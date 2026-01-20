# Lazy Bird: Blog Content Delivery

An educational project for learning response time optimization in distributed systems through hands-on practice.

---

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- 2GB+ available RAM
- Ports 3000, 8000, 8001, and 5432 available

### Setup

This project includes a `.env.development` file with development configuration. Copy this file to `.env` before running the system:

```bash
cp .env.development .env
```

These settings are for **local development only** and contain no sensitive data. In production applications, always use proper secret management and never commit credentials to version control.

```bash
# Start the system
make run
```

The system will:
- Start PostgreSQL database
- Seed 10 blog posts
- Launch Posts Service microservice
- Start FastAPI backend
- Start React frontend

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Posts Service: http://localhost:8001
- Database: localhost:5432

---

## System Architecture

```
+------------------------------------------------------------------+
|                         React Frontend                           |
|                      (http://localhost:3000)                     |
+----------------------------------+-------------------------------+
                                   |
                                   | HTTP Request
                                   | GET /api/posts/{id}
                                   v
+------------------------------------------------------------------+
|                      Backend API                                 |
|                      (http://localhost:8000)                     |
|                   FastAPI - Proxies Requests                     |
+----------------------------------+-------------------------------+
                                   |
                                   | GET /posts/{id}
                                   |
                                   v
+------------------------------------------------------------------+
|                      Posts Service                               |
|                      (http://localhost:8001)                     |
|                   FastAPI - Microservice                         |
|                   ~2s delay per request                          |
+----------------------------------+-------------------------------+
                                   |
                                   | SQL Query
                                   v
+------------------------------------------------------------------+
|                      PostgreSQL Database                         |
|                      (localhost:5432)                            |
|                   10 blog posts                                  |
+------------------------------------------------------------------+
```

### Technology Stack

**Frontend:** React 18 with TypeScript

**Backend:** FastAPI (Python) with microservices architecture

**Microservices:**
- Posts Service - Returns blog post content from database

**Database:** PostgreSQL 15 with seeded blog content

**Infrastructure:**
- Docker Compose for easy setup
- Hot-reload enabled for development
- Isolated network environment

---

## Meet the Lazy Bird

> 🐦 The Lazy Bird is a peculiar creature. It has an exceptional talent for catching bugs... but absolutely zero motivation to fix them. You'll find it wandering around codebases, spotting issues, and then immediately looking for someone else to do the hard work.
>
> Today, it found you.

---

## The Problem

> 🐦 "Hey... so we have this blog platform, right? And users are complaining that loading posts is super slow. Every. Single. Time. I tried loading the same post twice and... yeah, it takes forever both times. Like, why? It's the same post! There's definitely something weird going on in the backend. But I just found a really comfortable spot in the sun, so... could you figure this out? Load some posts and see what's happening. Thanks!"

The Posts Service has an artificial 2-second delay to simulate real-world processing time (complex queries, external API calls, data transformation, etc.).

**Your Mission:**
1. Investigate why the blog posts load slowly
2. Diagnose the root cause
3. Implement the optimization
4. Verify that the problem is resolved

**Important:** Do NOT remove or reduce the 2-second delay in the Posts Service. The delay is intentional to simulate real-world latency. The optimization should work WITH the delay, not around it.

---

## Success Criteria

You'll know you've successfully optimized the system when:

- The first time you load a blog post still takes approximately 2 seconds (expected)
- Subsequent loads of the same post are dramatically faster (< 100ms)
- The improvement is immediately noticeable in the UI
- The load time counter in the frontend reflects the improved performance

Compare the load times before and after your optimization to measure the improvement.

---

## How to Use the System

### Frontend Interface

**Load Blog Posts:**
1. Open http://localhost:3000
2. Select a blog post from the dropdown menu
3. Watch the load time counter
4. Review the blog post content
5. Try loading the same post again and observe the time

### API Endpoints

**Backend API:**
- `GET /api/posts` - Get all blog posts
- `GET /api/posts/{post_id}` - Get specific blog post
- `GET /health` - Health check

**Posts Service:**
- `GET /posts` - Get all posts (port 8001)
- `GET /posts/{post_id}` - Get specific post (port 8001)

### Database Access

**Using psql:**
```bash
make db-shell
```

**Connection Details:**
- Host: localhost
- Port: 5432
- Database: posts-repository
- Username: lazybird_dev
- Password: lazybird_password

---

## Running Tests

The project includes automated integration tests that verify all services work together correctly.

**Run tests (fast - uses cached images):**
```bash
make test
```

**Rebuild and test (after code changes):**
```bash
make test-build
```

Tests verify:
- All services are running and accessible
- Backend successfully retrieves posts from Posts Service
- Response structure matches expected format
- Database contains seeded blog posts

---

## Documentation

For detailed diagnostic guidance and step-by-step optimization instructions, see the [DETONADO Guide](./DETONADO.md).

---

Ready to start? Run `make run` and dive in!
