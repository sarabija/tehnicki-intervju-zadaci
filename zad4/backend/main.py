from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from typing import List
import  models, schemas, auth, database

from auth import hash_password, get_current_user, create_access_token

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Korisnik već postoji")
    new_user = models.User(
        username=user.username,
        password_hash=auth.hash_password(user.password),
        role=user.role,
        expected_calories=user.expected_calories
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Pogrešni podaci")
    
    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": user.role,
        "user_id": user.id 
    }


@app.get("/meals/", response_model=List[schemas.Meal])
def read_meals(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role == "admin":
        return db.query(models.Meal).all()
    return db.query(models.Meal).filter(models.Meal.user_id == current_user.id).all()

@app.post("/meals/", response_model=schemas.Meal)
def create_meal(meal: schemas.MealCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_meal = models.Meal(**meal.dict(), user_id=current_user.id)
    db.add(db_meal)
    db.commit()
    db.refresh(db_meal)
    return db_meal

@app.put("/meals/{meal_id}", response_model=schemas.Meal)
def update_meal(meal_id: int, meal: schemas.MealCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
    if not db_meal:
        raise HTTPException(status_code=404, detail="Obrok nije pronađen")
    if db_meal.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Nemate pristup")
    
    for key, value in meal.dict().items():
        setattr(db_meal, key, value)
    db.commit()
    db.refresh(db_meal)
    return db_meal

@app.delete("/meals/{meal_id}")
def delete_meal(meal_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
    if not db_meal or (db_meal.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="Nije pronađeno")
    db.delete(db_meal)
    db.commit()
    return {"detail": "Obrisano"}

@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(
    user_id: int, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role not in ["admin", "manager"] and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Nedozvoljen pristup tuđim podacima")

    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    return db_user

@app.get("/users/", response_model=List[schemas.User])
def read_users(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Nemate ovlastenja za pregled korisnika")
    return db.query(models.User).all()

@app.put("/users/{user_id}", response_model=schemas.User)
def update_user(
    user_id: int, 
    obj: schemas.UserUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    if current_user.role not in ["admin", "manager"] and current_user.id != user_id:
        raise HTTPException(
            status_code=403, 
            detail="Nemate ovlasti za izmjenu ovog korisnika"
        )

    if current_user.role not in ["admin", "manager"]:
        db_user.expected_calories = obj.expected_calories
    else:
        db_user.role = obj.role
        db_user.expected_calories = obj.expected_calories

    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Nemate ovlasti")

    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if current_user.role == "manager" and db_user.role == "admin":
        raise HTTPException(status_code=403, detail="Manager ne može obrisati Admina")

    db.delete(db_user)
    db.commit()
    return {"message": "Korisnik obrisan"}

@app.on_event("startup")
def seed_data():
    db = SessionLocal()
    try:
        user_count = db.query(models.User).count()
        if user_count == 0:
            print("Baza je prazna. Kreiram početne korisnike...")
            
            users_to_create = [
                {
                    "username": "admin",
                    "password": "admin123", 
                    "role": "admin",
                    "expected_calories": 0
                },
                {
                    "username": "manager",
                    "password": "manager123",
                    "role": "manager",
                    "expected_calories": 0
                },
                {
                    "username": "user",
                    "password": "user123",
                    "role": "user",
                    "expected_calories": 1000
                }
            ]

            for u in users_to_create:
                new_user = models.User(
                    username=u["username"],
                    password_hash= hash_password(u["password"]),
                    role=u["role"],
                    expected_calories=u["expected_calories"]
                )
                db.add(new_user)
            
            db.commit()
            print("Admin, manager i user su uspješno kreirani.")
    except Exception as e:
        print(f"Greška prilikom seedanja baze: {e}")
    finally:
        db.close()
