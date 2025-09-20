import json
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST
from django.contrib.sessions.models import Session
from rest_framework.renderers import JSONRenderer

from .serializers import PatientSerializer
from .serializers import VisitSerializer
from .models import Patient
from .models import Visit

# Декоратор для выдачи ошибки если пользователь неавторизован
def json_login_required(view_func):
    def wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Вы не авторизованы'}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapped_view

def get_csrf(request):
    response = JsonResponse({'detail': 'CSRF cookie set'})
    s = get_token(request)
    response['X-CSRFToken'] = s
    return response

@require_POST
def login_view(request):
    # Получаем авторизационные данные
    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')

    # Валидация
    if username is None or password is None:
        return JsonResponse({'detail': 'Пожалуйста предоставьте логин и пароль'}, status=400)

    # Аутентификация пользоваля
    user = authenticate(username=username, password=password)
    
    if user is None:
        return JsonResponse({'detail': 'Неверный логин или пароль'}, status=400)

    # Создаётся сессия. session_id отправляется в куки
    login(request, user)
    return JsonResponse({'detail': 'Успешная авторизация'})

  
# Сессия удаляется из БД и session_id на клиенте более недействителен
@json_login_required
def logout_view(request):
    logout(request)
    return JsonResponse({'detail': 'Вы успешно вышли'})

  
# Узнать авторизован ли пользователь и получить его данные
@ensure_csrf_cookie # <- Принудительная отправка CSRF cookie
def session_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'isAuthenticated': False})

    return JsonResponse({'isAuthenticated': True, 'username': request.user.username, 'user_id': request.user.id})

  
# Получение информации о пользователе
@json_login_required
def user_info(request):
    return JsonResponse({'username': request.user.username, 'firstname': request.user.first_name, 'lastname': request.user.last_name})

@json_login_required
def get_patients(request):
    patients_from_db = Patient.objects.all()
    serialized = PatientSerializer(patients_from_db, many=True) 
    return JsonResponse(serialized.data,safe=False)

@json_login_required
def test(request,id):
    my_object = Patient.objects.filter(pk=id).first()
    return JsonResponse(PatientSerializer(my_object).data)

@json_login_required
def get_analysis(request):
    tapID = request.GET.get("tapID")
    visits = Visit.objects.filter(tapID=tapID)
    serialized = VisitSerializer(visits, many=True) 
    return JsonResponse(serialized.data, safe=False)




# Удаление всех сессий из БД
# Вы можете переделать так, чтобы отзывать сессию у определённого пользователя
@json_login_required
def kill_all_sessions(request):
    sessions = Session.objects.all()
    sessions.delete()

    return JsonResponse({'detail': 'Сессии успешно завершены'})

import pandas as pd
import pickle
def diagnose_predict(request):
    codes = [
        "D50.9 Железодефицитная анемия неуточненная",
        "D51.9 Витамин-B12-дефицитная анемия неуточненная",
        "D52.9 Фолиеводефицитная анемия неуточненная",
        "D53.9 Анемия, связанная с питанием, неуточненная", 
        "D56.9 Талассемия неуточненная", 
        "D57.8 Другие серповидно-клеточные нарушения",
        "D58.9 Наследственная гемолитическая анемия неуточненная",
        "D59.9 Приобретенная гемолитическая анемия неуточненная", 
        "D60.9 Приобретенная чистая красно-клеточная аплазия неуточненная",
        "D61.9 Апластическая анемия неуточненная",
        "D62.0 Острая постгеморрагическая анемия",
        "D63.8 Анемия при других хронических болезнях, классифицированных в других рубриках",
        "D64.4 Врожденная дизэритропоэтическая анемия"
    ]

    pol = request.GET.get('pol')
    ves = request.GET.get('ves')
    travma = request.GET.get('travma')
    
    visits = Visit.objects.filter(tapID=request.GET.get("tap"))
    analyses = {}

    for visit in visits:
        analyses[visit.investigationName] = visit.investigationResult

    cols = ["pol", "ves", "travma", "onko", "infec", "uzi", "nasled",
        "HGB", "erit", "leik", "PLT", "gematok", "MCH", "MCHC", "MCV",
        "pokazatel", "Fe", "OZSS", "Ferrit", "B12", "billirubin", "belok",
        "folievay", "albumin", "mielogramma", "Kumbs"
    ]

    gender = 0 if request.GET.get('pol')=="жен" else 1
    weight = float(request.GET.get('ves'))/100
    array = pd.DataFrame([
        [gender, #Пол
        weight, #Вес
        request.GET.get('travma'), #травма 
        request.GET.get('onko'), #онко +
        request.GET.get('infec'), #инфекция +  
        request.GET.get('uzi'), #узи +
        request.GET.get('nasled'), #наследст +
        analyses["HGB"], #HGB Исследование уровня общего гемоглобина в крови
        analyses["erit"], # erit Исследование уровня эритроцитов в крови
        analyses["leik"], # leik Исследование уровня лейкоцитов в крови
        analyses["PLT"], #PLT Исследование уровня тромбоцитов в крови
        analyses["gematok"], #gematok Оценка гематокрита
        analyses["MCH"], #MCH Определение среднего содержания гемоглобина в эритроцитах (MCH)	
        analyses["MCHC"],	#MCHC Средняя концентрация гемоглобина в эритроцитах (MCHC)
        analyses["MCV"], #MCV Средний объем эритроцитов (MCV)
        analyses["pokazatel"], #Цветовой показатель
        analyses["Fe"], #Fe Исследование уровня железа в сыворотке крови
        analyses["OZSS"], #OZSS Исследование железосвязывающей способности сыворотки (ОЖСС)
        analyses["Ferrit"], #Ferrit Исследование уровня ферритина в крови
        analyses["B12"], #B12 Определение уровня витамина B12 (цианокобаламин) в крови
        analyses["billirubin"], #billirubin Исследование уровня общего билирубина в крови
        analyses["belok"], #belok Исследование уровня общего белка в крови
        analyses["folievay"], #folievay Исследование уровня фолиевой кислоты в сыворотке крови
        analyses["albumin"], #albumin Исследование уровня альбумина в крови
        analyses["mielogramma"], #mielogramma (миелограмма)
        analyses["Kumbs"] #Прямой антиглобулиновый тест (прямая проба Кумбса) 
        ], 
    ],columns=cols)
    

    with open("ml/model.pkl", "rb") as f:
        model = loaded_model = pickle.load(f)
        res = model.predict(array)
        result = codes[res[0]-1]

    return JsonResponse({'result':result})
    