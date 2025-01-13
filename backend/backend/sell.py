from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from models.models import Sales, Product, Merchants
from django.db import transaction
import json
from .views import process_request
from .alert import check_and_send_alerts


@csrf_exempt
def add_sell(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            
            # Extracting details and converting where necessary
            product_name = data.get("productName")
            buyer_name = data.get("buyerName")
            buyer_gst = data.get("gstId")
            company_name = data.get("companyName")
            shipping_address = data.get("shippingAddress")
            buyer_number = data.get("contactNumber")
            quantity = int(data.get("quantity"))  # Convert to integer
            price_per_unit = float(data.get("pricePerStock"))  # Convert to float
            location = data.get("location")
            
            # Check if product exists
            product = Product.objects.filter(name=product_name).first()
            if not product:
                return JsonResponse({"error": "Product not found"}, status=404)
            
            if quantity > product.stocks_available:
                return JsonResponse({"error": "Stocks Not Available"}, status=400)
            
            # Update product stock
            product.stocks_available -= quantity
            product.save()  # Save the updated stock
            
            # Check if buyer exists, else add to the buyer table
            buyer, created = Merchants.objects.get_or_create(
                merchant_name=buyer_name,
                defaults={
                    "company_name": company_name,
                    "merchant_address": shipping_address,
                    "merchant_number": buyer_number,
                    "merchant_gst": buyer_gst,
                },
            )
            
            if not created:  # If buyer exists, update details
                buyer.company_name = company_name
                buyer.merchant_address = shipping_address
                buyer.merchant_number = buyer_number
                buyer.location = location
                buyer.save()
            
            
            # Create and save sell
            new_sell = Sales(  # Use the correct model name
                product=product,
                buyer=buyer,
                quantity=quantity,
                price_per_unit=price_per_unit,
            )
            new_sell.save()

            if product.stocks_available < product.alert_rate:
                check_and_send_alerts(product.stocks_available,product.alert_rate,product.name)

            
            return JsonResponse({"message": "Sell added successfully", "id": new_sell.id}, status=201)
        except Exception as e:
            print(e)    
            return JsonResponse({"error": str(e)}, status=400)

    # Fallback for non-POST requests
    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def get_sales(request):
    if request.method == "GET":

        if not process_request(request):  # Middleware check
            return JsonResponse({"error": "Unauthorized access"}, status=401)
        
        try:
            # Retrieve all purchases

            sales = Sales.objects.all()
           
            
            sales_data = [
                {
                    "id":sale.id,
                    "productName": sale.product.name,
                    "category":sale.product.category.name,
                    "buyerName":sale.buyer.merchant_name,
                    "shippingAddress":sale.buyer.merchant_address,
                    "location":sale.buyer.location,
                    "contactNumber":sale.buyer.merchant_number,
                   
                    
                    "gstId":sale.buyer.merchant_gst,
                    
                    
                    "companyName": sale.buyer.company_name,
                    "quantity": sale.quantity,
                    "pricePerStock": float(sale.price_per_unit),
                    "totalPrice": float(sale.total_price),
                    "dateAdded": sale.sold_date,
                     
                }
                for sale in sales
            ]
            return JsonResponse({"sales": sales_data}, status=200)
            
        except Exception as e:
            print(e)
            return JsonResponse({"error": str(e)}, status=400)
        
@csrf_exempt
def update_sales(request, sales_id):
    if request.method == "PUT":
        if not process_request(request):  # Middleware check
            return JsonResponse({"error": "Unauthorized access"}, status=401)
        
        try:
            data = json.loads(request.body)

            # Get the existing Purchase instance
            
            sale = get_object_or_404(Sales, id=sales_id)

            # Update Seller details
            buyer, _ = Merchants.objects.update_or_create(
                id=sale.buyer.id,  # Update existing seller tied to the purchase
                defaults={
                    "merchant_name": data["buyerName"],
                    "company_name": data["companyName"],
                    "merchant_address": data["shippingAddress"],
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
            product.stocks_available = (old_quantity + sale.quantity)-float(data["quantity"])
            

            # Update the Purchase instance
            sale.buyer = buyer
            sale.product = product
            sale.quantity = float(data["quantity"])
            
            sale.price_per_unit = float(data["pricePerStock"])
            sale.save()
            product.save()

            return JsonResponse({"message": "Purchase updated successfully"}, status=200)
        except Exception as e:
            print(e)
            return JsonResponse({"error": str(e)}, status=400)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)
