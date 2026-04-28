from pydantic import BaseModel, Field


class AIInsightsResponse(BaseModel):
    symbol: str
    business_model: str
    summary: str
    growth: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    insight: str


class ComparisonInsights(BaseModel):
    summary: str
    key_differences: list[str] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)


class ChatRequest(BaseModel):
    question: str
    symbol: str | None = None


class ChatResponse(BaseModel):
    summary: str
    growth: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    insight: str

