from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class MenuItemBase(BaseModel):
    name: str = Field(..., example="Rajma Rice Bowl")
    price: float = Field(..., example=90.0)
    category: str = Field(..., example="meal")
    is_veg: bool = Field(default=True, example=True)
    rating: float = Field(default=4.5, ge=0.0, le=5.0, example=4.6)
    filling_score: int = Field(default=3, ge=1, le=5, example=5)
    estimated_wait_time: int = Field(default=10, ge=0, example=10)
    is_available: bool = Field(default=True, example=True)
    image_url: Optional[str] = Field(default=None, example="https://images.unsplash.com/photo-1546833999-b9f581a1996d")


class MenuItemCreate(MenuItemBase):
    pass


class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    is_veg: Optional[bool] = None
    rating: Optional[float] = Field(default=None, ge=0.0, le=5.0)
    filling_score: Optional[int] = Field(default=None, ge=1, le=5)
    estimated_wait_time: Optional[int] = Field(default=None, ge=0)
    is_available: Optional[bool] = None
    image_url: Optional[str] = None


class MenuItemResponse(MenuItemBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class RecommendRequest(BaseModel):
    budget: float = Field(..., ge=0, example=100.0, description="Maximum budget in Rupees")
    veg_only: bool = Field(default=False, example=True, description="Filter for vegetarian dishes only")
    category: Optional[str] = Field(default=None, example="meal", description="Category filter (e.g. snack, meal, beverage, or null/all)")


class RecommendedItemResponse(MenuItemResponse):
    score: float = Field(..., example=3.75, description="Computed recommendation score")


class AdminVerifyRequest(BaseModel):
    password: str = Field(..., example="admin123")


# ==========================================
# ORDER SCHEMAS
# ==========================================


class OrderCreate(BaseModel):
    item_id: int = Field(..., example=8, description="ID of the menu item to order")
    quantity: int = Field(default=1, ge=1, example=1, description="Quantity ordered")
    student_name: Optional[str] = Field(default=None, example="Aarav Sharma", description="Student identifier or name")


class OrderStatusUpdate(BaseModel):
    status: str = Field(
        ...,
        pattern="^(placed|preparing|ready|completed)$",
        example="preparing",
        description="Updated order status: placed | preparing | ready | completed",
    )


class OrderResponse(BaseModel):
    id: int
    item_id: int
    item_name: str
    item_price: float
    quantity: int
    total_price: float
    student_name: Optional[str]
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
