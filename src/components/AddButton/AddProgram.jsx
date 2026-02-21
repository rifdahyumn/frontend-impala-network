import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { useEffect, useState } from "react";
import { X, Plus, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";
import programService from "../../services/programService";

const AddProgram = ({ isAddProgramModalOpen, setIsAddProgramModalOpen, onAddProgram, editData = null, onEditProgram }) => {
    const isEditMode = !!editData;

    const [newInstructor, setNewInstructor] = useState('');
    const [newTag, setNewTag] = useState('');
    const [newInterest, setNewInterest] = useState('');
    const [newManPowerPic, setNewManPowerPic] = useState('');
    const [newKolaborator, setNewKolaborator] = useState('');
    
    const [formData, setFormData] = useState({
        program_name: '',
        client: '',
        category: '',
        status: 'Active',
        description: '',
        start_date: '',
        end_date: '',
        location: '',
        area: 'Lokal',
        activity: '',
        capacity: '',
        participant: '',
        budget_offering: 'Rp. ',
        budget_usage_plan: 'Rp. ',
        budget_finance_closure: 'Rp. ',
        budget_finance_closure_realisasi_penyerapan: '',
        margin_estimasi_margin: 'Rp. ',
        margin_real_margin: 'Rp. ',
        link_folder_program: '',
        deck_program_link: '',
        link_budgeting_offering: '',
        link_budgeting_usage_plan: '',
        link_budgeting_finance_tracker: '',
        quotation: '',
        invoice: '',
        receipt: '',
        link_drive_documentation: '',
        link_drive_media_release_program: '',
        link_drive_program_report: '',
        link_drive_e_catalogue_beneficiary: '',
        link_drive_bast: '',
        satisfaction_survey_link: '',
        link_kontrak_freelance: '',
        link_surat_tugas: '',
        link_document_kontrak_partner: '',
        instructors: [],
        tags: [],
        interest_of_program: [],
        man_power_pic: [],
        kolaborator: [],
        man_power_leads: '',
        man_power_division: '',
        jumlah_team_internal: '',
        jumlah_team_eksternal: '',
        termin: '',
        stage_start_leads_realisasi: 0,
        stage_analysis_realisasi: 0,
        stage_project_creative_development_realisasi: 0,
        stage_program_description_realisasi: 0,
        stage_project_initial_presentation_realisasi: 0,
        stage_project_organizing_development_realisasi: 0,
        stage_project_implementation_presentation_realisasi: 0,
        stage_project_implementation_realisasi: 0,
        stage_project_evaluation_monitoring_realisasi: 0,
        stage_project_satisfaction_survey_realisasi: 0,
        stage_project_report_realisasi: 0,
        stage_end_sustainability_realisasi: 0
    });

    const [loading, setLoading] = useState(false);
    const [programNames, setProgramNames] = useState([]);
    const [loadingPrograms, setLoadingPrograms] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState('basic');

    const tabs = [
        { id: 'basic', label: 'Basic Info' },
        { id: 'schedule', label: 'Schedule & Location' },
        { id: 'financial', label: 'Financial' },
        { id: 'documents', label: 'Documents & Links' },
        { id: 'team', label: 'Team' },
        { id: 'additional', label: 'Additional'}
    ];

    const formatCurrency = (value) => {
        if (!value || value === 'Rp. ') return 'Rp. ';
        
        const cleanValue = value.replace('Rp.', '').replace(/\s/g, '');
        const numericValue = cleanValue.replace(/\D/g, '');

        if (numericValue === '') return 'Rp. ';

        const numberValue = parseInt(numericValue);
        if (isNaN(numberValue)) return 'Rp. ';
        
        const formatted = numberValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return `Rp. ${formatted}`;
    };

    const parseCurrency = (formattedValue) => {
        if (!formattedValue || formattedValue === 'Rp. ') return '';
        
        return formattedValue
            .replace('Rp.', '')
            .replace(/\s/g, '')
            .replace(/\./g, '');
    };

    const handleCurrencyInput = (fieldName) => (e) => {
        const { value } = e.target;

        if (value === 'Rp. ' || value === 'Rp.' || value === '') {
            setFormData(prev => ({
                ...prev,
                [fieldName]: 'Rp. '
            }));
            return;
        }
        
        const formattedValue = formatCurrency(value);
        
        setFormData(prev => ({
            ...prev,
            [fieldName]: formattedValue
        }));

        if (errors[fieldName]) {
            setErrors(prev => ({
                ...prev,
                [fieldName]: ''
            }));
        }
    };

    const handleCurrencyKeyDown = (fieldName) => (e) => {
        if (e.key === 'Backspace') {
            const currentValue = formData[fieldName].replace(/\s/g, '');
            if (currentValue === 'Rp.' || currentValue === 'Rp') {
                setFormData(prev => ({
                    ...prev,
                    [fieldName]: 'Rp. '
                }));
                e.preventDefault();
            }
        }
    };

    const handleCurrencyPaste = (fieldName) => (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        
        const numbersOnly = pastedData.replace(/\D/g, '');
        const formattedValue = formatCurrency(numbersOnly);
        
        setFormData(prev => ({
            ...prev,
            [fieldName]: formattedValue
        }));
    };

    useEffect(() => {
        if (isAddProgramModalOpen) {
            fetchProgramNames();
        }
    }, [isAddProgramModalOpen]);

    const fetchProgramNames = async (search = '') => {
        setLoadingPrograms(true);
        try {
            const response = await programService.getProgramNamesFromClients(search);
            setProgramNames(response.data || []);
        } catch (error) {
            console.error('Error fetching program names:', error);
            toast.error('Failed to load program names');
        } finally {
            setLoadingPrograms(false);
        }
    };

    const handleProgramSearch = (query) => {
        setSearchQuery(query);
        fetchProgramNames(query);
    };

    const handleProgramSelect = (selectedProgramName) => {
        const selectedProgram = programNames.find(program => program.program_name === selectedProgramName);
        if (selectedProgram) {
            setFormData(prev => ({
                ...prev,
                program_name: selectedProgram.program_name,
                client: selectedProgram.company || '',
            }));

            if (errors.program_name) {
                setErrors(prev => ({
                    ...prev,
                    program_name: ''
                }));
            }
        }
    };

    useEffect(() => {
        if (isEditMode && editData) {
            const newFormData = { ...formData };
            
            const formatField = (value) => {
                if (!value) return 'Rp. ';
                if (typeof value === 'number') return formatCurrency(value.toString());
                if (typeof value === 'string' && !value.startsWith('Rp. ')) {
                    return formatCurrency(value);
                }
                return value;
            };

            Object.keys(editData).forEach(key => {
                if (key in newFormData) {
                    if (key.includes('budget') || key.includes('margin') || key.includes('price')) {
                        newFormData[key] = formatField(editData[key]);
                    } else if (Array.isArray(editData[key])) {
                        newFormData[key] = editData[key] || [];
                    } else {
                        newFormData[key] = editData[key] || '';
                    }
                }
            });

            setFormData(newFormData);
        } else {
            setFormData({
                program_name: '',
                client: '',
                category: '',
                status: 'Active',
                description: '',
                start_date: '',
                end_date: '',
                location: '',
                area: 'Lokal',
                activity: '',
                capacity: '',
                participant: '',
                budget_offering: 'Rp. ',
                budget_usage_plan: 'Rp. ',
                budget_finance_closure: 'Rp. ',
                budget_finance_closure_realisasi_penyerapan: '',
                margin_estimasi_margin: 'Rp. ',
                margin_real_margin: 'Rp. ',
                link_folder_program: '',
                deck_program_link: '',
                link_budgeting_offering: '',
                link_budgeting_usage_plan: '',
                link_budgeting_finance_tracker: '',
                quotation: '',
                invoice: '',
                receipt: '',
                link_drive_documentation: '',
                link_drive_media_release_program: '',
                link_drive_program_report: '',
                link_drive_e_catalogue_beneficiary: '',
                link_drive_bast: '',
                satisfaction_survey_link: '',
                link_kontrak_freelance: '',
                link_surat_tugas: '',
                link_document_kontrak_partner: '',
                instructors: [],
                tags: [],
                interest_of_program: [],
                man_power_pic: [],
                kolaborator: [],
                man_power_leads: '',
                man_power_division: '',
                jumlah_team_internal: '',
                jumlah_team_eksternal: '',
                termin: '',
                stage_start_leads_realisasi: 0,
                stage_analysis_realisasi: 0,
                stage_project_creative_development_realisasi: 0,
                stage_program_description_realisasi: 0,
                stage_project_initial_presentation_realisasi: 0,
                stage_project_organizing_development_realisasi: 0,
                stage_project_implementation_presentation_realisasi: 0,
                stage_project_implementation_realisasi: 0,
                stage_project_evaluation_monitoring_realisasi: 0,
                stage_project_satisfaction_survey_realisasi: 0,
                stage_project_report_realisasi: 0,
                stage_end_sustainability_realisasi: 0
            });
        }
        setErrors({});
        setNewInstructor('');
        setNewTag('');
        setNewInterest('');
        setNewManPowerPic('');
        setNewKolaborator('');
        setActiveTab('basic');
    }, [isEditMode, editData, isAddProgramModalOpen]);

    const validateForm = () => {
        const newErrors = {};

        const requiredFields = [
            { name: 'program_name', label: 'Program Name' },
            { name: 'client', label: 'Client Company' },
            { name: 'category', label: 'Category' },
            { name: 'description', label: 'Description' },
            { name: 'start_date', label: 'Start Date' },
            { name: 'end_date', label: 'End Date' },
            { name: 'location', label: 'Location' },
            { name: 'budget_offering', label: 'Budget Offering' }
        ];

        requiredFields.forEach(field => {
            const value = formData[field.name];
            if (!value || value.toString().trim() === '' || value === 'Rp. ') {
                newErrors[field.name] = `${field.label} is required`;
            }
        });

        if (formData.start_date && formData.end_date) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);
            if (start > end) {
                newErrors.end_date = 'End date cannot be before start date';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        const isCurrencyField = (name.includes('budget') || name.includes('margin')) && 
                            !name.includes('link_') && 
                            !name.includes('Link');
        
        if (isCurrencyField) {
            handleCurrencyInput(name)(e);
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
            }));
        }
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleNumberInput = (name) => (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            if (errors.program_name || errors.client || errors.category || errors.description) {
                setActiveTab('basic');
            } else if (errors.start_date || errors.end_date || errors.location) {
                setActiveTab('schedule');
            } else if (errors.budget_offering) {
                setActiveTab('financial');
            }
            return;
        }

        setLoading(true);

        try {
            const programData = {
                ...formData,
                budget_offering: parseCurrency(formData.budget_offering),
                budget_usage_plan: parseCurrency(formData.budget_usage_plan),
                budget_finance_closure: parseCurrency(formData.budget_finance_closure),
                margin_estimasi_margin: parseCurrency(formData.margin_estimasi_margin),
                margin_real_margin: parseCurrency(formData.margin_real_margin),
                participant: formData.participant || null,
                jumlah_team_internal: formData.jumlah_team_internal || null,
                jumlah_team_eksternal: formData.jumlah_team_eksternal || null,
                instructors: formData.instructors.filter(Boolean),
                tags: formData.tags.filter(Boolean),
                interest_of_program: formData.interest_of_program.filter(Boolean),
                man_power_pic: formData.man_power_pic.filter(Boolean),
                kolaborator: formData.kolaborator.filter(Boolean),
                stage_start_leads_realisasi: Number(formData.stage_start_leads_realisasi) || 0,
                stage_analysis_realisasi: Number(formData.stage_analysis_realisasi) || 0,
                stage_project_creative_development_realisasi: Number(formData.stage_project_creative_development_realisasi) || 0,
                stage_program_description_realisasi: Number(formData.stage_program_description_realisasi) || 0,
                stage_project_initial_presentation_realisasi: Number(formData.stage_project_initial_presentation_realisasi) || 0,
                stage_project_organizing_development_realisasi: Number(formData.stage_project_organizing_development_realisasi) || 0,
                stage_project_implementation_presentation_realisasi: Number(formData.stage_project_implementation_presentation_realisasi) || 0,
                stage_project_implementation_realisasi: Number(formData.stage_project_implementation_realisasi) || 0,
                stage_project_evaluation_monitoring_realisasi: Number(formData.stage_project_evaluation_monitoring_realisasi) || 0,
                stage_project_satisfaction_survey_realisasi: Number(formData.stage_project_satisfaction_survey_realisasi) || 0,
                stage_project_report_realisasi: Number(formData.stage_project_report_realisasi) || 0,
                stage_end_sustainability_realisasi: Number(formData.stage_end_sustainability_realisasi) || 0
            };

            if (isEditMode) {
                if (onEditProgram) {
                    await onEditProgram(editData.id, programData);
                } else {
                    await programService.updateProgram(editData.id, programData);
                    toast.success('Program updated successfully');
                }
            } else {
                if (onAddProgram) {
                    await onAddProgram(programData);
                } else {
                    await programService.addProgram(programData);
                    toast.success('Program added successfully');
                }
            }

            handleCloseModal();
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} program:`, error);
            toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'add'} program`);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsAddProgramModalOpen(false);
        setErrors({});
        setSearchQuery('');
        setProgramNames([]);
        setNewInstructor('');
        setNewTag('');
        setNewInterest('');
        setNewManPowerPic('');
        setNewKolaborator('');
        setActiveTab('basic');
    };

    const handleAddArrayItem = (arrayName, value, setter) => {
        if (value.trim() && !formData[arrayName].includes(value.trim())) {
            setFormData(prev => ({
                ...prev,
                [arrayName]: [...prev[arrayName], value.trim()]
            }));
            setter('');
        }
    };

    const handleRemoveArrayItem = (arrayName, index) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: prev[arrayName].filter((_, i) => i !== index)
        }));
    };

    const renderBasicTab = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="program_name">
                        Program Name <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.program_name}
                        onValueChange={handleProgramSelect}
                        disabled={isEditMode}
                    >
                        <SelectTrigger className={errors.program_name ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select program name" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                            <div className="p-2 border-b sticky top-0 bg-white z-10">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Search program names..."
                                        value={searchQuery}
                                        onChange={(e) => handleProgramSearch(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>

                            {loadingPrograms && (
                                <div className="flex items-center justify-center p-4">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    <span className="text-sm">Loading program names...</span>
                                </div>
                            )}

                            {!loadingPrograms && programNames.map((program, idx) => (
                                <SelectItem 
                                    key={`${program.program_name}-${idx}`} 
                                    value={program.program_name}
                                >
                                    <div className="flex flex-col py-1">
                                        <span className="font-medium text-sm">
                                            {program.program_name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {program.company}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.program_name && <p className="text-red-500 text-sm">{errors.program_name}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="client">
                        Client Company <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="client"
                        name="client"
                        value={formData.client}
                        onChange={handleInputChange}
                        placeholder="Client company name"
                        className={errors.client ? 'border-red-500' : ''}
                    />
                    {errors.client && <p className="text-red-500 text-sm">{errors.client}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="category">
                        Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.category}
                        onValueChange={(value) => handleSelectChange('category', value)}
                    >
                        <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {[
                                'Seminar / Webinar',
                                'Workshop',
                                'Community Service',
                                'Expo',
                                'Training',
                                'Conference'
                            ].map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                </Label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter program description"
                    className={`w-full min-h-[100px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            </div>
        </div>
    );

    const renderScheduleTab = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="start_date">
                        Start Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="start_date"
                        name="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        className={errors.start_date ? 'border-red-500' : ''}
                    />
                    {errors.start_date && <p className="text-red-500 text-sm">{errors.start_date}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="end_date">
                        End Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="end_date"
                        name="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        className={errors.end_date ? 'border-red-500' : ''}
                    />
                    {errors.end_date && <p className="text-red-500 text-sm">{errors.end_date}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="location">
                        Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Program location"
                        className={errors.location ? 'border-red-500' : ''}
                    />
                    {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="area">Area</Label>
                    <Select
                        value={formData.area}
                        onValueChange={(value) => handleSelectChange('area', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select area" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Lokal">Lokal</SelectItem>
                            <SelectItem value="Nasional">Nasional</SelectItem>
                            <SelectItem value="Internasional">Internasional</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="activity">Activity</Label>
                    <Input
                        id="activity"
                        name="activity"
                        value={formData.activity}
                        onChange={handleInputChange}
                        placeholder="Activity type"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Select
                        value={formData.capacity}
                        onValueChange={(value) => handleSelectChange('capacity', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select capacity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1-50">1-50</SelectItem>
                            <SelectItem value="50-100">50-100</SelectItem>
                            <SelectItem value="100-500">100-500</SelectItem>
                            <SelectItem value="500+">500+</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="participant">Actual Participants</Label>
                    <Input
                        id="participant"
                        name="participant"
                        type="number"
                        value={formData.participant}
                        onChange={handleNumberInput('participant')}
                        placeholder="Number of participants"
                    />
                </div>
            </div>
        </div>
    );

    const renderFinancialTab = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="budget_offering">
                        Budget Offering <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Input
                            id="budget_offering"
                            name="budget_offering"
                            value={formData.budget_offering}
                            onChange={handleInputChange}
                            onKeyDown={handleCurrencyKeyDown('budget_offering')}
                            onPaste={handleCurrencyPaste('budget_offering')}
                            className={`${errors.budget_offering ? 'border-red-500' : ''}`}
                        />
                       
                    </div>
                    {errors.budget_offering && <p className="text-red-500 text-sm">{errors.budget_offering}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="budget_usage_plan">Budget Usage Plan</Label>
                    <div className="relative">
                        <Input
                            id="budget_usage_plan"
                            name="budget_usage_plan"
                            value={formData.budget_usage_plan}
                            onChange={handleInputChange}
                            onKeyDown={handleCurrencyKeyDown('budget_usage_plan')}
                            onPaste={handleCurrencyPaste('budget_usage_plan')}
                        />
                    
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="budget_finance_closure">Budget Finance Closure</Label>
                    <div className="relative">
                        <Input
                            id="budget_finance_closure"
                            name="budget_finance_closure"
                            value={formData.budget_finance_closure}
                            onChange={handleInputChange}
                            onKeyDown={handleCurrencyKeyDown('budget_finance_closure')}
                            onPaste={handleCurrencyPaste('budget_finance_closure')}
                        />
                    </div>
                </div>

                {/* <div className="space-y-2">
                    <Label htmlFor="budget_finance_closure_realisasi_penyerapan">Realisasi Penyerapan (%)</Label>
                    <Input
                        id="budget_finance_closure_realisasi_penyerapan"
                        name="budget_finance_closure_realisasi_penyerapan"
                        value={formData.budget_finance_closure_realisasi_penyerapan}
                        onChange={handleInputChange}
                        placeholder="e.g., 97%"
                    />
                </div> */}

                <div className="space-y-2">
                    <Label htmlFor="margin_estimasi_margin">Estimasi Margin</Label>
                    <div className="relative">
                        <Input
                            id="margin_estimasi_margin"
                            name="margin_estimasi_margin"
                            value={formData.margin_estimasi_margin}
                            onChange={handleInputChange}
                            onKeyDown={handleCurrencyKeyDown('margin_estimasi_margin')}
                            onPaste={handleCurrencyPaste('margin_estimasi_margin')}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="margin_real_margin">Real Margin</Label>
                    <div className="relative">
                        <Input
                            id="margin_real_margin"
                            name="margin_real_margin"
                            value={formData.margin_real_margin}
                            onChange={handleInputChange}
                            onKeyDown={handleCurrencyKeyDown('margin_real_margin')}
                            onPaste={handleCurrencyPaste('margin_real_margin')}
                        />
                    </div>
                </div>

                <div className="space-y-2 col-span-2">
                    <Label htmlFor="termin">Termin</Label>
                    <Input
                        id="termin"
                        name="termin"
                        value={formData.termin}
                        onChange={handleInputChange}
                        placeholder="e.g., Termin 1 (50%) - Pelunasan (50%)"
                    />
                </div>
            </div>
        </div>
    );

    const renderDocumentsTab = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="link_folder_program">Link Folder Program</Label>
                    <Input
                        id="link_folder_program"
                        name="link_folder_program"
                        value={formData.link_folder_program}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="deck_program_link">Deck Program Link</Label>
                    <Input
                        id="deck_program_link"
                        name="deck_program_link"
                        value={formData.deck_program_link}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="link_budgeting_offering">Link Budgeting Offering</Label>
                    <Input
                        id="link_budgeting_offering"
                        name="link_budgeting_offering"
                        value={formData.link_budgeting_offering}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="link_budgeting_usage_plan">Link Budgeting Usage Plan</Label>
                    <Input
                        id="link_budgeting_usage_plan"
                        name="link_budgeting_usage_plan"
                        value={formData.link_budgeting_usage_plan}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="link_budgeting_finance_tracker">Link Budgeting Finance Tracker</Label>
                    <Input
                        id="link_budgeting_finance_tracker"
                        name="link_budgeting_finance_tracker"
                        value={formData.link_budgeting_finance_tracker}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="quotation">Quotation Link</Label>
                    <Input
                        id="quotation"
                        name="quotation"
                        value={formData.quotation}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="invoice">Invoice Link</Label>
                    <Input
                        id="invoice"
                        name="invoice"
                        value={formData.invoice}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="receipt">Receipt Link</Label>
                    <Input
                        id="receipt"
                        name="receipt"
                        value={formData.receipt}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="link_kontrak_freelance">Link Kontrak Freelance</Label>
                    <Input
                        id="link_kontrak_freelance"
                        name="link_kontrak_freelance"
                        value={formData.link_kontrak_freelance}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="link_surat_tugas">Link Surat Tugas</Label>
                    <Input
                        id="link_surat_tugas"
                        name="link_surat_tugas"
                        value={formData.link_surat_tugas}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="link_drive_documentation">Link Dokumentasi</Label>
                    <Input
                        id="link_drive_documentation"
                        name="link_drive_documentation"
                        value={formData.link_drive_documentation}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="link_drive_media_release_program">Link Media Release</Label>
                    <Input
                        id="link_drive_media_release_program"
                        name="link_drive_media_release_program"
                        value={formData.link_drive_media_release_program}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="link_drive_program_report">Link Program Report</Label>
                    <Input
                        id="link_drive_program_report"
                        name="link_drive_program_report"
                        value={formData.link_drive_program_report}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="link_drive_e_catalogue_beneficiary">Link E-Catalogue</Label>
                    <Input
                        id="link_drive_e_catalogue_beneficiary"
                        name="link_drive_e_catalogue_beneficiary"
                        value={formData.link_drive_e_catalogue_beneficiary}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="link_drive_bast">Link BAST</Label>
                    <Input
                        id="link_drive_bast"
                        name="link_drive_bast"
                        value={formData.link_drive_bast}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="space-y-2 col-span-2">
                    <Label htmlFor="satisfaction_survey_link">Satisfaction Survey Link</Label>
                    <Input
                        id="satisfaction_survey_link"
                        name="satisfaction_survey_link"
                        value={formData.satisfaction_survey_link}
                        onChange={handleInputChange}
                    />
                </div>
            </div>
        </div>
    );

    const renderTeamTab = () => (
        <div className="space-y-6">
            <div className="space-y-3">
                <Label>Instructors</Label>
                <div className="flex gap-2">
                    <Input
                        value={newInstructor}
                        onChange={(e) => setNewInstructor(e.target.value)}
                        placeholder="Enter instructor name"
                        className="flex-1"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddArrayItem('instructors', newInstructor, setNewInstructor);
                            }
                        }}
                    />
                    <Button 
                        type="button" 
                        onClick={() => handleAddArrayItem('instructors', newInstructor, setNewInstructor)}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                    </Button>
                </div>
                {formData.instructors.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {formData.instructors.map((item, index) => (
                            <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                {item}
                                <button type="button" onClick={() => handleRemoveArrayItem('instructors', index)}>
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <Label>Man Power PIC</Label>
                <div className="flex gap-2">
                    <Input
                        value={newManPowerPic}
                        onChange={(e) => setNewManPowerPic(e.target.value)}
                        placeholder="Enter PIC name"
                        className="flex-1"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddArrayItem('man_power_pic', newManPowerPic, setNewManPowerPic);
                            }
                        }}
                    />
                    <Button 
                        type="button" 
                        onClick={() => handleAddArrayItem('man_power_pic', newManPowerPic, setNewManPowerPic)}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                    </Button>
                </div>
                {formData.man_power_pic.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {formData.man_power_pic.map((item, index) => (
                            <div key={index} className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                                {item}
                                <button type="button" onClick={() => handleRemoveArrayItem('man_power_pic', index)}>
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="man_power_leads">Man Power Leads</Label>
                    <Input
                        id="man_power_leads"
                        name="man_power_leads"
                        value={formData.man_power_leads}
                        onChange={handleInputChange}
                        placeholder="Team lead name"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="man_power_division">Division</Label>
                    <Input
                        id="man_power_division"
                        name="man_power_division"
                        value={formData.man_power_division}
                        onChange={handleInputChange}
                        placeholder="e.g., Digital Learning Division"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="jumlah_team_internal">Jumlah Team Internal</Label>
                    <Input
                        id="jumlah_team_internal"
                        name="jumlah_team_internal"
                        type="number"
                        value={formData.jumlah_team_internal}
                        onChange={handleNumberInput('jumlah_team_internal')}
                        placeholder="0"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="jumlah_team_eksternal">Jumlah Team Eksternal</Label>
                    <Input
                        id="jumlah_team_eksternal"
                        name="jumlah_team_eksternal"
                        type="number"
                        value={formData.jumlah_team_eksternal}
                        onChange={handleNumberInput('jumlah_team_eksternal')}
                        placeholder="0"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="link_kontrak_freelance">Link Kontrak Freelance</Label>
                    <Input
                        id="link_kontrak_freelance"
                        name="link_kontrak_freelance"
                        value={formData.link_kontrak_freelance}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="link_surat_tugas">Link Surat Tugas</Label>
                    <Input
                        id="link_surat_tugas"
                        name="link_surat_tugas"
                        value={formData.link_surat_tugas}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="space-y-2 col-span-2">
                    <Label htmlFor="link_document_kontrak_partner">Link Kontrak Partner</Label>
                    <Input
                        id="link_document_kontrak_partner"
                        name="link_document_kontrak_partner"
                        value={formData.link_document_kontrak_partner}
                        onChange={handleInputChange}
                    />
                </div>
            </div>
        </div>
    );

    const renderStagesTab = () => {
        const stages = [
            { key: 'stage_start_leads_realisasi', label: 'Start Leads' },
            { key: 'stage_analysis_realisasi', label: 'Analysis' },
            { key: 'stage_project_creative_development_realisasi', label: 'Creative Development' },
            { key: 'stage_program_description_realisasi', label: 'Program Description' },
            { key: 'stage_project_initial_presentation_realisasi', label: 'Initial Presentation' },
            { key: 'stage_project_organizing_development_realisasi', label: 'Organizing Development' },
            { key: 'stage_project_implementation_presentation_realisasi', label: 'Implementation Presentation' },
            { key: 'stage_project_implementation_realisasi', label: 'Implementation' },
            { key: 'stage_project_evaluation_monitoring_realisasi', label: 'Evaluation & Monitoring' },
            { key: 'stage_project_satisfaction_survey_realisasi', label: 'Satisfaction Survey' },
            { key: 'stage_project_report_realisasi', label: 'Report' },
            { key: 'stage_end_sustainability_realisasi', label: 'End & Sustainability' }
        ];

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {stages.map(stage => (
                        <div key={stage.key} className="space-y-2">
                            <Label htmlFor={stage.key}>{stage.label} (%)</Label>
                            <Input
                                id={stage.key}
                                name={stage.key}
                                type="number"
                                min="0"
                                max="100"
                                value={formData[stage.key]}
                                onChange={handleNumberInput(stage.key)}
                                placeholder="0"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderAdditionalTab = () => (
        <div className="space-y-6">
            <div className="space-y-3">
                <Label>Interest of Program</Label>
                <div className="flex gap-2">
                    <Input
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="Enter interest (e.g., Gen Z, Digital Learning)"
                        className="flex-1"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddArrayItem('interest_of_program', newInterest, setNewInterest);
                            }
                        }}
                    />
                    <Button 
                        type="button" 
                        onClick={() => handleAddArrayItem('interest_of_program', newInterest, setNewInterest)}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                    </Button>
                </div>
                {formData.interest_of_program.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {formData.interest_of_program.map((item, index) => (
                            <div key={index} className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                                {item}
                                <button type="button" onClick={() => handleRemoveArrayItem('interest_of_program', index)}>
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <Label>Tags</Label>
                <div className="flex gap-2">
                    <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Enter tag"
                        className="flex-1"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddArrayItem('tags', newTag, setNewTag);
                            }
                        }}
                    />
                    <Button 
                        type="button" 
                        onClick={() => handleAddArrayItem('tags', newTag, setNewTag)}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                    </Button>
                </div>
                {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {formData.tags.map((item, index) => (
                            <div key={index} className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                {item}
                                <button type="button" onClick={() => handleRemoveArrayItem('tags', index)}>
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <Label>Kolaborator</Label>
                <div className="flex gap-2">
                    <Input
                        value={newKolaborator}
                        onChange={(e) => setNewKolaborator(e.target.value)}
                        placeholder="Enter collaborator name"
                        className="flex-1"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddArrayItem('kolaborator', newKolaborator, setNewKolaborator);
                            }
                        }}
                    />
                    <Button 
                        type="button" 
                        onClick={() => handleAddArrayItem('kolaborator', newKolaborator, setNewKolaborator)}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                    </Button>
                </div>
                {formData.kolaborator.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {formData.kolaborator.map((item, index) => (
                            <div key={index} className="flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                                {item}
                                <button type="button" onClick={() => handleRemoveArrayItem('kolaborator', index)}>
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <Dialog open={isAddProgramModalOpen} onOpenChange={setIsAddProgramModalOpen}>
            <DialogContent className="max-h-[90vh] max-w-[1000px] overflow-hidden flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>
                        {isEditMode ? `Edit Program: ${formData.program_name || ''}` : 'Add New Program'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? `Update information for "${formData.program_name || 'this program'}"`
                            : 'Fill in the details below to add a new program to the system'
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="flex border-b px-6 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'border-amber-500 text-amber-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6">
                        {activeTab === 'basic' && renderBasicTab()}
                        {activeTab === 'schedule' && renderScheduleTab()}
                        {activeTab === 'financial' && renderFinancialTab()}
                        {activeTab === 'documents' && renderDocumentsTab()}
                        {activeTab === 'team' && renderTeamTab()}
                        {activeTab === 'stages' && renderStagesTab()}
                        {activeTab === 'additional' && renderAdditionalTab()}
                    </div>

                    <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCloseModal}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className={isEditMode ? "bg-amber-500 hover:bg-amber-600" : "bg-amber-600 hover:bg-amber-700"}
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            {loading 
                                ? (isEditMode ? 'Updating...' : 'Adding...')
                                : (isEditMode ? 'Update Program' : 'Add Program')
                            }
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddProgram;