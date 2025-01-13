from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from models.models import Product ,Category
import json
from .views import process_request

# JWT Middleware Example


@csrf_exempt
def add_product(request):
    if request.method == "POST":
        if not process_request(request):  # Middleware check
            return JsonResponse({"error": "Unauthorized access"}, status=401)
         
        try:
            # Parse the request body
            data = json.loads(request.body)
            name = data["name"]
         
            get_name = Product.objects.filter(name=name)

            if(get_name): return JsonResponse({"error": "Product Name Already Exists"}, status=400)
            else : pass

            # Extract the category name from the data
            category_name = data.get("category").strip().lower() if data.get("category") else None
            if not category_name:
                return JsonResponse({"error": "Category is required."}, status=400)

            # Get or create the category instance
            category, created = Category.objects.get_or_create(name=(category_name))

            # Create the Product instance
            product = Product.objects.create(
                name=data["name"],
                category=category,  # Assign the category instance
                alert_rate=data.get("alert_rate", 0),
                stocks_available = 0
                
            )

            return JsonResponse({"message": "Product added successfully."}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def get_products(request):
    if request.method == "GET":
        if not process_request(request):  # Middleware check
            return JsonResponse({"error": "Unauthorized access"}, status=401)
        try:
            products = Product.objects.all()  # Use select_related for related data
            product_list = [
                {
                    "id": product.id,
                    "name": product.name,
                    "category": product.category.name,  # Access the related category name
                    "alertRate": product.alert_rate,
                    "addedDate": product.added_date,
                    "stocks_available":product.stocks_available
                }
                for product in products
            ]
            return JsonResponse(product_list, safe=False)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        
@csrf_exempt
def delete_product(request, product_id):
    if not process_request(request):  # Middleware check
            return JsonResponse({"error": "Unauthorized access"}, status=401)
    if request.method == "DELETE":
        try:
            product = Product.objects.get(id=product_id)
            product.delete()
            return JsonResponse({"message": "Product deleted successfully."})
        except Product.DoesNotExist:
            return JsonResponse({"error": "Product not found."}, status=404)
    return JsonResponse({"error": "Invalid request method."}, status=400)


@csrf_exempt
def update_product(request, product_id):
    
    if not process_request(request):  # Middleware check
            return JsonResponse({"error": "Unauthorized access"}, status=401)
    
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            product = Product.objects.get(id=product_id)
            
            # Update product name
            product.name = data.get('name', product.name)
            
            # Handle category
            category_name = data.get('category', '').strip().lower()
            if category_name:
                category, created = Category.objects.get_or_create(name=category_name)
                product.category = category
            
            # Update other fields
            product.stocks_available = data.get('stocks_available', product.stocks_available)
            product.alert_rate = data.get('alertRate', product.alert_rate)
            
            product.save()
            return JsonResponse({'message': 'Product updated successfully.'})
        except Product.DoesNotExist:
            return JsonResponse({'error': 'Product not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request method.'}, status=400)

