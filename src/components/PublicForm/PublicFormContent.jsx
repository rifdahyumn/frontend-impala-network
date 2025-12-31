import React from 'react';
// import FormField from '../FormBuilder/fields/FormField';
import CategorySelector from './CategorySelector';
import TermsAndConditions from './TermsAndConditions';
import FormHeader from './FormHeader';
import PersonalInfoSection from './sections/PersonalInfoSection';
import CategoryInfoSection from './sections/CategoryInfoSection';
import SubmitSection from './sections/SubmitSection';
// import { Button } from '../ui/button';
import { getPersonalInfoFields, getCategoryFields } from './utils/formFieldHelpers';

const PublicFormContent = ({
    // template,
    formConfig,
    formData,
    isSubmitting,
    selectedCategory,
    // setSelectedCategory,
    termsAccepted,
    setTermsAccepted,
    locationData,
    loadingLocation,
    handleInputChange,
    handleCategorySelect,
    handleSubmit,
    getSubmitButtonStatus,
    getProgramName,
    getFormTitle,
    getFormHeaderTitle
}) => {
    const personalFields = getPersonalInfoFields(formConfig, formData, locationData, loadingLocation);
    const categoryFields = getCategoryFields(formConfig, selectedCategory);

    const renderCustomDisabilityField = () => {
        if (formData.disability_status !== 'Lainnya') return null;
        
        return (
            <div className="space-y-2">
                <label htmlFor="disability_type" className="text-gray-900">
                    Jenis Disabilitas (jika memilih Lainnya)
                </label>
                <input
                    id="disability_type"
                    name="disability_type"
                    type="text"
                    value={formData.disability_type || ''}
                    onChange={(e) => handleInputChange('disability_type', e.target.value)}
                    placeholder="Jelaskan jenis disabilitas Anda"
                    className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <FormHeader
                    formTitle={getFormTitle()}
                    formHeaderTitle={getFormHeaderTitle()}
                />
                
                {/* Form Content */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 text-center">
                        <h2 className="text-xl font-semibold">
                            {getFormHeaderTitle()}
                        </h2>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            {/* Personal Info Section */}
                            <PersonalInfoSection
                                personalFields={personalFields}
                                formData={formData}
                                handleInputChange={handleInputChange}
                                renderCustomDisabilityField={renderCustomDisabilityField}
                            />

                            {/* Category Selector */}
                            <CategorySelector
                                selectedCategory={selectedCategory}
                                handleCategorySelect={handleCategorySelect}
                            />

                            {/* Category Info Section */}
                            {selectedCategory && categoryFields.length > 0 && (
                                <CategoryInfoSection
                                    selectedCategory={selectedCategory}
                                    categoryFields={categoryFields}
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                />
                            )}

                            {/* Terms and Conditions */}
                            <TermsAndConditions
                                termsAccepted={termsAccepted}
                                setTermsAccepted={setTermsAccepted}
                                programName={getProgramName()}
                            />

                            {/* Submit Section */}
                            <SubmitSection
                                isSubmitting={isSubmitting}
                                getSubmitButtonStatus={getSubmitButtonStatus}
                            />
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicFormContent;