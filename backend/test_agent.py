#!/usr/bin/env python3
"""
Test script to verify the voice agent is working correctly.
Run this to test the agent without the full LiveKit setup.
"""

import sys
import os
import asyncio
import logging

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from assistant.prompts import AGENT_INSTRUCTION, SESSION_INSTRUCTION

def test_prompts():
    """Test that prompts are loaded correctly"""
    print("=== TESTING PROMPTS ===")
    print(f"AGENT_INSTRUCTION length: {len(AGENT_INSTRUCTION)}")
    print(f"SESSION_INSTRUCTION length: {len(SESSION_INSTRUCTION)}")
    
    print("\n=== AGENT_INSTRUCTION (first 500 chars) ===")
    print(AGENT_INSTRUCTION[:500])
    
    print("\n=== SESSION_INSTRUCTION (first 500 chars) ===")
    print(SESSION_INSTRUCTION[:500])
    
    return True

def test_environment():
    """Test environment variables"""
    print("\n=== TESTING ENVIRONMENT ===")
    
    required_vars = [
        'LIVEKIT_API_KEY',
        'LIVEKIT_API_SECRET', 
        'LIVEKIT_WS_URL'
    ]
    
    missing_vars = []
    for var in required_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: {value[:20]}...")
        else:
            print(f"❌ {var}: Not set")
            missing_vars.append(var)
    
    if missing_vars:
        print(f"\n⚠️  Missing environment variables: {', '.join(missing_vars)}")
        return False
    
    return True

async def test_agent_creation():
    """Test that the agent can be created"""
    print("\n=== TESTING AGENT CREATION ===")
    
    try:
        from assistant.agent import Assistant
        assistant = Assistant()
        print("✅ Agent created successfully")
        print(f"   Instructions length: {len(assistant.instructions)}")
        return True
    except Exception as e:
        print(f"❌ Agent creation failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Voice Bot Agent Setup\n")
    
    # Test prompts
    prompts_ok = test_prompts()
    
    # Test environment
    env_ok = test_environment()
    
    # Test agent creation
    try:
        agent_ok = asyncio.run(test_agent_creation())
    except Exception as e:
        print(f"❌ Agent test failed: {e}")
        agent_ok = False
    
    # Summary
    print("\n=== TEST SUMMARY ===")
    print(f"Prompts: {'✅' if prompts_ok else '❌'}")
    print(f"Environment: {'✅' if env_ok else '❌'}")
    print(f"Agent Creation: {'✅' if agent_ok else '❌'}")
    
    if all([prompts_ok, env_ok, agent_ok]):
        print("\n🎉 All tests passed! Agent should be ready to run.")
        print("\nTo start the agent:")
        print("1. Start Django: python manage.py runserver")
        print("2. Start Agent: python assistant/agent_worker.py")
        print("3. Start Frontend: npm run dev")
    else:
        print("\n❌ Some tests failed. Please fix the issues above.")

if __name__ == "__main__":
    main()
