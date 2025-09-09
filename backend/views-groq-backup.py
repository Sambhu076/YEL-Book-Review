# Django Views (API Only) - No templates needed!
from venv import logger
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import os
import requests
from dotenv import load_dotenv
import json

load_dotenv()

@csrf_exempt
def health_check(request):
    """
    Simple health check endpoint
    """
    return JsonResponse({
        'status': 'ok',
        'message': 'API is working!'
    })

@csrf_exempt
@require_http_methods(["POST"])
def check_question1_answer(request):
    """
    API endpoint to check Question 1 answer - Story Title
    """
    try:
        data = json.loads(request.body)
        user_answer = data.get('answer', '').strip()
        
        if not user_answer:
            return JsonResponse({
                'error': 'Please enter an answer.'
            }, status=400)

        # Basic validation checks
        if len(user_answer) < 2:
            return JsonResponse({
                'isCorrect': False,
                'message': 'Please provide a more complete answer.',
                'feedback_type': 'guidance',
                'show_answer': False
            })

        if not user_answer[0].isupper():
            return JsonResponse({
                'isCorrect': False,
                'message': 'Remember to start your answer with a capital letter.',
                'feedback_type': 'correction',
                'show_answer': False,
                'highlight_issue': 'capitalization'
            })

        # AI-powered analysis for the title question
        return analyze_title_answer(user_answer)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid data format.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def analyze_title_answer(user_answer):
    """
    Use AI to analyze the title answer specifically
    """
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key:
        return create_fallback_response(user_answer)

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-app-domain.com",
        "X-Title": "Story Title Checker"
    }

    prompt = f"""You are a helpful reading teacher checking if a student correctly identified the story title.

The correct story title is: "Goldilocks and the Three Bears"

IMPORTANT: Always respond with valid JSON in this exact format:
{{
    "isCorrect": true/false, 
    "result": "Your feedback message here",
    "feedback_type": "excellent", "good", "partial", or "incorrect",
    "show_answer": true/false,
    "correct_answer": "Goldilocks and the Three Bears"
}}

Guidelines:
- If the answer is exactly correct or very close (like "goldilocks and the three bears"), mark as correct
- If they have the main elements but missing something (like just "Goldilocks" or "Three Bears"), mark as partial
- If they have some right elements but significant errors, give guidance
- If completely wrong, mark as incorrect
- Always be encouraging and specific in your feedback
- If isCorrect is false, set show_answer to true 
- If isCorrect is true, set show_answer to false 

Student's answer: "{user_answer}\""""

    payload = {
        "model": "llama3-8b-8192",
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
                parsed_result = json.loads(result_raw)
                if 'result' in parsed_result and 'message' not in parsed_result:
                    parsed_result['message'] = parsed_result['result']
                return JsonResponse(parsed_result)
            except json.JSONDecodeError:
                return create_fallback_response(user_answer)
        
        return JsonResponse({
            'error': f'AI service temporarily unavailable. Please try again.'
        }, status=500)

    except requests.RequestException as e:
        return JsonResponse({
            'error': 'Unable to check answer right now. Please try again.'
        }, status=500)


def create_fallback_response(user_answer):
    """
    Create a fallback response if AI service fails
    """
    try:
        user_lower = user_answer.lower()
        correct_title = "Goldilocks and the Three Bears"
        
        # Simple keyword matching as fallback
        has_goldilocks = 'goldilocks' in user_lower
        has_three_bears = 'three bears' in user_lower or '3 bears' in user_lower
        has_bears = 'bear' in user_lower
        
        if has_goldilocks and has_three_bears:
            return JsonResponse({
                'isCorrect': True,
                'message': 'Excellent! You got the title right!',
                'feedback_type': 'excellent',
                'show_answer': False,
                'correct_answer': correct_title
            })
        elif has_goldilocks and has_bears:
            return JsonResponse({
                'isCorrect': False,
                'message': 'Good! You have the main character, but the title also mentions how many bears there are.',
                'feedback_type': 'partial',
                'show_answer': True,
                'correct_answer': correct_title
            })
        elif has_goldilocks:
            return JsonResponse({
                'isCorrect': False,
                'message': 'You got the main character! But the title also includes information about the other characters.',
                'feedback_type': 'partial',
                'show_answer': True,
                'correct_answer': correct_title
            })
        elif has_bears:
            return JsonResponse({
                'isCorrect': False,
                'message': 'You identified some characters, but you\'re missing the main character\'s name.',
                'feedback_type': 'partial',
                'show_answer': True,
                'correct_answer': correct_title
            })
        else:
            return JsonResponse({
                'isCorrect': False,
                'message': 'That\'s not quite right. Think about the main character and the other characters in the story.',
                'feedback_type': 'incorrect',
                'show_answer': True,
                'correct_answer': correct_title
            })
    except Exception as e:
        return JsonResponse({
            'isCorrect': False,
            'message': 'Please try again.',
            'feedback_type': 'error',
            'show_answer': False
        })

@csrf_exempt
@require_http_methods(["POST"])
def check_question2_answer(request):
    """
    API endpoint to check Question 2 answer - Story Author
    """
    try:
        data = json.loads(request.body)
        user_answer = data.get('answer', '').strip()
        
        logger.debug(f"Question 2 - Received answer: {user_answer}")
        
        if not user_answer:
            return JsonResponse({
                'error': 'Please enter an answer.'
            }, status=400)

        # Basic validation checks
        if len(user_answer) < 2:
            return JsonResponse({
                'isCorrect': False,
                'message': 'Please provide a more complete answer.',
                'feedback_type': 'guidance',
                'show_answer': False
            })

        if not user_answer[0].isupper():
            return JsonResponse({
                'isCorrect': False,
                'message': 'Remember to start your answer with a capital letter.',
                'feedback_type': 'correction',
                'show_answer': False,
                'highlight_issue': 'capitalization'
            })

        # AI-powered analysis for the author question
        return analyze_author_answer(user_answer)

    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {e}")
        return JsonResponse({'error': 'Invalid data format.'}, status=400)
    except Exception as e:
        logger.error(f"Unexpected error in check_question2_answer: {e}")
        return JsonResponse({'error': 'Internal server error.'}, status=500)


def analyze_author_answer(user_answer):
    """
    Use AI to analyze the author answer specifically
    """
    api_key = os.getenv('GROQ_API_KEY')
    logger.debug(f"API key exists: {bool(api_key)}")
    
    if not api_key:
        logger.warning("OpenRouter API key not found, using fallback")
        return create_author_fallback_response(user_answer)

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-app-domain.com",
        "X-Title": "Story Author Checker"
    }

    prompt = f"""You are a helpful reading teacher checking if a student correctly identified the author of "Goldilocks and the Three Bears".

IMPORTANT CONTEXT: "Goldilocks and the Three Bears" is a traditional folk tale with no single author. It has been passed down through oral tradition and has many versions.

CORRECT ANSWERS include (any of these should be marked as correct):
- "Traditional story" / "Traditional folk tale"
- "Unknown" / "Unknown author"
- "Anonymous" 
- "Folk tale" / "Fairy tale"
- "Oral tradition"
- Historical attributions like "Robert Southey" (who published an early version)
- "No specific author" / "No single author"

IMPORTANT: Always respond with valid JSON in this exact format:
{{
    "isCorrect": true/false,
    "message": "Your feedback message here",
    "feedback_type": "excellent", "good", "partial", or "incorrect",
    "show_answer": true/false,
    "correct_answer": "Traditional folk tale (no single author)"
}}

Guidelines:
- If they mention any correct concept (traditional, folk tale, unknown, anonymous, etc.), mark as correct
- If they give a specific author name that's historically associated (like Robert Southey), mark as good/correct
- If they give a completely wrong specific author (like "Dr. Seuss"), mark as incorrect
- If they show understanding that it's not a single author, mark as correct
- Always be encouraging and educational
- If isCorrect is false, set show_answer to true
- If isCorrect is true, set show_answer to false

Student's answer: "{user_answer}\""""

    payload = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": f'Please analyze this author answer: "{user_answer}"'}
        ],
        "temperature": 0.3,
        "max_tokens": 250
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        logger.debug(f"OpenRouter response status: {response.status_code}")
        
        if response.status_code == 200:
            result_raw = response.json()['choices'][0]['message']['content'].strip()
            logger.debug(f"OpenRouter raw response: {result_raw}")
            
            try:
                # Try to parse JSON response
                parsed_result = json.loads(result_raw)
                # Ensure the response has the correct format
                if 'result' in parsed_result and 'message' not in parsed_result:
                    parsed_result['message'] = parsed_result['result']
                return JsonResponse(parsed_result)
            except json.JSONDecodeError as e:
                logger.warning(f"AI JSON decode error: {e}, using fallback")
                # Fallback if AI doesn't return proper JSON
                return create_author_fallback_response(user_answer)
        
        logger.error(f"OpenRouter API error: {response.status_code}")
        return JsonResponse({
            'error': f'AI service temporarily unavailable. Please try again.'
        }, status=500)

    except requests.RequestException as e:
        logger.error(f"Request exception: {e}")
        return JsonResponse({
            'error': 'Unable to check answer right now. Please try again.'
        }, status=500)


def create_author_fallback_response(user_answer):
    """
    Create a fallback response for author question if AI service fails
    """
    try:
        user_lower = user_answer.lower()
        correct_answer = "Traditional folk tale (no single author)"
        
        # Keywords that indicate correct understanding
        correct_keywords = ['traditional', 'folk', 'unknown', 'anonymous', 'fairy tale', 
                           'oral tradition', 'no author', 'southey']
        
        # Obviously wrong authors
        wrong_authors = ['dr. seuss', 'roald dahl', 'j.k. rowling', 'disney', 
                        'brothers grimm', 'hans christian andersen']
        
        # Check if they understand it's traditional/unknown
        has_correct_concept = any(keyword in user_lower for keyword in correct_keywords)
        has_wrong_author = any(wrong in user_lower for wrong in wrong_authors)
        
        if has_correct_concept:
            return JsonResponse({
                'isCorrect': True,
                'message': 'Excellent! You understand that this is a traditional story without a single author.',
                'feedback_type': 'excellent',
                'show_answer': False,
                'correct_answer': correct_answer
            })
        elif has_wrong_author:
            return JsonResponse({
                'isCorrect': False,
                'message': 'That author didn\'t write this story. Remember, this is a very old traditional tale.',
                'feedback_type': 'incorrect',
                'show_answer': True,
                'correct_answer': correct_answer
            })
        elif 'robert' in user_lower or 'southey' in user_lower:
            return JsonResponse({
                'isCorrect': True,
                'message': 'Good! Robert Southey did publish an early version, though the story is much older.',
                'feedback_type': 'good',
                'show_answer': False,
                'correct_answer': correct_answer
            })
        else:
            return JsonResponse({
                'isCorrect': False,
                'message': 'Think about how old this story is. Is it a modern story with a specific author, or something much older?',
                'feedback_type': 'partial',
                'show_answer': True,
                'correct_answer': correct_answer
            })
    except Exception as e:
        logger.error(f"Author fallback error: {e}")
        return JsonResponse({
            'isCorrect': False,
            'message': 'Please try again.',
            'feedback_type': 'error',
            'show_answer': False
        })
        
        

