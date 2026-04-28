import json
from typing import Any

from cachetools import TTLCache

from app.core.config import get_settings

try:
    import google.generativeai as genai
except ImportError:  # pragma: no cover
    genai = None


def _as_percent_text(value: float | None) -> str:
    if value is None:
        return "not available"
    return f"{value:.2f}%"


def _json_from_text(raw_text: str) -> dict[str, Any]:
    raw_text = raw_text.strip()
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        pass

    start = raw_text.find("{")
    end = raw_text.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(raw_text[start : end + 1])
        except json.JSONDecodeError:
            return {}
    return {}


def _ensure_list(value: Any) -> list[str]:
    if isinstance(value, list):
        return [str(item) for item in value if str(item).strip()]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


class AIService:
    def __init__(self) -> None:
        settings = get_settings()
        self._api_key = settings.gemini_api_key
        self._model_name = settings.gemini_model
        self._cache = TTLCache(maxsize=500, ttl=settings.insight_cache_ttl_seconds)
        self._client = None

        if self._api_key and genai is not None:
            genai.configure(api_key=self._api_key)
            self._client = genai.GenerativeModel(self._model_name)

    def _generate_json(self, prompt: str) -> dict[str, Any]:
        if not self._client:
            return {}
        try:
            response = self._client.generate_content(prompt)
            text = getattr(response, "text", "") or ""
            return _json_from_text(text)
        except Exception:
            return {}

    @staticmethod
    def _fallback_company_insight(
        company_data: dict[str, Any], analytics: dict[str, Any], news_items: list[dict[str, Any]]
    ) -> dict[str, Any]:
        overview = company_data["overview"]
        key_stats = company_data["key_stats"]

        growth_points: list[str] = []
        risk_points: list[str] = []

        one_year_return = analytics["performance"]["one_year"]
        if one_year_return is not None and one_year_return > 0:
            growth_points.append(f"1Y price performance is positive at {one_year_return:.2f}%.")
        if key_stats.get("revenue"):
            growth_points.append("Company has meaningful revenue scale, useful for long-term stability.")
        if news_items:
            growth_points.append("Recent media attention may create near-term catalysts.")

        volatility = analytics.get("volatility")
        if volatility is not None and volatility > 35:
            risk_points.append(f"Annualized volatility is elevated at {volatility:.2f}%.")
        if analytics.get("trend") == "Bearish":
            risk_points.append("Technical trend appears weak based on moving averages.")
        if not risk_points:
            risk_points.append("No high-confidence red flags from current data snapshot.")

        business_model = overview.get("description") or (
            f"{overview.get('name')} operates in the {overview.get('sector') or 'diversified'} sector."
        )
        summary = (
            f"{overview.get('name')} shows a {analytics.get('trend').lower()} trend with "
            f"1Y return at {_as_percent_text(one_year_return)}."
        )
        insight = (
            "Blend technical trend, valuation checks, and quarterly updates before taking conviction positions."
        )

        return {
            "business_model": business_model,
            "summary": summary,
            "growth": growth_points,
            "risks": risk_points,
            "insight": insight,
        }

    def generate_company_insights(
        self,
        company_data: dict[str, Any],
        analytics: dict[str, Any],
        news_items: list[dict[str, Any]],
    ) -> dict[str, Any]:
        symbol = company_data["overview"]["exchange_symbol"]
        cache_key = f"insight::{symbol}"
        cached = self._cache.get(cache_key)
        if cached:
            return cached

        prompt = f"""
You are a financial research assistant for Indian equities.
Return ONLY valid JSON with keys:
business_model (string), summary (string), growth (array of strings), risks (array of strings), insight (string).

Company Data:
{json.dumps(company_data, ensure_ascii=True)}

Analytics:
{json.dumps(analytics, ensure_ascii=True)}

News Headlines:
{json.dumps(news_items, ensure_ascii=True)}

Keep the response concise, factual, and investment-research style.
"""

        generated = self._generate_json(prompt)
        if not generated:
            generated = self._fallback_company_insight(company_data, analytics, news_items)

        cleaned = {
            "business_model": generated.get("business_model") or self._fallback_company_insight(company_data, analytics, news_items)["business_model"],
            "summary": generated.get("summary") or "Summary unavailable from model, showing computed fallback.",
            "growth": _ensure_list(generated.get("growth")),
            "risks": _ensure_list(generated.get("risks")),
            "insight": generated.get("insight") or "Use diversified position sizing while monitoring quarterly results.",
        }
        if not cleaned["growth"] or not cleaned["risks"]:
            fallback = self._fallback_company_insight(company_data, analytics, news_items)
            if not cleaned["growth"]:
                cleaned["growth"] = fallback["growth"]
            if not cleaned["risks"]:
                cleaned["risks"] = fallback["risks"]
        self._cache[cache_key] = cleaned
        return cleaned

    @staticmethod
    def _fallback_compare(left: dict[str, Any], right: dict[str, Any]) -> dict[str, Any]:
        diffs: list[str] = []
        strengths: list[str] = []
        weaknesses: list[str] = []

        if left.get("one_year_return") is not None and right.get("one_year_return") is not None:
            if left["one_year_return"] > right["one_year_return"]:
                diffs.append(f"{left['name']} delivered stronger 1Y returns.")
                strengths.append(f"{left['name']} has better trailing momentum.")
                weaknesses.append(f"{right['name']} has relatively weaker trailing momentum.")
            else:
                diffs.append(f"{right['name']} delivered stronger 1Y returns.")
                strengths.append(f"{right['name']} has better trailing momentum.")
                weaknesses.append(f"{left['name']} has relatively weaker trailing momentum.")

        summary = f"{left['name']} and {right['name']} show different return and profitability profiles."
        if not diffs:
            diffs.append("Comparable market profile with limited contrast from available data.")
        if not strengths:
            strengths.append("Both companies have meaningful scale within Indian equities.")
        if not weaknesses:
            weaknesses.append("Some financial fields are unavailable in the current snapshot.")

        return {
            "summary": summary,
            "key_differences": diffs,
            "strengths": strengths,
            "weaknesses": weaknesses,
        }

    def generate_comparison_insights(self, left: dict[str, Any], right: dict[str, Any]) -> dict[str, Any]:
        prompt = f"""
You are comparing two Indian listed companies for investors.
Return ONLY JSON with keys:
summary (string), key_differences (array of strings), strengths (array of strings), weaknesses (array of strings).

Company A:
{json.dumps(left, ensure_ascii=True)}

Company B:
{json.dumps(right, ensure_ascii=True)}
"""
        generated = self._generate_json(prompt)
        if not generated:
            return self._fallback_compare(left, right)
        result = {
            "summary": generated.get("summary") or self._fallback_compare(left, right)["summary"],
            "key_differences": _ensure_list(generated.get("key_differences")),
            "strengths": _ensure_list(generated.get("strengths")),
            "weaknesses": _ensure_list(generated.get("weaknesses")),
        }
        if not result["key_differences"] or not result["strengths"] or not result["weaknesses"]:
            fallback = self._fallback_compare(left, right)
            if not result["key_differences"]:
                result["key_differences"] = fallback["key_differences"]
            if not result["strengths"]:
                result["strengths"] = fallback["strengths"]
            if not result["weaknesses"]:
                result["weaknesses"] = fallback["weaknesses"]
        return result

    def generate_chat_response(
        self,
        question: str,
        company_data: dict[str, Any] | None = None,
        analytics: dict[str, Any] | None = None,
        news_items: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        prompt = f"""
You are an AI financial assistant for Indian stock research.
Respond ONLY in JSON with keys:
summary (string), growth (array of strings), risks (array of strings), insight (string).

User Question:
{question}

Optional Company Data:
{json.dumps(company_data or {}, ensure_ascii=True)}

Optional Analytics:
{json.dumps(analytics or {}, ensure_ascii=True)}

Optional News:
{json.dumps(news_items or [], ensure_ascii=True)}
"""
        generated = self._generate_json(prompt)
        if generated:
            return {
                "summary": generated.get("summary") or "No summary generated.",
                "growth": _ensure_list(generated.get("growth")),
                "risks": _ensure_list(generated.get("risks")),
                "insight": generated.get("insight") or "No additional investment insight.",
            }

        fallback_summary = "Answer generated from local analytics fallback because model output was unavailable."
        if company_data:
            fallback_summary = (
                f"{company_data['overview']['name']} currently shows a {analytics.get('trend', 'mixed').lower()} trend "
                f"with 1Y return at {_as_percent_text((analytics or {}).get('performance', {}).get('one_year'))}."
            )

        return {
            "summary": fallback_summary,
            "growth": ["Track revenue quality, margin trend, and management execution over multiple quarters."],
            "risks": ["Price volatility and macro shifts can affect short-term outcomes."],
            "insight": "Use this as research support, not a standalone buy or sell signal.",
        }
