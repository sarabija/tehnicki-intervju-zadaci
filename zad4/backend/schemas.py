from pydantic import BaseModel
from datetime import date, time
from typing import Optional

class MealBase(BaseModel):
    text: str
    calories: float
    date: date
    time: time

class MealCreate(MealBase):
    pass

class Meal(MealBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    role: str = "user"
    expected_calories: float = 2000.0

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        from_attributes = True
        
class UserUpdate(BaseModel):
    role: Optional[str] = None
    expected_calories: Optional[float] = None