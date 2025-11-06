// src/components/FormBuilder/FormPreview.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'; // Diperbaiki
import { Button } from '../ui/button'; // Diperbaiki
import FormField from './fields/FormField';

const FormPreview = ({ fields, onBack, category }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        console.log('Form data:', data);
        alert('Form submitted! Check console for data.');
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                    Preview: {category.name} Form
                </h3>
                <Button onClick={onBack} variant="outline">
                    Kembali ke Editor
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Form Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {fields.map((field) => (
                            <FormField
                                key={field.id}
                                field={field}
                                isEditing={false}
                            />
                        ))}
                        
                        <div className="flex gap-2 pt-4">
                            <Button type="submit">
                                Submit Form
                            </Button>
                            <Button type="button" variant="outline" onClick={onBack}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default FormPreview;