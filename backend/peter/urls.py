from django.urls import path
from . import views


urlpatterns = [
    # Health check endpoint
    path('api/health/', views.peter_health_check, name='health_check'),
    # Only API endpoints - no template views needed!
    path('api/check-peter-question1/', views.check_peter_question1_answer, name='check_question1_answer'),
    path('api/check-peter-question2/', views.check_peter_question2_answer, name='check_question2_answer'),
    path('api/check-peter-question3/', views.check_peter_question3_answer, name='check_question3_answer'),
    path('api/check-peter-question4/', views.check_peter_question4_answer, name='check_question4_answer'),
    path('api/check-peter-question5/', views.check_peter_question5_answer, name='check_question5_answer'),
    path('api/check-peter-question6/', views.check_peter_question6_answer, name='check_question6_answer'),
    path('api/check-peter-question7/', views.check_peter_question7_answer, name='check_question7_answer'),
    path('api/check-peter-question8/', views.check_peter_question8_answer, name='check_question8_answer'),
    path('api/check-peter-question9/', views.check_peter_question9_answer, name='check_question9_answer'),
    path('api/check-peter-question10/', views.check_peter_question10_answer, name='check_question10_answer'),
     path('api/check-peter-question11/', views.check_peter_question11_answer, name='check_question11_answer'),
     path('api/check-peter-question12/', views.check_peter_question12_answer, name='check_question12_answer'),
     path('api/check-peter-question13/', views.check_peter_question13_answer, name='check_question13_answer'),
     path('api/check-peter-question14/', views.check_peter_question14_answer, name='check_question14_answer'),
         ]