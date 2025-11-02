from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import bcrypt
import jwt
from bson import ObjectId
import asyncio
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'snap-your-car-secret-key-2025')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_DAYS = 30

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI(title="Snap Your Car API")
api_router = APIRouter(prefix="/api")

# ============== MODELS ==============

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    subscription: str
    created_at: datetime

class ImageData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    angle: str
    status: str = "captured"  # captured, processing, processed, failed
    before_base64: Optional[str] = None
    after_base64: Optional[str] = None
    background: str = "studio_white"
    watermark: bool = True
    mask_confidence: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SessionCreate(BaseModel):
    title: str
    mode: str  # exterior or interior

class SessionUpdate(BaseModel):
    title: Optional[str] = None
    images: Optional[List[ImageData]] = None

class Session(BaseModel):
    id: str
    user_id: str
    title: str
    mode: str
    created_at: datetime
    images: List[ImageData] = []

class EnhanceRequest(BaseModel):
    session_id: str
    image_id: str
    angle: str
    before_base64: str
    background: Optional[str] = "studio_white"

class EnhanceJobResponse(BaseModel):
    job_id: str
    status: str  # queued, uploading, processing, success, failed

class EnhanceResultResponse(BaseModel):
    job_id: str
    status: str
    after_base64: Optional[str] = None
    background: Optional[str] = None
    mask_confidence: Optional[float] = None
    processing_time_ms: Optional[int] = None

class ExportRequest(BaseModel):
    session_id: str
    size: str = "web"  # web, social, print

class ExportResponse(BaseModel):
    job_id: str
    status: str  # preparing, ready
    download_url: Optional[str] = None

