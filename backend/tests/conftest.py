"""
pytest configuration and fixtures for integration tests.
"""

import os
import pytest


@pytest.fixture(scope="session")
def api_url():
    """
    Provides the API URL for Docker-based tests.
    Tests make real HTTP requests to the backend container.
    """
    return os.getenv("API_URL", "http://test-backend:8000")
