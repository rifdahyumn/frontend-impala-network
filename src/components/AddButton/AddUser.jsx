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

const AddUser = ({ isAddUserModalOpen, setIsAddUserModalOpen }) => {
  // Form state untuk Add User
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    position: '',
    role: '',
    phone: ''
  });

  // Structure dengan sections
  const formSections = [
    {
      title: "Account Information",
      fields: [
        {
          name: 'employeeid',
          label: 'Employee Id',
          type: 'text',
          required: true,
          placeholder: 'Enter employee id'
        },
        {
          name: 'username',
          label: 'Username',
          type: 'text',
          required: true,
          placeholder: 'Enter username'
        },
        {
          name: 'password',
          label: 'Password',
          type: 'email',
          required: true,
          placeholder: 'Enter password'
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          placeholder: 'Enter email address'
        },
        {
          name: 'role',
          label: 'Role',
          type: 'select',
          required: true,
          placeholder: 'Select Role',
          options: [
            { value: 'admin', label: 'Admin' },
            { value: 'manajer_Program', label: 'Manajer Program' },
            { value: 'staff', label: 'Community Team' }
          ]
        }
      ]
    },
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
          name: 'phone',
          label: 'Phone',
          type: 'tel',
          required: true,
          placeholder: 'Enter phone number'
        },
        {
          name: 'position',
          label: 'Position',
          type: 'select',
          required: true,
          placeholder: 'Select Position',
          options: [
            { value: 'managing_Director', label: 'Managing Director' },
            { value: 'director', label: 'Director' },
            { value: 'general_Secretary', label: 'Head Manager' },
            { value: 'finance', label: 'Finance' },
            { value: 'legal', label: 'Legal' },
            { value: 'talent_Manager', label: 'Talent Manager' },
            { value: 'ecosystem_Manager', label: 'Ecosystem Manager' },
            { value: 'strategic_Partnership_Executive', label: 'Strategic Partnership Executive' },
            { value: 'program_Manager', label: 'Program Manager' },
            { value: 'space_Manager', label: 'Space Manager' },
            { value: 'creative', label: 'Creative' }
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
    console.log('Form submitted:', formData);
    // Handle form submission logic here
    alert(`User ${formData.fullName} added successfully!`);
    setIsAddUserModalOpen(false);
    // Reset form
    setFormData({
      fullName: '',
      username: '',
      email: '',
      position: '',
      role: '',
      phone: ''
    });
  };

  const handleCloseModal = () => {
    setIsAddUserModalOpen(false);
    // Reset form ketika modal ditutup
    setFormData({
      fullName: '',
      username: '',
      email: '',
      position: '',
      role: '',
      phone: ''
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
    <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new user to the system.
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
              Add User
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUser;