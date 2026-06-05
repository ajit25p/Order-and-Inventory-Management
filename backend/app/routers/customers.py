import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Customer
from ..schemas import CustomerCreate, CustomerResponse, PaginatedResponse

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("/", response_model=CustomerResponse, status_code=201)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    db_customer = Customer(**customer.model_dump())
    try:
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=f"Customer with email '{customer.email}' already exists",
        )
    return db_customer


@router.get("/", response_model=PaginatedResponse)
def get_customers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=10000),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Customer)

    if search:
        like = f"%{search}%"
        query = query.filter(
            Customer.full_name.ilike(like) | Customer.email.ilike(like)
        )

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    customers = (
        query.order_by(Customer.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedResponse(
        items=[CustomerResponse.model_validate(c) for c in customers],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.delete("/{customer_id}", status_code=204)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if customer.orders:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete customer with existing orders",
        )

    db.delete(customer)
    db.commit()
