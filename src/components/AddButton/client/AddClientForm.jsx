import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Button } from "../../ui/button";
import { Loader2 } from "lucide-react";
import clientService from "../../../services/clientService";
import { formSections } from "./AddClientFormSection";
import { renderField } from "./AddClientFormFields";
import { useLocationData } from "./AddClientLocation";
import { validateForm } from "./AddClientValidation";
import useClientSearch from "../../../hooks/useClientSearch";

const AddClientForm = ({ isEditMode, editData, onAddClient, onEditClient, setIsAddUserModalOpen }) => {
    const [formData, setFormData] = useState(getInitialFormData(isEditMode, editData));
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [updateAllFields, setUpdateAllFields] = useState(false);
    const [forceCreateNewClient, setForceCreateNewClient] = useState(false)
    
    const { 
        clientExists, 
        existingClientId, 
        clientSearchResults, 
        showSearchResults, 
        searchingClient,
        checkExistingClient,
        handleSelectClient,
        setClientExists,
        setExistingClientId,
        setShowClientInfo,
        setClientSearchResults,
        setShowSearchResults,
    } = useClientSearch(isEditMode);
    
    const searchTimeoutRef = useRef(null);
    
    const {
        provinces,
        regencies,
        districts,
        villages,
        loadingLocation,
    } = useLocationData(formData, setFormData);

    useEffect(() => {
        if (isEditMode && editData) {
            const updatedFormData = getEditFormData(editData);
            setFormData(updatedFormData);
            setClientExists(true);
            setExistingClientId(editData.id);
            setShowClientInfo(true);
            setUpdateAllFields(false);
        }
    }, [isEditMode, editData]);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const handleNameChange = (e) => {
        const { name, value } = e.target;

        if (name === 'full_name') {
            setForceCreateNewClient(false)
        }

        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if ((!isEditMode || updateAllFields )&& name === 'full_name' && !forceCreateNewClient) {
            if (value.trim().length >= 3) {
                if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                }
                searchTimeoutRef.current = setTimeout(() => {
                    checkExistingClient(value, formData.email);
                }, 500);
            } else {
                resetClientSearch();
            }
        }
    };

    const handleForceCreateNewClient = () => {
        setForceCreateNewClient(true)
        setClientExists(false)
        setExistingClientId(null)
        setClientSearchResults([])
        setShowSearchResults(false)

        toast.success('Client baru akan dibuat dengan nama ini')
    }

    const resetClientSearch = () => {
        setClientSearchResults([]);
        setShowSearchResults(false);
        setClientExists(false);
        setShowClientInfo(false);
        setExistingClientId(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'full_name') {
            handleNameChange(e);
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSelectChange = (name, value) => {
        const fieldConfig = formSections
            .flatMap(section => section.fields)
            .find(field => field.name === name);
            
        if (fieldConfig?.disabled) {
            return;
        }

        if (name === 'province_id') {
            const selectedProvince = provinces.find(p => p.value === value)
            setFormData(prev => ({
                ...prev,
                [name]: value,
                province_name: selectedProvince?.label || '',
                regency_id: '', 
                district_id: '',
                village_id: '',
                regency_name: '',
                district_name: '',
                village_name: ''
            }))
        } else if (name === 'regency_id') {
            const selectedRegency = regencies.find(r => r.value === value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                regency_name: selectedRegency?.label || '',
                district_id: '', 
                village_id: '',
                district_name: '',
                village_name: ''
            }));
        } else if (name === 'district_id') {
            const selectedDistrict = districts.find(d => d.value === value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                district_name: selectedDistrict?.label || '',
                village_id: '',
                village_name: ''
            }));
        } else if (name === 'village_id') {
            const selectedVillage = villages.find(v => v.value === value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                village_name: selectedVillage?.label || ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    };

    const handleSelectClientAndFillForm = (client) => {
        handleSelectClient(client);

        setFormData(prev => ({
            ...prev,
            full_name: client.full_name || '',
            email: client.email || '',
            phone: client.phone || '',
            company: client.company || '',
            gender: client.gender || '',
            business: client.business || '',
            total_employee: client.total_employee || '',
            position: client.position || '',
            address: client.address || '',

            province_id: client.province_id || '',
            province_name: client.province_name || '',
            regency_id: client.regency_id || '',
            regency_name: client.regency_name || '',
            district_id: client.district_id || '',
            district_name: client.district_name || '',
            village_id: client.village_id || '',
            village_name: client.village_name || '',

            existing_programs: Array.isArray(client.program_name)
                ? client.program_name
                : client.program_name
                    ? [client.program_name]
                    : [],
            program_name: ''
        }));

        setErrors({});
        setUpdateAllFields(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault()

        const isValid = validateForm(
            formData, formSections, clientExists && !forceCreateNewClient, setErrors, isEditMode, updateAllFields
        )

        if (!isValid) {
            toast.error('Please fix the errors in the form')
            return;
        }

        setLoading(true)

        try {
            let clientData = { ...formData }

            const locationData = {
                address: formData.address,
                province_id: formData.province_id,
                province_name: formData.province_name,
                regency_id: formData.regency_id,
                regency_name: formData.regency_name,
                district_id: formData.district_id,
                district_name: formData.district_name,
                village_id: formData.village_id,
                village_name: formData.village_name,
            };

            let programData = []
            if (clientExists && existingClientId) {
                const existingPrograms = formData.existing_programs || []
                const newProgram = formData.program_name?.trim()

                if (newProgram) {
                    programData = [...existingPrograms, newProgram]
                } else {
                    programData = existingPrograms
                }

                if (isEditMode && !updateAllFields) {
                    clientData = {
                        full_name: formData.full_name, 
                        email: formData.email || '',    
                        phone: formData.phone || '',    
                        company: formData.company || '', 
                        program_name: programData,
                        updated_at: new Date().toISOString(),
                        ...locationData
                    }
                } else {
                    clientData.program_name = programData
                    clientData.updated_at = new Date().toISOString()
                    
                    if (!isEditMode) {
                        clientData = {
                            ...clientData,
                            full_name: formData.full_name,
                            email: formData.email,
                            phone: formData.phone,
                            company: formData.company,
                            gender: formData.gender,
                            business: formData.business,
                            total_employee: formData.total_employee,
                            position: formData.position,
                            ...locationData,
                            notes: formData.notes || null,
                            status: formData.status
                        }
                    }
                }
            } else {
                programData = formData.program_name ? [formData.program_name.trim()] : []
                clientData.program_name = programData
            }

            delete clientData.existing_programs
            clientData.join_date = clientData.join_date || new Date().toISOString().split('T')[0]

            if (clientExists && existingClientId && !forceCreateNewClient) {
                if (onEditClient) {
                    await onEditClient(existingClientId, clientData)
                } else {
                    await clientService.updateClient(existingClientId, clientData)
                    toast.success(
                        isEditMode 
                            ? (updateAllFields ? 'Client updated successfully' : 'Program added successfully')
                            : 'Client updated with new program and changes'
                    )
                }
            } else {
                if (onAddClient) {
                    await onAddClient(clientData)
                } else {
                    await clientService.addClient(clientData)
                    toast.success('Client added successfully')
                }
            }

            handleCloseModal()
        } catch (error) {
            console.error(`Error ${clientExists ? 'updating' : 'adding'} client:`, error)
            toast.error(error.message || `Failed to ${clientExists ? 'update' : 'add'} client`)
        } finally {
            setLoading(false)
        }
    };

    const handleCloseModal = () => {
        setIsAddUserModalOpen(false);
        resetForm();
        
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = null;
        }
    };

    const resetForm = () => {
        setFormData(getInitialFormData(false, null));
        resetClientSearch();
        setUpdateAllFields(false);
        setErrors({});
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {formSections.map((section, sectionIndex) => (
                <div key={section.title} className="space-y-4">
                    <div className="border-b pb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {section.title}
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {section.fields.map((field, index) => (
                            <div 
                                key={field.name} 
                                className={field.fullWidth ? 'col-span-2' : 'col-span-1'}
                            >
                                {renderField({
                                    field,
                                    index,
                                    formData,
                                    errors,
                                    isEditMode,
                                    updateAllFields,
                                    clientExists,
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
                                    handleForceCreateNewClient,
                                    handleSelectClient: handleSelectClientAndFillForm
                                })}
                            </div>
                        ))}

                    </div>

                    {sectionIndex < formSections.length - 1 && (
                        <div className="pt-2" />
                    )}
                </div>
            ))}

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {loading 
                        ? (clientExists ? 'Updating...' : 'Saving...')
                        : (clientExists 
                            ? (isEditMode 
                                ? (updateAllFields ? 'Update All' : 'Update Program Only')
                                : 'Update Client')
                            : (isEditMode ? 'Update Client' : 'Add Client')
                          )
                    }
                </Button>
            </div>
        </form>
    );
};

