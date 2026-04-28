from pydantic import BaseModel, Field


class MarketHistoryPoint(BaseModel):
    date: str
    close: float


class MarketRow(BaseModel):
    symbol: str
    name: str
    sector: str | None = None
    price: float | None = None
    change_percent: float | None = None
    volume: int | None = None
    pe_ratio: float | None = None
    market_cap: float | None = None
    history: list[MarketHistoryPoint] = Field(default_factory=list)


class SectorPERow(BaseModel):
    sector: str
    pe_ratio: float


class MarketOverviewResponse(BaseModel):
    as_of: str
    rows: list[MarketRow] = Field(default_factory=list)
    sector_pe: list[SectorPERow] = Field(default_factory=list)

