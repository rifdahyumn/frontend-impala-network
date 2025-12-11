/* eslint-disable no-undef */
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Loader2, Search, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import clientService from "../../services/clientService";
import { Badge } from "../ui/badge";
import { locationService } from "../../services/locationService";

const AddClient = ({ isAddUserModalOpen, setIsAddUserModalOpen, onAddClient, editData = null, onEditClient = null }) => {
    const isEditMode = !!editData
    const [formData, setFormData] = useState({
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
        status: 'Active'
    });

    const [loading, setLoading] = useState(false)
    const [clientExists, setClientExists] = useState(false)
    const [existingClientId, setExistingClientId] = useState(null)
    const [errors, setErrors] = useState({})
    const [showClientInfo, setShowClientInfo] = useState(false)
    const [updateAllFields, setUpdateAllFields] = useState(false)
    const searchTimeoutRef = useRef(null)
    const [searchingClient, setSearchingClient] = useState(false)
    const [clientSearchResults, setClientSearchResults] = useState([])
    const [showSearchResults, setShowSearchResults] = useState(false)
    const [provinces, setProvinces] = useState([])
    const [regencies, setRegencies] = useState([])
    const [districts, setDistricts] = useState([])
    const [villages, setVillages] = useState([])
    const [loadingLocation, setLoadingLocation] = useState({
        provinces: false,
        regencies: false,
        districts: false,
        villages: false
    })

    const formSections = [
        {
            title: "Personal Information",
            fields: [
                {
                    name: 'full_name',
                    label: 'Full Name',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter full name'
                },
                {
                    name: 'email',
                    label: 'Email',
                    type: 'email',
                    required: true,
                    placeholder: 'Enter email address'
                },
                {
                    name: 'phone',
                    label: 'Phone',
                    type: 'tel',
                    required: true,
                    placeholder: 'Enter phone number'
                },
                {
                    name: 'gender',
                    label: 'Gender',
                    type: 'select',
                    required: true,
                    placeholder: 'Select gender',
                    options: [
                        { value: 'Male', label: 'Male' },
                        { value: 'Female', label: 'Female' }
                    ]
                },
            ]
        },
        {
            title: "Company Detail",
            fields: [
                {
                    name: 'company',
                    label: 'Company',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter company name',
                    disabled: isEditMode
                },
                {
                    name: 'business',
                    label: 'Business Type',
                    type: 'select',
                    required: true,
                    placeholder: 'Select business type',
                    options: [
                        { value: 'Retail', label: 'Retail' },
                        { value: 'Technology', label: 'Technology' },
                        { value: 'Healthcare', label: 'Healthcare' },
                        { value: 'Finance', label: 'Finance' },
                        { value: 'Education', label: 'Education' },
                        { value: 'Manufacturing', label: 'Manufacturing' },
                        { value: 'Food & Beverage', label: 'Food & Beverage' },
                        { value: 'Logistics / Transportation', label: 'Logistics / Transportation' },
                        { value: 'Agriculture', label: 'Agriculture' },
                        { value: 'Construction', label: 'Construction' },
                        { value: 'Media & Entertainment', label: 'Media & Entertainment' },
                        { value: 'Consulting', label: 'Consulting' },
                        { value: 'Non-Profit / NGO', label: 'Non-Profit / NGO' },
                        { value: 'Telecomunications', label: 'Telecomunications' },
                        { value: 'Automotive', label: 'Automotive' },
                        { value: 'E-Commerce', label: 'E-Commerce' },
                        { value: 'Professional Service', label: 'Professional Service' },
                        { value: 'Public Sector / Government', label: 'Public Sector / Government' },
                        { value: 'Real Estate', label: 'Real Estate' },
                        { value: 'Hospitality', label: 'Hospitality' },
                        { value: 'Energy & Utilities', label: 'Energy & Utilities' },
                    ]
                },
                {
                    name: 'total_employee',
                    label: 'Total Employee',
                    type: 'select',
                    required: true,
                    placeholder: 'Select total employee',
                    options: [
                        { value: '1-50 employees', label: '1-50 employees' },
                        { value: '50-100 employees', label: '50-100 employees' },
                        { value: '100-500 employees', label: '100-500 employees' },
                        { value: '500-1000 employees', label: '500-1000 employees' },
                        { value: '1000+ employees', label: '1000+ employees' }
                    ]
                },
                {
                    name: 'position',
                    label: 'Job Position',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter position'
                },
            ]
        },
        {
            title: "Program",
            fields: [
                {
                    name: 'program_name',
                    label: 'Program Name',
                    type: 'text',
                    required: !clientExists,
                    placeholder: clientExists ? 'Add new program for existing client' : 'Enter Program Name'
                },
            ]
        },
        {
            title: "Location",
            fields: [
                {
                    name: 'address',
                    label: 'Address',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter address'
                },
                {
                    name: 'province_id',
                    label: 'Province',
                    type: 'select',
                    required: true,
                    placeholder: loadingLocation.provinces ? 'Loading Province...' : 'Select Province',
                    options: provinces.map(p => ({ value: p.value, label: p.label })),
                    disabled: loadingLocation.provinces
                },
                {
                    name: 'regency_id',
                    label: 'City / Regency',
                    type: 'select',
                    required: true,
                    options: regencies.map(r => ({ value: r.value, label: r.label })),
                    placeholder: loadingLocation.regencies ? 'Loading regency...' : 'Select Regency',
                    disabled: loadingLocation.regencies || !formData.province_id
                },
                {
                    name: 'district_id',
                    label: 'District',
                    type: 'select',
                    required: true,
                    options: districts.map(d => ({ value: d.value, label: d.label })),
                    placeholder: loadingLocation.districts ? 'Loading district...' : 'Select District',
                    disabled: loadingLocation.districts || !formData.regency_id
                },
                {
                    name: 'village_id',
                    label: 'Village',
                    type: 'select',
                    required: true,
                    options: villages.map(v => ({ value: v.value, label: v.label })),
                    placeholder: loadingLocation.villages ? 'Loading village...' : 'Select Village',
                    disabled: loadingLocation.villages || !formData.district_id
                },
            ]
        },
        {
            title: "Additional Information",
            fields: [
                {
                    name: 'notes',
                    label: 'Notes',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Enter notes'
                },
            ]
        }
    ];

    const checkExistingClient = async (name, email) => {
        if (isEditMode) return;
        
        if (!name || name.trim().length < 3) {
            return
        }

        setSearchingClient(true)
        try {
            const response = await clientService.searchClient(name.trim(), email?.trim())

            if (response && response.data && response.data.length > 0) {
                setClientSearchResults(response.data)
                setShowSearchResults(true)
            } else {
                setClientSearchResults([])
                setShowSearchResults(false)
            }
        } catch (error) {
            console.error('Error checking existing client:', error)
            setClientSearchResults([])
            setShowSearchResults(false)
        } finally {
            setSearchingClient(false)
        }
    }

    const autoFillClientData = (client) => {
        if (isEditMode) return; 
        
        setClientExists(true)
        setExistingClientId(client.id)
        setShowClientInfo(true)
        setShowSearchResults(false)
        setClientSearchResults([])

        const locationData = client.location_data || {};
        
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
            address: client.address || locationData.address || '',
            province_id: locationData.province_id || '',
            province_name: locationData.province_name || '',
            regency_id: locationData.regency_id || '',
            regency_name: locationData.regency_name || '',
            district_id: locationData.district_id || '',
            district_name: locationData.district_name || '',
            village_id: locationData.village_id || '',
            village_name: locationData.village_name || '',
            status: client.status || 'Active',
            existing_programs: Array.isArray(client.program_name)
                ? client.program_name
                : (client.program_name ? [client.program_name] : [])
        }))

        toast.success(`Existing client found: ${client.full_name}. All fields auto-filled.`)
    }

    const handleNameChange = (e) => {
        const { name, value } = e.target

        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
            searchTimeoutRef.current = null
        }

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }

        if (!isEditMode && name === 'full_name') {
            if (value.trim().length >= 3) {
                searchTimeoutRef.current = setTimeout(() => {
                    checkExistingClient(value, formData.email)
                }, 500)
            } else {
                setClientSearchResults([])
                setShowSearchResults(false)
                setClientExists(false)
                setShowClientInfo(false)
                setExistingClientId(null)
            }
        }
    }

    const handleSelectClient = (client) => {
        if (isEditMode) return; 
        autoFillClientData(client)
    }

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showSearchResults && !e.target.closest('.search-results-container') && !e.target.closest('input[name="full_name"]')) {
                setShowSearchResults(false)
            }
        }

        document.addEventListener('click', handleClickOutside)
        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [showSearchResults])

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [])

    useEffect(() => {
        const loadProvinces = async () => {
            if (!isAddUserModalOpen) return;
            
            setLoadingLocation(prev => ({ ...prev, provinces: true }))

            try {
                const provincesData = await locationService.getProvinces()
                setProvinces(provincesData || [])
            } catch (error) {
                console.error('Error fetching provinces:', error)
                toast.error('Gagal memuat data provinsi')
            } finally {
                setLoadingLocation(prev => ({ ...prev, provinces: false }))
            }
        }
        
        if (isAddUserModalOpen) {
            loadProvinces()
        }
    }, [isAddUserModalOpen])

    useEffect(() => {
        const loadRegencies = async () => {
            if (!formData.province_id) {
                setRegencies([])
                return
            }

            setLoadingLocation(prev => ({ ...prev, regencies: true }))

            try {
                const regenciesData = await locationService.getRegencies(formData.province_id)
                setRegencies(regenciesData || [])
                
                setFormData(prev => ({
                    ...prev,
                    regency_id: '',
                    district_id: '',
                    village_id: '',
                    regency_name: '',
                    district_name: '',
                    village_name: ''
                }))
                setDistricts([])
                setVillages([])
            } catch (error) {
                console.error(`Error fetching regencies for ${formData.province_id}:`, error)
                toast.error('Error loading regency')
                setRegencies([])
            } finally {
                setLoadingLocation(prev => ({ ...prev, regencies: false }))
            }
        }

        loadRegencies()
    }, [formData.province_id])

    useEffect(() => {
        const loadDistricts = async () => {
            if (!formData.regency_id) {
                setDistricts([])
                return
            }

            setLoadingLocation(prev => ({ ...prev, districts: true }))

            try {
                const districtsData = await locationService.getDistricts(formData.regency_id)
                setDistricts(districtsData || [])
                
                setFormData(prev => ({
                    ...prev,
                    district_id: '',
                    village_id: '',
                    district_name: '',
                    village_name: ''
                }))
                setVillages([])
            } catch (error) {
                console.error(`Error fetching districts for ${formData.regency_id}:`, error)
                toast.error('Gagal memuat data kecamatan')
                setDistricts([])
            } finally {
                setLoadingLocation(prev => ({ ...prev, districts: false }))
            }
        }

        loadDistricts()
    }, [formData.regency_id])

    useEffect(() => {
        const loadVillages = async () => {
            if (!formData.district_id) {
                setVillages([])
                return
            }

            setLoadingLocation(prev => ({ ...prev, villages: true }))

            try {
                const villagesData = await locationService.getVillages(formData.district_id)
                setVillages(villagesData || [])
                
                setFormData(prev => ({
                    ...prev,
                    village_id: '',
                    village_name: ''
                }))
            } catch (error) {
                console.error(`Error fetching villages for ${formData.district_id}:`, error)
                toast.error('Gagal memuat data desa/kelurahan')
                setVillages([])
            } finally {
                setLoadingLocation(prev => ({ ...prev, villages: false }))
            }
        }

        loadVillages()
    }, [formData.district_id])

    useEffect(() => {
        if (isEditMode && editData) {
            
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
            }
            
            setFormData({
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
            })
            setClientExists(true)
            setExistingClientId(editData.id)
            setShowClientInfo(true)
            setUpdateAllFields(true)
        } else if (isAddUserModalOpen && !isEditMode) {
            // Reset form untuk mode tambah baru
            resetForm()
        }
        setErrors({})
    }, [isEditMode, editData, isAddUserModalOpen])

    const resetForm = () => {
        setFormData({
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
        })
        setClientExists(false)
        setExistingClientId(null)
        setShowClientInfo(false)
        setUpdateAllFields(false)
        setClientSearchResults([])
        setShowSearchResults(false)
        setProvinces([])
        setRegencies([])
        setDistricts([])
        setVillages([])
        setErrors({})
    }

    const validateForm = () => {
        const newErrors = {}

        formSections.forEach(section => {
            section.fields.forEach(field => {
                if (!field.required || field.disabled) {
                    return
                }

                const value = formData[field.name]
                if (!value || value.toString().trim() === '') {
                    newErrors[field.name] = `${field.label} is required`
                }
            })
        })

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (formData.phone && formData.phone.replace(/\D/g, '').length < 10) {
            newErrors.phone = 'Phone number is too short'
        }

        if (!formData.province_id) {
            newErrors.province_id = 'Province is required'
        }
        if (!formData.regency_id) {
            newErrors.regency_id = 'City/Regency is required'
        }
        if (!formData.district_id) {
            newErrors.district_id = 'District is required'
        }
        if (!formData.village_id) {
            newErrors.village_id = 'Village is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        const fieldConfig = formSections
            .flatMap(section => section.fields)
            .find(field => field.name === name);
            
        if (fieldConfig?.disabled) {
            return;
        }

        if (name === 'full_name') {
            handleNameChange(e)
            return
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if(errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
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

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
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

            if (clientExists && existingClientId) {
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
        resetForm()
        
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
            searchTimeoutRef.current = null
        }
    };

    const renderField = (field, index) => {
        const error = errors[field.name]
        const value = formData[field.name] || '';

        if (field.name === 'program_name') {
            if (isEditMode) {
                return (
                    <div key={field.name || index} className="space-y-2">
                        <Label htmlFor={field.name}>
                            Programs
                        </Label>
                        
                        <p className="text-xs text-gray-500 mt-1">
                            To add new programs, please use the "Add Client" feature
                        </p>
                    </div>
                );
            } else {
                return (
                    <div key={field.name || index} className="space-y-2">
                        {formData.existing_programs && formData.existing_programs.length > 0 && (
                            <>
                                <Label htmlFor={field.name}>
                                    Existing Programs
                                </Label>
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
                            {clientExists ? 'Add New Program' : 'Program Name'}
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
            }
        }

        if (field.type === 'select') {
        const options = field.options || [];
        const isDisabled = field.disabled || (field.name.includes('_id') && 
            ((field.name === 'regency_id' && !formData.province_id) ||
             (field.name === 'district_id' && !formData.regency_id) ||
             (field.name === 'village_id' && !formData.district_id)));
        
        return (
            <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Select
                    value={value}
                    onValueChange={(value) => handleSelectChange(field.name, value)}
                    required={field.required}
                    disabled={isDisabled}
                >
                    <SelectTrigger className={error ? 'border-red-500' : ''} >
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
    }

        if (field.type === 'textarea') {
            return (
                <div key={field.name} className="space-y-2 md:col-span-2">
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
        }

        if (field.name === 'full_name') {
            const isDisabled = isEditMode && !updateAllFields;
            
            return (
                <div key={field.name} className="space-y-2 relative">
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
                    
                    {!isEditMode && value.length > 0 && value.length < 3 && !clientExists && (
                        <p className="text-xs text-gray-500">
                            Type at least 3 characters to search for existing client
                        </p>
                    )}

                    {!isEditMode && showSearchResults && clientSearchResults.length > 0 && (
                        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto search-results-container">
                            {clientSearchResults.map((client) => (
                                <div
                                    key={client.id}
                                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                                    onClick={() => handleSelectClient(client)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="font-medium text-gray-900">{client.full_name}</div>
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">{client.email}</div>
                                    <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-2">
                                        <span>{client.company}</span>
                                        {client.total_employee && <span>• {client.total_employee}</span>}
                                        {client.program_name && Array.isArray(client.program_name) && (
                                            <span>• {client.program_name.length} program(s)</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )
        }

        return (
            <div key={field.name} className="space-y-2">
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

    return (
        <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
            <DialogContent className="max-h-[90vh] max-w-[900px] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? 'Edit Client' : 'Add New Client'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update the client information below'
                            : clientExists 
                                ? 'Existing client found. All fields auto-filled. You can modify and add new program.'
                                : 'Fill in the details below to add a new client to the system'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {formSections.map((section, sectionIndex) => (
                        <div key={section.title} className="space-y-4">

                            <div className="border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {section.title}
                                </h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {section.fields.map(renderField)}
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
            </DialogContent>
        </Dialog>
    );
};

export default AddClient;