def analyze_genre_answer(user_answer):
    """
    Use AI to analyze the genre answer specifically
    """
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key:
        return JsonResponse({'error': 'API Key not configured.'}, status=500)

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    prompt = f"""You are a helpful reading teacher checking if a student correctly identified the genre of "Goldilocks and the Three Bears".

The correct broad genre is "Fiction". Other related correct answers include "fairy tale", "folk tale", or "made-up story".

IMPORTANT: The entire response must be a single, valid JSON object. Do not include any text outside of the JSON structure.
Example valid response:
{{
    "isCorrect": true,
    "message": "Excellent! 'Fiction' is the perfect genre because the story is imaginary and features talking animals.",
    "feedback_type": "excellent",
    "show_answer": false,
    "correct_answer": "Fiction"
}}

Guidelines:
- If the answer is "Fiction" or a very close synonym (like "fairy tale", "folk tale", "imaginary"), mark as correct and explain WHY (it's a made-up story with talking animals).
- If the answer is "Non-Fiction", mark as incorrect and explain the difference.
- If the answer is a sub-genre like "Comedy", "Adventure", or "Drama", acknowledge their good thinking but explain that the broader category is "Fiction". Mark as "partial" or "good" but not fully correct.
- Always be encouraging and educational. If isCorrect is false, set show_answer to true.

Student's answer: "{user_answer}\""""

    payload = {
        "model": "llama3-8b-8192",
        "messages": [{"role": "system", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 300,
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        if response.status_code == 200:
            # THIS IS THE CORRECTED LOGIC
            # 1. Get the JSON string from the AI's response.
            ai_response_string = response.json()['choices'][0]['message']['content']
            
            # 2. Parse that string into a Python dictionary.
            data = json.loads(ai_response_string)
            
            # 3. Now, safely pass the dictionary to JsonResponse.
            return JsonResponse(data)
            
        return JsonResponse({'error': 'AI service temporarily unavailable.'}, status=503)
    except requests.RequestException:
        return JsonResponse({'error': 'Unable to check answer right now.'}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def check_question3_answer(request):
    """
    API endpoint to check Question 3 answer - Story Genre (AI-powered)
    """
    try:
        data = json.loads(request.body)
        user_answer = data.get('answer', '').strip()
        
        if not user_answer:
            return JsonResponse({'error': 'Please select an answer.'}, status=400)

        # AI-powered analysis for the genre question
        return analyze_genre_answer(user_answer)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid data format.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def check_genre_manually(user_answer):
    """
    Simple manual checking for genre question
    """
    if user_answer == 'Fiction':
        return JsonResponse({
            'isCorrect': True,
            'message': 'Excellent! You\'re absolutely right. Goldilocks is a fiction story because it features imaginary characters and events that didn\'t really happen. Fiction stories are made-up tales like fairy tales, novels, and fantasy stories.',
            'feedback_type': 'excellent',
            'show_answer': False,
            'correct_answer': 'Fiction'
        })
    
    elif user_answer == 'Non-Fiction':
        return JsonResponse({
            'isCorrect': False,
            'message': 'Not quite! Goldilocks is actually fiction because it\'s an imaginary story with made-up characters and talking animals. Non-fiction would be true stories about real people, historical events, biographies, or factual information.',
            'feedback_type': 'incorrect',
            'show_answer': True,
            'correct_answer': 'Fiction'
        })
    
    else:
        return JsonResponse({
            'isCorrect': False,
            'message': 'Please select either Fiction or Non-Fiction.',
            'feedback_type': 'guidance',
            'show_answer': False,
            'correct_answer': 'Fiction'
        })

@csrf_exempt
@require_http_methods(["POST"])
def check_question4_answer(request):
    """
    API endpoint to check Question 4 answer - Story Characters
    """
    try:
        data = json.loads(request.body)
        user_answer = data.get('answer', '').strip()
        
        if not user_answer:
            return JsonResponse({
                'error': 'Please enter an answer.'
            }, status=400)

        # Basic validation checks
        if len(user_answer) < 3:
            return JsonResponse({
                'isCorrect': False,
                'message': 'Please provide more character names. Think about who the main characters are in this story.',
                'feedback_type': 'guidance',
                'show_answer': False
            })

        if not user_answer[0].isupper():
            return JsonResponse({
                'isCorrect': False,
                'message': 'Remember to start your answer with a capital letter.',
                'feedback_type': 'correction',
                'show_answer': False,
                'highlight_issue': 'capitalization'
            })

        # AI-powered analysis for the characters question
        return analyze_characters_answer(user_answer)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid data format.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def analyze_characters_answer(user_answer):
    """
    Use AI to analyze the characters answer specifically
    """
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key:
        return create_characters_fallback_response(user_answer)

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-app-domain.com",
        "X-Title": "Story Characters Checker"
    }

    prompt = f"""You are a helpful reading teacher checking if a student correctly identified the main characters in "Goldilocks and the Three Bears".

The main characters are:
1. Goldilocks (the little girl)
2. Papa Bear / Father Bear / Big Bear / Great Big Bear (the father)
3. Mama Bear / Mother Bear / Medium Bear / Middle Bear (the mother) 
4. Baby Bear / Little Bear / Small Bear / Wee Bear (the baby)

IMPORTANT: Always respond with valid JSON in this exact format:
{{
    "isCorrect": true/false,
    "message": "Your feedback message here",
    "feedback_type": "excellent", "good", "partial", or "needs_improvement",
    "show_answer": true/false,
    "correct_answer": "Goldilocks, Papa Bear, Mama Bear, and Baby Bear"
}}

Guidelines:
- If they mention ALL 4 main characters (any variations of names), mark as "excellent"
- If they mention 3 characters, mark as "good" 
- If they mention 2 characters, mark as "partial"
- If they mention 1 or fewer characters, mark as "needs_improvement"
- Accept various name forms: "Papa/Father/Big/Great Big Bear" etc.
- Be encouraging even if they missed some characters
- If isCorrect is false (partial/needs_improvement), set show_answer to true
- If isCorrect is true (excellent/good), set show_answer to false

Student's answer: "{user_answer}\""""

    payload = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": f'Please analyze this characters answer: "{user_answer}"'}
        ],
        "temperature": 0.3,
        "max_tokens": 300
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        if response.status_code == 200:
            result_raw = response.json()['choices'][0]['message']['content'].strip()
            
            try:
                # Try to parse JSON response
                parsed_result = json.loads(result_raw)
                # Ensure the response has the correct format
                if 'result' in parsed_result and 'message' not in parsed_result:
                    parsed_result['message'] = parsed_result['result']
                
                # Set isCorrect based on feedback_type
                feedback_type = parsed_result.get('feedback_type', 'needs_improvement')
                parsed_result['isCorrect'] = feedback_type in ['excellent', 'good']
                    
                return JsonResponse(parsed_result)
            except json.JSONDecodeError:
                # Fallback if AI doesn't return proper JSON
                return create_characters_fallback_response(user_answer)
        
        return JsonResponse({
            'error': f'AI service temporarily unavailable. Please try again.'
        }, status=500)

    except requests.RequestException as e:
        return JsonResponse({
            'error': 'Unable to check answer right now. Please try again.'
        }, status=500)


def create_characters_fallback_response(user_answer):
    """
    Create a fallback response for characters question if AI service fails
    """
    try:
        user_lower = user_answer.lower()
        correct_answer = "Goldilocks, Papa Bear, Mama Bear, and Baby Bear"
        
        # Check for character mentions
        has_goldilocks = 'goldilocks' in user_lower
        has_papa = any(word in user_lower for word in ['papa', 'father', 'dad', 'big bear', 'great'])
        has_mama = any(word in user_lower for word in ['mama', 'mother', 'mom', 'medium', 'middle'])
        has_baby = any(word in user_lower for word in ['baby', 'little', 'small', 'wee', 'tiny'])
        
        character_count = sum([has_goldilocks, has_papa, has_mama, has_baby])
        
        if character_count >= 4:
            return JsonResponse({
                'isCorrect': True,
                'message': 'Excellent! You identified all the main characters in the story.',
                'feedback_type': 'excellent',
                'show_answer': False,
                'correct_answer': correct_answer
            })
        elif character_count == 3:
            return JsonResponse({
                'isCorrect': True,
                'message': 'Good job! You got most of the main characters. You might have missed one.',
                'feedback_type': 'good',
                'show_answer': False,
                'correct_answer': correct_answer
            })
        elif character_count == 2:
            return JsonResponse({
                'isCorrect': False,
                'message': 'You\'re on the right track! You identified some characters, but there are more main characters in this story.',
                'feedback_type': 'partial',
                'show_answer': True,
                'correct_answer': correct_answer
            })
        else:
            return JsonResponse({
                'isCorrect': False,
                'message': 'Think about all the main characters - there\'s a little girl and a family of bears. Can you name them all?',
                'feedback_type': 'needs_improvement',
                'show_answer': True,
                'correct_answer': correct_answer
            })
    except Exception as e:
        return JsonResponse({
            'isCorrect': False,
            'message': 'Please try again.',
            'feedback_type': 'error',
            'show_answer': False
        })

@csrf_exempt
@require_http_methods(["POST"])
def check_question5_answer(request):
    """
    API endpoint to check Question 5 answer - Story Setting/Location
    """
    try:
        data = json.loads(request.body)
        user_answer = data.get('answer', '').strip()
        
        if not user_answer:
            return JsonResponse({
                'error': 'Please enter an answer.'
            }, status=400)

        # Basic validation checks
        if len(user_answer) < 3:
            return JsonResponse({
                'isCorrect': False,
                'message': 'Please provide more details about where the story takes place.',
                'feedback_type': 'guidance',
                'show_answer': False
            })

        if not user_answer[0].isupper():
            return JsonResponse({
                'isCorrect': False,
                'message': 'Remember to start your answer with a capital letter.',
                'feedback_type': 'correction',
                'show_answer': False,
                'highlight_issue': 'capitalization'
            })

        # AI-powered analysis for the setting question
        return analyze_setting_answer(user_answer)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid data format.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def analyze_setting_answer(user_answer):
    """
    Use AI to analyze the setting answer specifically
    """
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key:
        return create_setting_fallback_response(user_answer)

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-app-domain.com",
        "X-Title": "Story Setting Checker"
    }

    prompt = f"""You are a helpful reading teacher checking if a student correctly identified where "Goldilocks and the Three Bears" takes place.

The main settings in the story are:
1. The woods/forest/woodland (where the bears go for a walk and where Goldilocks lives)
2. The bears' house/cottage (where most of the action happens)

CORRECT ANSWERS include any combination of:
- "Woods" / "Forest" / "Woodland" / "In the woods"
- "Bears' house" / "The bears' cottage" / "House in the woods"
- "Woods and bears' house" / "Forest and cottage"
- "A house in the forest" / "Cottage in the woods"

IMPORTANT: Always respond with valid JSON in this exact format:
{{
    "isCorrect": true/false,
    "message": "Your feedback message here",
    "feedback_type": "excellent", "good", "partial", or "needs_improvement",
    "show_answer": true/false,
    "correct_answer": "In the woods and at the bears' house"
}}

Guidelines:
- If they mention BOTH woods/forest AND house/cottage, mark as "excellent"
- If they mention ONLY woods/forest OR ONLY house/cottage, mark as "good"
- If they mention something related but incomplete (like just "outside"), mark as "partial"
- If they give completely wrong locations, mark as "needs_improvement"
- Be encouraging and explain what settings they got right
- If isCorrect is false (partial/needs_improvement), set show_answer to true
- If isCorrect is true (excellent/good), set show_answer to false

Student's answer: "{user_answer}\""""

    payload = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": f'Please analyze this setting answer: "{user_answer}"'}
        ],
        "temperature": 0.3,
        "max_tokens": 300
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        if response.status_code == 200:
            result_raw = response.json()['choices'][0]['message']['content'].strip()
            
            try:
                # Try to parse JSON response
                parsed_result = json.loads(result_raw)
                # Ensure the response has the correct format
                if 'result' in parsed_result and 'message' not in parsed_result:
                    parsed_result['message'] = parsed_result['result']
                
                # Set isCorrect based on feedback_type
                feedback_type = parsed_result.get('feedback_type', 'needs_improvement')
                parsed_result['isCorrect'] = feedback_type in ['excellent', 'good']
                    
                return JsonResponse(parsed_result)
            except json.JSONDecodeError:
                # Fallback if AI doesn't return proper JSON
                return create_setting_fallback_response(user_answer)
        
        return JsonResponse({
            'error': f'AI service temporarily unavailable. Please try again.'
        }, status=500)

    except requests.RequestException as e:
        return JsonResponse({
            'error': 'Unable to check answer right now. Please try again.'
        }, status=500)


