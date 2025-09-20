from django.contrib import admin
from .models import Patient
from .models import Visit

# Register your models here.
class PatientAdmin(admin.ModelAdmin):
    list_display = ('first_name','last_name', 'patronym', 'birth_date')

admin.site.register(Patient, PatientAdmin)

class VisitAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Visit._meta.fields]
admin.site.register(Visit, VisitAdmin)
