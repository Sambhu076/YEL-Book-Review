# Voice Bot Integration for Goldilocks Questions

## Overview
This integration provides a complete voice bot experience for the "Goldilocks and the Three Bears" reading comprehension questions. The voice bot follows a specific 6-step workflow for each question.

## Voice Bot Flow
1. **Bot asks question vocally** - The AI assistant speaks the question clearly
2. **User responds vocally** - Student speaks their answer into the microphone
3. **Bot analyzes vocal response + gives vocal feedback** - AI provides encouraging feedback about their spoken answer
4. **Bot prompts: "Now write your answer in the input"** - AI asks student to type their answer
5. **User types in input field** - Student writes their final answer
6. **System analyzes written answer + gives text feedback** - System provides feedback on written response

## Setup Instructions

### Backend Setup
1. **Environment Variables**: Create a `.env` file in the backend directory with:
   ```
   LIVEKIT_API_KEY=your_livekit_api_key
   LIVEKIT_API_SECRET=your_livekit_api_secret
   LIVEKIT_WS_URL=wss://your-livekit-server.com
   ```

2. **Install Dependencies**: Make sure all required packages are installed:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run Django Server**:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Voice Assistant Endpoints
- `POST /voice_assistant/token/` - Get LiveKit token for voice connection
- `GET /voice_assistant/status/` - Check voice bot integration status
- `POST /voice_assistant/voice-query/` - Fallback text-based voice endpoint
- `GET /voice_assistant/test/` - Test endpoint

### Question Checking Endpoints
- `POST /api/check-question1/` - Check answer for question 1 (title)

## Questions Covered
The voice bot handles 9 questions about "Goldilocks and the Three Bears":

1. What is the title of this story?
2. Who is the author of this story?
3. What genre is this story - Fiction or Non-Fiction?
4. Who are the main characters in this story?
5. Where does the story take place?
6. What are three important events that happen in the story?
7. What is the problem or conflict in the story?
8. Who is your favorite character and why?
9. What lesson or moral does this story teach us?

## Voice Bot Features

### Real-time Voice Interaction
- LiveKit integration for real-time audio communication
- Noise cancellation for clear audio
- Automatic microphone management

### Intelligent Feedback
- Vocal feedback on spoken responses
- Written feedback on typed answers
- Encouraging and educational responses
- Comparison between spoken and written answers

### User Experience
- Visual progress indicators
- Audio visualizers during recording
- Clear status messages
- Disabled states during processing

## Technical Implementation

### Frontend Components
- `GodAct1.jsx` - Main voice-integrated question component
- LiveKit client integration
- Real-time audio handling
- State management for voice modes

### Backend Services
- Django REST API for token generation
- LiveKit agent for voice processing
- Google Realtime AI for natural language understanding
- Custom prompts for educational interactions

### Data Flow
1. Frontend requests LiveKit token
2. Backend generates token and returns connection details
3. Frontend connects to LiveKit room
4. Voice bot agent joins room and starts asking questions
5. Real-time audio and data messages flow between frontend and agent
6. Frontend updates UI based on agent messages

## Testing the Integration

### Check Voice Bot Status
```bash
curl http://localhost:8000/voice_assistant/status/
```

### Test Token Generation
```bash
curl -X POST http://localhost:8000/voice_assistant/token/ \
  -H "Content-Type: application/json" \
  -d '{"identity": "test_student", "room": "goldilocks_question1"}'
```

## Troubleshooting

### Common Issues
1. **LiveKit Connection Failed**: Check API credentials and network connectivity
2. **Audio Not Working**: Ensure microphone permissions are granted
3. **Token Generation Error**: Verify environment variables are set correctly
4. **Voice Bot Not Responding**: Check if the agent is properly configured

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify Django server is running
3. Test API endpoints individually
4. Check LiveKit dashboard for connection status

## Future Enhancements
- Support for multiple stories and question sets
- Advanced speech recognition improvements
- Multi-language support
- Progress tracking and analytics
- Integration with learning management systems
