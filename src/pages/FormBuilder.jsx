import React from 'react';
import Header from "../components/Layout/Header";
import Sidebar from "../components/Layout/Sidebar";
import FormBuilderWorkspace from '../components/FormBuilder/FormBuilderWorkspace';

const FormBuilder = () => {
    return (
        <div className='flex pt-20 min-h-screen bg-gray-100'>
            <Sidebar />
            <div className='flex-1 p-6'>
                <Header />
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Form Builder - Impala Management</h1>
                        </div>
                    </div>

                    <FormBuilderWorkspace />
                </div>
            </div>
        </div>
    );
};

export default FormBuilder;