function getInitialFormData(isEditMode, editData) {
    return {
        full_name: '',
        email: '',
        phone: '',
        company: '',
        program_name: '',
        existing_programs: [],
        join_date: '',
        gender: '',
        position: '',
        business: '',
        total_employee: '',
        address: '',
        province_id: '',  
        province_name: '',   
        regency_id: '',    
        regency_name: '',
        district_id: '',   
        district_name: '', 
        village_id: '',  
        village_name: '', 
        notes: '',
        status: 'Active',
        ...(isEditMode && editData ? getEditFormData(editData) : {})
    };
}

function getEditFormData(editData) {
    const locationData = {
        address: editData.address || '',
        province_id: editData.province_id || '',
        province_name: editData.province_name || '',
        regency_id: editData.regency_id || '',
        regency_name: editData.regency_name || '',
        district_id: editData.district_id || '',
        district_name: editData.district_name || '',
        village_id: editData.village_id || '',
        village_name: editData.village_name || ''
    };
    
    return {
        full_name: editData.full_name || '',
        email: editData.email || '',
        phone: editData.phone || '',
        company: editData.company || '',
        program_name: '',
        existing_programs: Array.isArray(editData.program_name)
            ? editData.program_name
            : (editData.program_name ? [editData.program_name] : []),
        join_date: editData.join_date || '',
        gender: editData.gender || '',
        position: editData.position || '',
        business: editData.business || '',
        total_employee: editData.total_employee || '',
        ...locationData,
        notes: editData.notes || '',
        status: editData.status || 'Active'
    };
}

export default AddClientForm;