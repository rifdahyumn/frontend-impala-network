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

const AddMemberSurakarta = ({ isAddMemberModalOpen, setIsAddMemberModalOpen }) => {
  // Form state untuk Add Member Surakarta
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
    postalCode:'',
    bussinessName:'',
    maneka: '',
    rembug: '',
    eventSpace: '',
    privateOffice: '',
    addInformation: ''
  });

  // Structure dengan sections untuk Surakarta
  const formSections = [
    {
      title: "Personal Information",
      fields: [
        {
          name: 'member_id',
          label: 'Member ID',
          type: 'text',
          required: true,
          placeholder: 'MEM-SRK-XXX'
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
            { value: 's1', label: 'Bachleor Degree (S1)' },
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
        {
          name: 'maneka',
          label: 'Maneka Package',
          type: 'select',
          required: false,
          placeholder: 'Select maneka package',
          options: [
            { value: 'personal', label: 'Personal Membership' },
            { value: 'group', label: 'Group Membership' }
          ]
        },
        {
          name: 'rembug',
          label: 'Rembug Package',
          type: 'select',
          required: false,
          placeholder: 'Select rembug package',
          options: [
            { value: '1', label: 'Rembug 1' },
            { value: '2', label: 'Rembug 2' },
            { value: '3', label: 'Rembug 3' },
          ]
        },
        {
          name: 'eventSpace',
          label: 'Event Space',
          type: 'select',
          required: false,
          placeholder: 'Select event space',
          options: [
            { value: 'gatra', label: 'Gatra' },
            { value: 'maneka', label: 'Maneka' },
            { value: 'outdoor', label: 'Outdoor' },
          ]
        },
        {
          name: 'privateOffice',
          label: 'Private Office',
          type: 'select',
          required: false,
          placeholder: 'Select private office',
          options: [
            { value: '1-3', label: 'Private Offive 1-3' },
            { value: '4&5', label: 'Private Offive 4&5' },
            { value: '6', label: 'Private Offive 6' },
          ]
        }
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
            { value: 'event', label: 'Event / Exhibiton' },
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New member data for Surakarta:', formData);
    alert(`Member ${formData.full_name} added successfully to Surakarta!`);
    setIsAddMemberModalOpen(false);
    // Reset form
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
      postalCode:'',
      bussinessName:'',
      maneka: '',
      rembug: '',
      eventSpace: '',
      privateOffice: '',
      addInformation: ''
    });
  };

  const handleCloseModal = () => {
    setIsAddMemberModalOpen(false);
    // Reset form ketika modal ditutup
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
      postalCode:'',
      bussinessName:'',
      maneka: '',
      rembug: '',
      eventSpace: '',
      privateOffice: '',
      addInformation: ''
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
                <SelectItem key={option.value} value={option.value}>
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
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Member - Surakarta</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new member to Surakarta branch.
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
                {section.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {section.description}
                  </p>
                )}
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

export default AddMemberSurakarta;