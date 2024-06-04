from django.shortcuts import render,redirect
import random
from django.contrib.auth.decorators import login_required
from .models import ProductList



def products_list(request):
    products = ProductList.objects.all()
    if request.method == 'POST':
        product_name = request.POST.get('product_name')
       

        product_filter = ProductList.objects.filter(product_name=product_name)

        if product_filter:
            message = 'Item already exists'
            return render(request, 'products-list.html', {'message': message, 'products': products})

        else:
        
        
            ProductList.objects.create(
            product_name = product_name,
            product_id = random.randint(100, 999)

            )
        products = ProductList.objects.all()
        return render(request ,'products-list.html',{'products':products})

    return render(request , 'products-list.html',{'products':products})


    

def purchase(request):
    return render(request,'purchase.html')

def sales(request):
    return render(request,'sales.html')

def contacts(request):
    return render(request,'contacts.html')