def create_setting_fallback_response(user_answer):
    """
    Create a fallback response for setting question if AI service fails
    """
    user_lower = user_answer.lower()
    correct_answer = "In the woods and at the bears' house"
    
    # Check for setting mentions
    has_woods = any(word in user_lower for word in ['wood', 'forest', 'tree', 'woodland'])
    has_house = any(word in user_lower for word in ['house', 'home', 'cottage', 'cabin'])
    has_bears_house = any(phrase in user_lower for phrase in ['bears house', 'bear house', 'bears home', 'bears cottage'])
    
    if (has_woods and has_house) or has_bears_house:
        return JsonResponse({
            'isCorrect': True,
            'message': 'Excellent! You identified both main settings - the woods and the bears\' house.',
            'feedback_type': 'excellent',
            'show_answer': False,
            'correct_answer': correct_answer
        })
    elif has_woods:
        return JsonResponse({
            'isCorrect': True,
            'message': 'Good! You identified the woods/forest setting. The story also takes place in another important location.',
            'feedback_type': 'good',
            'show_answer': False,
            'correct_answer': correct_answer
        })
    elif has_house:
        return JsonResponse({
            'isCorrect': True,
            'message': 'Good! You identified the house setting. The story also takes place in another important outdoor location.',
            'feedback_type': 'good',
            'show_answer': False,
            'correct_answer': correct_answer
        })
    else:
        return JsonResponse({
            'isCorrect': False,
            'message': 'Think about where Goldilocks goes and where the bears live. What kind of place is it?',
            'feedback_type': 'needs_improvement',
            'show_answer': True,
            'correct_answer': correct_answer
        })


