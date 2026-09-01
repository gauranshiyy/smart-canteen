# Smart Canteen 🥗

Smart Canteen is a modern full-stack web application designed to put campus food counters online — featuring live menus, budget filtering, dietary preferences, and wait time insights.

---

## 🏗 Project Architecture

```
smart canteen/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI entrypoint, CORS & GET / health check
│   │   └── database.py        # SQLAlchemy SQLite engine & session (canteen.db)
│   ├── requirements.txt       # Python backend dependencies
│   └── .venv/                 # Python 3 virtual environment
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx     # Branded header & navigation
│   │   │   ├── StatusCard.jsx # Live backend link tester & response inspector
│   │   │   └── MetricRow.jsx  # Campus counter metrics
│   │   ├── App.jsx            # Main view with editorial design & hero
│   │   ├── index.css          # Tailwind CSS styles & typography
│   │   └── main.jsx           # React DOM root
│   ├── index.html             # Google Fonts (Newsreader + Plus Jakarta Sans)
│   ├── tailwind.config.js     # Custom palette & styling tokens
│   ├── vite.config.js         # Vite configuration
│   └── package.json           # Frontend dependencies
│
└── README.md
```

---

## 🚀 Getting Started

Follow the instructions below to run both the backend and frontend locally.

### 1. Backend Setup (FastAPI + Python)

Open a terminal in the root directory:

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Create and activate a Python virtual environment (if not already created)
python3 -m venv .venv

# On macOS / Linux:
source .venv/bin/activate

# On Windows:
# .venv\Scripts\activate

# 3. Install required packages
pip install -r requirements.txt

# 4. Start the FastAPI development server
uvicorn app.main:app --reload --port 8000
```

The backend server will run at:
- **API URL**: [http://localhost:8000](http://localhost:8000)
- **API Health Check**: [http://localhost:8000/](http://localhost:8000/) (returns `{"status": "ok", ...}`)
- **Menu Endpoint**: [http://localhost:8000/menu](http://localhost:8000/menu) (returns all seeded canteen items)
- **Order Placement Endpoints**:
  - `POST /orders` (place new student order: item_id, quantity, student_name)
  - `GET /orders` (list all counter orders, newest first)
  - `PUT /orders/{id}/status` (update status: placed → preparing → ready → completed)
- **Recommendation Engine Endpoint**: `POST http://localhost:8000/recommend` (scores and ranks top 3 picks)
- **Admin Endpoints**:
  - `POST /admin/verify` (password verification)
  - `POST /admin/menu` (add item)
  - `PUT /admin/menu/{id}` (update item / availability)
  - `DELETE /admin/menu/{id}` (delete item)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Database**: SQLite database initialized at [backend/canteen.db](file:///Users/gauranshiyadav/smart%20canteen/backend/canteen.db).

### Testing Order Placement (cURL)
```bash
# 1. Place a new order
curl -X POST http://localhost:8000/orders \
  -H "Content-Type: application/json" \
  -d '{"item_id": 8, "quantity": 2, "student_name": "Rahul Verma"}'

# 2. List all orders (newest first)
curl http://localhost:8000/orders

# 3. Update status (placed -> preparing -> ready -> completed)
curl -X PUT http://localhost:8000/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "preparing"}'
```

### Admin Panel Access
- **URL**: [http://localhost:5173/admin](http://localhost:5173/admin)
- **Demo Password**: `admin123`

### Testing the Recommendation Engine (cURL)
```bash
curl -X POST http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{"budget": 100, "veg_only": true, "category": "meal"}'
```

### Re-seeding the Database (Optional)
To reset or re-seed the canteen items at any time:
```bash
cd backend
source .venv/bin/activate
python -m app.seed
```

---

### 2. Frontend Setup (React + Vite + Tailwind CSS)

Open a new terminal window/tab:

```bash
# 1. Navigate to the frontend folder
cd frontend

# 2. Install dependencies (if not already installed)
npm install

# 3. Start the Vite development server
npm run dev
```

The frontend will run at:
- **Local App URL**: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Verifying Connectivity

1. Start the backend (`uvicorn app.main:app --reload --port 8000`).
2. Start the frontend (`npm run dev`).
3. Open `http://localhost:5173` in your browser.
4. You will see the **Smart Canteen** homepage styled with the warm editorial theme, along with the **Full-Stack Connection Check** displaying:
   - **Backend connected ✅**
   - Live latency measurement in milliseconds
   - Exact JSON response received from `GET http://localhost:8000/`
   - Active database link to `canteen.db` via SQLAlchemy.
