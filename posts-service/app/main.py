from fastapi import FastAPI

app = FastAPI(title="Posts Service")

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": "posts-service"}