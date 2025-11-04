import asyncio
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from .core.database import get_db
from .core.logging_config import get_logger
from .models.post import Post

logger = get_logger(__name__)

app = FastAPI(title="Posts Service")

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": "posts-service"}

@app.get("/posts", response_model=List[Dict[Any, Any]])
async def get_all_posts(db: Session = Depends(get_db)):
    """
    Get all blog posts.
    """
    logger.info("Starting to fetch all posts...")

    await asyncio.sleep(2)

    try:
        posts = db.query(Post).all()
        logger.info(f"Retrieved {len(posts)} posts.")

        return [post.to_dict() for post in posts]
    except Exception as e:
        logger.error(f"Error fetching posts: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    

@app.get("/posts/{post_id}", response_model=Dict[Any, Any])
async def get_post_by_id(post_id: int, db: Session = Depends(get_db)):
    """
    Get a specific post by ID.
    """
    logger.info(f"Starting to fetch post with ID: {post_id}")

    await asyncio.sleep(2)

    post = db.query(Post).filter(Post.id == post_id).first()
        
    if not post:
        logger.warning(f"Post with ID {post_id} not found")
        raise HTTPException(status_code=404, detail=f"Post with ID {post_id} not found")

    try:
        logger.info(f"Retrieved post '{post.title}'")
        return post.to_dict()

    except Exception as e:
        logger.error(f"Error fetching post {post_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")




        


