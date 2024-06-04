from django.urls import path
from .import views

app_name = 'inventory_component'

urlpatterns = [
   
    path('products/',views.products_list,name ='products-list'),
    path('purchase/',views.purchase,name='purchase'),
    path('sales/',views.sales,name = "sales"), 
    path('contacts/',views.contacts,name = 'contacts')
]
