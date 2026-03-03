import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Badge } from "../../ui/badge";
import { Search, Loader2, X } from "lucide-react";

export const renderField = (props) => {
    const {
        field,
        formData,
        errors,
        isEditMode,
        updateAllFields,
        clientSearchResults,
        showSearchResults,
        searchingClient,
        provinces,
        regencies,
        districts,
        villages,
        loadingLocation,
        handleInputChange,
        handleSelectChange,
        handleSelectClient,
        handleForceCreateNewClient
    } = props;

    const error = errors?.[field.name];
    const value = formData[field.name] || '';

    if (field.name === 'program_name') {
        return renderProgramField(field, formData, error, value, isEditMode, handleInputChange);
    }

    if (field.type === 'select') {
        return renderSelectField(field, value, error, formData, provinces, regencies, districts, villages, loadingLocation, handleSelectChange, isEditMode);
    }

    if (field.type === 'textarea') {
        return renderTextareaField(field, value, error, handleInputChange);
    }

    if (field.type === 'file') {
        return renderFileField(field, formData, error, handleInputChange, isEditMode);
    }

    if (field.name === 'full_name') {
        return renderFullNameField(field, value, error, isEditMode, updateAllFields, searchingClient, clientSearchResults, showSearchResults, handleInputChange, handleSelectClient, handleForceCreateNewClient);
    }

    return renderInputField(field, value, error, handleInputChange);
};

const renderProgramField = (field, formData, error, value, isEditMode, handleInputChange) => {
    const hasError = !!error;
    
    if (isEditMode) {
        return (
            <div className="space-y-2">
                <Label htmlFor={field.name}>Programs</Label>
                <p className="text-xs text-gray-500 mt-1">
                    To add new programs, please use the "Add Client" feature
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {formData.existing_programs && formData.existing_programs.length > 0 && (
                <>
                    <Label>Existing Programs</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {formData.existing_programs.map((program, idx) => (
                            <Badge key={idx} variant="secondary" className="px-3 py-1">
                                {program}
                            </Badge>
                        ))}
                    </div>
                </>
            )}

            <Label htmlFor={field.name} className="flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
                id={field.name}
                name={field.name}
                value={value}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                // required={field.required}
                disabled={field.disabled}
                className={hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                style={hasError ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : {}}
            />
            {hasError && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    {error}
                </p>
            )}
        </div>
    );
};

const renderSelectField = (field, value, error, formData, provinces, regencies, districts, villages, loadingLocation, handleSelectChange) => {
    let options = field.options || [];
    
    if (field.name === 'province_id') {
        options = provinces.map(p => ({ value: p.value, label: p.label }));
    } else if (field.name === 'regency_id') {
        options = regencies.map(r => ({ value: r.value, label: r.label }));
    } else if (field.name === 'district_id') {
        options = districts.map(d => ({ value: d.value, label: d.label }));
    } else if (field.name === 'village_id') {
        options = villages.map(v => ({ value: v.value, label: v.label }));
    }

    const isDisabled = field.disabled || loadingLocation[field.name.replace('_id', '')] ||
        (field.name === 'regency_id' && !formData.province_id) ||
        (field.name === 'district_id' && !formData.regency_id) ||
        (field.name === 'village_id' && !formData.district_id);

    const hasError = !!error;

    return (
        <div className="space-y-2">
            <Label htmlFor={field.name} className="flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
                value={value}
                onValueChange={(val) => handleSelectChange(field.name, val)}
                required={field.required}
                disabled={isDisabled}
            >
                <SelectTrigger 
                    className={hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    style={hasError ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : {}}
                >
                    <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.length > 0 ? (
                        options
                            .filter(option => option.value && option.value.toString().trim() !== '')
                            .map((option) => (
                                <SelectItem 
                                    key={option.value} 
                                    value={option.value.toString()}
                                >
                                    {option.label}
                                </SelectItem>
                            ))
                    ) : (
                        <SelectItem value="no-options" disabled>
                            {field.placeholder || 'No options available'}
                        </SelectItem>
                    )}
                </SelectContent>
            </Select>
            {hasError && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    {error}
                </p>
            )}
        </div>
    );
};

