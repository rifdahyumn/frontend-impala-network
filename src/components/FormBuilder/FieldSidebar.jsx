// src/components/FormBuilder/FieldSidebar.jsx
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'; // Diperbaiki

const DraggableField = ({ type, label, icon }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `draggable-${type}`,
        data: { type }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="p-3 border border-gray-300 rounded-lg bg-white cursor-move hover:shadow-md transition-shadow mb-2"
        >
            <div className="flex items-center gap-2">
                <span className="text-gray-500">{icon}</span>
                <span className="text-sm font-medium">{label}</span>
            </div>
        </div>
    );
};

const FieldSidebar = () => {
    const fieldTypes = [
        { type: 'text', label: 'Text Field', icon: 'T' },
        { type: 'email', label: 'Email Field', icon: '✉' },
        { type: 'number', label: 'Number Field', icon: '#' },
        { type: 'phone', label: 'Phone Field', icon: '📞' },
        { type: 'select', label: 'Dropdown', icon: '▼' },
        { type: 'textarea', label: 'Text Area', icon: '📝' },
        { type: 'date', label: 'Date Picker', icon: '📅' }
    ];

    return (
        <Card className="w-64 flex-shrink-0">
            <CardHeader>
                <CardTitle className="text-sm">Field Library</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-gray-500 mb-3">Drag fields to form</p>
                <div>
                    {fieldTypes.map((field) => (
                        <DraggableField
                            key={field.type}
                            type={field.type}
                            label={field.label}
                            icon={field.icon}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default FieldSidebar;