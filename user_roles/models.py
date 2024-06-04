# models.py

from django.db import models

class UserRolesSalesMen(models.Model):
    ROLES = (
        ('purchaser', 'Purchaser'),
        ('salesperson', 'Sales Personnel'),
    )
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLES)

    def __str__(self):
        return self.email
