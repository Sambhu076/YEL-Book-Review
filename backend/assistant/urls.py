# voice_assistant/urls.py

from django.urls import path
from .views import (
    get_livekit_token,
    test_endpoint,
    voice_query,
    voice_bot_status,
)

app_name = "voice_assistant"

urlpatterns = [
    path("token/",             get_livekit_token,   name="get_token"),
    path("test/",              test_endpoint,       name="test"),
    path("voice-query/",       voice_query,         name="voice_query"),
    path("status/",            voice_bot_status,    name="voice_bot_status"),
]