@csrf_exempt
@require_http_methods(["POST"])
def check_question6_answer(request):
    """
    API endpoint to check Question 6 answer - Story Events/What Happens
    """
    try:
        data = json.loads(request.body)
        user_answers = data.get('answers', [])
        
        # Filter out empty answers
        filled_answers = [answer.strip() for answer in user_answers if answer.strip()]
        
        if len(filled_answers) < 3:
            return JsonResponse({
                'error': 'Please fill in all 3 important story events.'
            }, status=400)

        # Basic validation - check if at least one answer starts with capital
        for i, answer in enumerate(filled_answers):
            if not answer[0].isupper():
                return JsonResponse({
                    'isCorrect': False,
                    'message': f'Remember to start each answer with a capital letter (check answer #{i+1}).',
                    'feedback_type': 'correction',
                    'show_answer': False,
                    'highlight_issue': 'capitalization'
                })

        # AI-powered analysis for the story events question
        return analyze_story_events_answer(filled_answers)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid data format.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def analyze_story_events_answer(user_answers):
    """
    Use AI to analyze the story events answers specifically
    """
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key:
        return create_story_events_fallback_response(user_answers)

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-app-domain.com",
        "X-Title": "Story Events Checker"
    }

    # Join the answers for analysis
    answers_text = "\n".join([f"{i+1}. {answer}" for i, answer in enumerate(user_answers)])

    prompt = f"""You are a helpful reading teacher checking if a student correctly identified important events from "Goldilocks and the Three Bears".

The main story events include:
1. Bears make porridge and go for a walk
2. Goldilocks enters the house
3. Goldilocks tastes the porridge (finds baby bear's just right)
4. Goldilocks tries the chairs (breaks baby bear's chair)  
5. Goldilocks sleeps in baby bear's bed
6. Bears come home and discover someone was there
7. Bears find Goldilocks sleeping
8. Goldilocks wakes up, sees bears, and runs away

IMPORTANT: Always respond with valid JSON in this exact format:
{{
    "isCorrect": true/false,
    "message": "Your feedback message here",
    "feedback_type": "excellent", "good", "partial", or "needs_improvement", 
    "show_answer": true/false,
    "correct_answer": "1. Goldilocks enters the bears' house\\n2. She tries their porridge, chairs, and beds\\n3. The bears find her and she runs away"
}}

Guidelines:
- If they identify 3+ major story events correctly, mark as "excellent"
- If they identify 2 major events correctly, mark as "good"
- If they identify 1 major event correctly, mark as "partial"
- If they miss all major events or give vague answers, mark as "needs_improvement"
- Accept different ways of describing events (e.g., "Goldilocks ate porridge" vs "She tried the porridge")
- Be encouraging and specific about what they got right
- If isCorrect is false (partial/needs_improvement), set show_answer to true
- If isCorrect is true (excellent/good), set show_answer to false

Student's 3 answers:
{answers_text}"""

    payload = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": f'Please analyze these story events: {answers_text}'}
        ],
        "temperature": 0.3,
        "max_tokens": 400
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        if response.status_code == 200:
            result_raw = response.json()['choices'][0]['message']['content'].strip()
            
            try:
                # Try to parse JSON response
                parsed_result = json.loads(result_raw)
                # Ensure the response has the correct format
                if 'result' in parsed_result and 'message' not in parsed_result:
                    parsed_result['message'] = parsed_result['result']
                
                # Set isCorrect based on feedback_type
                feedback_type = parsed_result.get('feedback_type', 'needs_improvement')
                parsed_result['isCorrect'] = feedback_type in ['excellent', 'good']
                    
                return JsonResponse(parsed_result)
            except json.JSONDecodeError:
                # Fallback if AI doesn't return proper JSON
                return create_story_events_fallback_response(user_answers)
        
        return JsonResponse({
            'error': f'AI service temporarily unavailable. Please try again.'
        }, status=500)

    except requests.RequestException as e:
        return JsonResponse({
            'error': 'Unable to check answer right now. Please try again.'
        }, status=500)


