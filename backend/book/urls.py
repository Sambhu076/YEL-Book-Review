
from django.urls import path
from . import views

urlpatterns = [
    # Health check endpoint
    path('api/health/', views.health_check, name='health_check'),
    # Only API endpoints - no template views needed!
    path('api/check-question1/', views.check_question1_answer, name='check_question1_answer'),
    path('api/check-question2/', views.check_question2_answer, name='check_question2_answer'),
    path('api/check-question3/', views.check_question3_answer, name='check_question3_answer'),
    path('api/check-question4/', views.check_question4_answer, name='check_question4_answer'),
    path('api/check-question5/', views.check_question5_answer, name='check_question5_answer'),
    path('api/check-question6/', views.check_question6_answer, name='check_question6_answer'),
    path('api/check-goldilocks-favourite-character/', views.check_goldilocks_favourite_character_answer, name='check_goldilocks_favourite_character'),
    path('api/check-question8/', views.check_question8_answer, name='check_question8_answer'),
    # path('api/livekit-token/', views.livekit_token, name='livekit_token'),


]


