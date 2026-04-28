from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.chat import router as chat_router
from app.api.routes.compare import router as compare_router
from app.api.routes.company import router as company_router
from app.core.config import get_settings
from app.core.errors import AppError, app_error_handler, generic_error_handler

settings = get_settings()
app = FastAPI(title=settings.app_name, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(Exception, generic_error_handler)

app.include_router(company_router, prefix=settings.api_prefix)
app.include_router(compare_router, prefix=settings.api_prefix)
app.include_router(chat_router, prefix=settings.api_prefix)


@app.get("/")
def healthcheck() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}

