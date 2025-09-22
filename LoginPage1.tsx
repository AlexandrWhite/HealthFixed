import './LoginPage.scss';

import block from 'bem-cn-lite';
const b = block('login-page');

import axios from 'axios';

import React from 'react';
const serverUrl = 'http://localhost:8000/'


import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AppContexts/AppContext';
import { useContext, useState, useEffect } from "react";

import { ThemeProvider } from '@gravity-ui/uikit';
import { TextInput,Button,Alert } from '@gravity-ui/uikit';
import { Footer } from '@gravity-ui/navigation';

export const LoginPage: React.FC = () => {
    
    const navigate = useNavigate();

    const [isAuth, setIsAuth] = useState(false)
    const {username, setUsername} = useContext(AuthContext)
    const [isCsrf, setIsCsrf] = useState(null)
    
    const [isLogin, setIsLogin] = useState('')
    const [isPassword, setIsPassword] = useState('')
    const [isErrorMessageVisible, setIsErrorMessageVisible] = useState(false)



    const getCSRF = () => {
        axios.get(serverUrl + 'api/csrf/', { withCredentials: true })
        .then((res) => {
            const csrfToken = res.headers.get('X-CSRFToken')
            setIsCsrf(csrfToken)
        })
        .catch((err) => console.error(err))
    }

    const get_session = () => {
        
        axios.get(serverUrl+"api/session/", {withCredentials:true})
        .then((res)=>{
            // alert(JSON.stringify(res.data));
            if (res.data.isAuthenticated===false) {
                getCSRF()
                setIsAuth(true)
            }else{
                navigate('/')
            }
        })
    }

    useEffect(() => {
        get_session()
        setIsErrorMessageVisible(false);
    }, [])

    const login = () => {
        //alert("TOKEN: "+isCsrf);
        const data = { username: isLogin, password: isPassword }
        axios.post(serverUrl + "api/login/", data,
            {   
                withCredentials: true, 
                headers:{
                    "Content-Type": "application/json",
                    "X-CSRFToken": isCsrf,
                }
            }
        ).then((res)=>{
            setUsername(isLogin)
            setIsAuth(true)
            navigate('/', { replace: true })
        }).catch((err)=>{
            setIsErrorMessageVisible(true);
        });
    }

   


    function submitForm(event){
        event.preventDefault()
        login()
    }

    function onchange_login(event){
        setIsErrorMessageVisible(false)
        setIsLogin(event.target.value)
    }

    function onchange_pasword(event){
        setIsErrorMessageVisible(false)
        setIsPassword(event.target.value)
    }


    return(
        <ThemeProvider theme='light'>
            <div className={b()}>
                <div>
                    <form>
                        <h1 className={b('header')}>Вход в систему</h1>
                        <TextInput type="text" size='l' onChange={onchange_login} className={b('text-input')} placeholder='Логин'/>
                        <TextInput size='l' type='password' onChange={onchange_pasword} className={b('text-input')} placeholder='Пароль'/>
                        <Button type='submit' onClick={submitForm} className={b('login-btn')}  view='action' size='l' width='max' children="Войти"/>
                    </form>
                </div>
                {isErrorMessageVisible &&
                <Alert className={b('alert')} theme='danger'
                title='Ошибка входа' 
                message='Неверный логин или пароль'/>
                }
            </div>
            <Footer copyright='Выполнил студент Иванов И.И. Оренбург. 2025 год' withDivider={true}/>
        </ThemeProvider>
    );
};
