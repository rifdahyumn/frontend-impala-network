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

const AddMemberBanyumas = ({ isAddMemberModalOpen, setIsAddMemberModalOpen }) => {
  // Form state untuk Add Member Banyumas
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
    // State untuk duration dan date
    manekaDuration: '',
    manekaDate: '',
    rembugDuration: '',
    rembugDate: '',
    eventSpaceDuration: '',
    eventSpaceDate: '',
    privateOfficeDuration: '',
    privateOfficeDate: ''
  });

  // Options untuk setiap service
  const serviceOptions = {
    maneka: {
      packages: [
        { 
          value: 'personal', 
          label: 'Personal Membership',
          durations: [
            { value: 'opsi1', label: '35k/1 Day' },
            { value: 'opsi2', label: '472,5k/15Day' },
            { value: 'opsi3', label: '840k/30 Day' },
          ]
        },
        { 
          value: 'group', 
          label: 'Group Membership',
          durations: [
            { value: 'opsi1', label: '3,6mio/Month' },
            { value: 'opsi2', label: '18mio/6 Month' },
            { value: 'opsi3', label: '30mio/12 Month' }
          ]
        }
      ]
    },
    rembug: {
      packages: [
        { 
          value: 'rembug1', 
          label: 'Rembug 1',
          durations: [
            { value: 'opsi1', label: '120k/1 Hour' },
            { value: 'opsi2', label: '850k/Full Day' }
          ]
        },
        { 
          value: 'rembug2', 
          label: 'Rembug 2',
          durations: [
            { value: 'opsi1', label: '120k/1 Hour' },
            { value: 'opsi2', label: '850k/Full Day' }
          ]
        },
        { 
          value: 'rembug3', 
          label: 'Rembug 3',
          durations: [
            { value: 'opsi1', label: '200k/1 Hour' },
            { value: 'opsi2', label: '1500k/Full Day' }
          ]
        }
      ]
    },
    eventSpace: {
      packages: [
        { 
          value: 'gatra', 
          label: 'Gatra',
          durations: [
            { value: 'half-day', label: 'Setengah Hari (4 Jam)' },
            { value: 'full-day', label: '1 Hari Penuh' },
            { value: '2-days', label: '2 Hari' },
            { value: '3-days', label: '3 Hari' }
          ]
        },
        { 
          value: 'maneka', 
          label: 'Maneka',
          durations: [
            { value: 'half-day', label: 'Setengah Hari (4 Jam)' },
            { value: 'full-day', label: '1 Hari Penuh' },
            { value: '2-days', label: '2 Hari' },
            { value: '3-days', label: '3 Hari' }
          ]
        },
        { 
          value: 'outdoor', 
          label: 'Outdoor',
          durations: [
            { value: 'half-day', label: 'Setengah Hari (4 Jam)' },
            { value: 'full-day', label: '1 Hari Penuh' },
            { value: '2-days', label: '2 Hari' },
            { value: '3-days', label: '3 Hari' }
          ]
        }
      ]
    },
    privateOffice: {
      packages: [
        { 
          value: 'private1', 
          label: 'Private Office 1-3',
          durations: [
            { value: 'opsi1', label: '23mio/6 Month' },
            { value: 'opsi2', label: '40mio/12 Month' }
          ]
        },
        { 
          value: 'private4', 
          label: 'Private Office 4&5',
          durations: [
            { value: 'opsi1', label: '27mio/6 Month' },
            { value: 'opsi2', label: '50mio/12 Month' }
          ]
        },
        { 
          value: 'private6', 
          label: 'Private Office 6',
          durations: [
            { value: 'opsi1', label: '40mio/6 Month' },
            { value: 'opsi2', label: '60mio/12 Month' }
          ]
        }
      ]
    }
  };

  // Helper function untuk mendapatkan package yang dipilih
  const getSelectedPackage = (serviceKey) => {
    if (!formData[serviceKey]) return null;
    return serviceOptions[serviceKey]?.packages?.find(pkg => pkg.value === formData[serviceKey]) || null;
  };

  // Structure dengan sections untuk Banyumas
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
        // MANEKA PACKAGE - STEP 1: Pilih package
        {
          name: 'maneka',
          label: 'Maneka Package',
          type: 'select',
          required: false,
          placeholder: 'Select maneka package',
          options: [
            { value: 'none', label: 'Not choosing Maneka' },
            ...serviceOptions.maneka.packages.map(pkg => ({
              value: pkg.value,
              label: pkg.label // HANYA LABEL SAJA
            }))
          ]
        },
        // STEP 2: Jika package dipilih, tampilkan pilihan duration
        ...(formData.maneka && formData.maneka !== 'none' ? [{
          name: 'manekaDuration',
          label: `Duration for ${getSelectedPackage('maneka')?.label}`,
          type: 'select',
          required: true,
          placeholder: 'Select duration',
          options: getSelectedPackage('maneka')?.durations?.map(dur => ({
            value: dur.value,
            label: dur.label // HANYA LABEL SAJA
          })) || []
        }] : []),
        // STEP 3: Jika duration dipilih, tampilkan date picker
        ...(formData.manekaDuration ? [{
          name: 'manekaDate',
          label: `Start Date for ${getSelectedPackage('maneka')?.label}`,
          type: 'date',
          required: true,
          placeholder: 'Select start date'
        }] : []),

        // REMBUG PACKAGE - STEP 1: Pilih package
        {
          name: 'rembug',
          label: 'Rembug Package',
          type: 'select',
          required: false,
          placeholder: 'Select rembug package',
          options: [
            { value: 'none', label: 'Not choosing Rembug' },
            ...serviceOptions.rembug.packages.map(pkg => ({
              value: pkg.value,
              label: pkg.label // HANYA LABEL SAJA
            }))
          ]
        },
        // STEP 2: Jika package dipilih, tampilkan pilihan duration
        ...(formData.rembug && formData.rembug !== 'none' ? [{
          name: 'rembugDuration',
          label: `Duration for ${getSelectedPackage('rembug')?.label}`,
          type: 'select',
          required: true,
          placeholder: 'Select duration',
          options: getSelectedPackage('rembug')?.durations?.map(dur => ({
            value: dur.value,
            label: dur.label // HANYA LABEL SAJA
          })) || []
        }] : []),
        // STEP 3: Jika duration dipilih, tampilkan date picker
        ...(formData.rembugDuration ? [{
          name: 'rembugDate',
          label: `Start Date for ${getSelectedPackage('rembug')?.label}`,
          type: 'date',
          required: true,
          placeholder: 'Select start date'
        }] : []),

        // Event Space - STEP 1: Pilih package
        {
          name: 'eventSpace',
          label: 'Event Space',
          type: 'select',
          required: false,
          placeholder: 'Select event space',
          options: [
            { value: 'none', label: 'Not choosing Event Space' },
            ...serviceOptions.eventSpace.packages.map(pkg => ({
              value: pkg.value,
              label: pkg.label
            }))
          ]
        },
        // STEP 2: Jika package dipilih, langsung tampilkan date picker
        ...(formData.eventSpace && formData.eventSpace !== 'none' ? [{
          name: 'eventSpaceDate',
          label: `Event Date for ${getSelectedPackage('eventSpace')?.label}`,
          type: 'date',
          required: true,
          placeholder: 'Select event date'
        }] : []),

        // PRIVATE OFFICE - STEP 1: Pilih package
        {
          name: 'privateOffice',
          label: 'Private Office',
          type: 'select',
          required: false,
          placeholder: 'Select private office',
          options: [
            { value: 'none', label: 'Not choosing Private Office' },
            ...serviceOptions.privateOffice.packages.map(pkg => ({
              value: pkg.value,
              label: pkg.label // HANYA LABEL SAJA
            }))
          ]
        },
        // STEP 2: Jika package dipilih, tampilkan pilihan duration
        ...(formData.privateOffice && formData.privateOffice !== 'none' ? [{
          name: 'privateOfficeDuration',
          label: `Duration for ${getSelectedPackage('privateOffice')?.label}`,
          type: 'select',
          required: true,
          placeholder: 'Select duration',
          options: getSelectedPackage('privateOffice')?.durations?.map(dur => ({
            value: dur.value,
            label: dur.label // HANYA LABEL SAJA
          })) || []
        }] : []),
        // STEP 3: Jika duration dipilih, tampilkan date picker
        ...(formData.privateOfficeDuration ? [{
          name: 'privateOfficeDate',
          label: `Start Date for ${getSelectedPackage('privateOffice')?.label}`,
          type: 'date',
          required: true,
          placeholder: 'Select start date'
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    // Reset dependent fields ketika parent field diubah
    let resetFields = {};
    
    if (name === 'maneka') {
      resetFields = { manekaDuration: '', manekaDate: '' };
    } else if (name === 'manekaDuration') {
      resetFields = { manekaDate: '' };
    } else if (name === 'rembug') {
      resetFields = { rembugDuration: '', rembugDate: '' };
    } else if (name === 'rembugDuration') {
      resetFields = { rembugDate: '' };
    } else if (name === 'eventSpace') {
      resetFields = { eventSpaceDuration: '', eventSpaceDate: '' };
    } else if (name === 'eventSpaceDuration') {
      resetFields = { eventSpaceDate: '' };
    } else if (name === 'privateOffice') {
      resetFields = { privateOfficeDuration: '', privateOfficeDate: '' };
    } else if (name === 'privateOfficeDuration') {
      resetFields = { privateOfficeDate: '' };
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...resetFields
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New member data for Banyumas:', formData);
    alert(`Member ${formData.full_name} added successfully to Banyumas!`);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsAddMemberModalOpen(false);
    // Reset semua field
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
      manekaDuration: '',
      manekaDate: '',
      rembugDuration: '',
      rembugDate: '',
      eventSpaceDuration: '',
      eventSpaceDate: '',
      privateOfficeDuration: '',
      privateOfficeDate: ''
    });
  };

  // Function untuk render field berdasarkan type
  const renderField = (field) => {
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
                <SelectItem 
                  key={`${field.name}-${option.value}`}
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Input untuk date type
    if (field.type === 'date') {
      return (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={field.name}
            name={field.name}
            type="date"
            value={formData[field.name]}
            onChange={handleInputChange}
            required={field.required}
            className="w-full"
          />
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
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Member - Banyumas</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new member to Banyumas branch. Select service packages and choose dates as needed.
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

export default AddMemberBanyumas;