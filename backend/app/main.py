import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# ... any other imports you have ...

app = FastAPI()   # <-- app must be created FIRST

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://smart-canteen-liart.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import Depends, FastAPI, Header, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import get_db, init_db
from app.models import MenuItem, Order
from app.schemas import (
    AdminVerifyRequest,
    MenuItemCreate,
    MenuItemResponse,
    MenuItemUpdate,
    OrderCreate,
    OrderResponse,
    OrderStatusUpdate,
    RecommendRequest,
    RecommendedItemResponse,
)
from app.seed import seed_database

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database and seed 12 canteen items if empty
    init_db()
    seed_database(force_refresh=False)
    yield


app = FastAPI(
    title="Smart Canteen API",
    description="Backend API with Orders, Admin Management & Recommendation Engine for Smart Canteen",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def verify_admin(
    x_admin_password: Optional[str] = Header(None, alias="X-Admin-Password"),
    password: Optional[str] = Query(None),
):
    """Simple admin password verification dependency."""
    provided_password = x_admin_password or password
    if not provided_password or provided_password != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing admin password",
        )
    return True


@app.get("/")
def health_check():
    """Health check endpoint to confirm backend and database are running."""
    return {
        "status": "ok",
        "message": "Smart Canteen API is up and running",
        "database": "SQLite (canteen.db) connected",
    }


# ==========================================
# MENU ENDPOINTS
# ==========================================


@app.get("/menu", response_model=List[MenuItemResponse])
def get_menu(db: Session = Depends(get_db)):
    """Retrieve all menu items from the database."""
    items = db.query(MenuItem).order_by(MenuItem.price.asc()).all()
    return items


# ==========================================
# RECOMMENDATION ENGINE
# ==========================================


@app.post("/recommend", response_model=List[RecommendedItemResponse])
def get_recommendations(request: RecommendRequest, db: Session = Depends(get_db)):
    """
    Recommendation Engine:
    1. Hard filter: price <= budget, veg_only, category, is_available.
    2. Score = 0.5*rating + 0.3*filling - 0.2*normalized_wait_time.
    3. Return top 3 scored picks.
    """
    query = db.query(MenuItem).filter(
        MenuItem.is_available == True,
        MenuItem.price <= request.budget,
    )

    if request.veg_only:
        query = query.filter(MenuItem.is_veg == True)

    if request.category and request.category.strip() and request.category.lower() != "all":
        query = query.filter(MenuItem.category.ilike(request.category.strip().lower()))

    filtered_items = query.all()
    if not filtered_items:
        return []

    max_wait_time = max(item.estimated_wait_time for item in filtered_items)

    scored_items = []
    for item in filtered_items:
        normalized_wait_time = (
            (item.estimated_wait_time / max_wait_time) if max_wait_time > 0 else 0.0
        )
        score = (
            (0.5 * item.rating)
            + (0.3 * item.filling_score)
            - (0.2 * normalized_wait_time)
        )

        item_data = {
            "id": item.id,
            "name": item.name,
            "price": item.price,
            "category": item.category,
            "is_veg": item.is_veg,
            "rating": item.rating,
            "filling_score": item.filling_score,
            "estimated_wait_time": item.estimated_wait_time,
            "is_available": item.is_available,
            "image_url": item.image_url,
            "score": round(score, 4),
        }
        scored_items.append(item_data)

    scored_items.sort(key=lambda x: x["score"], reverse=True)
    return scored_items[:3]


# ==========================================
# ORDER ENDPOINTS
# ==========================================


@app.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    """
    Place a new student order.
    Validates item existence and availability, records snapshot of item name & price.
    """
    menu_item = db.query(MenuItem).filter(MenuItem.id == order_in.item_id).first()
    if not menu_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with ID {order_in.item_id} not found",
        )

    if not menu_item.is_available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"'{menu_item.name}' is currently unavailable at the counter",
        )

    new_order = Order(
        item_id=menu_item.id,
        item_name=menu_item.name,
        item_price=menu_item.price,
        quantity=order_in.quantity,
        student_name=order_in.student_name.strip() if order_in.student_name else None,
        status="placed",
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order


@app.get("/orders", response_model=List[OrderResponse])
def list_orders(db: Session = Depends(get_db)):
    """
    List all orders, newest first.
    Used by shop staff and kitchen counter display.
    """
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return orders


@app.put("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
):
    """
    Update order status: placed -> preparing -> ready -> completed.
    Used by staff to progress orders.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found",
        )

    order.status = status_update.status
    db.commit()
    db.refresh(order)
    return order


# ==========================================
# ADMIN ENDPOINTS (Protected with admin password)
# ==========================================


@app.post("/admin/verify")
def verify_admin_password(req: AdminVerifyRequest):
    """Verify admin password for frontend login."""
    if req.password != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect admin password",
        )
    return {"status": "authenticated", "message": "Admin access granted"}


@app.post("/admin/menu", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
def admin_create_menu_item(
    item_in: MenuItemCreate,
    db: Session = Depends(get_db),
    authorized: bool = Depends(verify_admin),
):
    """Admin: Add a new item to the menu."""
    item = MenuItem(**item_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.put("/admin/menu/{item_id}", response_model=MenuItemResponse)
def admin_update_menu_item(
    item_id: int,
    item_in: MenuItemUpdate,
    db: Session = Depends(get_db),
    authorized: bool = Depends(verify_admin),
):
    """Admin: Update an existing menu item (price, availability, etc.)."""
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with ID {item_id} not found",
        )

    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


@app.delete("/admin/menu/{item_id}")
def admin_delete_menu_item(
    item_id: int,
    db: Session = Depends(get_db),
    authorized: bool = Depends(verify_admin),
):
    """Admin: Delete a menu item."""
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with ID {item_id} not found",
        )

    db.delete(item)
    db.commit()
    return {"message": "Menu item deleted successfully", "id": item_id}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
