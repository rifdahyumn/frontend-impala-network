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

const AddClient = ({ isAddUserModalOpen, setIsAddUserModalOpen }) => {
  // Form state untuk Add Client - DIPERBAIKI: tambah field yang missing
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    programname: '',
    joindate: '',
    gender: '',
    position: '',
    businesstype: '',
    totalemployee: ''
  });

  // Structure dengan sections - YANG SUDAH DIPERBAIKI
  const formSections = [
    {
      title: "Personal Information",
      fields: [
        {
          name: 'fullName',
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
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' }
          ]
        },
        {
          name: 'position',
          label: 'Position',
          type: 'text',
          required: true,
          placeholder: 'Enter position'
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
          placeholder: 'Enter company name'
        },
        {
          name: 'businesstype',
          label: 'Business Type',
          type: 'select',
          required: true,
          placeholder: 'Select business type',
          options: [
            { value: 'retail', label: 'Retail' },
            { value: 'technology', label: 'Technology' },
            { value: 'healthcare', label: 'Healthcare' },
            { value: 'finance', label: 'Finance' },
            { value: 'education', label: 'Education' }
          ]
        },
        {
          name: 'totalemployee',
          label: 'Total Employee',
          type: 'select',
          required: true,
          placeholder: 'Select total employee',
          options: [
            { value: '1-50', label: '1-50 employees' },
            { value: '50-100', label: '50-100 employees' },
            { value: '100-500', label: '100-500 employees' },
            { value: '500-1000', label: '500-1000 employees' },
            { value: '1000+', label: '1000+ employees' }
          ]
        },
      ]
    },
    {
      title: "Program",
      fields: [
        {
          name: 'programname',
          label: 'Program Name',
          type: 'text',
          required: true,
          placeholder: 'Enter program name'
        },
        {
          name: 'joindate',
          label: 'Join Date',
          type: 'date',
          required: true,
          placeholder: 'Select join date'
        },
      ]
    },
    {
      title: "Location",
      fields: [
        {
          name: 'address',
          label: 'Adress',
          type: 'text',
          required: true,
          placeholder: 'Enter address'
        },
        {
          name: 'city',
          label: 'City',
          type: 'text',
          required: true,
          placeholder: 'Enter city'
        },
        {
          name: 'country',
          label: 'Country',
          type: 'text',
          required: true,
          placeholder: 'Enter country'
        },
      ]
    },
    {
      title: "Additional Information",
      fields: [
        {
          name: 'notes',
          label: 'Notes',
          type: 'text',
          required: false,
          placeholder: 'Enter notes'
        },
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
    console.log('Form submitted:', formData);
    // Handle form submission logic here
    alert(`Client ${formData.fullName} added successfully!`);
    setIsAddUserModalOpen(false);
    // Reset form - DIPERBAIKI: tambah semua field
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      company: '',
      programname: '',
      joindate: '',
      gender: '',
      position: '',
      businesstype: '',
      totalemployee: ''
    });
  };

  const handleCloseModal = () => {
    setIsAddUserModalOpen(false);
    // Reset form ketika modal ditutup - DIPERBAIKI: tambah semua field
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      company: '',
      programname: '',
      joindate: '',
      gender: '',
      position: '',
      businesstype: '',
      totalemployee: ''
    });
  };

  // Function untuk render field berdasarkan type - DIPERBAIKI: handle date type
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

    // Default input field (termasuk date)
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
    <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new client to the system.
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
              Add Client
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddClient;