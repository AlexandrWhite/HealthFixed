from django.urls import path
from . import views

urlpatterns = [
   path('patient/<str:id>', views.test, name='api-test'),
   path('csrf/', views.get_csrf, name='api-csrf'),
   path('patients/',views.get_patients, name='api-patients'),
   path('login/', views.login_view, name='api-login'),
   path('logout/', views.logout_view, name='api-logout'),
   path('session/', views.session_view, name='api-session'),
   path('user_info/', views.user_info, name='api-userInfo'),
   path('kill_all_sessions/', views.kill_all_sessions, name='kill-all-sessions'),
   path('diagnose_predict/', views.diagnose_predict,name='api-predict'),
   path("get_analysis/", views.get_analysis, name="get-analysis")
]