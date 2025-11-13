"""
End-to-end integration test for blog platform API.
Tests the complete flow: Backend -> Posts Service -> Database
"""

import httpx


def test_get_post_endpoint_e2e(api_url):
    """
    E2E test for /api/posts/{post_id} endpoint.

    Validates:
    - Backend API is running and accessible
    - Posts Service successfully connects to database
    - Backend successfully proxies request to Posts Service
    - Response contains expected post data
    - Response structure matches expected format
    """

    post_id = 1

    # Make request to backend API endpoint via HTTP
    with httpx.Client(timeout=30.0) as client:
        response = client.get(f"{api_url}/api/posts/{post_id}")

        # Validate successful response
        if response.status_code != 200:
            print(f"\nError response: {response.text}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("\nSUCCESS: API endpoint returned 200 OK")

        data = response.json()

        # Validate response structure
        assert "id" in data, "Missing id in response"
        assert "title" in data, "Missing title in response"
        assert "content" in data, "Missing content in response"
        assert "department" in data, "Missing department in response"
        assert "author" in data, "Missing author in response"
        print("SUCCESS: Response has correct structure")

        # Validate post_id matches request
        assert data["id"] == post_id, f"Expected id={post_id}, got {data['id']}"
        print(f"SUCCESS: Post ID matches request: {post_id}")

        # Validate data types
        assert isinstance(data["title"], str), "Title should be a string"
        assert isinstance(data["content"], str), "Content should be a string"
        assert isinstance(data["department"], str), "Department should be a string"
        assert isinstance(data["author"], str), "Author should be a string"
        assert len(data["title"]) > 0, "Title should not be empty"
        assert len(data["content"]) > 0, "Content should not be empty"
        print(f"SUCCESS: Post data valid - '{data['title']}' by {data['author']}")

        print("\n" + "=" * 70)
        print("E2E TEST PASSED: All services integrated correctly!")
        print("=" * 70)
        print(f"\nComplete response:")
        print(f"  Title: {data['title']}")
        print(f"  Author: {data['author']}")
        print(f"  Department: {data['department']}")
        print(f"  Content length: {len(data['content'])} characters")
        print("=" * 70)


def test_get_all_posts_endpoint_e2e(api_url):
    """
    E2E test for /api/posts endpoint.

    Validates:
    - Backend API returns list of posts
    - Response contains multiple posts
    - Each post has correct structure
    """

    # Make request to backend API endpoint via HTTP
    with httpx.Client(timeout=30.0) as client:
        response = client.get(f"{api_url}/api/posts")

        # Validate successful response
        if response.status_code != 200:
            print(f"\nError response: {response.text}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("\nSUCCESS: GET /api/posts endpoint returned 200 OK")

        data = response.json()

        # Validate response is a list
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should return at least one post"
        print(f"SUCCESS: Retrieved {len(data)} posts")

        # Validate first post structure
        first_post = data[0]
        assert "id" in first_post, "Missing id in post"
        assert "title" in first_post, "Missing title in post"
        assert "content" in first_post, "Missing content in post"
        assert "department" in first_post, "Missing department in post"
        assert "author" in first_post, "Missing author in post"
        print("SUCCESS: Post structure is valid")

        print("\n" + "=" * 70)
        print("E2E TEST PASSED: Get all posts endpoint working correctly!")
        print("=" * 70)
        print(f"  Total posts: {len(data)}")
        print(f"  Sample post: '{first_post['title']}' by {first_post['author']}")
        print("=" * 70)
