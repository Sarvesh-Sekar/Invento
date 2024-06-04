from django.urls import path,include
from .import views
app_name = 'users'

urlpatterns = [
    path('login/',views.user_login,name ='login'),
    path('users/',views.users,name ='user'),
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
     path('logout/', views.custom_logout, name='logout'),
]
