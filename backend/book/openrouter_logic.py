import os
import requests
import json
from django.http import JsonResponse

# NOTE: This file contains the AI analysis functions previously in views.py
# They are moved here to be shared between the Django views and the LiveKit agent.

import os
import requests
import json
from django.http import JsonResponse # Still needed for the fallback function

def analyze_title_answer(user_answer):
    """
    Use AI to analyze the title answer.
    This function ALWAYS returns a dictionary.
    """
    api_key = os.getenv('OPENROUTER_API_KEY2')
    if not api_key:
        # Call the fallback, ensuring it returns a dictionary
        return create_fallback_response(user_answer, as_dict=True)

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

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

Note on "misspelled_words":
- This must be a simple list of strings.
- If there are no spelling mistakes, return an empty list: [].

Guidelines for the TITLE question:
- If the answer is exactly correct or very close (like "goldilocks and the three bears"), mark as correct.
- If they have the main elements but are missing something (like just "Goldilocks"), mark as partial.
- If completely wrong, mark as incorrect.
- Always be encouraging.
- If isCorrect is false, set show_answer to true.
- If isCorrect is true, set show_answer to false.

Student's answer: "{user_answer}" """

    payload = {
        "model": "openai/gpt-4o-mini",
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": f'Please analyze this title answer: "{user_answer}"'}
        ],
        "temperature": 0.3,
        "max_tokens": 200
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        if response.status_code == 200:
            result_raw = response.json()['choices'][0]['message']['content'].strip()
            try:
                # This is a dict, which is the correct return type
                return json.loads(result_raw)
            except json.JSONDecodeError:
                # If AI response is not valid JSON, use the fallback (as a dict)
                return create_fallback_response(user_answer, as_dict=True)
        # Handle API errors by returning an error dictionary
        return {'isCorrect': False, 'message': 'The AI service is temporarily unavailable. Please try again.'}
    except requests.RequestException:
        # Handle network errors by returning an error dictionary
        return {'isCorrect': False, 'message': 'There was a network error. Please check your connection and try again.'}


def create_fallback_response(user_answer, as_dict=False):
    """
    Create a fallback response if the AI service fails.
    Returns a dictionary if as_dict is True, otherwise returns a JsonResponse.
    """
    user_lower = user_answer.lower()
    correct_title = "Goldilocks and the Three Bears"
    
    # Simple keyword matching logic
    has_goldilocks = 'goldilocks' in user_lower
    has_three_bears = 'three bears' in user_lower or '3 bears' in user_lower
    has_bears = 'bear' in user_lower
    
    response_data = {}

    if has_goldilocks and has_three_bears:
        response_data = {
            'isCorrect': True,
            'message': 'Excellent! You got the title right!',
            'feedback_type': 'excellent',
            'show_answer': False,
            'correct_answer': correct_title,
            'misspelled_words': []
        }
    elif has_goldilocks and has_bears:
        response_data = {
            'isCorrect': False,
            'message': 'Good! You have the main character, but the title also mentions how many bears there are.',
            'feedback_type': 'partial',
            'show_answer': True,
            'correct_answer': correct_title,
            'misspelled_words': []
        }
    elif has_goldilocks:
        response_data = {
            'isCorrect': False,
            'message': 'You got the main character! But the title also includes information about the other characters.',
            'feedback_type': 'partial',
            'show_answer': True,
            'correct_answer': correct_title,
            'misspelled_words': []
        }
    elif has_bears:
        response_data = {
            'isCorrect': False,
            'message': 'You identified some characters, but you\'re missing the main character\'s name.',
            'feedback_type': 'partial',
            'show_answer': True,
            'correct_answer': correct_title,
            'misspelled_words': []
        }
    else:
        response_data = {
            'isCorrect': False,
            'message': 'That\'s not quite right. Think about the main character and the other characters in the story.',
            'feedback_type': 'incorrect',
            'show_answer': True,
            'correct_answer': correct_title,
            'misspelled_words': []
        }
    
    # This is the key change: return a dict or a JsonResponse based on the parameter
    return response_data if as_dict else JsonResponse(response_data)