def create_story_events_fallback_response(user_answers):
    """
    Create a fallback response for story events question if AI service fails
    """
    correct_answer = "1. Goldilocks enters the bears' house\n2. She tries their porridge, chairs, and beds\n3. The bears find her and she runs away"
    
    # Check for key story elements
    all_text = " ".join(user_answers).lower()
    
    story_elements = {
        'goldilocks': 'goldilocks' in all_text,
        'house': any(word in all_text for word in ['house', 'home', 'enter']),
        'porridge': 'porridge' in all_text or 'food' in all_text,
        'chair': 'chair' in all_text or 'sit' in all_text,
        'bed': 'bed' in all_text or 'sleep' in all_text,
        'bears': 'bear' in all_text,
        'runs_away': any(phrase in all_text for phrase in ['run', 'escape', 'away', 'left'])
    }
    
    correct_elements = sum(story_elements.values())
    
    if correct_elements >= 5:
        return JsonResponse({
            'isCorrect': True,
            'message': 'Excellent! You identified many important events from the story.',
            'feedback_type': 'excellent',
            'show_answer': False,
            'correct_answer': correct_answer
        })
    elif correct_elements >= 3:
        return JsonResponse({
            'isCorrect': True,
            'message': 'Good job! You got several important story events.',
            'feedback_type': 'good',
            'show_answer': False,
            'correct_answer': correct_answer
        })
    elif correct_elements >= 1:
        return JsonResponse({
            'isCorrect': False,
            'message': 'You have some story elements, but try to think of more major events that happen.',
            'feedback_type': 'partial',
            'show_answer': True,
            'correct_answer': correct_answer
        })
    else:
        return JsonResponse({
            'isCorrect': False,
            'message': 'Think about the main things that happen: What does Goldilocks do? What do the bears do?',
            'feedback_type': 'needs_improvement',
            'show_answer': True,
            'correct_answer': correct_answer
        })

