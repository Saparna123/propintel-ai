from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

DataStatus = Literal["verified", "ai_inferred", "demo", "unavailable"]
Confidence = Literal["high", "medium", "limited"]
AgentStatus = Literal[
    "active", "processing", "completed", "waiting", "data_unavailable", "error"
]


class DataPoint(BaseModel):
    value: Any
    status: DataStatus
    source_type: str
    source_reference: str | None = None
    confidence: Confidence = "limited"
    note: str | None = None


class PropertyInput(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    address: str = Field(..., min_length=1, max_length=400)
    city: str = Field(..., min_length=1, max_length=120)
    latitude: float | None = None
    longitude: float | None = None
    property_type: str = Field(..., min_length=1, max_length=80)
    estimated_price: float | None = None
    built_up_area: float | None = None

    @field_validator("latitude")
    @classmethod
    def lat_range(cls, v: float | None) -> float | None:
        if v is None:
            return v
        if not -90 <= v <= 90:
            raise ValueError("Latitude must be between -90 and 90")
        return v

    @field_validator("longitude")
    @classmethod
    def lng_range(cls, v: float | None) -> float | None:
        if v is None:
            return v
        if not -180 <= v <= 180:
            raise ValueError("Longitude must be between -180 and 180")
        return v

    @field_validator("estimated_price", "built_up_area")
    @classmethod
    def non_negative(cls, v: float | None) -> float | None:
        if v is None:
            return v
        if v < 0:
            raise ValueError("Numeric values cannot be negative")
        return v


class ChatRequest(BaseModel):
    research_id: str
    question: str = Field(..., min_length=1, max_length=2000)


class CompareRequest(BaseModel):
    research_ids: list[str] = Field(..., min_length=2, max_length=4)


class WeightUpdate(BaseModel):
    legal: float | None = None
    financial: float | None = None
    market: float | None = None
    location: float | None = None
    infrastructure: float | None = None
    documentation: float | None = None
