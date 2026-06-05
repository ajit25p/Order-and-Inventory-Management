import math
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Customer, Order, OrderItem, Product
from ..schemas import (
    OrderCreate,
    OrderItemResponse,
    OrderResponse,
    PaginatedResponse,
)

router = APIRouter(prefix="/orders", tags=["Orders"])


def _build_order_response(order: Order) -> OrderResponse:
    """Build a rich response including customer name and product details."""
    return OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.full_name if order.customer else "",
        total_amount=order.total_amount,
        status=order.status,
        created_at=order.created_at,
        items=[
            OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                product_name=item.product.name if item.product else "",
                product_sku=item.product.sku if item.product else "",
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=item.subtotal,
            )
            for item in order.items
        ],
    )


def _load_order(db: Session, order_id: int) -> Order | None:
    """Eagerly load an order with its customer and items→products."""
    return (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .filter(Order.id == order_id)
        .first()
    )


@router.post("/", response_model=OrderResponse, status_code=201)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    # Verify customer exists
    customer = (
        db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    total_amount = Decimal("0")
    order_items: list[OrderItem] = []

    for item_data in order_data.items:
        # Lock the product row to prevent race conditions
        product = (
            db.query(Product)
            .filter(Product.id == item_data.product_id)
            .with_for_update()
            .first()
        )

        if not product:
            db.rollback()
            raise HTTPException(
                status_code=404,
                detail=f"Product with ID {item_data.product_id} not found",
            )

        if product.quantity < item_data.quantity:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Insufficient stock for '{product.name}'. "
                    f"Available: {product.quantity}, Requested: {item_data.quantity}"
                ),
            )

        unit_price = product.price
        subtotal = unit_price * item_data.quantity
        total_amount += subtotal

        # Deduct stock
        product.quantity -= item_data.quantity

        order_items.append(
            OrderItem(
                product_id=item_data.product_id,
                quantity=item_data.quantity,
                unit_price=unit_price,
                subtotal=subtotal,
            )
        )

    # Create order with items
    order = Order(
        customer_id=order_data.customer_id,
        total_amount=total_amount,
        items=order_items,
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    # Reload with relationships
    order = _load_order(db, order.id)
    return _build_order_response(order)


@router.get("/", response_model=PaginatedResponse)
def get_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=10000),
    db: Session = Depends(get_db),
):
    total = db.query(Order).count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    orders = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .order_by(Order.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    # Deduplicate rows caused by joinedload on one-to-many
    seen: set[int] = set()
    unique: list[Order] = []
    for o in orders:
        if o.id not in seen:
            seen.add(o.id)
            unique.append(o)

    return PaginatedResponse(
        items=[_build_order_response(o) for o in unique],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = _load_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _build_order_response(order)


@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Restore stock for each item
    for item in order.items:
        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .with_for_update()
            .first()
        )
        if product:
            product.quantity += item.quantity

    db.delete(order)
    db.commit()
