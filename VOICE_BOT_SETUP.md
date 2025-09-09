# Quick Voice Bot Setup Guide

## Issues Fixed
1. **JSON Commands Being Spoken**: Updated prompts to clearly separate speech vs data messages
2. **Voice Recognition**: Improved microphone handling and permissions
3. **Agent Configuration**: Enhanced LiveKit agent settings for better voice processing

## Steps to Run the Voice Bot

### 1. Set Up Environment Variables
Create a `.env` file in the `backend` directory:
```
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_WS_URL=wss://jarvis-w6b4irmm.livekit.cloud
GOOGLE_API_KEY=your_google_api_key
```

### 2. Start the Django Backend
```bash
cd backend
python manage.py runserver
```

### 3. Start the LiveKit Agent Worker
In a new terminal:
```bash
cd backend
python assistant/agent_worker.py
```

### 4. Start the React Frontend
In another terminal:
```bash
cd frontend
npm run dev
```

### 5. Test the Integration
1. Navigate to the GodAct1 component
2. Allow microphone permissions when prompted
3. Listen to the voice bot ask the question
4. Click the blue microphone button to record your answer
5. Click the red stop button when done speaking
6. Wait for voice feedback
7. Type your written answer when prompted

## Key Changes Made

### Prompts (prompts.py)
- ✅ Clear separation between speech and data messages
- ✅ Explicit instructions not to speak JSON
- ✅ Better microphone handling instructions
- ✅ Step-by-step voice interaction flow

### Agent Configuration (agent.py & agent_worker.py)
- ✅ Enabled both text and audio modalities
- ✅ Optimized for audio-only interaction
- ✅ Better noise cancellation settings
- ✅ Proper session initialization

### Frontend (GodAct1.jsx)
- ✅ Better microphone permission handling
- ✅ Clearer user instructions
- ✅ Enhanced error handling
- ✅ Visual feedback improvements

## Troubleshooting

### Voice Bot Speaking JSON
- Fixed: Prompts now clearly separate speech from data messages

### Microphone Not Working
- Check browser permissions for microphone access
- Ensure HTTPS or localhost (required for microphone access)
- Look for permission prompts in the browser

### Connection Issues
- Verify LiveKit credentials in .env file
- Check that both Django server and agent worker are running
- Test the status endpoint: `http://localhost:8000/voice_assistant/status/`

### Voice Not Recognized
- Speak clearly and wait for the recording to start
- Use the microphone button (blue = start, red = stop)
- Check browser console for any errors

## Expected Flow
1. 🤖 Bot asks: "What is the title of this story?"
2. 🎤 You click microphone and speak your answer
3. 🔴 You click stop when done speaking
4. 💬 Bot gives vocal feedback on your answer
5. ✍️ Bot prompts you to write in the text box
6. 📝 You type your final answer and submit
