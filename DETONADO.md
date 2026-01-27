# DETONADO: Content Delivery Performance Optimization

This guide walks you through identifying and fixing the performance issue in the Blog Content Delivery application by implementing caching.

---

## Learning Objective

**Primary Skill:** Application-level caching strategies and implementation

By completing this exercise, you will:
- Understand what caching is and when to use it
- Identify redundant expensive operations that benefit from caching
- Implement a simple in-memory cache with TTL support
- Learn about production-ready caching solutions

---

## Problem Identification

### Symptoms

When you load blog posts in the frontend:
- Every post load takes approximately 2 seconds
- Reloading the same post still takes 2 seconds every time
- The application feels sluggish and unresponsive

### Measuring the Problem

1. Start the application:
   ```bash
   make run
   ```

2. Wait for all services to become healthy (verify with `docker ps`)

3. Open the frontend at http://localhost:3000

4. Select a blog post from the dropdown and note the load time (~2000ms)

5. Select the same post again and observe it still takes ~2000ms

### Initial Questions

- Why does selecting the same post repeatedly always take 2 seconds?
- Is the backend making redundant calls to the posts-service?
- What if 100 users request the same popular post?

---

## Understanding the Problem: Caching

### What Is Caching?

A cache is temporary storage that holds frequently accessed data for quick retrieval. The principle is simple: it's faster to retrieve data from nearby storage than to repeatedly fetch it from a distant source.

**Cache Hit:** Requested data is found in cache (fast, < 1ms)

**Cache Miss:** Data not in cache, must fetch from source (slow, ~2000ms)

**Cache Hit Rate:** `(Cache Hits / Total Requests) x 100%`

Even a 50% hit rate provides significant performance improvements.

### The Current Architecture

```
React Frontend (3000)
    |
    v HTTP GET /api/posts/{id}
    |
FastAPI Backend (8000) [NO CACHE]
    |
    v HTTP GET /posts/{id} (every time!)
    |
Posts Service (8001)
    |
    v 2-second delay + Database query
    |
PostgreSQL (5432)
```

**The Problem:** The backend makes a network call to posts-service for every request, even if the same post was requested 1 second ago.

### Why This Happens

Look at `backend/app/main.py` lines 32-61:

```python
async def call_posts_service(endpoint: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{POSTS_SERVICE_URL}{endpoint}")
        return response.json()
```

Every call makes a fresh HTTP request with no storage of previous responses.

### What We Need

```
React Frontend (3000)
    |
    v HTTP GET /api/posts/{id}
    |
FastAPI Backend (8000)
    |
    v Check SimpleCache
    |
    +-- HIT? Return cached data (< 1ms)
    |
    +-- MISS? Fetch from posts-service -> Store in cache -> Return
```

### Further Reading

If you want to learn more about caching strategies and solutions:

