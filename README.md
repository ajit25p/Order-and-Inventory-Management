# Inventory & Order Management System

A full-stack application for managing products, customers, orders, and inventory tracking.

## Tech Stack

| Layer       | Technology        |
| ----------- | ----------------- |
| Frontend    | React 18 + Vite   |
| Backend     | Python FastAPI     |
| Database    | PostgreSQL 16      |
| Container   | Docker + Compose   |

## Quick Start (Docker)

```bash
# 1. Clone the repository
git clone 
cd "Order and Inventory Management"

# 2. Copy environment file
cp .env.example .env

# 3. Start all services
docker-compose up --build

# 4. Open in browser
#    Frontend: http://localhost:3000
#    Backend API: http://localhost:8000
#    API Docs: http://localhost:8000/docs
```

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt

# Set environment variable
set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

> Set `VITE_API_URL=http://localhost:8000` in `frontend/.env` if the backend runs on a different host/port.

## API Endpoints

### Products
| Method | Endpoint            | Description          |
| ------ | ------------------- | -------------------- |
| POST   | `/products/`        | Create product       |
| GET    | `/products`         | List (paginated)     |
| GET    | `/products/{id}`    | Get by ID            |
| PUT    | `/products/{id}`    | Update               |
| DELETE | `/products/{id}`    | Delete               |

### Customers
| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| POST   | `/customers/`        | Create customer      |
| GET    | `/customers`         | List (paginated)     |
| GET    | `/customers/{id}`    | Get by ID            |
| DELETE | `/customers/{id}`    | Delete               |

### Orders
| Method | Endpoint          | Description                        |
| ------ | ----------------- | ---------------------------------- |
| POST   | `/orders/`        | Create order (auto-deducts stock)  |
| GET    | `/orders`         | List (paginated)                   |
| GET    | `/orders/{id}`    | Get with items                     |
| DELETE | `/orders/{id}`    | Delete (restores stock)            |

### Dashboard
| Method | Endpoint      | Description            |
| ------ | ------------- | ---------------------- |
| GET    | `/dashboard`  | Summary stats          |


## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── database.py      # SQLAlchemy setup
│   │   ├── models.py        # ORM models
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── routers/         # API route handlers
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API layer
│   │   ├── components/      # React components
│   │   └── styles/          # CSS design system
│   ├── package.json
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