const renderTextareaField = (field, value, error, handleInputChange) => {
    const hasError = !!error;
    
    return (
        <div className="space-y-2 md:col-span-2">
            <Label htmlFor={field.name} className="flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
            </Label>
            <textarea
                id={field.name}
                name={field.name}
                value={value}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                required={field.required}
                disabled={field.disabled}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md 
                    ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'} 
                    ${field.disabled ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''} 
                    focus:outline-none focus:ring-2 transition-colors duration-200
                `}
                style={hasError ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : {}}
            />
            {hasError && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    {error}
                </p>
            )}
        </div>
    );
};

const renderFullNameField = (
    field, 
    value, 
    error, 
    isEditMode,
    updateAllFields, 
    searchingClient, 
    clientSearchResults, 
    showSearchResults, 
    handleInputChange, 
    handleSelectClient, 
    handleForceCreateNewClient 
) => {
    const isDisabled = false;
    const hasError = !!error;
    
    return (
        <div className="space-y-2 relative">
            <Label htmlFor={field.name} className="flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="relative">
                <Input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    value={value}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    disabled={isDisabled}
                    className={`
                        ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} 
                        ${searchingClient ? 'pr-10' : ''} 
                        ${isDisabled ? 'bg-gray-100 text-gray-600' : ''}
                        transition-colors duration-200
                    `}
                    style={hasError ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : {}}
                />

                {!isEditMode && searchingClient && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                )}

                {!isEditMode && !searchingClient && value.length >= 3 && !isDisabled && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                )}
            </div>

            {hasError && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    {error}
                </p>
            )}
            
            {!isEditMode && value.length > 0 && value.length < 3 && (
                <p className="text-xs text-gray-500">
                    Type at least 3 characters to search for existing client
                </p>
            )}

            {!isEditMode && showSearchResults && clientSearchResults.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto search-results-container">
                    {clientSearchResults.map((client) => (
                        <div
                            key={client.id}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition-colors duration-150"
                            onClick={() => handleSelectClient(client)}
                        >
                            <div className="font-medium text-gray-900">{client.full_name}</div>
                            <div className="text-sm text-gray-500 mt-1">{client.email}</div>
                        </div>
                    ))}

                    <div className="px-3 py-2 border-t bg-gray-50">
                        <button
                            type="button"
                            onClick={handleForceCreateNewClient}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            + Tetap buat client baru dengan nama ini
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const renderInputField = (field, value, error, handleInputChange) => {
    const isDisabled = field.disabled;
    const hasError = !!error;
    
    return (
        <div className="space-y-2">
            <Label htmlFor={field.name} className="flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
                id={field.name}
                name={field.name}
                type={field.type}
                value={value}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                required={field.required}
                disabled={isDisabled}
                className={`
                    ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} 
                    ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}
                    transition-colors duration-200
                `}
                style={hasError ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : {}}
            />
            {hasError && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    {error}
                </p>
            )}
        </div>
    );
};

const renderFileField = (field, formData, error, handleInputChange, isEditMode) => {
    const fileValue = formData[field.name]
    const hasError = !!error;

    const handleRemoveFile = () => {
        handleInputChange({
            target: {
                name: field,
                value: null
            }
        })
    }

    return (
        <div className="space-y-2">
            <Label htmlFor={field.name} className="flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            <Input
                id={field.name}
                name={field.name}
                type="file"
                accept={field.accept || "image/*"}
                onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                        handleInputChange({
                            target: {
                                name: field.name,
                                value: file
                            }
                        });
                    }
                }}
                disabled={field.disabled}
                className={hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                style={hasError ? { borderColor: '#ef4444' } : {}}
            />

            {fileValue instanceof File && (
                <div className="mt-2 p-3 border rounded-md bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-700">
                                Selected: {fileValue.name}
                            </div>
                            <Badge variant="outline" className="text-xs">
                                {(fileValue.size / 1024).toFixed(1)} KB
                            </Badge>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                            title="Remove file"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {fileValue.type.startsWith('image/') && (
                        <div className="mt-2">
                            <img
                                src={URL.createObjectURL(fileValue)}
                                alt="Preview"
                                className="h-20 w-20 object-contain border rounded-md bg-white"
                                onLoad={(e) => {
                                    URL.revokeObjectURL(e.target.src);
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            {fileValue && typeof fileValue === 'string' && (
                <div className="mt-2 p-3 border rounded-md bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-700">
                            Current Logo
                        </div>

                        {!isEditMode && (
                            <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                                title="Remove logo"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="mt-2">
                        <img
                            src={fileValue}
                            alt="Logo preview"
                            className="h-20 w-20 object-contain border rounded-md bg-white"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder-image.png';
                            }}
                        />
                    </div>
                </div>
            )}

            <p className="text-xs text-gray-500">
                Supported formats: JPEG, PNG, GIF, WEBP, SVG. Max size: 2MB
            </p>
            
            {hasError && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    {error}
                </p>
            )}
        </div>
    )
}