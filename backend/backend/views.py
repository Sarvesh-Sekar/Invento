import jwt
import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.conf import settings
import json
from django.utils.deprecation import MiddlewareMixin

# Define your JWT secret and algorithm
JWT_SECRET = "your_jwt_secret_key"
JWT_ALGORITHM = "HS256"

@csrf_exempt
def login_view(request):
    print(request.method)

    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")
            
            # Validate credentials
            if username == "admin" and password == "1234":
                # Generate JWT token
                payload = {
                    "username": username,
                    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
                }
                token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
                return JsonResponse({
                    "token": token,
                    "message": "Login successful"
                }, status=200)
            else:
                return JsonResponse({"message": "Invalid credentials"}, status=401)
        except Exception as e:
            return JsonResponse({"message": "An error occurred", "error": str(e)}, status=400)

    return JsonResponse({"message": "Invalid request method"}, status=405)


def process_request(request):
    try:
        token = request.headers.get("Authorization")
        if not token:
            return False

        # Extract the token without the "Bearer " prefix
        token = token.split(" ")[1]

        # Decode and validate the token
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return True  # Return True if the token is valid

    except jwt.ExpiredSignatureError:
        return False  # Token has expired
    except jwt.InvalidTokenError:
        return False  # Token is invalid