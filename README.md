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
git clone <your-repo-url>
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

## Deployment

### Backend → Render

1. Create a **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repository
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   - `DATABASE_URL` — your Render PostgreSQL connection string
   - `CORS_ORIGINS` — your Vercel frontend URL

### Database → Render PostgreSQL

1. Create a **PostgreSQL** instance on Render (free tier)
2. Copy the **External Database URL**
3. Use it as `DATABASE_URL` for the backend

### Frontend → Vercel

1. Import your GitHub repository on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Set **Framework Preset** to `Vite`
4. Add environment variable:
   - `VITE_API_URL` — your Render backend URL (e.g., `https://your-backend.onrender.com`)

### Docker Hub

```bash
# Build and push backend image
docker build -t yourusername/inventory-backend ./backend
docker push yourusername/inventory-backend
```

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

## License

MIT
