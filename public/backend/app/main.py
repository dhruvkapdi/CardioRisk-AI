"""
CardioRisk AI — FastAPI Backend
Complete production-ready server for cardiovascular disease prediction.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.predict import router as predict_router

app = FastAPI(
    title="CardioRisk AI",
    description="AI-powered cardiovascular disease risk prediction API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "CardioRisk AI", "version": "1.0.0"}
