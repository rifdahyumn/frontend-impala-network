// src/pages/FormBuilderPage.jsx
import React from 'react';
import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import FormBuilderWorkspace from '../components/FormBuilder/FormBuilderWorkspace';

const FormBuilder = () => {
    return (
        <div className='flex pt-20 min-h-screen bg-gray-100'>
            <div className='flex-1 p-6'>
                <Header />
                <Card>
                    <CardHeader>
                        <CardTitle className='text-xl'>Form Builder - Impala Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormBuilderWorkspace />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default FormBuilder;