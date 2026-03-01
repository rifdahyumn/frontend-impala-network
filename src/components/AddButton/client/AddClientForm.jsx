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

const AddClientForm = ({ isEditMode, editData, setIsAddUserModalOpen, onSuccess, onAddClient, onEditClient }) => {
    const [formData, setFormData] = useState(getInitialFormData(isEditMode, editData));
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [updateAllFields, setUpdateAllFields] = useState(true);
    const [forceCreateNewClient, setForceCreateNewClient] = useState(false)
    const [uploading, setUploading] = useState(false)
    
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
            brand_name: client.brand_name || '',
            logo_partner: client.logo_partner || null,
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

        const isUpdateAll = isEditMode ? true : updateAllFields;

        const isValid = validateForm(
            formData, formSections, clientExists && !forceCreateNewClient, setErrors, isEditMode, isUpdateAll
        )

        if (!isValid) {
            toast.error('Please fix the errors in the form')
            return;
        }

        setLoading(true)

        try {
            let dataToSend = { ...formData }

            if (formData.logo_partner instanceof File) {
                setLoading(true)
                toast.loading('Uploading logo...', { id: 'logo-upload' });

                try {
                    const logoUrl = await clientService.uploadLogo(formData.logo_partner)
                    dataToSend.logo_partner = logoUrl

                    if (isEditMode && editData?.logo_partner) {
                        await clientService.deleteLogo(editData.logo_partner).catch(err => {
                            console.warn('Failed to delete old logo:', err)
                        })
                    }

                    toast.success('Logo uploaded successfully', { id: 'logo-upload' });

                } catch (error) {
                    toast.error(`Failed to upload logo: ${error.message}`)
                    setLoading(false)
                    setUploading(false)
                    return
                } finally {
                    setUploading(false)
                }
            } else if (formData.logo_partner === null && isEditMode && editData?.logo_partner) {
                dataToSend.logo_partner = null

                await clientService.deleteLogo(editData.logo_partner).catch(err => {
                    console.warn('Failed to delete logo:', err)
                })
            }

            delete dataToSend.existing_programs
            const locationData = {};
            
            if (isEditMode) {
                const shouldUpdateLocation = 
                    formData.address !== editData?.address ||
                    formData.province_id !== editData?.province_id ||
                    formData.regency_id !== editData?.regency_id ||
                    formData.district_id !== editData?.district_id ||
                    formData.village_id !== editData?.village_id;

                if (shouldUpdateLocation) {
                    locationData.address = formData.address || '';
                    locationData.province_id = formData.province_id || '';
                    locationData.province_name = formData.province_name || '';
                    locationData.regency_id = formData.regency_id || '';
                    locationData.regency_name = formData.regency_name || '';
                    locationData.district_id = formData.district_id || '';
                    locationData.district_name = formData.district_name || '';
                    locationData.village_id = formData.village_id || '';
                    locationData.village_name = formData.village_name || '';
                }
            } else {
                locationData.address = formData.address;
                locationData.province_id = formData.province_id;
                locationData.province_name = formData.province_name;
                locationData.regency_id = formData.regency_id;
                locationData.regency_name = formData.regency_name;
                locationData.district_id = formData.district_id;
                locationData.district_name = formData.district_name;
                locationData.village_id = formData.village_id;
                locationData.village_name = formData.village_name;
            }

            let programData = []
            if (clientExists && existingClientId) {
                const existingPrograms = formData.existing_programs || []
                const newProgram = formData.program_name?.trim()

                if (newProgram) {
                    programData = [...existingPrograms, newProgram]
                } else {
                    programData = existingPrograms
                }
            } else {
                programData = formData.program_name ? [formData.program_name.trim()] : []
            }
            
            const baseClientData = {
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone || null,
                company: formData.company || null,
                brand_name: formData.brand_name || null,  
                gender: formData.gender || null,
                business: formData.business || null,
                total_employee: formData.total_employee || null,
                position: formData.position || null,
                program_name: programData,
                notes: formData.notes || null,
                logo_partner: dataToSend.logo_partner || null,  
                ...locationData
            };

            let result;
            
            if (clientExists && existingClientId && !forceCreateNewClient) {
                const updateData = {
                    ...baseClientData,
                    updated_at: new Date().toISOString()
                };

                if (onEditClient) {
                    result = await onEditClient(existingClientId, updateData)
                } else {
                    result = await clientService.updateClient(existingClientId, updateData)
                }
                
                toast.success('Client updated successfully');

            } else {
                const createData = {
                    ...baseClientData,
                    status: formData.status || 'Active',
                    join_date: formData.join_date || new Date().toISOString().split('T')[0],
                    created_at: new Date().toISOString()
                };
                
                if (onAddClient) {
                    result = await onAddClient(createData)
                } else {
                    result = await clientService.addClient(createData)
                }

                toast.success('Client added successfully');
            }

            if (onSuccess) {
                onSuccess(result, isEditMode ? 'updated' : 'created');
            }

            handleCloseModal();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.message || 'Failed to save client');
        } finally {
            setLoading(false);
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
                <Button type="submit" disabled={loading || uploading}>
                    {(loading || uploading) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {loading 
                        ? (clientExists ? 'Updating...' : 'Saving...')
                        : uploading 
                            ? 'Uploading logo...' 
                            : (clientExists 
                                ? (isEditMode ? (updateAllFields ? 'Update Client' : 'Update Program Only') : 'Update Client')
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
        brand_name: '',
        logo_partner: '',
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
        brand_name: editData.brand_name || '',
        logo_partner: editData.logo_partner || null,
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