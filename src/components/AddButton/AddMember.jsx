import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useState } from "react";
import { Check, ChevronRight, Package, Calendar } from "lucide-react";

const AddMemberSemarang = ({ isAddMemberModalOpen, setIsAddMemberModalOpen }) => {
  // Form state untuk Add Member Semarang
  const [formData, setFormData] = useState({
    member_id: '',
    full_name: '',
    nik: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    education: '',
    address: '',
    district: '',
    city: '',
    province: '',
    postalCode: '',
    bussinessName: '',
    maneka: '',
    rembug: '',
    eventSpace: '',
    privateOffice: '',
    addInformation: '',
    // State untuk package selection step
    manekaDate: '',
    rembugDate: '',
    eventSpaceDate: '',
    privateOfficeDate: ''
  });

  // State untuk mengelola step selection
  const [selectionStep, setSelectionStep] = useState({
    activeService: null, // 'maneka', 'rembug', 'eventSpace', 'privateOffice'
    showPackageOptions: false,
    showDatePicker: false
  });

  // Data package options untuk setiap service
  const packageOptions = {
    maneka: [
      { 
        id: 'personal', 
        name: 'Personal Membership', 
        description: 'Akses penuh untuk individu',
        features: ['Akses ruang kerja 24/7', 'Meeting room 4 jam/bulan', 'Free coffee & tea'],
        price: 'Rp 1.500.000/bulan'
      },
      { 
        id: 'group', 
        name: 'Group Membership', 
        description: 'Untuk tim 3-5 orang',
        features: ['Akses untuk 3-5 orang', 'Meeting room 8 jam/bulan', 'Dedicated locker'],
        price: 'Rp 3.500.000/bulan'
      }
    ],
    rembug: [
      { 
        id: '1', 
        name: 'Rembug 1', 
        description: 'Paket meeting room dasar',
        features: ['Kapasitas 10 orang', '4 jam penggunaan', 'Projector & screen'],
        price: 'Rp 350.000/sesi'
      },
      { 
        id: '2', 
        name: 'Rembug 2', 
        description: 'Paket meeting room premium',
        features: ['Kapasitas 20 orang', '6 jam penggunaan', 'Full equipment'],
        price: 'Rp 550.000/sesi'
      },
      { 
        id: '3', 
        name: 'Rembug 3', 
        description: 'Paket meeting room executive',
        features: ['Kapasitas 30 orang', '8 jam penggunaan', 'Catering included'],
        price: 'Rp 850.000/sesi'
      }
    ],
    eventSpace: [
      { 
        id: 'gatra', 
        name: 'Gatra', 
        description: 'Ruang event kecil',
        features: ['Kapasitas 50 orang', 'Sound system basic', 'Standing room'],
        price: 'Rp 2.500.000/hari'
      },
      { 
        id: 'maneka', 
        name: 'Maneka Hall', 
        description: 'Ruang event medium',
        features: ['Kapasitas 100 orang', 'Full sound system', 'Seating arrangement'],
        price: 'Rp 5.000.000/hari'
      },
      { 
        id: 'outdoor', 
        name: 'Outdoor Space', 
        description: 'Area outdoor',
        features: ['Kapasitas 200 orang', 'Gazebo & canopy', 'Garden area'],
        price: 'Rp 3.500.000/hari'
      }
    ],
    privateOffice: [
      { 
        id: '1-3', 
        name: 'Private Office 1-3', 
        description: 'Office untuk 1-3 orang',
        features: ['15m² space', 'Furniture included', 'Private access'],
        price: 'Rp 4.500.000/bulan'
      },
      { 
        id: '4&5', 
        name: 'Private Office 4&5', 
        description: 'Office untuk 4-5 orang',
        features: ['25m² space', 'Meeting area', 'Storage cabinet'],
        price: 'Rp 7.500.000/bulan'
      },
      { 
        id: '6', 
        name: 'Private Office 6', 
        description: 'Office untuk 6+ orang',
        features: ['35m² space', 'Executive furniture', 'Pantry area'],
        price: 'Rp 10.000.000/bulan'
      }
    ]
  };

  // Structure dengan sections untuk Semarang
  const formSections = [
    {
      title: "Personal Information",
      fields: [
        {
          name: 'member_id',
          label: 'Member ID',
          type: 'text',
          required: true,
          placeholder: 'MEM-SMG-XXX'
        },
        {
          name: 'full_name',
          label: 'Full Name',
          type: 'text',
          required: true,
          placeholder: 'Enter full name'
        },
        {
          name: 'nik',
          label: 'NIK',
          type: 'text',
          required: true,
          placeholder: 'Enter NIK'
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          placeholder: 'Enter email'
        },
        {
          name: 'phone',
          label: 'Phone Number',
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
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' }
          ]
        },
        {
          name: 'dateOfBirth',
          label: 'Date of Birth',
          type: 'date',
          required: true,
          placeholder: 'Select date of birth'
        },
        {
          name: 'education',
          label: 'Last Education',
          type: 'select',
          required: true,
          placeholder: 'Select last education',
          options: [
            { value: 'sma', label: 'Senior High School (SMA/SMK/MA)' },
            { value: 'd3', label: 'Diploma (D3)' },
            { value: 's1', label: 'Bachelor Degree (S1)' },
            { value: 's2', label: 'Master Degree (S2)' },
            { value: 's3', label: 'Doctoral Degree (S3)' }
          ]
        }
      ]
    },
    {
      title: "Residential Address",
      fields: [
        {
          name: 'address',
          label: 'Complete Address',
          type: 'text',
          required: true,
          placeholder: 'Enter complete address'
        },
        {
          name: 'district',
          label: 'District / Sub District',
          type: 'text',
          required: true,
          placeholder: 'Enter district / sub district',
        },
        {
          name: 'city',
          label: 'City / Regency',
          type: 'text',
          required: true,
          placeholder: 'Enter city'
        },
        {
          name: 'province',
          label: 'Province',
          type: 'text',
          required: true,
          placeholder: 'Enter province'
        },
        {
          name: 'postalCode',
          label: 'Postal Code',
          type: 'text',
          required: true,
          placeholder: 'Enter postal code'
        }
      ]
    },
    {
      title: "Business / Organization",
      fields: [
        {
          name: 'bussinessName',
          label: 'Name of Company',
          type: 'text',
          required: true,
          placeholder: 'Enter name of company'
        }
      ]
    },
    {
      title: "Service Requirements",
      fields: [
        // Service selection buttons
        {
          name: 'serviceSelection',
          label: 'Select Services',
          type: 'serviceButtons',
          services: [
            { key: 'maneka', label: 'Maneka Package', icon: Package },
            { key: 'rembug', label: 'Rembug Package', icon: Package },
            { key: 'eventSpace', label: 'Event Space', icon: Package },
            { key: 'privateOffice', label: 'Private Office', icon: Package }
          ]
        },
        // Package options (akan muncul ketika service dipilih)
        ...(selectionStep.showPackageOptions ? [{
          name: 'packageOptions',
          label: `Select ${selectionStep.activeService} Package`,
          type: 'packageOptions'
        }] : []),
        // Date picker (akan muncul ketika package dipilih)
        ...(selectionStep.showDatePicker ? [{
          name: `${selectionStep.activeService}Date`,
          label: `Select Date for ${formData[selectionStep.activeService]}`,
          type: 'date',
          required: false
        }] : [])
      ]
    },
    {
      title: "Additional Information",
      fields: [
        {
          name: 'addInformation',
          label: 'How did you find out about Hetero?',
          type: 'select',
          required: true,
          placeholder: 'Select additional information',
          options: [
            { value: 'sosmed', label: 'Social Media' },
            { value: 'website', label: 'Company Website' },
            { value: 'friend', label: 'Friends / Family Recommendation' },
            { value: 'event', label: 'Event / Exhibition' },
            { value: 'local', label: 'Local Community' }
          ]
        }
      ]
    }
  ];

  // Handler untuk service selection
  const handleServiceSelect = (serviceKey) => {
    setSelectionStep({
      activeService: serviceKey,
      showPackageOptions: true,
      showDatePicker: false
    });
  };

  // Handler untuk package selection
  const handlePackageSelect = (packageId, packageName) => {
    const serviceKey = selectionStep.activeService;
    
    // Update form data dengan package yang dipilih
    setFormData(prev => ({
      ...prev,
      [serviceKey]: packageId
    }));

    // Lanjut ke date picker step
    setSelectionStep(prev => ({
      ...prev,
      showDatePicker: true
    }));
  };

  // Handler untuk kembali ke package selection
  const handleBackToPackages = () => {
    setSelectionStep(prev => ({
      ...prev,
      showDatePicker: false
    }));
  };

  // Handler untuk cancel service selection
  const handleCancelServiceSelection = () => {
    setSelectionStep({
      activeService: null,
      showPackageOptions: false,
      showDatePicker: false
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New member data for Semarang:', formData);
    alert(`Member ${formData.full_name} added successfully to Semarang!`);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsAddMemberModalOpen(false);
    // Reset semua state
    setFormData({
      member_id: '',
      full_name: '',
      nik: '',
      email: '',
      phone: '',
      gender: '',
      dateOfBirth: '',
      education: '',
      address: '',
      district: '',
      city: '',
      province: '',
      postalCode: '',
      bussinessName: '',
      maneka: '',
      rembug: '',
      eventSpace: '',
      privateOffice: '',
      addInformation: '',
      manekaDate: '',
      rembugDate: '',
      eventSpaceDate: '',
      privateOfficeDate: ''
    });
    setSelectionStep({
      activeService: null,
      showPackageOptions: false,
      showDatePicker: false
    });
  };

  // Function untuk render field berdasarkan type
  const renderField = (field) => {
    // Service selection buttons
    if (field.type === 'serviceButtons') {
      return (
        <div key={field.name} className="space-y-4">
          <Label>{field.label}</Label>
          <div className="grid grid-cols-2 gap-3">
            {field.services.map((service) => (
              <Button
                key={service.key}
                type="button"
                variant={formData[service.key] ? "default" : "outline"}
                className="h-auto py-3 flex flex-col items-center gap-2"
                onClick={() => handleServiceSelect(service.key)}
              >
                <service.icon className="h-5 w-5" />
                <span className="text-sm">{service.label}</span>
                {formData[service.key] && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    // Package options display
    if (field.type === 'packageOptions' && selectionStep.activeService) {
      const serviceKey = selectionStep.activeService;
      const packages = packageOptions[serviceKey] || [];
      
      return (
        <div key={field.name} className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg">{field.label}</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancelServiceSelection}
            >
              Cancel
            </Button>
          </div>
          
          <div className="grid gap-3">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  formData[serviceKey] === pkg.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handlePackageSelect(pkg.id, pkg.name)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">Features:</p>
                      <ul className="text-xs text-gray-600 mt-1 space-y-1">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <Check className="h-3 w-3 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-sm font-semibold text-blue-600 mt-2">{pkg.price}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (field.type === 'select') {
      return (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            value={formData[field.name]}
            onValueChange={(value) => handleSelectChange(field.name, value)}
            required={field.required}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (field.type === 'date') {
      return (
        <div key={field.name} className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg">{field.label}</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBackToPackages}
            >
              Back to Packages
            </Button>
          </div>
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <Calendar className="h-5 w-5 text-gray-400" />
            <Input
              name={field.name}
              type="date"
              value={formData[field.name]}
              onChange={handleInputChange}
              required={field.required}
              className="flex-1"
            />
          </div>
        </div>
      );
    }

    // Default input field
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
          value={formData[field.name]}
          onChange={handleInputChange}
          placeholder={field.placeholder}
          required={field.required}
          className="w-full"
        />
      </div>
    );
  };

  return (
    <Dialog open={isAddMemberModalOpen} onOpenChange={setIsAddMemberModalOpen}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Member - Semarang</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new member to Semarang branch. Select service packages and choose dates as needed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {formSections.map((section, sectionIndex) => (
            <div key={section.title} className="space-y-4">
              {/* Section Header */}
              <div className="border-b pb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {section.title}
                </h3>
              </div>

              {/* Section Fields */}
              <div className={
                section.title === "Service Requirements" && 
                (selectionStep.showPackageOptions || selectionStep.showDatePicker)
                  ? "grid grid-cols-1 gap-4" 
                  : "grid grid-cols-1 md:grid-cols-2 gap-4"
              }>
                {section.fields.map(renderField)}
              </div>

              {/* Add spacing between sections except for the last one */}
              {sectionIndex < formSections.length - 1 && (
                <div className="pt-2" />
              )}
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button type="submit">
              Add Member
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberSemarang;