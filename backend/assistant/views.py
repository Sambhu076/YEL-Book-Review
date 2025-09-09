import os
import logging
import traceback
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from livekit import api
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

@api_view(["POST"])
@permission_classes([AllowAny])
def get_livekit_token(request):
    """Generate LiveKit access token for voice session"""
    try:
        data = request.data
        identity = data.get("identity", "student")
        room = data.get("room", "goldilocks-story")

        # Check if LiveKit is properly configured
        api_key = os.getenv("LIVEKIT_API_KEY")
        api_secret = os.getenv("LIVEKIT_API_SECRET")
        livekit_url = os.getenv("LIVEKIT_WS_URL", "wss://your-livekit-server.com")
        
        if not api_key or not api_secret:
            logger.error("LiveKit credentials not found in environment variables")
            return Response({
                "error": "LiveKit not configured",
                "message": "Please set LIVEKIT_API_KEY and LIVEKIT_API_SECRET in your .env file",
                "token": "mock_token_for_development"
            }, status=400)

        try:
            # Create access token
            token = (
                api.AccessToken(api_key, api_secret)
                .with_identity(identity)
                .with_name(identity)
                .with_grants(
                    api.VideoGrants(
                        room_join=True,
                        room=room,
                        can_publish=True,
                        can_subscribe=True,
                    )
                )
                .to_jwt()
            )

            logger.info(f"Generated LiveKit token for {identity} in room {room}")
            
            return Response({
                "token": token,
                "url": livekit_url,
                "room": room,
                "identity": identity
            })
            
        except Exception as token_error:
            logger.error(f"Error generating LiveKit token: {token_error}")
            return Response({
                "error": "Failed to generate LiveKit token",
                "details": str(token_error),
                "token": "mock_token_for_development"
            }, status=500)
        
    except Exception as e:
        logger.error(f"Unexpected error in get_livekit_token: {str(e)}")
        logger.error(traceback.format_exc())
        return Response({
            "error": f"Server error: {str(e)}",
            "token": "mock_token_for_development"
        }, status=500)

@api_view(["GET"])
@permission_classes([AllowAny])
def voice_bot_status(request):
    """Check voice bot integration status"""
    try:
        api_key = os.getenv("LIVEKIT_API_KEY")
        api_secret = os.getenv("LIVEKIT_API_SECRET")
        livekit_url = os.getenv("LIVEKIT_WS_URL")
        
        status = {
            "voice_bot_status": "ready" if (api_key and api_secret) else "not_configured",
            "livekit_configured": bool(api_key and api_secret),
            "livekit_url": livekit_url,
            "environment": "development" if not api_key else "production",
            "message": "Voice bot ready for Goldilocks story session" if api_key else "LiveKit not configured - using mock mode"
        }
        
        return Response(status)
        
    except Exception as e:
        logger.error(f"Error checking voice bot status: {str(e)}")
        return Response({
            "voice_bot_status": "error",
            "error": str(e)
        }, status=500)

@api_view(["GET"])
@permission_classes([AllowAny])
def test_endpoint(request):
    """Test endpoint to verify backend is working"""
    return Response({
        "message": "Voice assistant backend is working!",
        "status": "ok",
        "service": "goldilocks-voice-tutor"
    })

@api_view(["POST"])
@permission_classes([AllowAny])
def voice_query(request):
    """Fallback text-based query endpoint"""
    try:
        query = request.data.get("query", "").strip()
        if not query:
            return Response({"error": "Query is required"}, status=400)

        # Simple response for testing
        response_text = f"I heard you say: '{query}'. Let's continue with our Goldilocks story questions!"
        return Response({"response": response_text})

    except Exception as e:
        logger.error(f"Error in voice_query: {str(e)}")
        return Response({"error": str(e)}, status=500)
