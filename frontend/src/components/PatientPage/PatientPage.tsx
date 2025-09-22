import axios from "axios"
import {useLocation, useNavigate, useParams} from 'react-router-dom'
import {BACKEND_URL} from '../../constants';
import { useEffect, useState } from "react";
import { Button, Modal, Select, Spin, TextArea, TextInput, useToaster } from "@gravity-ui/uikit";
import { Settings } from "@gravity-ui/navigation";
import {DatePicker} from '@gravity-ui/date-components';
import {dateTime, settings, UtcTimeZone} from '@gravity-ui/date-utils';

settings.getLocale(); // default locale "en"
settings.loadLocale('ru').then(() => {
  settings.setLocale('ru');
  settings.getLocale(); // "de"
});


export const PatientPage: React.FC = () =>{
    const navigate = useNavigate();
    const { patientId } = useParams();
    const [curPatient,setCurPatient] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [analysis, setAnalysis] = useState({});
    const [analysIsLoad, setAnlysIsLoad] = useState(true)
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const doctorName = location.state?.name; 
    const [aiDiagnose, setAiDiagnose] = useState<string | undefined>(undefined);

    const {add} = useToaster();
    const {removeAll} = useToaster();


    const getPatient = () =>{
        axios.get(BACKEND_URL+'/api/patient/'+patientId,{
            withCredentials:true
        })
        .then((res)=>{
            setCurPatient(res.data)
            setIsLoading(false)
        })
        .catch((err)=>{
            alert(err.data)
            navigate('/login')
        })
    }

     const getAnalysis = () =>{
        axios.get(BACKEND_URL+'api/get_analysis/',{
            withCredentials:true,
            params:{
                "tapID":123765,
            }
        })
        .then((res)=>{
            
            console.log("here")
            const dictByInvestigationName = res.data.reduce((acc, item) => {
                if (Array.isArray(item)) {
                  item.forEach(obj => {
                    acc[obj.investigationName] = obj;
                  });
                } else {
                  acc[item.investigationName] = item;
                }
                return acc;
            }, {});

            if (res.data.length !== 0){
                setAnlysIsLoad(false)
            }
            setAnalysis(dictByInvestigationName)
            console.log(JSON.stringify(dictByInvestigationName));
            console.log(JSON.stringify(analysis["Kumbs"].investigationResult));
        })
        .catch((err)=>{
            // alert("NO ANALYS")
        })
    }

    const getPredict = () => {
        axios.get(BACKEND_URL+'api/diagnose_predict/', {
            params: {
                "tap": analysis["Kumbs"].tapID,
                "pol" : curPatient['gender'],
                "ves" : weightValue,
                "travma" : travmaValue,
                "onko": onkoValue,
                "infec": infecValue,
                "uzi": uziValue,
                "nasled": nasledValue
            }
        }).then((res)=>{

            add({
                title: 'Прогноз модели',
                name: "s1",
                content: res.data.result,
                theme: "success"
            });
            setAiDiagnose(res.data.result);
        })
    }

    const formatPhoneNumber = (number) => {
        const cleaned = ('' + number).replace(/\D/g, '');
        // Проверяем, что номер состоит из 10 цифр
        const match = cleaned.match(/^7?(\d{3})(\d{3})(\d{4})$/);
        return `+7 (${match[1]}) ${match[2]}-${match[3]}`;
    };

    function check_values(){
        var errorMsg = ``;

        if(natureDeseaseValue===undefined){
            errorMsg += `Характер заболевания\n`;
            setNatureDeseaseValid("invalid");
        }

        if(patientStateValue===undefined){
            errorMsg += `Состояние пациента\n`;
            setPatientStateValid("invalid");
        }
        if(travmaValue === undefined){
            errorMsg += `Наличие кровотечения\n`;
            setTravmaValid("invalid");
        }

        if(onkoValue === undefined){
            errorMsg += `Наличие онкологий\n`;
            setOnkoValid("invalid");
        }

        if(infecValue === undefined){
            errorMsg += `Инфекции\n`;
            setInfecValid("invalid");
        }
        if(uziValue === undefined){
            errorMsg += `Результат ультразвукового исследования\n`;
            setUziValid("invalid");
        }
        if(nasledValue === undefined){
            errorMsg += `Наследставенность\n`;
            setNasledValid("invalid");
        }
        if(weightValue==undefined || weightValue===""){
            errorMsg += `Вес\n`;
            setWeightValid("invalid");
        }

        if(temperatureValue==undefined || temperatureValue===""){
            errorMsg += `Температура\n`;
            setTemperatureValid("invalid");
        }

        if(heightValue==undefined || heightValue===""){
            errorMsg += `Рост\n`;
            setHeightValid("invalid");
        }

        const MyComponent = () => (
            <div style={{ whiteSpace: 'pre-line' }}>
              {errorMsg}
            </div>
        );
        
        if(errorMsg !== ""){
            add({
                title: 'Допущены ошибки в данных',
                name: "s",
                theme: "danger",
                content: <MyComponent/>,
                autoHiding:false
            });
            return false;
        }else{
            removeAll();
            getPredict();
            add({
                title: 'Данные успешно отправлены',
                name: "s",
                theme: "success"
            });
            return true;
        } 
    }

    function onPredictClick(e){
        if (check_values()){
            getPredict()
        }
    }

        
    const [patientStateValid, setPatientStateValid] = useState<"invalid" | undefined>(undefined);
    const [patientStateValue, setPatientStateValue] = useState<string | undefined>(undefined);
    var patientStateSelect = <Select width={370}
    value={[patientStateValue ?? ""]}
    validationState={patientStateValid}
    errorMessage = "Это поле обязательно для заполнения"
    onUpdate={(value) => {
        setPatientStateValue(value[0])
        if(value === undefined){
            setPatientStateValid("invalid");
        }else{
            setPatientStateValid(undefined);
        }
    }}>
        <Select.Option value="pain">Удовлетворительное</Select.Option>
        <Select.Option value="first_time">Средней тяжести</Select.Option>
        <Select.Option value="early">Тяжелое</Select.Option>
        <Select.Option value="pain">Крайне тяжелое</Select.Option>
        <Select.Option value="first_time">Клиническая смерть</Select.Option>
    </Select>

    const [natureDeseaseValid, setNatureDeseaseValid] = useState<"invalid" | undefined>(undefined);
    const [natureDeseaseValue, setNatureDeseaseValue] = useState<string | undefined>(undefined);
    var natureDeseaseSelect = <Select width={370}
        value={[natureDeseaseValue ?? ""]}
        validationState={natureDeseaseValid}
        errorMessage = "Это поле обязательно для заполнения"
        onUpdate={(value) => {
            setNatureDeseaseValue(value[0])
            if(value === undefined){
                setNatureDeseaseValid("invalid");
            }else{
                setNatureDeseaseValid(undefined);
            }
        }}>
        <Select.Option value="pain">Острое</Select.Option>
        <Select.Option value="first_time">Впервые в жизни установленное хроническое</Select.Option>
        <Select.Option value="early">Ранее установленное хроническое</Select.Option>
    </Select>


    const [heightValue, setHeightValue] = useState<string|undefined>(undefined);
    const [heightValid, setHeightValid] = useState<"invalid" | undefined>(undefined);
    const [heightErrMsg, setHeightErrMsg] = useState<string|undefined>(undefined);
    var heightTextInput = <TextInput     
        type="number" 
        value={heightValue ?? ""}
        validationState={heightValid}
        errorMessage = {heightErrMsg}
        onUpdate={
            (value) => {
                setHeightValue(value)
                if(value === ""){
                    setHeightErrMsg("Значение не может быть пустым")
                    setHeightValid("invalid");
                }else if (parseInt(value)>300){
                    setHeightValid("invalid");
                    setHeightErrMsg("Кто ты воин?")
                }else if (parseInt(value)<=0){
                    setHeightValid("invalid");
                    setHeightErrMsg("Значение не может быть меньше нуля")
                }else{
                    setHeightValid(undefined);
                }
            }}>
    </TextInput>


    const [weightValue, setWeightValue] = useState<string|undefined>(undefined);
    const [weightValid, setWeightValid] = useState<"invalid" | undefined>(undefined);
    const [weightErrMsg, setWeightErrMsg] = useState<string|undefined>(undefined);
    var weightTextInput = <TextInput     
        type="number" 
        value={weightValue ?? ""}
        validationState={weightValid}
        errorMessage = {weightErrMsg}
        onUpdate={
            (value) => {
                setWeightValue(value)
                if(value === ""){
                    setWeightErrMsg("Значение не может быть пустым")
                    setWeightValid("invalid");
                }else if (parseInt(value)>300){
                    setWeightValid("invalid");
                    setWeightErrMsg("Слишком большое число")
                }else if (parseInt(value)<=0){
                    setWeightValid("invalid");
                    setWeightErrMsg("Вес не может быть нулевым или отрицательным")
                }else{
                    setWeightValid(undefined);
                }
            }}>
    </TextInput>

    const [temperatureValue, setTemperatureValue] = useState<string|undefined>(undefined);
    const [temperatureValid, setTemperatureValid] = useState<"invalid" | undefined>(undefined);
    const [temperatureErrMsg, setTemperatureErrMsg] = useState<string|undefined>(undefined);
    var temperatureTextInput = <TextInput     
        type="number" 
        value={temperatureValue ?? ""}
        validationState={temperatureValid}
        errorMessage = {temperatureErrMsg}
        onUpdate={
            (value) => {
                setTemperatureValue(value)
                if(value === ""){
                    setTemperatureErrMsg("Значение не может быть пустым")
                    setTemperatureValid("invalid");
                }else if (parseInt(value)>42){
                    setTemperatureValid("invalid");
                    setTemperatureErrMsg("Значение больше 42. Пациент умер!")
                }else if (parseInt(value)<=0){
                    setTemperatureValid("invalid");
                    setTemperatureErrMsg("Это снеговик что ли?")
                }else{
                    setTemperatureValid(undefined);
                }
            }}>
    </TextInput>


    const [nasledValue, setNasledValue] = useState<string|undefined>(undefined);
    const [nasledValid, setNasledValid] = useState<"invalid"|undefined>(undefined);
    var nasledSelect = <Select
        errorMessage = "Это поле обязательно для заполнения" 
        validationState={nasledValid}
        width={350} value={[nasledValue ?? ""]} 
        onUpdate={(value) => {
            setNasledValue(value[0])
            if(value === undefined){
                setNasledValid("invalid");
            }else{
                setNasledValid(undefined);
            }
        }}>
        <Select.Option value="0">D56.4 Наследственное персистирование фетального гемоглобина [НПФГ]</Select.Option>
        <Select.Option value="1">D57.3 Носительство признака серповидно-клеточности</Select.Option>
        <Select.Option value="2">D58.0 Наследственный сфероцитоз</Select.Option>
        <Select.Option value="3">D58.1 Наследственный эллиптоцитоз</Select.Option>
        <Select.Option value="4">D58.8 Другие уточненные наследственные гемолитические анемии</Select.Option>
        <Select.Option value="5">D58.9 Наследственная гемолитическая анемия неуточненная</Select.Option>
        <Select.Option value="6">Наследственность отсутствует</Select.Option>
    </Select>


    const [uziValue, setUziValue] = useState<string|undefined>(undefined);
    const [uziValid, setUziValid] = useState<"invalid"|undefined>(undefined);
    var uziSelect = <Select width={350} 
        value={[uziValue ?? ""]}
        validationState={uziValid}
        errorMessage = "Это поле обязательно для заполнения" 
        onUpdate={(value) => {
            setUziValue(value[0])
            if(value === undefined){
                setUziValid("invalid");
            }else{
                setUziValid(undefined);
            }
        }}>
        <Select.Option value="1">Да</Select.Option>
        <Select.Option value="0">Нет</Select.Option>
    </Select>

    const [infecValue, setInfecValue] = useState<string|undefined>(undefined);
    const [infecValid, setInfecValid] = useState<"invalid"|undefined>(undefined);
    var infecSelect = <Select width={350} 
    value={[infecValue ?? ""]}
    validationState={infecValid}
    errorMessage = "Это поле обязательно для заполнения" 
    onUpdate={(value) => {
        setInfecValue(value[0])
        if(value === undefined){
            setInfecValid("invalid");
        }else{
            setInfecValid(undefined);
        }
    }}>
    <Select.Option value="1">Да</Select.Option>
    <Select.Option value="0">Нет</Select.Option>
    </Select>


    const [onkoValid, setOnkoValid] = useState<"invalid"|undefined>(undefined);
    const [onkoValue, setOnkoValue] = useState<string|undefined>(undefined);
    var onkoSelect = <Select width={350} 
        value={[onkoValue ?? ""]}
        validationState={onkoValid}
        errorMessage = "Это поле обязательно для заполнения" 
        onUpdate={(value) => {
            setOnkoValue(value[0])
            if(value === undefined){
                setOnkoValid("invalid");
            }else{
                setOnkoValid(undefined);
            }
        }}>
        <Select.Option value="1">Да</Select.Option>
        <Select.Option value="0">Нет</Select.Option>
    </Select>

    const [travmaValid, setTravmaValid] = useState<"invalid"|undefined>(undefined);
    const [travmaValue, setTravmaValue] = useState<string|undefined>(undefined);
    var travmaSelect = <Select width={350}  
        value={[travmaValue ?? ""]} 
        validationState={travmaValid}
        errorMessage = "Это поле обязательно для заполнения"
        onUpdate={(value) => {
            setTravmaValue(value[0])
            if(value === undefined){
                setTravmaValid("invalid");
            }else{
                setTravmaValid(undefined);
            }
        }}>
        <Select.Option value="1">Да</Select.Option>
        <Select.Option value="0">Нет</Select.Option>
    </Select>

const planStr = `Приём (осмотр, консультация) врача первичный

Жалобы

Анамнез заболевания

Анамнез жизни

Объективный статус

Диагноз основной (расшифровка)

Рекомендации назначения

Врач ${doctorName} 
Дата ${dateTime()}
`;

    useEffect(()=>{   
        getPatient()
        getAnalysis()
    },[isLoading, setAnlysIsLoad])

    return(
        <div>
            {isLoading || Object.keys(analysis).length === 0 ?(
                <div style={
                    {
                        height:'100vh',                      
                        top:'50%',
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                    }
                }>
                    <Spin size="xl"/>    
                </div>
        ):(
            
            <Settings title={curPatient['last_name'] + " " + curPatient['first_name'] + " " + curPatient['patronym']}
                showRightAdornmentOnHover={true} filterPlaceholder="Найти параметр">
                <Settings.Group id="main" groupTitle="Параметры пациента">

                    <Settings.Page title="Информация о пациенте" >
                        <Settings.Section title={curPatient['last_name']+" "+curPatient['first_name'] + " "+curPatient['patronym']}>
                            <Settings.Item title="Дата рождения">
                                <p>{new Date(curPatient['birth_date']).toLocaleDateString('ru-RU')}</p>
                            </Settings.Item>
                            <Settings.Item title="Пол">
                                <p>{curPatient['gender']}</p>
                            </Settings.Item>
                            <Settings.Item title="Социальный статус">
                                <p>{curPatient['social_status']}</p>
                            </Settings.Item>
                            <Settings.Item title="Адрес проживания">
                                <p>{curPatient['living_adress']}</p>
                            </Settings.Item>
                            <Settings.Item title="Адрес регистрации">
                                <p>{curPatient['registration_adress']}</p>
                            </Settings.Item>
                            <Settings.Item title="Телефон">
                                <p>
                                {formatPhoneNumber(curPatient['phone_number'])}
                                </p>
                            </Settings.Item>
                            <Settings.Item title="Номер страхового полиса">
                                <p>{curPatient['insurance_number']}</p>
                            </Settings.Item>
                        </Settings.Section>
                    </Settings.Page>

                    <Settings.Page title={"ТАП №" + analysis["Kumbs"].tapID} id="tap">
                        <Settings.Section title="">
                            <Settings.Item title="Дата и время приема">
                                <DatePicker format="D MMM , YYYY H:mm" defaultValue={dateTime()}/>
                            </Settings.Item>

                            <Settings.Item title="Врач">
                                <p>{doctorName}</p>
                            </Settings.Item>

                            <Settings.Item title="Отделение">
                                <p>Гематология</p>
                            </Settings.Item>

                            <Settings.Section title="Осмотр пациента">       
                                <TextArea minRows={20} defaultValue={planStr}/>
                            </Settings.Section>


                            <Settings.Item title="Лабораторные исследования">    
                                <Button view="outlined-info" onClick={() => setOpen(true)}>
                                    Открыть
                                </Button>

                                <Modal open={open} onClose={() => setOpen(false)}>
                                <table id="results-table">
                                    <tr>
                                        <th>Код</th>
                                        <th>Наименование лабораторного исследования</th>
                                        <th>Референсные измерения</th>
                                        <th>Ед. измерения</th>
                                        <th>Результат</th>
                                        <th>Дата исследования</th>
                                    </tr>
                                    <tr>
                                        <td>A09.05.003</td>
                                        <td>Исследование уровня общего гемоглобина в крови</td>
                                        <td>120-140 (ж), 135-160 (м)</td>
                                        <td>г/л</td>
                                        <td>{analysis["HGB"].investigationResult}</td>
                                        <td>{new Date(analysis["HGB"].investigationDate).toLocaleDateString('ru-RU')}</td>
                                    </tr>
                                    <tr>
                                        <td>A12.05.118</td>
                                        <td>Исследование уровня эритроцитов в крови</td>
                                        <td>3,9-4,7 (ж), 4-5 (м)</td>
                                        <td>*10^12/л</td>
                                        <td>{analysis["erit"].investigationResult}</td>
                                        <td>{new Date(analysis["erit"].investigationDate).toLocaleDateString('ru-RU')}</td>
                                    </tr>
                                    <tr>
                                        <td>A12.05.119</td>
                                        <td>Исследование уровня лейкоцитов в крови</td>
                                        <td>4-9</td>
                                        <td>*10^9/л</td>
                                        <td>{analysis["leik"].investigationResult}</td>
                                        <td>{new Date(analysis["leik"].investigationDate).toLocaleDateString('ru-RU')}</td>
                                    </tr>
                                    <tr>
                                        <td>A12.05.120</td>
                                        <td>Исследование уровня тромбоцитов в крови</td>
                                        <td>150-400</td>
                                        <td>*10^9/л</td>
                                        <td>{analysis["PLT"].investigationResult}</td>
                                        <td>{new Date(analysis["PLT"].investigationDate).toLocaleDateString('ru-RU')}</td>
                                    </tr>
                                    <tr>
                                        <td>A12.05.117</td>
                                        <td>Оценка гематокрита</td>
                                        <td>36-42 (ж), 40-54 (м)</td>
                                        <td>%</td>
                                        <td>{analysis["gematok"].investigationResult}</td>
                                        <td>{new Date(analysis["gematok"].investigationDate).toLocaleDateString('ru-RU')}</td>
                                    </tr>
                                    <tr>
                                        <td>A09.05.282.001</td>
                                        <td>Определение среднего содержания гемоглобина в эритроцитах (MCH)</td>
                                        <td>24-34</td>
                                        <td>пг</td>
                                        <td>{analysis["MCH"].investigationResult}</td>
                                        <td>{new Date(analysis["MCH"].investigationDate).toLocaleDateString('ru-RU')}</td>
                                    </tr>
                                    <tr>
                                        <td>A09.05.282.002</td>
                                        <td>Средняя концентрация гемоглобина в эритроцитах (MCHC)</td>
                                        <td>300-380</td>
                                        <td>г/л</td>
                                        <td>{analysis["MCHC"].investigationResult}</td>
                                        <td>{new Date(analysis["MCHC"].investigationDate).toLocaleDateString('ru-RU')}</td>
                                    </tr>
                                    <tr>
                                        <td>A12.05.124.001</td>
                                        <td>Средний объем эритроцитов (MCV)</td>
                                        <td>75-95</td>
                                        <td>фл</td>
                                        <td>{analysis["MCV"].investigationResult}</td>
                                        <td>{new Date(analysis["MCV"].investigationDate).toLocaleDateString('ru-RU')}</td>
                                    </tr>
                                    <tr>
                                        <td>—</td>
                                        <td>Цветовой показатель</td>
                                        <td>—</td>
                                        <td>—</td>
                                        <td>{analysis["pokazatel"].investigationResult}</td>
                                        <td>{new Date(analysis["pokazatel"].investigationDate).toLocaleDateString('ru-RU')}</td>
                                    </tr>
                                    <tr>
                                        <td>A09.05.007</td>
                                        <td>Исследование уровня железа в сыворотке крови</td>
                                        <td>6,6 – 26 (м), 11 – 28 (ж)</td>
                                        <td>мкмоль/л</td>
                                        <td>{analysis["Fe"].investigationResult}</td>
                                        <td>{new Date(analysis["Fe"].investigationDate).toLocaleDateString('ru-RU')}</td>
                                    </tr>
                                    <tr>
                                        <td>A12.05.011</td>
                                        <td>Исследование железосвязывающей способности сыворотки (ОЖСС)</td>
                                        <td>45,3-77,1</td>
                                        <td>мкмоль/л</td>
                                        <td>{analysis["OZSS"].investigationResult}</td>
                                        <td>{new Date(analysis["OZSS"].investigationDate).toLocaleDateString('ru-RU')}</td>
                                    </tr>
                                    <tr>
                                        <td>A09.05.076</td>
                                        <td>Исследование уровня ферритина в крови</td>
                                        <td>10-120 (ж), 20-250 (м)</td>
                                        <td>мкг/л</td>
                                        <td>{analysis["Ferrit"].investigationResult}</td>
                                        <td>{new Date(analysis["Ferrit"].investigationDate).toLocaleDateString('ru-RU')}</td>
                                    </tr>
                                    <tr>
                                        <td>A12.06.060</td>
                                        <td>Определение уровня витамина B12 (цианокобаламин) в крови</td>
                                        <td>197-771</td>
                                        <td>пг/мл</td>
                                        <td>{analysis["B12"].investigationResult}</td>
                                        <td>{new Date(analysis["B12"].investigationDate).toLocaleDateString('ru-RU')}</td>
                                    </tr>
                                    <tr>
                                        <td>A09.05.021</td>
                                        <td>Исследование уровня общего билирубина в крови</td>
                                        <td>2-21</td>
                                        <td>мкмоль/л</td>
                                        <td>{analysis["billirubin"].investigationResult}</td>
                                        <td>{new Date(analysis["billirubin"].investigationDate).toLocaleDateString('ru-RU')}</td>
                                    </tr>
                                    <tr>
                                        <td>A09.05.010</td>
                                        <td>Исследование уровня общего белка в крови</td>
                                        <td>65-85</td>
                                        <td>г/л</td>
                                        <td>{analysis["belok"].investigationResult}</td>
                                        <td>{new Date(analysis["belok"].investigationDate).toLocaleDateString('ru-RU')}</td>
                                    </tr>
                                    <tr>
                                        <td>A09.05.080</td>
                                        <td>Исследование уровня фолиевой кислоты в сыворотке крови</td>
                                        <td>3 - 17</td>
                                        <td>нг/мл</td>
                                        <td>{analysis["folievay"].investigationResult}</td>
                                        <td>{new Date(analysis["folievay"].investigationDate).toLocaleDateString('ru-RU')}</td>
                                    </tr>
                                    <tr>
                                        <td>A09.05.011</td>
                                        <td>Исследование уровня альбумина в крови</td>
                                        <td>35-53</td>
                                        <td>г/л</td>
                                        <td>{analysis["albumin"].investigationResult}</td>
                                        <td>{new Date(analysis["albumin"].investigationDate).toLocaleDateString('ru-RU')}</td>
                                    </tr>
                                    <tr>
                                        <td>A08.05.001</td>
                                        <td>Цитологическое исследование мазка костного мозга (миелограмма)</td>
                                        <td>0 - норма, 1-угнетение более 2-х ростков, 0,5 - изолированное угнетение красного ростка</td>
                                        <td>—</td>
                                        <td>{analysis["mielogramma"].investigationResult}</td>
                                        <td>{new Date(analysis["mielogramma"].investigationDate).toLocaleDateString('ru-RU')}</td>
                                    </tr>
                                    <tr>
                                        <td>A12.05.009</td>
                                        <td>Прямой антиглобулиновый тест (прямая проба Кумбса)</td>
                                        <td>0-отриц, 1-+/слабо+</td>
                                        <td>—</td>
                                        <td>{analysis["Kumbs"].investigationResult}</td>
                                        <td>{new Date(analysis["Kumbs"].investigationDate).toLocaleDateString('ru-RU')}</td>
                                    </tr>
                                </table>
                                </Modal>
                            </Settings.Item>

                            <Settings.Item title="Основной диагноз">
                                <div style={{ width:370, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: "10px" }}>
                                    <TextInput/>
                                </div>                                
                            </Settings.Item>

                            <Settings.Item title="Характер заболевания">
                                {natureDeseaseSelect}
                            </Settings.Item>

                            <Settings.Item title="Состояние пациента" id="patientItem">
                                {patientStateSelect}
                            </Settings.Item>

                            <Settings.Item title="Диагноз системы">
                                <Settings.Section title="">
                                    <div style={{ width:370, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: "10px" }}>
                                        <TextInput value={aiDiagnose ?? ""}   onUpdate={(value) => {setAiDiagnose(value)}}/>
                                        <Button children={"Поставить диагноз"} view="action" onClick={onPredictClick}/>
                                    </div>
                                </Settings.Section>                                
                            </Settings.Item>

                        </Settings.Section>
                    </Settings.Page>

                    <Settings.Page title="Опрос пациента">
                    
                        <Settings.Section title="Витальные параметры">
                            <Settings.Item title="Рост (см)">
                                {heightTextInput}
                            </Settings.Item>

                            <Settings.Item title="Вес (кг)">
                                {weightTextInput}
                            </Settings.Item>
                            
                            <Settings.Item title="Температура (C)">
                                {temperatureTextInput}
                            </Settings.Item>
                        </Settings.Section>

                        <Settings.Section title="Опрос">
                            <Settings.Item title="Наличие кровотечения">
                                {travmaSelect}
                            </Settings.Item>

                            <Settings.Item title="Наличие на момент обследования восполительных заболеваний, онкологий">
                                {onkoSelect}
                            </Settings.Item>

                            <Settings.Item title="Инфекции, переливание крови, отравление, интоксикация">
                                {infecSelect}
                            </Settings.Item>

                            <Settings.Item title="Результат ультразвукового исследования">
                                {uziSelect}
                            </Settings.Item>

                            <Settings.Item title="Наследственность">
                                {nasledSelect}
                            </Settings.Item>
                            
                        </Settings.Section>


                    </Settings.Page>

                </Settings.Group>


            </Settings>
        )}

        </div>
    )
}