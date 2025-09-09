# assistant/agent.py - Standalone version
import os
import sys
import logging
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions, llm
from livekit.plugins import noise_cancellation, google

# Add the parent directory to Python path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

logger = logging.getLogger("voice-assistant")
logger.setLevel(logging.INFO)

# Prompts defined directly in this file to avoid import issues
AGENT_INSTRUCTION = """
You are a friendly AI voice tutor named Storyteller, helping children understand the story "Goldilocks and the Three Bears".

Your role:
- Ask questions about the story in a warm, encouraging manner
- Provide positive feedback on children's answers
- Help guide them to correct answers if they're struggling
- Keep responses short and age-appropriate (5-8 years old)
- Be patient and supportive

Story Questions to ask in order:
1. What is the title of this story?
2. Who is the author of this story?
3. What genre is this story - Fiction or Non-Fiction?
4. Who are the main characters in this story?
5. Where does the story take place?
6. What are three important events that happen in the story?
7. What is the problem or conflict in the story?
8. Who is your favorite character and why?
9. What lesson or moral does this story teach us?

Keep your responses conversational, encouraging, and brief (1-2 sentences max).
Always redirect conversations back to the Goldilocks story if the child goes off-topic.
"""

SESSION_INSTRUCTION = """
Hi there! I'm Storyteller, your reading companion. We're going to talk about the story 'Goldilocks and the Three Bears' together. I have some fun questions to ask you about the story. Are you ready to start? Let's begin with our first question: What is the title of this story?
"""

# Tools defined directly in this file
# Note: The new LiveKit agents API handles tools differently

def get_weather(location: str) -> str:
    """Get current weather for a location - but we're focusing on stories today!"""
    return f"The weather is nice today, but let's focus on our Goldilocks story! Do you remember what happened when Goldilocks went into the bears' house?"

def search_web(query: str) -> str:
    """Search the web for information - redirected to story context."""
    return f"That's an interesting question about '{query}', but right now we're having our special story time about Goldilocks and the Three Bears! Let's continue with our questions."

def send_email(to: str, subject: str, message: str) -> str:
    """Send an email (disabled during story sessions)."""
    return "That's not something we need during our story time! Let's keep talking about Goldilocks and the Three Bears. What do you think about the story so far?"

def get_story_help(topic: str) -> str:
    """Provide help with story elements."""
    story_help = {
        "characters": "The main characters are Goldilocks, Papa Bear, Mama Bear, and Baby Bear. Each character is different and special!",
        "setting": "The story takes place in a forest where the three bears live in their cozy house.",
        "events": "The main events are: Goldilocks enters the house, tries the porridge, sits in chairs, sleeps in beds, and then the bears come home!",
        "lesson": "The story teaches us to always ask permission before using someone else's things, and to be respectful of other people's homes."
    }
    return story_help.get(topic.lower(), "That's a great question! Think about what Goldilocks did and what happened because of her actions.")

def encourage_student() -> str:
    """Provide encouragement to the student."""
    import random
    encouragements = [
        "You're doing such a great job thinking about this story!",
        "I love how carefully you're thinking about the characters!",
        "You have wonderful ideas about this story!",
        "Keep up the excellent work! You really understand the story well!",
        "That's fantastic thinking! You're a great storyteller yourself!"
    ]
    return random.choice(encouragements)

class Assistant(Agent):
    def __init__(self):
        super().__init__(
            instructions=AGENT_INSTRUCTION,
            llm=google.beta.realtime.RealtimeModel(
                voice="Kore",  # You can also use "Aoede", "Charon", "Fenrir", "Puck"
                temperature=0.7,  # Slightly lower for more consistent educational responses
            ),
            # Remove tools for now - Google Realtime API handles this differently
            # tools=[get_weather, search_web, send_email, get_story_help, encourage_student],
        )
        logger.info("Assistant initialized with Google Realtime Model")

async def entrypoint(ctx: agents.JobContext):
    """Main entry point for the voice assistant agent"""
    
    logger.info(f"Connecting to room {ctx.room.name}")
    
    # Connect to the room
    await ctx.connect()
    
    # Create assistant instance
    assistant = Assistant()
    
    # Create a new AgentSession
    session = AgentSession()

    # Start the session
    await session.start(
        agent=assistant,
        room=ctx.room,
        room_input_options=RoomInputOptions(
            video_enabled=False,  # Audio-only for better performance
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    logger.info("Agent session started successfully")
    
    # Send initial greeting with Goldilocks context
    await session.generate_reply(instructions=SESSION_INSTRUCTION)

    # Handle incoming data/messages (if needed)
    @ctx.room.on("data_received")
    async def on_data(payload, track):
        logger.info(f"Received data: {payload}")
        await session.generate_reply()

    # Handle participant connections
    @ctx.room.on("participant_connected")
    async def on_participant_connected(participant):
        logger.info(f"Participant connected: {participant.identity}")
        
    @ctx.room.on("participant_disconnected")
    async def on_participant_disconnected(participant):
        logger.info(f"Participant disconnected: {participant.identity}")

def main():
    """Main function to run the agent"""
    try:
        # Check required environment variables
        required_vars = ["LIVEKIT_API_KEY", "LIVEKIT_API_SECRET", "LIVEKIT_WS_URL"]
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        
        if missing_vars:
            logger.error(f"Missing required environment variables: {missing_vars}")
            logger.error("Please check your .env file and ensure all LiveKit credentials are set")
            return
        
        logger.info("Starting Goldilocks Story Agent...")
        logger.info(f"LiveKit URL: {os.getenv('LIVEKIT_WS_URL')}")
        
        # Launch the LiveKit agents worker
        agents.cli.run_app(
            agents.WorkerOptions(
                entrypoint_fnc=entrypoint,
                api_key=os.getenv("LIVEKIT_API_KEY"),
                api_secret=os.getenv("LIVEKIT_API_SECRET"),
                ws_url=os.getenv("LIVEKIT_WS_URL"),
            )
        )
    except KeyboardInterrupt:
        logger.info("Agent stopped by user")
    except Exception as e:
        logger.error(f"Error starting agent: {e}")
        raise

if __name__ == "__main__":
    main()