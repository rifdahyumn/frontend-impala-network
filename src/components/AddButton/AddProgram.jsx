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
import { X, Plus } from "lucide-react";

const AddProgram = ({ isAddProgramModalOpen, setIsAddProgramModalOpen }) => {
  // Form state untuk Add Program
  const [formData, setFormData] = useState({
    programName: '',
    programCode: '',
    category: '',
    status: 'Active',
    duration: '',
    startDate: '',
    endDate: '',
    price: '',
    capacity: '',
    instructor: [],
    location: '',
    description: '',
    tags: []
  });

  const [newInstructor, setNewInstructor] = useState('');
  const [newTag, setNewTag] = useState('');

  // Structure dengan sections untuk Program - SEMUA SECTION DIKUMPULKAN DI SINI
  const formSections = [
    {
      title: "Program Information",
      fields: [
        {
          name: 'programName',
          label: 'Program Name',
          type: 'text',
          required: true,
          placeholder: 'Enter program name'
        },
        {
          name: 'clientname',
          label: 'Client Name',
          type: 'text',
          required: true,
          placeholder: 'Enter client name'
        },
        {
          name: 'category',
          label: 'Category',
          type: 'select',
          required: true,
          placeholder: 'Select category',
          options: [
            { value: 'seminar', label: 'Seminar / Webinar' },
            { value: 'workshop', label: 'Workshop / Training' },
            { value: 'volunteer', label: 'Volunteer / Community Service' },
            { value: 'exhibition', label: 'Exhibition / Expo' }
          ]
        },
        {
          name: 'description',
          label: 'Description',
          type: 'text',
          required: true,
          placeholder: 'Enter program description'
        }
      ]
    },
    {
      title: "Schedule & Duration",
      fields: [
        {
          name: 'duration',
          label: 'Duration',
          type: 'text',
          required: true,
          placeholder: 'e.g., 3 months, 4 months'
        },
        {
          name: 'startDate',
          label: 'Start Date',
          type: 'date',
          required: true,
          placeholder: 'Select start date'
        },
        {
          name: 'endDate',
          label: 'End Date',
          type: 'date',
          required: true,
          placeholder: 'Select end date'
        },
        {
          name: 'location',
          label: 'Location',
          type: 'text',
          required: true,
          placeholder: 'Enter program location'
        }
      ]
    },
    {
      title: "Pricing & Capacity",
      fields: [
        {
          name: 'price',
          label: 'Price',
          type: 'text',
          required: true,
          placeholder: 'e.g., Rp 250.000.000'
        },
        {
          name: 'capacity',
          label: 'Capacity',
          type: 'select',
          required: true,
          placeholder: 'Select capacity',
          options: [
            { value: '1-50', label: '1-50' },
            { value: '50-100', label: '50-100' },
            { value: '100-500', label: '100-500' },
          ]
        }
      ]
    },
    {
      title: "Instructors",
      customComponent: true,
      render: () => (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newInstructor}
              onChange={(e) => setNewInstructor(e.target.value)}
              placeholder="Enter instructor name"
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddInstructor();
                }
              }}
            />
            <Button 
              type="button" 
              onClick={handleAddInstructor}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          
          {formData.instructor.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.instructor.map((instructor, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {instructor}
                  <button
                    type="button"
                    onClick={() => handleRemoveInstructor(index)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      title: "Tags",
      customComponent: true,
      render: () => (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter tag (e.g., Startup, Funding)"
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button 
              type="button" 
              onClick={handleAddTag}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )
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

  const handleAddInstructor = () => {
    if (newInstructor.trim() && !formData.instructor.includes(newInstructor.trim())) {
      setFormData(prev => ({
        ...prev,
        instructor: [...prev.instructor, newInstructor.trim()]
      }));
      setNewInstructor('');
    }
  };

  const handleRemoveInstructor = (index) => {
    setFormData(prev => ({
      ...prev,
      instructor: prev.instructor.filter((_, i) => i !== index)
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Program form submitted:', formData);
    
    alert(`Program "${formData.programName}" added successfully!`);
    setIsAddProgramModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      programName: '',
      programCode: '',
      category: '',
      status: 'Active',
      duration: '',
      startDate: '',
      endDate: '',
      price: '',
      capacity: '',
      instructor: [],
      location: '',
      description: '',
      tags: []
    });
    setNewInstructor('');
    setNewTag('');
  };

  const handleCloseModal = () => {
    setIsAddProgramModalOpen(false);
    resetForm();
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

    // Untuk textarea
    if (field.type === 'textarea') {
      return (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <textarea
            id={field.name}
            name={field.name}
            value={formData[field.name]}
            onChange={handleInputChange}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
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
    <Dialog open={isAddProgramModalOpen} onOpenChange={setIsAddProgramModalOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Program</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new program to the system.
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

              {/* Section Fields - untuk section biasa */}
              {!section.customComponent && (
                <div className={`grid gap-4 ${
                  section.fields.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 
                  section.fields.length === 4 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                }`}>
                  {section.fields.map(renderField)}
                </div>
              )}

              {/* Custom Component - untuk Instructors dan Tags */}
              {section.customComponent && section.render && (
                <div className="grid grid-cols-1">
                  {section.render()}
                </div>
              )}

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
              Add Program
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProgram;