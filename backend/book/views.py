from venv import logger
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import os
import requests
from dotenv import load_dotenv

load_dotenv()

# --- NEW: Centralized function to query the Groq API ---
def query_groq_api(prompt, model="llama3-8b-8192"):
    """
    Sends a prompt to the Groq API and returns the parsed JSON response.
    """
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key:
        logger.error("GROQ_API_KEY not found in environment variables.")
        return None

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "max_tokens": 500,
        "response_format": {"type": "json_object"}
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=20)
        response.raise_for_status()
        
        response_json = response.json()
        content_string = response_json.get('choices', [{}])[0].get('message', {}).get('content', '{}')
        
        return json.loads(content_string)

    except requests.RequestException as e:
        if e.response is not None:
            logger.error(f"Groq API Error: Status {e.response.status_code}, Body: {e.response.text}")
        else:
            logger.error(f"Groq API request failed: {e}")
        return None
    except (json.JSONDecodeError, IndexError, KeyError) as e:
        logger.error(f"Failed to parse Groq's response: {e}")
        return None


# --- Health Check ---
@csrf_exempt
def health_check(request):
    return JsonResponse({'status': 'ok', 'message': 'API is working!'})


# --- Question 1: Story Title ---
@csrf_exempt
@require_http_methods(["POST"])
def check_question1_answer(request):
    try:
        data = json.loads(request.body)
        user_answer = data.get('answer', '').strip()
        if not user_answer:
            return JsonResponse({'error': 'Please enter an answer.'}, status=400)
        return analyze_title_answer(user_answer)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def analyze_title_answer(user_answer):
    """
    Generates a prompt to evaluate a student's answer for the title
    "Goldilocks and the Three Bears", focusing only on the title's correctness, not spelling.
    """
    prompt = f"""You are a helpful reading teacher. Your goal is to evaluate if the student correctly identified the title of the story "Goldilocks and the Three Bears". Do NOT check for spelling mistakes.

    The correct title is: "Goldilocks and the Three Bears"
    Student's answer: "{user_answer}"
    
    Respond ONLY with a valid JSON object containing these keys:
    - "isCorrect": boolean
    - "message": "Your feedback here"
    - "feedback_type": "excellent/good/partial/incorrect"
    - "show_answer": boolean
    - "correct_answer": "Goldilocks and the Three Bears"

    Guidelines:
    - Your only task is to check if the student's answer correctly identifies the story's title. Ignore any and all spelling errors.
    - Close answers (e.g., "Goldilocks & the 3 bears") should be considered correct.
    - Partial answers (e.g., "Goldilocks" or "The Three Bears") should receive partial credit.
    - Be encouraging in your feedback message.
    - If the answer is incorrect, the "show_answer" key should be true. Otherwise, it should be false.
    """
    ai_response = query_groq_api(prompt)
    if ai_response:
        return JsonResponse(ai_response)
    else:
        return create_fallback_response(user_answer)

def create_fallback_response(user_answer):
    user_lower = user_answer.lower()
    correct_title = "Goldilocks and the Three Bears"
    has_goldilocks = 'goldilocks' in user_lower
    has_three_bears = 'three bears' in user_lower or '3 bears' in user_lower
    if has_goldilocks and has_three_bears:
        return JsonResponse({'isCorrect': True, 'message': 'Excellent! You got the title right!', 'feedback_type': 'excellent', 'show_answer': False, 'correct_answer': correct_title, 'misspelled_words': []})
    elif has_goldilocks:
        return JsonResponse({'isCorrect': False, 'message': 'You got the main character! But the title also includes the other characters.', 'feedback_type': 'partial', 'show_answer': True, 'correct_answer': correct_title, 'misspelled_words': []})
    else:
        return JsonResponse({'isCorrect': False, 'message': 'That\'s not quite right.', 'feedback_type': 'incorrect', 'show_answer': True, 'correct_answer': correct_title, 'misspelled_words': []})


# --- Question 2: Story Author ---
@csrf_exempt
@require_http_methods(["POST"])
def check_question2_answer(request):
    try:
        data = json.loads(request.body)
        user_answer = data.get('answer', '').strip()
        if not user_answer:
            return JsonResponse({'error': 'Please enter an answer.'}, status=400)
        return analyze_author_answer(user_answer)
    except Exception as e:
        return JsonResponse({'error': 'Internal server error.'}, status=500)

def analyze_author_answer(user_answer):
    prompt = f"""You are a helpful reading teacher. The story "Goldilocks" is a traditional folk tale. Correct answers include "Traditional", "Unknown", "Folk tale", or "Robert Southey".
    Student's answer: "{user_answer}"

    Respond ONLY with a valid JSON object containing these keys:
    - "isCorrect": boolean
    - "message": "Your feedback here"
    - "feedback_type": "excellent/good/partial/incorrect"
    - "show_answer": boolean
    - "correct_answer": "Traditional folk tale (no single author)"
    - "misspelled_words": []
    """
    ai_response = query_groq_api(prompt)
    if ai_response:
        return JsonResponse(ai_response)
    else:
        return create_author_fallback_response(user_answer)

def create_author_fallback_response(user_answer):
    user_lower = user_answer.lower()
    correct_answer = "Traditional folk tale (no single author)"
    correct_keywords = ['traditional', 'folk', 'unknown', 'anonymous', 'southey']
    if any(keyword in user_lower for keyword in correct_keywords):
        return JsonResponse({'isCorrect': True, 'message': 'Excellent! You understand that this is a traditional story.', 'feedback_type': 'excellent', 'show_answer': False, 'correct_answer': correct_answer, 'misspelled_words': []})
    else:
        return JsonResponse({'isCorrect': False, 'message': 'Not quite. This is a very old story that doesn\'t have a single author.', 'feedback_type': 'incorrect', 'show_answer': True, 'correct_answer': correct_answer, 'misspelled_words': []})


# --- Question 3: Story Genre ---
@csrf_exempt
@require_http_methods(["POST"])
def check_question3_answer(request):
    try:
        data = json.loads(request.body)
        user_answer = data.get('answer', '').strip()
        if not user_answer:
            return JsonResponse({'error': 'Please select an answer.'}, status=400)
        return analyze_genre_answer(user_answer)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def analyze_genre_answer(user_answer):
    prompt = f"""You are a helpful reading teacher. The correct genre for "Goldilocks" is "Fiction" or "Fairy Tale".
    Student's answer: "{user_answer}"

    Respond ONLY with a valid JSON object containing these keys:
    - "isCorrect": boolean
    - "message": "Your feedback here, explaining why it is or isn't fiction."
    - "feedback_type": "excellent/incorrect"
    - "show_answer": boolean
    - "correct_answer": "Fiction"
    """
    ai_response = query_groq_api(prompt)
    if ai_response:
        return JsonResponse(ai_response)
    else:
        return check_genre_manually(user_answer)

def check_genre_manually(user_answer):
    if user_answer == 'Fiction':
        return JsonResponse({'isCorrect': True, 'message': 'Excellent! "Fiction" is correct because the story is imaginary.', 'feedback_type': 'excellent', 'show_answer': False, 'correct_answer': 'Fiction'})
    elif user_answer == 'Non-Fiction':
        return JsonResponse({'isCorrect': False, 'message': 'Not quite! The story is fiction because it\'s a made-up tale.', 'feedback_type': 'incorrect', 'show_answer': True, 'correct_answer': 'Fiction'})
    else:
        return JsonResponse({'isCorrect': False, 'message': 'Please select either Fiction or Non-Fiction.', 'feedback_type': 'guidance', 'show_answer': False, 'correct_answer': 'Fiction'})


# --- Question 4: Story Characters ---
@csrf_exempt
@require_http_methods(["POST"])
def check_question4_answer(request):
    try:
        data = json.loads(request.body)
        user_answer = data.get('answer', '').strip()
        if not user_answer:
            return JsonResponse({'error': 'Please enter an answer.'}, status=400)
        return analyze_characters_answer(user_answer)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def analyze_characters_answer(user_answer):
    prompt = f"""You are a teacher evaluating a student's answer about the characters in "Goldilocks and the Three Bears".
    Characters are Goldilocks, Papa Bear, Mama Bear, Baby Bear.
    Student's answer: "{user_answer}"

    Respond ONLY with a valid JSON object containing these keys:
    - "isCorrect": boolean
    - "message": "Your feedback here"
    - "feedback_type": "excellent/good/partial/needs_improvement"
    - "show_answer": boolean
    - "correct_answer": "Goldilocks, Papa Bear, Mama Bear, and Baby Bear"
    - "misspelled_words": []

    Guidelines: 4 chars=excellent, 3=good, 2=partial, 1 or less=needs_improvement. `isCorrect` is true for excellent and good.
    """
    ai_response = query_groq_api(prompt)
    if ai_response:
        return JsonResponse(ai_response)
    else:
        return create_characters_fallback_response(user_answer)

def create_characters_fallback_response(user_answer):
    user_lower = user_answer.lower()
    correct_answer = "Goldilocks, Papa Bear, Mama Bear, and Baby Bear"
    character_count = sum([
        'goldilocks' in user_lower,
        any(word in user_lower for word in ['papa', 'father', 'big bear']),
        any(word in user_lower for word in ['mama', 'mother', 'medium bear']),
        any(word in user_lower for word in ['baby', 'little', 'small bear'])
    ])
    if character_count >= 4:
        return JsonResponse({'isCorrect': True, 'message': 'Excellent! You identified all the main characters.', 'feedback_type': 'excellent', 'show_answer': False, 'correct_answer': correct_answer, 'misspelled_words': []})
    elif character_count == 3:
        return JsonResponse({'isCorrect': True, 'message': 'Good job! You got most of the characters.', 'feedback_type': 'good', 'show_answer': False, 'correct_answer': correct_answer, 'misspelled_words': []})
    else:
        return JsonResponse({'isCorrect': False, 'message': 'You\'re on the right track, but there are more main characters.', 'feedback_type': 'partial', 'show_answer': True, 'correct_answer': correct_answer, 'misspelled_words': []})


# --- Question 5: Story Setting ---
@csrf_exempt
@require_http_methods(["POST"])
def check_question5_answer(request):
    try:
        data = json.loads(request.body)
        user_answer = data.get('answer', '').strip()
        if not user_answer:
            return JsonResponse({'error': 'Please enter an answer.'}, status=400)
        return analyze_setting_answer(user_answer)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def analyze_setting_answer(user_answer):
    prompt = f"""You are a teacher evaluating a student's answer about the setting of "Goldilocks and the Three Bears".
    The setting is the woods/forest and the bears' house/cottage.
    Student's answer: "{user_answer}"

    Respond ONLY with a valid JSON object containing these keys:
    - "isCorrect": boolean
    - "message": "Your feedback here"
    - "feedback_type": "excellent/good/partial/needs_improvement"
    - "show_answer": boolean
    - "correct_answer": "In the woods and at the bears' house"
    - "misspelled_words": []

    Guidelines: Both woods & house=excellent, just one=good. `isCorrect` is true for excellent and good.
    """
    ai_response = query_groq_api(prompt)
    if ai_response:
        return JsonResponse(ai_response)
    else:
        return create_setting_fallback_response(user_answer)

def create_setting_fallback_response(user_answer):
    user_lower = user_answer.lower()
    correct_answer = "In the woods and at the bears' house"
    has_woods = any(word in user_lower for word in ['wood', 'forest'])
    has_house = any(word in user_lower for word in ['house', 'home', 'cottage'])
    if has_woods and has_house:
        return JsonResponse({'isCorrect': True, 'message': 'Excellent! You identified both the woods and the house.', 'feedback_type': 'excellent', 'show_answer': False, 'correct_answer': correct_answer, 'misspelled_words': []})
    elif has_woods or has_house:
        return JsonResponse({'isCorrect': True, 'message': 'Good! You identified one of the main settings.', 'feedback_type': 'good', 'show_answer': False, 'correct_answer': correct_answer, 'misspelled_words': []})
    else:
        return JsonResponse({'isCorrect': False, 'message': 'Think about where the story takes place.', 'feedback_type': 'needs_improvement', 'show_answer': True, 'correct_answer': correct_answer, 'misspelled_words': []})


# --- Question 6: Story Events ---
@csrf_exempt
@require_http_methods(["POST"])
def check_question6_answer(request):
    try:
        data = json.loads(request.body)
        user_input = data.get('answer', '').strip() or data.get('answers', [])
        if not user_input:
            return JsonResponse({'error': 'No answer was provided.'}, status=400)
        return analyze_story_events_answer(user_input)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def analyze_story_events_answer(user_input):
    prompt = f"""You are a teacher evaluating a student's summary of "Goldilocks and the Three Bears".
    Main events: Goldilocks enters house, tries porridge/chairs/beds, bears find her, she runs away.
    Student's answer(s): "{user_input}"

    Respond ONLY with a valid JSON object containing these keys:
    - "isCorrect": boolean
    - "message": "Your feedback here"
    - "feedback_type": "excellent/good/partial/needs_improvement"
    - "show_answer": boolean
    - "correct_answer": "1. Goldilocks enters the bears' house\\n2. She tries their items\\n3. The bears find her and she runs away"
    - "misspelled_words": [["list for answer1"], ["list for answer2"]]

    Guidelines: 3+ events=excellent, 2=good, 1=partial. `isCorrect` is true for excellent and good. If input is a single string, parse it for events.
    """
    ai_response = query_groq_api(prompt)
    if ai_response:
        return JsonResponse(ai_response)
    else:
        return create_story_events_fallback_response(user_input)

def create_story_events_fallback_response(user_answers):
    all_text = " ".join(user_answers).lower() if isinstance(user_answers, list) else user_answers.lower()
    story_elements = sum([
        'goldilocks' in all_text, 'house' in all_text, 'porridge' in all_text,
        'chair' in all_text, 'bed' in all_text, 'bear' in all_text, 'run' in all_text
    ])
    if story_elements >= 5:
        return JsonResponse({'isCorrect': True, 'message': 'Excellent! You identified many important events.', 'feedback_type': 'excellent', 'show_answer': False})
    elif story_elements >= 2:
        return JsonResponse({'isCorrect': True, 'message': 'Good job! You got several important story events.', 'feedback_type': 'good', 'show_answer': False})
    else:
        return JsonResponse({'isCorrect': False, 'message': 'You have some elements, but try to think of more major events.', 'feedback_type': 'partial', 'show_answer': True})


# --- Question 7: Favourite Character ---
@csrf_exempt
@require_http_methods(["POST"])
def check_goldilocks_favourite_character_answer(request):
    try:
        data = json.loads(request.body)
        user_answer = data.get('answer', '').strip()
        if not user_answer:
            return JsonResponse({'error': 'Please write about your favourite character.'}, status=400)
        return analyze_goldilocks_favourite_character_answer(user_answer)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def analyze_goldilocks_favourite_character_answer(user_answer):
    prompt = f"""You are a teacher evaluating a student's opinion on their favorite character from "Goldilocks".
    Student's answer: "{user_answer}"

    Respond ONLY with a valid JSON object containing these keys:
    - "isCorrect": boolean
    - "message": "Your encouraging feedback here"
    - "feedback_type": "excellent/good/partial/needs_improvement"
    - "show_answer": false
    - "misspelled_words": []

    Guidelines: Valid character + reason = excellent/good. Valid character, no reason = partial. No character = needs_improvement. Always be positive. `isCorrect` is true if feedback is not needs_improvement.
    """
    ai_response = query_groq_api(prompt)
    if ai_response:
        return JsonResponse(ai_response)
    else:
        return create_goldilocks_favourite_character_fallback_response(user_answer)

def create_goldilocks_favourite_character_fallback_response(user_answer):
    user_lower = user_answer.lower()
    has_character = any(char in user_lower for char in ['goldilocks', 'papa', 'mama', 'baby', 'bear'])
    has_reasoning = any(word in user_lower for word in ['because', 'like', 'favourite'])
    if has_character and has_reasoning:
        return JsonResponse({'isCorrect': True, 'message': 'Excellent! You chose a character and gave a great reason.', 'feedback_type': 'excellent', 'show_answer': False, 'misspelled_words': []})
    elif has_character:
        return JsonResponse({'isCorrect': True, 'message': 'You mentioned a character! Can you tell us more about why they are your favourite?', 'feedback_type': 'good', 'show_answer': False, 'misspelled_words': []})
    else:
        return JsonResponse({'isCorrect': False, 'message': 'Remember to choose a character from the story.', 'feedback_type': 'needs_improvement', 'show_answer': False, 'misspelled_words': []})


# --- Question 8: Favourite Part ---
@csrf_exempt
@require_http_methods(["POST"])
def check_question8_answer(request):
    try:
        data = json.loads(request.body)
        user_answer = data.get('answer', '').strip()
        if not user_answer:
            return JsonResponse({'error': 'Please tell us your favourite part.'}, status=400)
        return analyze_favorite_part_answer(user_answer)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def analyze_favorite_part_answer(user_answer):
    prompt = f"""Evaluate the student's opinion on their favorite part of "Goldilocks".
    Student's answer: "{user_answer}"
    
    Respond ONLY with a valid JSON object containing these keys:
    - "isCorrect": boolean
    - "message": "Your encouraging feedback here"
    - "feedback_type": "excellent/good/partial/needs_improvement"
    - "show_answer": false
    - "misspelled_words": []

    Guidelines: This is subjective. A story part + reason = excellent/good. A story part with no reason = partial. No story part = needs_improvement. `isCorrect` is true if feedback is not needs_improvement.
    """
    ai_response = query_groq_api(prompt)
    if ai_response:
        return JsonResponse(ai_response)
    else:
        return create_favorite_part_fallback_response(user_answer)

def create_favorite_part_fallback_response(user_answer):
    user_lower = user_answer.lower()
    has_story_part = any(word in user_lower for word in ['porridge', 'chair', 'bed', 'bears', 'house', 'running'])
    has_reasoning = any(word in user_lower for word in ['because', 'liked', 'favourite', 'funny'])
    if has_story_part and has_reasoning:
        return JsonResponse({'isCorrect': True, 'message': 'That\'s a great choice! Thanks for explaining why you liked it.', 'feedback_type': 'excellent', 'show_answer': False, 'misspelled_words': []})
    elif has_story_part:
        return JsonResponse({'isCorrect': True, 'message': 'Good pick! Can you also tell me *why* that was your favourite part?', 'feedback_type': 'good', 'show_answer': False, 'misspelled_words': []})
    else:
        return JsonResponse({'isCorrect': False, 'message': 'Try to think about a specific part of the story you liked.', 'feedback_type': 'needs_improvement', 'show_answer': False, 'misspelled_words': []})