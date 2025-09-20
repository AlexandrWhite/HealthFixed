import './HomePage.scss'
import { useEffect, useState, useLayoutEffect} from 'react';
import {BACKEND_URL} from '../../constants';
import {useNavigate} from 'react-router-dom'
import { useLocation } from 'react-router-dom';

import axios from 'axios';
import { ArrowToggle, Button, Icon, RenderRowActionsProps, Table, TextInput, Tooltip, User, UserLabel, withTableActions } from '@gravity-ui/uikit';
import { CircleQuestion, Magnifier } from '@gravity-ui/icons';

export const HomePage: React.FC = () => {
    const [username, setUsername] = useState('')
    const [fullname, setFullName] = useState('')
    const[Patients, setPatients] = useState([])

    const location = useLocation();
    const isCsrf = location.state?.token; 

    const navigate = useNavigate();
    
    const userInfo = () => {
        axios.get(BACKEND_URL + "api/user_info/", {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((res) => {
            setUsername(res.data.username)
            setFullName(`${res.data.lastname} ${res.data.firstname} `)    

        })
        .catch((err) => {
            if (err.status === 401){
                navigate("/")
            }

        });
    }

    const logout = () => {
        axios.get(BACKEND_URL + "api/logout/",
            {   
                withCredentials: true, 
                headers:{
                    "Content-Type": "application/json",
                    "X-CSRFToken": isCsrf,
                }
            }
        ).then((res)=>{
            navigate('/')
        })
    }


    const getPatients = () =>{        
        axios.get(BACKEND_URL + 'api/patients', {
            withCredentials:true,
            headers:{
                "Content-Type":"application/json",
            },
        })
        .then((res)=>{
            // alert(JSON.stringify(res.data))
            setPatients(res.data)
        }) 
    }

    useEffect(() => {
        userInfo()
        getPatients()
    }, [])


    const MyTable = withTableActions(Table);
    const RowAction = ({item}: RenderRowActionsProps<Item>) => {
        const handleAcceptButton = () => {
            //alert(`Принимаю : ${item.first_name} ${item.id}`);
            navigate('/patient/'+item.id, {state: {name: fullname}})
        }
        return <Button onClick={handleAcceptButton}>{`Принять`}</Button>;
    };

    const columns = [
        {
            name: "Фамилия", 
            id: 'last_name'
        },
        {
            name: "Имя", 
            id: 'first_name'
        },
        {
            name:"Отчество",
            id: 'patronym'
        },
        {
            name:"Дата рождения",
            id: 'birth_date'
        }
    ];

    return(    
        <div>
            <nav className="navbar">
                <div className="navbar-left">

                    <div>    
                        <div className='arrow-list'>
                            <p>АРМ врача поликлиники</p>
                            <ArrowToggle direction='right'/>
                            <p>МО1</p>
                            <ArrowToggle direction='right'/>
                            <p>Гематология поликлиника</p>
                            <ArrowToggle direction='right'/>
                            <p>Врач</p>
                        </div> 
                    </div> 
                
                </div>

                <div className="navbar-right">
                    <div>
                        <UserLabel type="empty" text={fullname}></UserLabel>
                    </div>
                    <div>
                        <Button view='outlined-danger' size='m' children='Выйти' onClick={logout}/>
                    </div>
                    <div>
                        <Tooltip content="Справка">
                            <Button view='outlined-action'>
                                <Icon data={CircleQuestion}/>
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            </nav>

            <div className="journal">
                <div className='search-element'>
                    <div className='search-input'>
                        <TextInput size='l' placeholder='ФИО пациента'/>
                    </div>
                    <Button view="outlined-action" size="l">
                        <Icon data={Magnifier} size={18} />
                        Найти
                    </Button>
                </div>
                <MyTable data={Patients} columns={columns} renderRowActions={RowAction}/>
            </div>
        </div>
    )
}
