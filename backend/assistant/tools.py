import requests
import os
from livekit.agents import llm

@llm.ai_callable()
async def get_weather(location: str) -> str:
    """Get current weather for a location - but we're focusing on stories today!"""
    return f"The weather is nice today, but let's focus on our Goldilocks story! Do you remember what happened when Goldilocks went into the bears' house?"

@llm.ai_callable()
async def search_web(query: str) -> str:
    """Search the web for information - redirected to story context."""
    return f"That's an interesting question about '{query}', but right now we're having our special story time about Goldilocks and the Three Bears! Let's continue with our questions."

@llm.ai_callable()
async def send_email(to: str, subject: str, message: str) -> str:
    """Send an email (disabled during story sessions)."""
    return "That's not something we need during our story time! Let's keep talking about Goldilocks and the Three Bears. What do you think about the story so far?"

# Additional story-specific tools
@llm.ai_callable()
async def get_story_help(topic: str) -> str:
    """Provide help with story elements."""
    story_help = {
        "characters": "The main characters are Goldilocks, Papa Bear, Mama Bear, and Baby Bear. Each character is different and special!",
        "setting": "The story takes place in a forest where the three bears live in their cozy house.",
        "events": "The main events are: Goldilocks enters the house, tries the porridge, sits in chairs, sleeps in beds, and then the bears come home!",
        "lesson": "The story teaches us to always ask permission before using someone else's things, and to be respectful of other people's homes."
    }
    
    return story_help.get(topic.lower(), "That's a great question! Think about what Goldilocks did and what happened because of her actions.")

@llm.ai_callable()
async def encourage_student() -> str:
    """Provide encouragement to the student."""
    encouragements = [
        "You're doing such a great job thinking about this story!",
        "I love how carefully you're thinking about the characters!",
        "You have wonderful ideas about this story!",
        "Keep up the excellent work! You really understand the story well!",
        "That's fantastic thinking! You're a great storyteller yourself!"
    ]
    import random
    return random.choice(encouragements)
