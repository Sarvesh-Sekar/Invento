from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

class ProductList(models.Model):
    product_name = models.TextField()
    product_id = models.IntegerField()
    product_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.product_name

class Stock(models.Model):
    stock_name = models.TextField()
    stock_id = models.IntegerField()
    stock_quantity = models.IntegerField(default=0)
    stock_price = models.IntegerField(default=0)

    def __str__(self):
        return self.stock_name

@receiver(post_save, sender=ProductList)
def create_or_update_stock(sender, instance, created, **kwargs):
    if created:
        # If the ProductList instance is created, create the corresponding Stock instance
        Stock.objects.create(
            stock_name=instance.product_name,
            stock_id=instance.product_id,
            stock_quantity=0,
            stock_price=0
        )
    else:
        # If the ProductList instance is updated, update the corresponding Stock instance
        stock = Stock.objects.get(stock_id=instance.product_id)
        stock.stock_name = instance.product_name
        stock.save()
