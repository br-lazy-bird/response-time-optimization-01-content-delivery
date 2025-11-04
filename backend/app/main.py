from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import httpx
import os
import time

from .core.logging_config import get_logger, setup_logging

setup_logging()
logger = get_logger(__name__)

app = FastAPI(title="Blog Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

POSTS_SERVICE_URL = os.getenv("POSTS_SERVICE_URL")
if not POSTS_SERVICE_URL:
    raise ValueError("POSTS_SERVICE_URL is not set. Check your .env file.")

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": "backend"}

async def call_posts_service(endpoint: str) -> Dict[Any, Any]:
    """
    Call posts-service with proper error handling.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{POSTS_SERVICE_URL}{endpoint}", timeout=5.0)
            response.raise_for_status()
            return response.json()
    
    except httpx.ConnectTimeout:
        logger.error(f"Timeout calling posts-service: {endpoint}")
        raise HTTPException(status_code=503, detail="Posts service unavailable (timeout)")
    
    except httpx.ConnectError:
        logger.error(f"Connection error to posts-service: {endpoint}")
        raise HTTPException(status_code=503, detail="Posts service unavailable (connection error)")
    
    except httpx.HTTPStatusError as e:
        logger.warning(f"Posts service returned {e.response.status_code} for {endpoint}")
        # Pass through the posts-service error (404, 500, etc.)
        try:
            error_detail = e.response.json().get("detail", e.response.text)
        except:
            error_detail = e.response.text
        raise HTTPException(status_code=e.response.status_code, detail=error_detail)
    
    except Exception as e:
        logger.error(f"Unexpected error calling posts-service {endpoint}: {e}")
        raise HTTPException(status_code=503, detail="Service communication error")

@app.get("/api/posts", response_model=List[Dict[Any, Any]])
async def get_all_posts():
    """
    Get all blog posts by proxying to posts-service.
    """
    start_time = time.time()
     
    try:
        posts = await call_posts_service("/posts")
        
        end_time = time.time()
        duration = end_time - start_time
        
        logger.info(f"Retrieved {len(posts)} posts in {duration:.2f} seconds")
        
        return posts
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in get_all_posts: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/posts/{post_id}", response_model=Dict[Any, Any])
async def get_post_by_id(post_id: int):
    """
    Get a specific blog post by proxying to posts-service.
    """
    start_time = time.time()
    
    try:
        post = await call_posts_service(f"/posts/{post_id}")
        end_time = time.time()
        duration = end_time - start_time
        
        logger.info(f"Retrieved post '{post.get('title', 'Unknown')}' in {duration:.2f} seconds")
        
        return post
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in get_post_by_id: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
