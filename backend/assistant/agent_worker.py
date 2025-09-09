import os
import sys
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import noise_cancellation, google

# Add the parent directory to Python path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Now import from voice_assistant app
try:
    from assistant.prompts import AGENT_INSTRUCTION, SESSION_INSTRUCTION
    from assistant.tools import get_weather, search_web, send_email
except ImportError:
    # Fallback to relative imports if the above doesn't work
    from .prompts import AGENT_INSTRUCTION, SESSION_INSTRUCTION
    from .tools import get_weather, search_web, send_email

# Load environment variables
load_dotenv()

class Assistant(Agent):
    def __init__(self):
        super().__init__(
            instructions=AGENT_INSTRUCTION,
            llm=google.beta.realtime.RealtimeModel(
                voice="Kore",
                temperature=0.8,
            ),
            tools=[get_weather, search_web, send_email],
        )

async def entrypoint(ctx: agents.JobContext):
    # Connect to the room first
    await ctx.connect()
    
    # Create assistant instance
    assistant = Assistant()
    
    # Create a new AgentSession
    session = AgentSession()

    # Start the session with named arguments
    await session.start(
        agent=assistant,
        room=ctx.room,
        room_input_options=RoomInputOptions(
            video_enabled=True,
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    # Send initial greeting
    await session.generate_reply(instructions=SESSION_INSTRUCTION)

    # On each DataTrack message from the client, generate a reply
    @ctx.room.on("data_received")
    async def on_data(payload, _track):
        await session.generate_reply()

if __name__ == "__main__":
    # Launch the LiveKit agents worker
    agents.cli.run_app(
        agents.WorkerOptions(
            entrypoint_fnc=entrypoint,
            api_key=os.getenv("LIVEKIT_API_KEY"),
            api_secret=os.getenv("LIVEKIT_API_SECRET"),
            ws_url=os.getenv("LIVEKIT_WS_URL"),
        )
    )