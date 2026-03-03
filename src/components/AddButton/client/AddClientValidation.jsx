import toast from "react-hot-toast";

export const validateForm = (formData, formSections, clientExists, setErrors, isEditMode, updateAllFields = true) => {
    const newErrors = {};

    formSections.forEach(section => {
        section.fields.forEach(field => {
            if (field.required) {
                const value = formData[field.name];
                
                if (field.type === 'select') {
                    if (!value || value === '' || value === 'no-options') {
                        newErrors[field.name] = `${field.label} is required`;
                    }
                } else if (field.type === 'file') {
                    if (!value && !isEditMode) {
                        newErrors[field.name] = `${field.label} is required`;
                    }
                } else {
                    if (!value || (typeof value === 'string' && value.trim() === '')) {
                        newErrors[field.name] = `${field.label} is required`;
                    }
                }
            }
        });
    });

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email format is invalid (example: name@domain.com)';
    }

    if (formData.phone) {
        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            newErrors.phone = 'Phone number must be at least 10 digits';
        } else if (phoneDigits.length > 15) {
            newErrors.phone = 'Phone number is too long (max 15 digits)';
        }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
        let modeContext = '';
        let modeColor = '';
        if (isEditMode) {
            modeContext = updateAllFields ? 'Edit All Fields' : 'Edit Program Only';
            modeColor = updateAllFields ? '#3b82f6' : '#8b5cf6';
        } else if (clientExists) {
            modeContext = 'Add Program to Existing Client';
            modeColor = '#f59e0b';
        } else {
            modeContext = 'New Client';
            modeColor = '#10b981';
        }

        const errorsBySection = {};
        formSections.forEach(section => {
            const sectionErrors = [];
            section.fields.forEach(field => {
                if (newErrors[field.name]) {
                    sectionErrors.push({
                        field: field.label,
                        message: newErrors[field.name]
                    });
                }
            });
            if (sectionErrors.length > 0) {
                errorsBySection[section.title] = sectionErrors;
            }
        });

        const totalErrors = Object.keys(newErrors).length;

        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto border-l-4 border-red-500`}>
                <div className="p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                                Form Validation Error
                            </p>
                            <div className="mt-1 text-sm text-gray-500">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: modeColor + '20', color: modeColor }}>
                                        {modeContext}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {totalErrors} error(s) found
                                    </span>
                                </div>
                                
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {Object.entries(errorsBySection).map(([sectionTitle, sectionErrors]) => (
                                        <div key={sectionTitle} className="border-l-2 border-gray-200 pl-2">
                                            <p className="text-xs font-semibold text-gray-700 mb-1">
                                                {sectionTitle} ({sectionErrors.length})
                                            </p>
                                            {sectionErrors.map((err, idx) => (
                                                <div key={idx} className="flex items-start gap-2 mb-1">
                                                    <div className="flex-shrink-0 mt-1">
                                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-gray-600">
                                                            <span className="font-medium">{err.field}:</span> {err.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-3 flex gap-2">
                                <button
                                    onClick={() => {
                                        const firstErrorField = Object.keys(newErrors)[0];
                                        const element = document.getElementById(firstErrorField);
                                        if (element) {
                                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            element.focus();
                                        }
                                        toast.dismiss(t.id);
                                    }}
                                    className="flex-1 px-3 py-1.5 text-xs font-medium text-center text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none"
                                >
                                    Fix Errors
                                </button>
                                <button
                                    onClick={() => toast.dismiss(t.id)}
                                    className="px-3 py-1.5 text-xs font-medium text-center text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ), {
            duration: 8000,
            position: 'top-right',
        });

        return false;
    }

    return true;
};