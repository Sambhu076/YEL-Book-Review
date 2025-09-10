import asyncio
import os
import json
from dotenv import load_dotenv

# LiveKit imports
from livekit import rtc
from livekit.agents import JobContext, WorkerOptions, cli

# Google imports for STT and LLM (from livekit-agents)
from livekit.plugins import google

# Direct Google Cloud Text-to-Speech import
from google.cloud import texttospeech

load_dotenv()

# --- Configuration ---
STT_PLUGIN = google.STT()
LLM_PLUGIN = google.LLM()

# Initialize the official Google TTS client directly
TTS_CLIENT = texttospeech.TextToSpeechClient()

# Define your desired voice settings here
VOICE_PARAMS = texttospeech.VoiceSelectionParams(
    language_code="en-US",
    name="en-US-Chirp3-HD-Kore"
)
AUDIO_CONFIG = texttospeech.AudioConfig(
    audio_encoding=texttospeech.AudioEncoding.LINEAR16,
    sample_rate_hertz=24000 # Required for high-fidelity voices like Chirp
)


async def process_user_speech(ctx: JobContext, track: rtc.AudioTrack):
    audio_stream = rtc.AudioStream(track)
    stt_stream = STT_PLUGIN.stream()
    text_stream = stt_stream.pipe(audio_stream)
    
    print("Agent is listening to user...")

    try:
        async for stt_event in text_stream:
            if stt_event.is_final:
                user_transcript = stt_event.alternatives[0].text
                print(f"User said: {user_transcript}")

                if not user_transcript:
                    continue

                prompt = f"""You are a helpful reading teacher checking if a student correctly identified the story title. Your task is twofold:
1. Evaluate the correctness of the student's answer about the story "Goldilocks and the Three Bears".
2. Identify any misspelled English words in their answer.
The correct story title is: "Goldilocks and the Three Bears"
IMPORTANT: Your entire response MUST be a single, valid JSON object and nothing else.
The required JSON format is:
{{
    "isCorrect": true/false,
    "message": "Your feedback message here",
    "feedback_type": "excellent", "good", "partial", or "incorrect",
    "show_answer": true/false,
    "correct_answer": "Goldilocks and the Three Bears",
    "misspelled_words": ["word1", "word2"]
}}
Student's answer: "{user_transcript}" """

                llm_stream = await LLM_PLUGIN.chat(prompt)
                full_response = "".join([chunk.text async for chunk in llm_stream])
                
                print(f"Gemini raw response: {full_response}")

                try:
                    ai_response_dict = json.loads(full_response)
                    feedback_message = ai_response_dict.get('message')

                    if not feedback_message:
                        print("AI response has no message to speak.")
                        continue

                    print(f"AI response to speak: {feedback_message}")

                    # --- New TTS logic using the direct API call ---
                    synthesis_input = texttospeech.SynthesisInput(text=feedback_message)
                    
                    # Make the API call to synthesize speech
                    response = TTS_CLIENT.synthesize_speech(
                        input=synthesis_input, voice=VOICE_PARAMS, audio_config=AUDIO_CONFIG
                    )
                    
                    # Create an audio source to stream the response
                    audio_source = rtc.AudioSource(AUDIO_CONFIG.sample_rate_hertz, 1) # 1 channel for mono
                    await ctx.room.local_participant.publish_track(audio_source)
                    
                    # Stream the audio bytes back to the user in chunks (frames)
                    frame_duration_ms = 20
                    frame_size = int(AUDIO_CONFIG.sample_rate_hertz * (frame_duration_ms / 1000) * 2) # 16-bit PCM = 2 bytes per sample

                    audio_bytes = response.audio_content
                    for i in range(0, len(audio_bytes), frame_size):
                        chunk = audio_bytes[i:i+frame_size]
                        if len(chunk) < frame_size:
                            break # Don't send partial frames
                        
                        frame = rtc.AudioFrame(
                            data=chunk,
                            sample_rate=AUDIO_CONFIG.sample_rate_hertz,
                            num_channels=1,
                            samples_per_channel=len(chunk) // 2
                        )
                        await audio_source.capture_frame(frame)
                    
                    print("Finished speaking response.")

                except json.JSONDecodeError:
                    print(f"Error: Could not decode Gemini's response into JSON. Response was: {full_response}")

    finally:
        await text_stream.aclose()


async def request_handler(ctx: JobContext):
    print(f"Agent connected to room: {ctx.room.name}")
    @ctx.room.on("track_published")
    def on_track_published(publication: rtc.TrackPublication, participant: rtc.RemoteParticipant):
        agent_identity = ctx.room.local_participant.identity
        if publication.kind == rtc.TrackKind.AUDIO and participant.identity != agent_identity:
            track = publication.track
            if track:
                asyncio.create_task(process_user_speech(ctx, track))

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=request_handler))