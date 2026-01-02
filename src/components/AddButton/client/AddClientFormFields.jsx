import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Badge } from "../../ui/badge";
import { Search, Loader2 } from "lucide-react";

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

    const error = errors[field.name];
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

    if (field.name === 'full_name') {
        return renderFullNameField(field, value, error, isEditMode, updateAllFields, searchingClient, clientSearchResults, showSearchResults, handleInputChange, handleSelectClient, handleForceCreateNewClient);
    }

    return renderInputField(field, value, error, handleInputChange);
};

const renderProgramField = (field, formData, error, value, isEditMode, handleInputChange) => {
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
                    <Label htmlFor={field.name}>Existing Programs</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {formData.existing_programs.map((program, idx) => (
                            <Badge key={idx} variant="secondary" className="px-3 py-1">
                                {program}
                            </Badge>
                        ))}
                    </div>
                </>
            )}

            <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
                id={field.name}
                name={field.name}
                value={value}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                required={field.required}
                disabled={field.disabled}
                className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
};

const renderSelectField = (field, value, error, formData, provinces, regencies, districts, villages, loadingLocation, handleSelectChange, isEditMode) => {
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

    const isLocationField = ['province_id', 'regency_id', 'district_id', 'village_id'].includes(field.name)
    const isDisabledByEditMode = isEditMode && isLocationField
    const isDisabled = isDisabledByEditMode || field.disabled || loadingLocation[field.name.replace('_id', '')] ||
        (field.name === 'regency_id' && !formData.province_id) ||
        (field.name === 'district_id' && !formData.regency_id) ||
        (field.name === 'village_id' && !formData.district_id);

    return (
        <div className="space-y-2">
            <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
                value={value}
                onValueChange={(val) => handleSelectChange(field.name, val)}
                required={field.required}
                disabled={isDisabled}
            >
                <SelectTrigger className={error ? 'border-red-500' : ''}>
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
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
};

const renderTextareaField = (field, value, error, handleInputChange) => {
    return (
        <div className="space-y-2 md:col-span-2">
            <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
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
                className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'} ${field.disabled ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''} focus:outline-none focus:ring-2 focus:ring-amber-500`}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
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
    const isDisabled = isEditMode && !updateAllFields;
    
    return (
        <div className="space-y-2 relative">
            <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
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
                    className={`${error ? 'border-red-500' : ''} ${searchingClient ? 'pr-10' : ''} ${isDisabled ? 'bg-gray-100 text-gray-600' : ''}`}
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

            {error && <p className="text-red-500 text-sm">{error}</p>}
            
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
    return (
        <div className="space-y-2">
            <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
                id={field.name}
                name={field.name}
                type={field.type}
                value={value}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                required={field.required}
                disabled={field.disabled}
                className={`${error ? 'border-red-500' : ''} ${field.disabled ? 'bg-gray-100 text-gray-600' : ''}`}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
};