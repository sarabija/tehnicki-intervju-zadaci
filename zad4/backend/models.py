from sqlalchemy import Column, Integer, String, Float, Date, Time, ForeignKey
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="user")  
    expected_calories = Column(Float, default=2000.0)

    meals = relationship("Meal", back_populates="owner", cascade="all, delete-orphan")

class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    calories = Column(Float)
    date = Column(Date)
    time = Column(Time)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="meals")