# ============== HELPER FUNCTIONS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str, email: str) -> str:
    expiration = datetime.utcnow() + timedelta(days=JWT_EXPIRATION_DAYS)
    payload = {
        'sub': user_id,
        'email': email,
        'exp': expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('sub')
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Mock enhanced images (base64 placeholders - in production these would be actual images)
MOCK_ENHANCED_IMAGES = {
    "front": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",  # Placeholder
    "front_left": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
    "left": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
    "rear_left": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
    "rear": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
    "rear_right": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
    "front_right": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
    "dashboard": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
    "front_seats": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
    "rear_seats": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
    "trunk": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
    "door_panels": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
}

# ============== AUTH ENDPOINTS ==============

@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_doc = {
        "name": user_data.name,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "subscription": "lifetime",
        "created_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    # Generate token
    token = create_jwt_token(user_id, user_data.email)
    
    return {
        "user": {
            "id": user_id,
            "name": user_data.name,
            "email": user_data.email,
            "subscription": "lifetime"
        },
        "token": token
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id = str(user['_id'])
    token = create_jwt_token(user_id, credentials.email)
    
    return {
        "user": {
            "id": user_id,
            "name": user['name'],
            "email": user['email'],
            "subscription": user.get('subscription', 'lifetime')
        },
        "token": token
    }

@api_router.post("/auth/demo")
async def demo_login():
    # Check if demo user exists
    demo_email = "demo@snapyourcar.app"
    demo_user = await db.users.find_one({"email": demo_email})
    
    if not demo_user:
        # Create demo user with sample sessions
        demo_user_doc = {
            "name": "Marco Demo",
            "email": demo_email,
            "password_hash": hash_password("demo123"),
            "subscription": "lifetime",
            "created_at": datetime.utcnow()
        }
        result = await db.users.insert_one(demo_user_doc)
        demo_user_id = str(result.inserted_id)
        
        # Create 3 demo sessions
        await create_demo_sessions(demo_user_id)
    else:
        demo_user_id = str(demo_user['_id'])
    
    token = create_jwt_token(demo_user_id, demo_email)
    
    return {
        "user": {
            "id": demo_user_id,
            "name": "Marco Demo",
            "email": demo_email,
            "subscription": "lifetime"
        },
        "token": token
    }

async def create_demo_sessions(user_id: str):
    demo_sessions = [
        {
            "user_id": user_id,
            "title": "BMW-8SERIES",
            "mode": "exterior",
            "created_at": datetime.utcnow() - timedelta(days=5),
            "images": [
                {
                    "id": str(uuid.uuid4()),
                    "angle": "Front",
                    "status": "processed",
                    "before_base64": MOCK_ENHANCED_IMAGES["front"],
                    "after_base64": MOCK_ENHANCED_IMAGES["front"],
                    "background": "studio_white",
                    "watermark": True,
                    "mask_confidence": 98.5,
                    "created_at": datetime.utcnow() - timedelta(days=5)
                },
                {
                    "id": str(uuid.uuid4()),
                    "angle": "Front Left",
                    "status": "processed",
                    "before_base64": MOCK_ENHANCED_IMAGES["front_left"],
                    "after_base64": MOCK_ENHANCED_IMAGES["front_left"],
                    "background": "studio_white",
                    "watermark": True,
                    "mask_confidence": 97.8,
                    "created_at": datetime.utcnow() - timedelta(days=5)
                }
            ]
        },
        {
            "user_id": user_id,
            "title": "TESLA-MODEL-3",
            "mode": "exterior",
            "created_at": datetime.utcnow() - timedelta(days=2),
            "images": [
                {
                    "id": str(uuid.uuid4()),
                    "angle": "Rear",
                    "status": "processed",
                    "before_base64": MOCK_ENHANCED_IMAGES["rear"],
                    "after_base64": MOCK_ENHANCED_IMAGES["rear"],
                    "background": "luxury_showroom",
                    "watermark": True,
                    "mask_confidence": 99.1,
                    "created_at": datetime.utcnow() - timedelta(days=2)
                }
            ]
        },
        {
            "user_id": user_id,
            "title": "AUDI-Q8-INTERIOR",
            "mode": "interior",
            "created_at": datetime.utcnow() - timedelta(days=1),
            "images": [
                {
                    "id": str(uuid.uuid4()),
                    "angle": "Dashboard",
                    "status": "in_queue",
                    "before_base64": MOCK_ENHANCED_IMAGES["dashboard"],
                    "after_base64": None,
                    "background": "studio_white",
                    "watermark": True,
                    "created_at": datetime.utcnow() - timedelta(days=1)
                }
            ]
        }
    ]
    
    await db.sessions.insert_many(demo_sessions)

# ============== USER ENDPOINTS ==============

@api_router.get("/user/profile")
async def get_profile(current_user = Depends(get_current_user)):
    return {
        "id": str(current_user['_id']),
        "name": current_user['name'],
        "email": current_user['email'],
        "subscription": current_user.get('subscription', 'lifetime'),
        "created_at": current_user['created_at']
    }

# ============== SESSION ENDPOINTS ==============

@api_router.post("/sessions")
async def create_session(session_data: SessionCreate, current_user = Depends(get_current_user)):
    session_doc = {
        "user_id": str(current_user['_id']),
        "title": session_data.title,
        "mode": session_data.mode,
        "created_at": datetime.utcnow(),
        "images": []
    }
    
    result = await db.sessions.insert_one(session_doc)
    session_id = str(result.inserted_id)
    
    return {
        "id": session_id,
        "user_id": session_doc['user_id'],
        "title": session_doc['title'],
        "mode": session_doc['mode'],
        "created_at": session_doc['created_at'],
        "images": []
    }

@api_router.get("/sessions")
async def get_sessions(current_user = Depends(get_current_user)):
    sessions = await db.sessions.find({"user_id": str(current_user['_id'])}).sort("created_at", -1).to_list(100)
    
    result = []
    for session in sessions:
        # Determine status based on images
        image_count = len(session.get('images', []))
        processed_count = sum(1 for img in session.get('images', []) if img.get('status') == 'processed')
        
        if image_count == 0:
            status = "continue"
        elif processed_count == image_count:
            status = "processed"
        elif processed_count > 0:
            status = "in_queue"
        else:
            status = "continue"
        
        result.append({
            "id": str(session['_id']),
            "user_id": session['user_id'],
            "title": session['title'],
            "mode": session['mode'],
            "created_at": session['created_at'],
            "image_count": image_count,
            "status": status,
            "thumbnail": session['images'][0].get('after_base64') or session['images'][0].get('before_base64') if session.get('images') else None
        })
    
    return result

@api_router.get("/sessions/{session_id}")
async def get_session(session_id: str, current_user = Depends(get_current_user)):
    try:
        session = await db.sessions.find_one({"_id": ObjectId(session_id), "user_id": str(current_user['_id'])})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "id": str(session['_id']),
            "user_id": session['user_id'],
            "title": session['title'],
            "mode": session['mode'],
            "created_at": session['created_at'],
            "images": session.get('images', [])
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.put("/sessions/{session_id}")
async def update_session(session_id: str, update_data: SessionUpdate, current_user = Depends(get_current_user)):
    try:
        update_fields = {}
        if update_data.title:
            update_fields['title'] = update_data.title
        if update_data.images is not None:
            update_fields['images'] = [img.dict() for img in update_data.images]
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = await db.sessions.update_one(
            {"_id": ObjectId(session_id), "user_id": str(current_user['_id'])},
            {"$set": update_fields}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {"message": "Session updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, current_user = Depends(get_current_user)):
    try:
        result = await db.sessions.delete_one({"_id": ObjectId(session_id), "user_id": str(current_user['_id'])})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {"message": "Session deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============== ENHANCEMENT ENDPOINTS ==============

# Store enhancement jobs in memory for demo
enhancement_jobs = {}

@api_router.post("/enhance", response_model=EnhanceJobResponse)
async def enhance_image(request: EnhanceRequest, current_user = Depends(get_current_user)):
    job_id = str(uuid.uuid4())
    
    # Store job
    enhancement_jobs[job_id] = {
        "job_id": job_id,
        "session_id": request.session_id,
        "image_id": request.image_id,
        "status": "queued",
        "angle": request.angle,
        "before_base64": request.before_base64,
        "background": request.background,
        "created_at": datetime.utcnow()
    }
    
    # Start async processing (mock)
    asyncio.create_task(process_enhancement(job_id, request))
    
    return EnhanceJobResponse(job_id=job_id, status="queued")

async def process_enhancement(job_id: str, request: EnhanceRequest):
    try:
        # Update to uploading
        enhancement_jobs[job_id]["status"] = "uploading"
        await asyncio.sleep(1)
        
        # Update to processing
        enhancement_jobs[job_id]["status"] = "processing"
        await asyncio.sleep(random.randint(4, 8))  # Simulate 4-8 second processing
        
        # Generate mock enhanced image (in production, this would call AI service)
        angle_key = request.angle.lower().replace(" ", "_")
        after_base64 = MOCK_ENHANCED_IMAGES.get(angle_key, request.before_base64)
        
        # Update to success
        enhancement_jobs[job_id].update({
            "status": "success",
            "after_base64": after_base64,
            "mask_confidence": round(random.uniform(95.0, 99.9), 1),
            "processing_time_ms": random.randint(6000, 12000),
            "completed_at": datetime.utcnow()
        })
    except Exception as e:
        enhancement_jobs[job_id]["status"] = "failed"
        enhancement_jobs[job_id]["error"] = str(e)

@api_router.get("/enhance/{job_id}", response_model=EnhanceResultResponse)
async def get_enhancement_result(job_id: str, current_user = Depends(get_current_user)):
    job = enhancement_jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Enhancement job not found")
    
    return EnhanceResultResponse(
        job_id=job_id,
        status=job["status"],
        after_base64=job.get("after_base64"),
        background=job.get("background"),
        mask_confidence=job.get("mask_confidence"),
        processing_time_ms=job.get("processing_time_ms")
    )

# ============== EXPORT ENDPOINTS ==============

export_jobs = {}

@api_router.post("/export", response_model=ExportResponse)
async def export_session(request: ExportRequest, current_user = Depends(get_current_user)):
    job_id = str(uuid.uuid4())
    
    export_jobs[job_id] = {
        "job_id": job_id,
        "session_id": request.session_id,
        "size": request.size,
        "status": "preparing",
        "created_at": datetime.utcnow()
    }
    
    # Start async export (mock)
    asyncio.create_task(process_export(job_id))
    
    return ExportResponse(job_id=job_id, status="preparing")

async def process_export(job_id: str):
    await asyncio.sleep(random.randint(3, 6))  # Simulate 3-6 second preparation
    
    export_jobs[job_id].update({
        "status": "ready",
        "download_url": f"/downloads/{job_id}.zip",
        "completed_at": datetime.utcnow()
    })

@api_router.get("/export/{job_id}", response_model=ExportResponse)
async def get_export_status(job_id: str, current_user = Depends(get_current_user)):
    job = export_jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Export job not found")
    
    return ExportResponse(
        job_id=job_id,
        status=job["status"],
        download_url=job.get("download_url")
    )

# ============== HEALTH CHECK ==============

@api_router.get("/")
async def root():
    return {"message": "Snap Your Car API", "version": "1.0.0"}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
