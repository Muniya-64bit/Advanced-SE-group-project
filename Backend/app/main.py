from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.health import router as health_router
from app.routes.nlp_routes import router as nlp_router
from app.routes.context_routes import router as context_router
from app.routes.chat import router as chat_router
from app.routes.enhance import router as enhance_router
from app.routes.issues import router as issues_router

app = FastAPI(
    title="Advanced SE Architecture Workbench API",
    description="AI-powered architecture recommendation system with context management",
    version="1.0.0"
)

# app.middleware("http")
# async def log_requests(request: Request, call_next):
#     print(f"Request path: {request.url.path}")
#     response = await call_next(request)
#     return response

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],           
)

app.include_router(health_router)
app.include_router(nlp_router)
app.include_router(context_router)
app.include_router(chat_router)
app.include_router(enhance_router) 
app.include_router(issues_router)