- [Lazy Bird Blog - Caching](https://lazybird.com.br/blog/2025-11-10-lazy-bird---caching/)

---

## Solution Implementation

We'll implement a `SimpleCache` class with TTL (Time-To-Live) support. This approach helps you understand exactly how caching works under the hood.

### Step 1: Create the SimpleCache Class

Create a new file: `backend/app/cache.py`

```python
"""
Simple in-memory cache with TTL support.
"""
from typing import Dict, Any, Optional
import time

class SimpleCache:
    """
    A simple in-memory cache with time-to-live (TTL) support.

    This cache stores key-value pairs in memory and automatically removes
    entries that have exceeded their TTL.

    Note: This is a learning implementation. For production use, consider:
    - fastapi-cache2 for decorator-based caching with FastAPI
    - Redis for distributed caching
    - cachetools for more sophisticated eviction policies
    """

    def __init__(self, default_ttl: int = 300):
        """
        Initialize the cache.

        Args:
            default_ttl: Default time-to-live in seconds (default: 5 minutes)
        """
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._default_ttl = default_ttl

    def get(self, key: str) -> Optional[Any]:
        """
        Retrieve a value from the cache.

        Args:
            key: The cache key

        Returns:
            The cached value if found and not expired, None otherwise
        """
        if key not in self._cache:
            return None

        entry = self._cache[key]

        # Check if entry has expired
        if time.time() > entry["expires_at"]:
            # Remove expired entry
            del self._cache[key]
            return None

        return entry["value"]

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        Store a value in the cache.

        Args:
            key: The cache key
            value: The value to cache
            ttl: Time-to-live in seconds (uses default if not specified)
        """
        ttl = ttl if ttl is not None else self._default_ttl
        expires_at = time.time() + ttl

        self._cache[key] = {
            "value": value,
            "expires_at": expires_at
        }

    def clear(self) -> None:
        """
        Clear all entries from the cache.
        """
        self._cache.clear()
```

### Step 2: Initialize the Cache in main.py

Open `backend/app/main.py` and add the import at the top:

```python
from .cache import SimpleCache
```

After the `setup_logging()` call (around line 10), initialize the cache:

```python
setup_logging()
logger = get_logger(__name__)

# Initialize cache with 5-minute TTL
cache = SimpleCache(default_ttl=300)
```

### Step 3: Modify call_posts_service to Use Cache

Replace the `call_posts_service()` function (lines 32-61) with this cached version:

```python
async def call_posts_service(endpoint: str) -> Dict[Any, Any]:
    """
    Call posts-service with caching and proper error handling.
    """
    # Check cache first
    cached_data = cache.get(endpoint)
    if cached_data is not None:
        logger.info(f"Cache HIT for {endpoint}")
        return cached_data

    # Cache miss - fetch from posts-service
    logger.info(f"Cache MISS for {endpoint}")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{POSTS_SERVICE_URL}{endpoint}", timeout=5.0)
            response.raise_for_status()
            data = response.json()

            # Store in cache for future requests
            cache.set(endpoint, data)

            return data

    except httpx.ConnectTimeout:
        logger.error(f"Timeout calling posts-service: {endpoint}")
        raise HTTPException(status_code=503, detail="Posts service unavailable (timeout)")

    except httpx.ConnectError:
        logger.error(f"Connection error to posts-service: {endpoint}")
        raise HTTPException(status_code=503, detail="Posts service unavailable (connection error)")

    except httpx.HTTPStatusError as e:
        logger.warning(f"Posts service returned {e.response.status_code} for {endpoint}")
        try:
            error_detail = e.response.json().get("detail", e.response.text)
        except:
            error_detail = e.response.text
        raise HTTPException(status_code=e.response.status_code, detail=error_detail)

    except Exception as e:
        logger.error(f"Unexpected error calling posts-service {endpoint}: {e}")
        raise HTTPException(status_code=503, detail="Service communication error")
```

### Understanding the Implementation

**Key Design Decisions:**

**TTL-based Invalidation:** Entries expire after 5 minutes. Simple to implement and guarantees eventual freshness. For blog posts (infrequently updated), this is reasonable.

**Endpoint as Cache Key:** Simple and unique. Maps directly to the request (e.g., `/posts/1`, `/posts`).

**No Size Limit:** Suitable for small datasets (10 posts). Production systems should implement max size and eviction policies (LRU/LFU).

**No Thread Safety:** FastAPI's async event loop is single-threaded per request. For multi-threaded environments, use locks or Redis.

---

## Verification and Expected Results

### Step 1: Restart the Backend Service

```bash
docker compose -f docker/compose.yaml --env-file .env restart backend
```

Wait a few seconds for the service to restart.

### Step 2: Test Cache Performance

1. Open http://localhost:3000

2. Select any blog post (e.g., "The Dialectics of Nature")

3. **First load (Cache MISS):** ~2000ms

4. Select the same post again immediately

5. **Second load (Cache HIT):** < 100ms (typically 10-50ms)

6. Try different posts and reload them - first load slow, subsequent loads fast

### Step 3: Check Backend Logs

```bash
docker compose -f docker/compose.yaml --env-file .env logs backend
```

You should see:

```
backend  | INFO:app.main:Cache MISS for /posts/1
backend  | INFO:app.main:Retrieved post 'The Dialectics of Nature' in 2.01 seconds
backend  | INFO:app.main:Cache HIT for /posts/1
backend  | INFO:app.main:Retrieved post 'The Dialectics of Nature' in 0.02 seconds
```

### Expected Performance Improvement

| Scenario | Without Cache | With Cache | Improvement |
|----------|---------------|------------|-------------|
| First load | ~2000ms | ~2000ms | 0% (cache miss) |
| Repeated load | ~2000ms | ~50ms | 97.5% faster |
| 10 requests, same post | ~20s | ~2.5s | 87.5% faster |

---

## Success Criteria

You've successfully implemented caching when:

- First load of any post takes ~2000ms (expected - cache miss)
- Subsequent loads of the same post take < 100ms (cache hit)
- Backend logs show "Cache HIT" and "Cache MISS" messages
- Different posts are cached independently
- Cache expires after 5 minutes (TTL working)

---

## Production Considerations

### Moving Beyond This Implementation

**Use fastapi-cache2 for Production FastAPI Apps:**
```python
# Install: pip install fastapi-cache2[inmemory]
# Or with Redis: pip install fastapi-cache2[redis]

from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi_cache.decorator import cache

@app.on_event("startup")
async def startup():
    FastAPICache.init(InMemoryBackend())

@cache(expire=300)
async def call_posts_service(endpoint: str):
    # Automatically cached
    ...
```

**Use Redis for Distributed Systems:**
- Shared cache across multiple server instances
- Persistence and advanced features
- Install: `pip install redis`
- Docs: https://redis-py.readthedocs.io/

**Implement Proper Eviction:**
- Add max cache size
- Implement LRU (Least Recently Used) eviction
- Monitor memory usage

**Consider Cache Layers:**
- L1: In-memory cache (fastest, per-instance)
- L2: Redis cache (shared, distributed)
- L3: CDN cache (edge locations, static content)

---

## Key Takeaways

**When to Use Caching:**

- Data is read frequently (high read-to-write ratio)
- Data is expensive to compute or fetch
- Some staleness is acceptable
- Same data is requested by multiple users

**When NOT to Use Caching:**

- Data changes constantly
- Data is user-specific (low hit rate)
- Strict consistency requirements
- Infinite key space (e.g., unique queries)

---

> "Oh, you actually fixed it? Nice... I mean, I knew you could do it. That's why I picked you, obviously."
>
> "Caching, huh? Yeah, I was gonna suggest that... eventually. Anyway, thanks for the help. I'm gonna go back to my nap now. But hey, if I find another bug, I know who to call..."

**Congratulations!** You've successfully implemented application-level caching and dramatically improved the performance of the Blog Content Delivery system.
