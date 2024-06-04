from django.shortcuts import render,redirect
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login as auth_login
from django.contrib.auth.decorators import login_required
from .models import UserRolesSalesMen
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView
from django.contrib.auth import logout



# Create your views here.

def user_login(request):
    if request.method == "POST":
        form = AuthenticationForm(data = request.POST)
        if form.is_valid():
            auth_login(request, form.get_user())
            return render(request,"dashboard.html")
    
    else: 
        form = AuthenticationForm()
    return render(request, "login.html", { "form": form })


def users(request): 
    persons = UserRolesSalesMen.objects.all()   
    if request.method == 'POST':
        email = request.POST.get('email')
        role = request.POST.get('role')
        if email and role in ['purchaser', 'salesperson']:
            # Save the user with the specified role
            user = UserRolesSalesMen.objects.create(email=email, role=role)
            user.save()
       
        elif 'delete_email' in request.POST:
            email_to_delete = request.POST.get('delete_email')
            UserRolesSalesMen.objects.filter(email=email_to_delete).delete()

        persons = UserRolesSalesMen.objects.all()

    # Retrieve all persons
       

    return render(request, 'users.html', {'persons': persons})

   

class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = 'dashboard.html'


def custom_logout(request):
    logout(request)
    return redirect('../login')