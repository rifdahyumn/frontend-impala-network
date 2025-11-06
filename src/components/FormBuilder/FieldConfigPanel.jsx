// src/components/FormBuilder/FieldConfigPanel.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';

// Fallback Switch jika komponen tidak ada
const FallbackSwitch = ({ checked, onCheckedChange, ...props }) => {
  return (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      }`}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

// Coba import Switch, jika tidak ada gunakan fallback
let Switch;
try {
  Switch = require('../ui/switch').Switch;
} catch (error) {
  Switch = FallbackSwitch;
  console.warn('Switch component not found, using fallback');
}

const FieldConfigPanel = ({ field, onFieldUpdate }) => {
    if (!field) {
        return (
            <Card className="w-80 flex-shrink-0">
                <CardContent className="p-6">
                    <div className="text-center text-gray-500">
                        Pilih field untuk mengkonfigurasi
                    </div>
                </CardContent>
            </Card>
        );
    }

    const handleChange = (key, value) => {
        onFieldUpdate({
            ...field,
            [key]: value
        });
    };

    const handleOptionsChange = (newOptions) => {
        handleChange('options', newOptions);
    };

    const addOption = () => {
        const currentOptions = field.options || [];
        handleOptionsChange([...currentOptions, `Option ${currentOptions.length + 1}`]);
    };

    const updateOption = (index, value) => {
        const newOptions = [...(field.options || [])];
        newOptions[index] = value;
        handleOptionsChange(newOptions);
    };

    const removeOption = (index) => {
        const newOptions = field.options.filter((_, i) => i !== index);
        handleOptionsChange(newOptions);
    };

    return (
        <Card className="w-80 flex-shrink-0">
            <CardHeader>
                <CardTitle className="text-sm">Field Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="label">Label</Label>
                    <Input
                        id="label"
                        value={field.label || ''}
                        onChange={(e) => handleChange('label', e.target.value)}
                    />
                </div>

                <div>
                    <Label htmlFor="name">Field Name</Label>
                    <Input
                        id="name"
                        value={field.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                    />
                </div>

                <div>
                    <Label htmlFor="placeholder">Placeholder</Label>
                    <Input
                        id="placeholder"
                        value={field.placeholder || ''}
                        onChange={(e) => handleChange('placeholder', e.target.value)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Label htmlFor="required">Required</Label>
                    <Switch
                        checked={field.required || false}
                        onCheckedChange={(checked) => handleChange('required', checked)}
                    />
                </div>

                {field.type === 'select' && (
                    <div>
                        <Label>Options</Label>
                        <div className="space-y-2 mt-2">
                            {(field.options || []).map((option, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={option}
                                        onChange={(e) => updateOption(index, e.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeOption(index)}
                                    >
                                        ×
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={addOption}>
                                Add Option
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default FieldConfigPanel;