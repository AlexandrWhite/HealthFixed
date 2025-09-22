import axios from 'axios';
import { Alert, Button, TextInput } from '@gravity-ui/uikit';
import { useEffect, useState} from 'react';
import {BACKEND_URL} from '../../constants';
import {useNavigate} from 'react-router-dom'
import './LoginPage.scss'
import block from 'bem-cn-lite';
const b = block('login-page');


export const LoginPage: React.FC = () => {
    const [isErrorMessageVisible, setIsErrorMessageVisible] = useState(false)
    const [isLogin, setIsLogin] = useState('')
    const [isPassword, setIsPassword] = useState('')
    const [isCsrf, setIsCsrf] = useState(null)
    const [isAuth, setIsAuth] = useState(false)
    const navigate = useNavigate();

    const getCSRF = () => {
        axios.get(BACKEND_URL + 'api/csrf/', { withCredentials: true })
        .then((res) => {
            const csrfToken = res.headers.get('X-CSRFToken')
            setIsCsrf(csrfToken)
        })
        .catch((err) => console.error(err))
    }

    const get_session = () => {
        axios.get(BACKEND_URL+"api/session/", {withCredentials:true})
        .then((res)=>{
            // alert(JSON.stringify(res.data));
            if (res.data.isAuthenticated) {
                // alert("i am logined")                
                navigate("/home", {state: {token: isCsrf}})
                setIsAuth(true)
                return
            }
            setIsAuth(false)
            getCSRF()
        })
    }

    const login = () => {
        const data = { username: isLogin, password: isPassword }
        axios.post(BACKEND_URL+"api/login/", data, {
            withCredentials: true,
            headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": isCsrf,
        }
        })
        .then((res) => {
            // alert("Успешно логин")
            setIsAuth(true)
            setIsLogin('')
            setIsPassword('')
            setIsErrorMessageVisible(false)
            navigate("/home", {state: {token: isCsrf}})
        })
        .catch((err) => {
            console.error(err);
            setIsErrorMessageVisible(true)
        });
    }

    function submitForm(e) {
        e.preventDefault()
        login()
    }
    

    useEffect(() => {
        get_session();
    }, [])


    
    return(
        <div className={b()}>
            <form className={b('form')}>
                <h1 className={b('header')}>Вход в систему</h1>
                <TextInput className={b('text-input')} type="text" onUpdate={setIsLogin} placeholder='Логин'/>
                <TextInput className={b('text-input')} type="password" onUpdate={setIsPassword} placeholder='Пароль'/>
                
                <Button className={b('login-btn')} type='submit'
                    onClick={submitForm} 
                    view='action' size='l' width='max' children="Войти"/>

                {isErrorMessageVisible && <Alert className={b('alert')} theme='danger'
                    title='Ошибка входа' 
                    message='Неверный логин или пароль'/>}
            </form>
        </div>
    )
}
