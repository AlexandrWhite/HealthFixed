import React, { useState } from 'react';

import {Theme, ThemeProvider, Toaster, ToasterProvider, ToasterComponent} from '@gravity-ui/uikit';
import { BrowserRouter, Routes, Route} from "react-router-dom";

import { LoginPage } from './components/LoginPage/LoginPage';
import { HomePage } from './components/HomePage/HomePage';
import { PatientPage } from './components/PatientPage/PatientPage';
import {FoobarComponent} from './components/Test';
import {DEFAULT_THEME} from './constants';
const toaster = new Toaster();

const App = () => {
    return (

        <ThemeProvider theme={DEFAULT_THEME}>
            <ToasterProvider toaster={toaster}>
                <ToasterComponent className="optional additional classes" />
                <BrowserRouter>
                    <Routes>
                        <Route path="/home" element={<HomePage/>} />
                        <Route path="/" element={<LoginPage/>} />
                        <Route path="/patient/:patientId" element={<PatientPage/>}/>
                    </Routes>
                </BrowserRouter>
            </ToasterProvider>
        </ThemeProvider>

       
    );
};

export default App;
