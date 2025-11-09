from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.health import router as health_router

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
    allow_origins=origins,            # restrict allowed origins
    allow_credentials=True,
    allow_methods=["*"],              # allow all HTTP methods
    allow_headers=["*"],              # allow all headers
)

app.include_router(health_router)