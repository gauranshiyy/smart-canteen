from app.database import SessionLocal, init_db
from app.models import MenuItem

CANTEEN_SEED_ITEMS = [
    {
        "name": "Masala Chai",
        "price": 20.0,
        "category": "beverage",
        "is_veg": True,
        "rating": 4.9,
        "filling_score": 1,
        "estimated_wait_time": 2,
        "is_available": True,
        "image_url": "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=500&auto=format&fit=crop&q=80",
    },
    {
        "name": "Samosa Pav (2 pcs)",
        "price": 35.0,
        "category": "snack",
        "is_veg": True,
        "rating": 4.3,
        "filling_score": 3,
        "estimated_wait_time": 3,
        "is_available": True,
        "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80",
    },
    {
        "name": "Egg Maggi",
        "price": 50.0,
        "category": "snack",
        "is_veg": False,
        "rating": 4.6,
        "filling_score": 3,
        "estimated_wait_time": 7,
        "is_available": True,
        "image_url": "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80",
    },
    {
        "name": "Aloo Paratha with Curd",
        "price": 60.0,
        "category": "meal",
        "is_veg": True,
        "rating": 4.5,
        "filling_score": 4,
        "estimated_wait_time": 10,
        "is_available": True,
        "image_url": "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop&q=80",
    },
    {
        "name": "Cold Coffee with Ice Cream",
        "price": 60.0,
        "category": "beverage",
        "is_veg": True,
        "rating": 4.7,
        "filling_score": 2,
        "estimated_wait_time": 5,
        "is_available": True,
        "image_url": "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&auto=format&fit=crop&q=80",
    },
    {
        "name": "Masala Dosa",
        "price": 70.0,
        "category": "meal",
        "is_veg": True,
        "rating": 4.4,
        "filling_score": 4,
        "estimated_wait_time": 15,
        "is_available": True,
        "image_url": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=80",
    },
    {
        "name": "Paneer Kathi Wrap",
        "price": 80.0,
        "category": "snack",
        "is_veg": True,
        "rating": 4.5,
        "filling_score": 4,
        "estimated_wait_time": 8,
        "is_available": True,
        "image_url": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80",
    },
    {
        "name": "Rajma Rice Bowl",
        "price": 90.0,
        "category": "meal",
        "is_veg": True,
        "rating": 4.6,
        "filling_score": 5,
        "estimated_wait_time": 10,
        "is_available": True,
        "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80",
    },
    {
        "name": "Chole Bhature",
        "price": 100.0,
        "category": "meal",
        "is_veg": True,
        "rating": 4.8,
        "filling_score": 5,
        "estimated_wait_time": 12,
        "is_available": True,
        "image_url": "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&auto=format&fit=crop&q=80",
    },
    {
        "name": "Chicken Roll",
        "price": 110.0,
        "category": "snack",
        "is_veg": False,
        "rating": 4.7,
        "filling_score": 4,
        "estimated_wait_time": 12,
        "is_available": True,
        "image_url": "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=500&auto=format&fit=crop&q=80",
    },
    {
        "name": "Veg Fried Rice & Manchurian",
        "price": 120.0,
        "category": "meal",
        "is_veg": True,
        "rating": 4.5,
        "filling_score": 5,
        "estimated_wait_time": 14,
        "is_available": True,
        "image_url": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=80",
    },
    {
        "name": "Chicken Biryani Bowl",
        "price": 140.0,
        "category": "meal",
        "is_veg": False,
        "rating": 4.8,
        "filling_score": 5,
        "estimated_wait_time": 10,
        "is_available": True,
        "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
    },
]


def seed_database(force_refresh: bool = False):
    """Seed the database with default 12 canteen items."""
    init_db()
    db = SessionLocal()
    try:
        existing_count = db.query(MenuItem).count()
        if existing_count > 0 and not force_refresh:
            print(f"ℹ️ Database already contains {existing_count} menu items. Skipping seed.")
            return existing_count

        if force_refresh:
            db.query(MenuItem).delete()
            print("🧹 Cleared existing menu items.")

        for item_data in CANTEEN_SEED_ITEMS:
            item = MenuItem(**item_data)
            db.add(item)

        db.commit()
        total = db.query(MenuItem).count()
        print(f"✅ Successfully seeded database with {total} canteen menu items.")
        return total
    finally:
        db.close()


if __name__ == "__main__":
    seed_database(force_refresh=True)
