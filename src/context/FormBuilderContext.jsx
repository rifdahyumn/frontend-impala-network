import React, { createContext, useState } from 'react';

export const FormBuilderContext = createContext();

export const FormBuilderProvider = ({ children }) => {
    const [formData, setFormData] = useState({
        programName: '',
        fields: [],
        // ... data form lainnya
    });

    const updateFormData = (newData) => {
        setFormData(prev => ({
            ...prev,
            ...newData
        }));
    };

    const addField = (fieldType) => {
        const newField = {
            id: Date.now().toString(),
            type: fieldType,
            label: '',
            required: false,
            // ... properti field lainnya
        };
        
        setFormData(prev => ({
            ...prev,
            fields: [...prev.fields, newField]
        }));
    };

    return (
        <FormBuilderContext.Provider value={{
            formData,
            updateFormData,
            addField,
            // ... fungsi lainnya
        }}>
            {children}
        </FormBuilderContext.Provider>
    );
};