// src/components/FormBuilder/FormPreview.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import FormField from './fields/FormField';

const FormPreview = ({ fields, onBack, category }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        console.log('Form data:', data);
        alert('Form submitted! Check console for data.');
    };

    // Pisahkan fields menjadi personal info dan category fields
    const personalInfoFields = fields.slice(0, 5);
    const categoryFields = fields.slice(5);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">
                        Preview: {category.name} Form
                    </h3>
                    <p className="text-sm text-gray-600">
                        Personal Information + {category.name} Fields
                    </p>
                </div>
                <Button onClick={onBack} variant="outline">
                    Kembali ke Editor
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Form Preview - {category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information Section */}
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-4 pb-2 border-b">
                                Personal Information
                            </h4>
                            <div className="space-y-4">
                                {personalInfoFields.map((field) => (
                                    <FormField
                                        key={field.id}
                                        field={field}
                                        isEditing={false}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Category Fields Section */}
                        {categoryFields.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-4 pb-2 border-b">
                                    {category.name} Information
                                </h4>
                                <div className="space-y-4">
                                    {categoryFields.map((field) => (
                                        <FormField
                                            key={field.id}
                                            field={field}
                                            isEditing={false}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        
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