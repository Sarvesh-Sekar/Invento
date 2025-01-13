from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from models.models import Purchase, Product, Merchants
from django.db import transaction
import json
from .views import process_request

@csrf_exempt
def add_purchase(request):
    if request.method == "POST":
        if not process_request(request):  # Middleware check
            return JsonResponse({"error": "Unauthorized access"}, status=401)
        try:
            data = json.loads(request.body)
            
            # Extracting details and converting where necessary
            product_name = data.get("productName")
            seller_name = data.get("sellerName")
            company_name = data.get("companyName")
            billing_address = data.get("billingAddress")
            seller_number = data.get("contactNumber")
            quantity = int(data.get("quantity"))  # Convert to integer
            price_per_unit = float(data.get("pricePerStock"))  # Convert to float
            location = data.get("location")
            
            # Check if product exists
            product = Product.objects.filter(name=product_name).first()
            if not product:
                return JsonResponse({"error": "Product not found"}, status=404)
            
            # Update product stock
            product.stocks_available += quantity
            product.save()
            
            # Check if seller exists, else add to the Seller table
            seller, created = Merchants.objects.get_or_create(
                merchant_name=seller_name,
                defaults={
                    "company_name": company_name,
                    "merchant_address": billing_address,
                    "merchant_number": seller_number,
                },
            )
            
            if not created:  # If seller exists, update details
                seller.company_name = company_name
                seller.merchant_address = billing_address
                seller.merchant_number = seller_number
                seller.location = location
                seller.save()
            
            # Create and save purchase
            purchase = Purchase(
                product=product,
                seller=seller,
                quantity=quantity,
                price_per_unit=price_per_unit,
            )
            purchase.save()
            
            return JsonResponse({"message": "Purchase added successfully", "id": purchase.id}, status=201)
        except Exception as e:
            print(e)
            return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
def delete_purchase(request, purchase_id):
    if request.method == "DELETE":

        if not process_request(request):  # Middleware check
            return JsonResponse({"error": "Unauthorized access"}, status=401)
        
        data = json.loads(request.body)
        try:
            # Fetch and delete purchase
            purchase = get_object_or_404(Purchase, pk=purchase_id)
            print(purchase)
            product = Product.objects.filter(name=data["productName"]).first()
            product.stocks_available = product.stocks_available-int(data["quantity"])
            product.save()
            purchase.delete()
            return JsonResponse({"message": "Purchase deleted successfully"}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
        

@csrf_exempt
def get_purchases(request):
    if request.method == "GET":

        if not process_request(request):  # Middleware check
            return JsonResponse({"error": "Unauthorized access"}, status=401)
        
        try:
            # Retrieve all purchases

            purchases = Purchase.objects.all()
            
            purchase_data = [
                {
                    "id":purchase.id,
                    "productName": purchase.product.name,
                    "category":purchase.product.category.name,
                    "billingAddress":purchase.seller.merchant_address,
                    "location":purchase.seller.location,
                    "contactNumber":purchase.seller.merchant_number,
                    "gstId":purchase.seller.merchant_gst,
                    
                    "sellerName": purchase.seller.merchant_name,
                    "companyName": purchase.seller.company_name,
                    "quantity": purchase.quantity,
                    "pricePerStock": float(purchase.price_per_unit),
                    "totalPrice": float(purchase.total_price),
                    "dateAdded": purchase.purchase_date,
                }
                for purchase in purchases
            ]
            return JsonResponse({"purchases": purchase_data}, status=200)
        except Exception as e:
            print(e)
            return JsonResponse({"error": str(e)}, status=400)
        

@csrf_exempt
def update_purchase(request, purchase_id):
    if request.method == "PUT":
        if not process_request(request):  # Middleware check
            return JsonResponse({"error": "Unauthorized access"}, status=401)
        
        try:
            data = json.loads(request.body)

            # Get the existing Purchase instance
            purchase = get_object_or_404(Purchase, id=purchase_id)

            # Update Seller details
            seller, _ = Merchants.objects.update_or_create(
                id=purchase.seller.id,  # Update existing seller tied to the purchase
                defaults={
                    "merchant_name": data["sellerName"],
                    "company_name": data["companyName"],
                    "merchant_address": data["billingAddress"],
                    "location": data["location"],
                    "merchant_number": data["contactNumber"],
                    "merchant_gst":data["gstId"]
                }
            )

            # Get or create the Product instance
            product = Product.objects.filter(name=data["productName"]).first()
            if not product:
                return JsonResponse({"message: Product not found"},status = 404)
            
            old_quantity = product.stocks_available
            product.stocks_available = old_quantity - purchase.quantity
            product.stocks_available = product.stocks_available + float(data["quantity"])

            # Update the Purchase instance
            purchase.seller = seller
            purchase.product = product
            purchase.quantity = float(data["quantity"])
            
            purchase.price_per_unit = float(data["pricePerStock"])
            purchase.save()
            product.save()

            return JsonResponse({"message": "Purchase updated successfully"}, status=200)
        except Exception as e:
            print(e)
            return JsonResponse({"error": str(e)}, status=400)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)    