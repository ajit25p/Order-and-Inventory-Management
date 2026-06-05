from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func as sa_func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Customer, Order, Product
from ..schemas import DashboardResponse, ProductResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

LOW_STOCK_THRESHOLD = 10


@router.get("/", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    total_products = db.query(Product).count()
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()

    revenue = db.query(
        sa_func.coalesce(sa_func.sum(Order.total_amount), 0)
    ).scalar()

    low_stock = (
        db.query(Product)
        .filter(Product.quantity <= LOW_STOCK_THRESHOLD)
        .order_by(Product.quantity.asc())
        .all()
    )

    return DashboardResponse(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=[ProductResponse.model_validate(p) for p in low_stock],
        total_revenue=Decimal(str(revenue)),
    )
