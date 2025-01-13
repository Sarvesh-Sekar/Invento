"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from .views import login_view
from .product import add_product
from .product import get_products
from .product import delete_product
from .product import update_product
from . import purchase
from .import sell


urlpatterns = [
    path('login/', login_view, name='login'),
    path('api/add_product', add_product, name='add_product'),
    path('api/get_products',get_products,name='get_products'),
    path("api/delete_product/<int:product_id>", delete_product, name="delete_product"),
    path("api/update_product/<int:product_id>",update_product,name = "update_product"),
    path('api/add_purchase/', purchase.add_purchase, name='add_purchase'),
    path('api/add_sell/', sell.add_sell, name='add_sell'),
   
    path('api/delete_purchase/<int:purchase_id>/', purchase.delete_purchase, name='delete_purchase'),
    path('api/get_purchases/', purchase.get_purchases, name='get_purchases'),
    path('api/get_sells/', sell.get_sales, name='get_sales'),
    path('api/update_purchase/<int:purchase_id>/', purchase.update_purchase, name='update_purchase'),
    path('api/update_sell/<int:sales_id>/', sell.update_sales, name='update_sell'),
    
    
]
