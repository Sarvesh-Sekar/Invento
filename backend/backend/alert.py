from django.core.mail import send_mail
from django.conf import settings
from models.models import Product  # Adjust based on your app structure

def check_and_send_alerts(stocks,alert_rate,name):
    """
    Checks if any product's quantity is below the alert rate and sends an email notification.
    """
    # Fetch products with quantity below alert rate
    

        # Prepare email details
    subject = f"Alert: Low Stock for {name}"
    message = (
        f"Dear {"Sarvesh"},\n\n"
        f"The stock for the product '{name}' is below the alert rate.\n"
        f"Current Quantity: {stocks}\n"
        f"Alert Rate: {alert_rate}\n\n"
        "Please restock at the earliest convenience.\n\n"
        "Best regards,\nYour Inventory Team"
        )
    recipient_email = "sarveshsekardeveloper@gmail.com"  # Assumes recipient email is stored in the product model
        
        # Send email
    try:
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,  # Sender's email
            [recipient_email],  # Recipient email
            fail_silently=False,
            )
    except Exception as e:
            print(f"Error sending email for product {name}: {e}")

    return "Alert emails sent successfully."
