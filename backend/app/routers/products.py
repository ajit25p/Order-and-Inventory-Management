import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Product
from ..schemas import PaginatedResponse, ProductCreate, ProductResponse, ProductUpdate

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/", response_model=ProductResponse, status_code=201)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    db_product = Product(**product.model_dump())
    try:
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=f"Product with SKU '{product.sku}' already exists",
        )
    return db_product


@router.get("/", response_model=PaginatedResponse)
def get_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=10000),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Product)

    if search:
        like = f"%{search}%"
        query = query.filter(
            Product.name.ilike(like) | Product.sku.ilike(like)
        )

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    products = (
        query.order_by(Product.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedResponse(
        items=[ProductResponse.model_validate(p) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    try:
        for field, value in update_data.items():
            setattr(product, field, value)
        db.commit()
        db.refresh(product)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=f"Product with SKU '{product_update.sku}' already exists",
        )

    return product


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.order_items:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete product that is referenced in orders",
        )

    db.delete(product)
    db.commit()
