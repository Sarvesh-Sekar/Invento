from django.db import models
from django.core.validators import RegexValidator


class Category(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)

class Product(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)  # Use ForeignKey
    alert_rate = models.IntegerField(default=0)
    stocks_available = models.IntegerField(default=0)
    added_date = models.DateTimeField(auto_now_add=True)
    revenue = models.DecimalField(max_digits=20,decimal_places=2,default=(0.00))

class Merchants(models.Model):
    id = models.AutoField(primary_key=True)
    merchant_name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    merchant_address = models.CharField(max_length=255)
    phone_regex = RegexValidator(regex=r'^\+?1?\d{9,15}$', message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")
    merchant_number = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    location = models.CharField(max_length=255)
    merchant_gst = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r'^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$',
                message="Enter a valid GST number in the format: 22ABCDE1234F1Z5",
            )
        ],
        unique=True,  # Ensure each GST number is unique
        null=True,    # Allow null if not mandatory
        blank=True    # Allow blank if not mandatory
    )

class Purchase(models.Model):
    id = models.AutoField(primary_key=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    seller = models.ForeignKey(Merchants,on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)
    price_per_unit = models.DecimalField(max_digits=20,decimal_places=2,default=(0.00))
    total_price = models.DecimalField(max_digits=20,decimal_places=2,default=(0.00))
    purchase_date = models.DateTimeField(auto_now_add=True)
   

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.price_per_unit
        super(Purchase, self).save(*args, **kwargs)


class Sales(models.Model):
    id = models.AutoField(primary_key=True)
    buyer = models.ForeignKey(Merchants,on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    
    quantity = models.IntegerField(default=0)
    price_per_unit = models.DecimalField(max_digits=20,decimal_places=2,default=(0.0))
    total_price = models.DecimalField(max_digits=20,decimal_places=2,default=(0.0))
    sold_date = models.DateField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.price_per_unit
        super(Sales, self).save(*args, **kwargs)


    
    
    







