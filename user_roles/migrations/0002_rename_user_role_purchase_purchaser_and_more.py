# Generated by Django 5.0.4 on 2024-05-04 06:57

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('user_roles', '0001_initial'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='user_role_purchase',
            new_name='purchaser',
        ),
        migrations.RenameModel(
            old_name='user_role_sales',
            new_name='sales_men',
        ),
    ]
