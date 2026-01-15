import React from 'react';
import CategorySelector from './CategorySelector';
import TermsAndConditions from './TermsAndConditions';
import FormHeader from './FormHeader';
import PersonalInfoSection from './sections/PersonalInfoSection';
import CategoryInfoSection from './sections/CategoryInfoSection';
import SubmitSection from './sections/SubmitSection';
import { getPersonalInfoFields, getCategoryFields } from './utils/formFieldHelpers';

const PublicFormContent = ({
    formConfig,
    formData,
    isSubmitting,
    selectedCategory,
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <FormHeader
                    formTitle={getFormTitle()}
                    formHeaderTitle={getFormHeaderTitle()}
                />
                
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 text-center">
                        <h2 className="text-xl font-semibold">
                            {getFormHeaderTitle()}
                        </h2>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            <PersonalInfoSection
                                personalFields={personalFields}
                                formData={formData}
                                handleInputChange={handleInputChange}
                            />

                            <CategorySelector
                                selectedCategory={selectedCategory}
                                handleCategorySelect={handleCategorySelect}
                            />

                            {selectedCategory && categoryFields.length > 0 && (
                                <CategoryInfoSection
                                    selectedCategory={selectedCategory}
                                    categoryFields={categoryFields}
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                />
                            )}

                            <TermsAndConditions
                                termsAccepted={termsAccepted}
                                setTermsAccepted={setTermsAccepted}
                                programName={getProgramName()}
                            />

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