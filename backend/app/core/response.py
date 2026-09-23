"""Standardized API response envelope."""

from typing import Any, Optional
from pydantic import BaseModel


class APIResponse(BaseModel):
    success: bool = True
    data: Any = None
    message: Optional[str] = None
    errors: list[str] = []


def success_response(data: Any = None, message: str | None = None) -> dict:
    return {"success": True, "data": data, "message": message, "errors": []}


def error_response(errors: list[str], message: str | None = None) -> dict:
    return {"success": False, "data": None, "message": message, "errors": errors}