@csrf_exempt
@require_http_methods(["POST"])
def check_goldilocks_favourite_character_answer(request):
    """
    API endpoint to check Goldilocks Favourite Character answer
    Based on the "My Favourite Character" React component UI
    """
    try:
        data = json.loads(request.body)
        user_answer = data.get('answer', '').strip()
        
        if not user_answer:
            return JsonResponse({
                'error': 'Please write about your favourite character.'
            }, status=400)

        # Basic validation checks
        if len(user_answer) < 10:
            return JsonResponse({
                'isCorrect': False,
                'message': 'Please write 1-2 complete sentences about your favourite character.',
                'feedback_type': 'guidance',
                'show_answer': False
            })

        if not user_answer[0].isupper():
            return JsonResponse({
                'isCorrect': False,
                'message': 'Remember to start your sentence with a capital letter.',
                'feedback_type': 'correction',
                'show_answer': False,
                'highlight_issue': 'capitalization'
            })

        # AI-powered analysis for the favourite character question
        return analyze_goldilocks_favourite_character_answer(user_answer)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid data format.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def analyze_goldilocks_favourite_character_answer(user_answer):
    """
    Use AI to analyze the favourite character answer from Goldilocks story
    """
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key:
        return create_goldilocks_favourite_character_fallback_response(user_answer)

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-app-domain.com",
        "X-Title": "Goldilocks Favourite Character Checker"
    }

    prompt = f"""You are a helpful reading teacher checking if a student wrote thoughtfully about their favourite character from "Goldilocks and the Three Bears".

The main characters in the Goldilocks story are:
- Goldilocks (the curious little girl who enters the bears' house)
- Papa Bear / Father Bear / Big Bear / Great Big Bear (the father bear)
- Mama Bear / Mother Bear / Medium Bear / Middle Bear (the mother bear)  
- Baby Bear / Little Bear / Small Bear / Wee Bear (the baby bear)

IMPORTANT: Always respond with valid JSON in this exact format:
{{
    "isCorrect": true/false,
    "message": "Your encouraging feedback message here",
    "feedback_type": "excellent", "good", "partial", or "needs_improvement",
    "show_answer": false
}}

Guidelines for "My Favourite Character" question:
- If they mention a valid character AND give a good reason why they like them, mark as "excellent"
- If they mention a valid character with some reasoning, mark as "good"
- If they mention a character but reasoning is unclear/minimal, mark as "partial"
- If they don't mention any story characters or give unrelated answers, mark as "needs_improvement"
- Accept all characters as valid favourites - there's no "wrong" favourite character
- Look for sentence starters like "My favourite character is..." or "I like... because..."
- Always be encouraging and positive about their choice
- Focus on whether they explained WHY they like the character
- For favourite character questions, never show the "correct answer" since it's subjective
- Always set show_answer to false

Student's answer: "{user_answer}\""""

    payload = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": f'Please analyze this favourite character answer: "{user_answer}"'}
        ],
        "temperature": 0.3,
        "max_tokens": 250
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        if response.status_code == 200:
            result_raw = response.json()['choices'][0]['message']['content'].strip()
            
            try:
                # Try to parse JSON response
                parsed_result = json.loads(result_raw)
                # Ensure the response has the correct format
                if 'result' in parsed_result and 'message' not in parsed_result:
                    parsed_result['message'] = parsed_result['result']
                
                # Set isCorrect based on feedback_type
                feedback_type = parsed_result.get('feedback_type', 'needs_improvement')
                parsed_result['isCorrect'] = feedback_type in ['excellent', 'good', 'partial']
                
                return JsonResponse(parsed_result)
            except json.JSONDecodeError:
                # Fallback if AI doesn't return proper JSON
                return create_goldilocks_favourite_character_fallback_response(user_answer)
        
        return JsonResponse({
            'error': f'AI service temporarily unavailable. Please try again.'
        }, status=500)

    except requests.RequestException as e:
        return JsonResponse({
            'error': 'Unable to check answer right now. Please try again.'
        }, status=500)


def create_goldilocks_favourite_character_fallback_response(user_answer):
    """
    Create a fallback response for Goldilocks favourite character question if AI service fails
    """
    user_lower = user_answer.lower()
    
    # Check for Goldilocks story character mentions
    characters = {
        'goldilocks': any(word in user_lower for word in ['goldilocks', 'goldi', 'girl', 'little girl']),
        'papa_bear': any(word in user_lower for word in ['papa bear', 'father bear', 'dad bear', 'big bear', 'great bear', 'papa', 'father']),
        'mama_bear': any(word in user_lower for word in ['mama bear', 'mother bear', 'mom bear', 'medium bear', 'middle bear', 'mama', 'mother']),
        'baby_bear': any(word in user_lower for word in ['baby bear', 'little bear', 'small bear', 'wee bear', 'baby', 'little'])
    }
    
    # Check for reasoning/explanation words
    reasoning_words = ['because', 'since', 'like', 'love', 'favorite', 'favourite', 'nice', 'kind', 'funny', 'cute', 'brave', 'curious', 'sweet', 'smart']
    has_reasoning = any(word in user_lower for word in reasoning_words)
    
    # Check if any character is mentioned
    character_mentioned = any(characters.values())
    
    if character_mentioned and has_reasoning and len(user_answer) >= 20:
        return JsonResponse({
            'isCorrect': True,
            'message': 'Excellent! You chose a character from the Goldilocks story and gave a great explanation of why you like them.',
            'feedback_type': 'excellent',
            'show_answer': False
        })
    elif character_mentioned and has_reasoning and len(user_answer) >= 10:
        return JsonResponse({
            'isCorrect': True,
            'message': 'Good job! You chose a character from the story and explained why you like them.',
            'feedback_type': 'good',
            'show_answer': False
        })
    elif character_mentioned and len(user_answer) >= 8:
        return JsonResponse({
            'isCorrect': True,
            'message': 'You mentioned a character from the story! Can you tell us more about why they are your favourite?',
            'feedback_type': 'partial',
            'show_answer': False
        })
    elif character_mentioned:
        return JsonResponse({
            'isCorrect': True,
            'message': 'You chose a character from the Goldilocks story! Try to write a bit more about why you like them.',
            'feedback_type': 'partial',
            'show_answer': False
        })
    else:
        return JsonResponse({
            'isCorrect': False,
            'message': 'Remember to choose one of the characters from the Goldilocks and the Three Bears story (Goldilocks, Papa Bear, Mama Bear, or Baby Bear) and explain why you like them.',
            'feedback_type': 'needs_improvement',
            'show_answer': False
        })

