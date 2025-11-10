from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.health import router as health_router
from routes.nlp_routes import router as nlp_router

app = FastAPI()

# app.middleware("http")
# async def log_requests(request: Request, call_next):
#     print(f"Request path: {request.url.path}")
#     response = await call_next(request)
#     return response

origins = [
    "http://localhost",
    "http://localhost:3000",
    # Add more origins as needed
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