from django.db import models

# Create your models here.
class Patient(models.Model):
    first_name = models.CharField(max_length=120)
    last_name = models.CharField(max_length=120)
    patronym = models.CharField(max_length=120)
    birth_date = models.DateField()

    gender = models.CharField(max_length=3, default='муж')

    registration_adress = models.CharField(max_length=120, default='г. Оренбург, просп. Победы, д. 13')
    living_adress = models.CharField(max_length=120, default='г. Оренбург, просп. Победы, д. 13')

    social_status = models.CharField(max_length=120, default='работает')
    insurance_number = models.CharField(max_length=14,default='000-000-000 00')
    phone_number = models.CharField(max_length=11, default='74957556983')

class Visit(models.Model):
    patientID = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='visits')
    tapID = models.IntegerField() 
    investigationName = models.CharField(max_length=255)
    investigationResult = models.TextField()
    investigationDate = models.DateField()
    visitResult = models.TextField(blank=True, null=True) 

    def __str__(self):
        return f"Visit of {self.patientID} on {self.investigationDate}"


