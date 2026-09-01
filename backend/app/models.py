from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base


class MenuItem(Base):
    """SQLAlchemy model for Smart Canteen menu items."""

    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False, index=True)
    price = Column(Float, nullable=False)
    category = Column(String(50), nullable=False, index=True)  # "snack", "meal", "beverage"
    is_veg = Column(Boolean, nullable=False, default=True)
    rating = Column(Float, nullable=False, default=4.0)  # 0.0 to 5.0
    filling_score = Column(Integer, nullable=False, default=3)  # 1 to 5
    estimated_wait_time = Column(Integer, nullable=False, default=10)  # in minutes
    is_available = Column(Boolean, nullable=False, default=True)
    image_url = Column(String(255), nullable=True)

    orders = relationship("Order", back_populates="menu_item")

    def __repr__(self):
        return f"<MenuItem(id={self.id}, name='{self.name}', price={self.price}, category='{self.category}')>"


class Order(Base):
    """SQLAlchemy model for student orders at the canteen counter."""

    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False, index=True)
    item_name = Column(String(100), nullable=False)
    item_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    student_name = Column(String(100), nullable=True)
    status = Column(String(50), nullable=False, default="placed", index=True)  # "placed", "preparing", "ready", "completed"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    menu_item = relationship("MenuItem", back_populates="orders")

    @property
    def total_price(self) -> float:
        return round(self.item_price * self.quantity, 2)

    def __repr__(self):
        return f"<Order(id={self.id}, item='{self.item_name}', qty={self.quantity}, status='{self.status}')>"