@csrf_exempt
@require_http_methods(["POST"])
def check_question8_answer(request):
    """
    API endpoint to check Question 8 answer - Story Moral/Lesson
    """
    try:
        data = json.loads(request.body)
        user_answer = data.get('answer', '').strip()
        
        if not user_answer:
            return JsonResponse({
                'error': 'Please write about the lesson or moral of the story.'
            }, status=400)

        # Basic validation checks
        if len(user_answer) < 10:
            return JsonResponse({
                'isCorrect': False,
                'message': 'Please write 1-2 complete sentences about what lesson or moral you learned from the story.',
                'feedback_type': 'guidance',
                'show_answer': False
            })

        if not user_answer[0].isupper():
            return JsonResponse({
                'isCorrect': False,
                'message': 'Remember to start your sentence with a capital letter.',
                'feedback_type': 'correction',
                'show_answer': False,
                'highlight_issue': 'capitalization'
            })

        # AI-powered analysis for the moral/lesson question
        return analyze_moral_answer(user_answer)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid data format.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def analyze_moral_answer(user_answer):
    """
    Use AI to analyze the moral/lesson answer specifically
    """
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key:
        return create_moral_fallback_response(user_answer)

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-app-domain.com",
        "X-Title": "Story Moral Checker"
    }

    prompt = f"""You are a helpful reading teacher checking if a student correctly identified the moral or lesson from "Goldilocks and the Three Bears".

The main morals/lessons from the Goldilocks story include:
- Don't enter someone else's home without permission
- Respect other people's property
- Don't take things that don't belong to you
- Be careful and think before you act
- Don't be too curious or nosy
- Respect boundaries and privacy
- Think about how your actions affect others

IMPORTANT: Always respond with valid JSON in this exact format:
{{
    "isCorrect": true/false,
    "message": "Your encouraging feedback message here",
    "feedback_type": "excellent", "good", "partial", or "needs_improvement",
    "show_answer": false
}}

Guidelines for moral/lesson question:
- If they identify a clear moral/lesson from the story, mark as "excellent"
- If they mention a related concept but not quite the main lesson, mark as "good"
- If they have some understanding but it's unclear, mark as "partial"
- If they don't mention any lesson or give unrelated answers, mark as "needs_improvement"
- Accept various ways of expressing the same concept (e.g., "don't go in houses" vs "respect privacy")
- Always be encouraging and positive about their understanding
- Focus on whether they understood that Goldilocks' actions were wrong
- For moral questions, never show a "correct answer" since there can be multiple valid interpretations
- Always set show_answer to false

Student's answer: "{user_answer}\""""

    payload = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": f'Please analyze this moral/lesson answer: "{user_answer}"'}
        ],
        "temperature": 0.3,
        "max_tokens": 250
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        if response.status_code == 200:
            result_raw = response.json()['choices'][0]['message']['content'].strip()
            
            try:
                # Try to parse JSON response
                parsed_result = json.loads(result_raw)
                # Ensure the response has the correct format
                if 'result' in parsed_result and 'message' not in parsed_result:
                    parsed_result['message'] = parsed_result['result']
                
                # Set isCorrect based on feedback_type
                feedback_type = parsed_result.get('feedback_type', 'needs_improvement')
                parsed_result['isCorrect'] = feedback_type in ['excellent', 'good', 'partial']
                
                return JsonResponse(parsed_result)
            except json.JSONDecodeError:
                # Fallback if AI doesn't return proper JSON
                return create_moral_fallback_response(user_answer)
        
        return JsonResponse({
            'error': f'AI service temporarily unavailable. Please try again.'
        }, status=500)

    except requests.RequestException as e:
        return JsonResponse({
            'error': 'Unable to check answer right now. Please try again.'
        }, status=500)


def create_moral_fallback_response(user_answer):
    """
    Create a fallback response for moral/lesson question if AI service fails
    """
    user_lower = user_answer.lower()
    
    # Check for moral/lesson keywords
    moral_keywords = {
        'permission': any(word in user_lower for word in ['permission', 'ask', 'allowed', 'invited']),
        'property': any(word in user_lower for word in ['property', 'belong', 'theirs', 'not mine', 'not yours']),
        'respect': any(word in user_lower for word in ['respect', 'polite', 'manners', 'courteous']),
        'careful': any(word in user_lower for word in ['careful', 'think', 'before', 'consider']),
        'curious': any(word in user_lower for word in ['curious', 'nosy', 'snoop', 'spy']),
        'boundaries': any(word in user_lower for word in ['boundaries', 'privacy', 'private', 'personal']),
        'wrong': any(word in user_lower for word in ['wrong', 'bad', 'shouldn\'t', 'not right', 'mistake']),
        'home': any(word in user_lower for word in ['home', 'house', 'enter', 'go in', 'break in'])
    }
    
    # Check for reasoning/explanation words
    reasoning_words = ['because', 'since', 'when', 'if', 'then', 'so', 'therefore', 'learned', 'teaches']
    has_reasoning = any(word in user_lower for word in reasoning_words)
    
    # Count how many moral concepts they mentioned
    moral_concepts = sum(moral_keywords.values())
    
    if moral_concepts >= 2 and has_reasoning and len(user_answer) >= 20:
        return JsonResponse({
            'isCorrect': True,
            'message': 'Excellent! You identified important lessons from the Goldilocks story and explained them well.',
            'feedback_type': 'excellent',
            'show_answer': False
        })
    elif moral_concepts >= 1 and has_reasoning and len(user_answer) >= 15:
        return JsonResponse({
            'isCorrect': True,
            'message': 'Good job! You understood an important lesson from the story.',
            'feedback_type': 'good',
            'show_answer': False
        })
    elif moral_concepts >= 1 and len(user_answer) >= 10:
        return JsonResponse({
            'isCorrect': True,
            'message': 'You have the right idea! Can you explain more about why this lesson is important?',
            'feedback_type': 'partial',
            'show_answer': False
        })
    elif moral_concepts >= 1:
        return JsonResponse({
            'isCorrect': True,
            'message': 'You mentioned something about the story! Try to write more about what lesson or moral you learned.',
            'feedback_type': 'partial',
            'show_answer': False
        })
    else:
        return JsonResponse({
            'isCorrect': False,
            'message': 'Think about what Goldilocks did wrong in the story. What lesson can we learn from her actions?',
            'feedback_type': 'needs_improvement',
            'show_answer': False
        })

