import re
import math
from decimal import Decimal
from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Product
# ---------------------------------------------------------------------------
class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=100)
    price: Decimal = Field(..., ge=0)
    quantity: int = Field(default=0, ge=0)


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[Decimal] = Field(None, ge=0)
    quantity: Optional[int] = Field(None, ge=0)


class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    price: Decimal
    quantity: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Customer
# ---------------------------------------------------------------------------
class CustomerCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., min_length=1, max_length=255)
    phone: str = Field(..., min_length=1, max_length=50)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(pattern, v):
            raise ValueError("Invalid email format")
        return v.lower()


class CustomerResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Order
# ---------------------------------------------------------------------------
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str = ""
    product_sku: str = ""
    quantity: int
    unit_price: Decimal
    subtotal: Decimal

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate] = Field(..., min_length=1)


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: str = ""
    total_amount: Decimal
    status: str
    created_at: datetime
    items: List[OrderItemResponse] = []

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Pagination
# ---------------------------------------------------------------------------
class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------
class DashboardResponse(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: List[ProductResponse]
    total_revenue: Decimal
