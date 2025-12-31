import React from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import PublicFormLoading from './PublicFormLoading';
import PublicFormError from './PublicFormError';
import PublicFormContent from './PublicFormContent';
import PublicFormSuccess from './PublicFormSuccess';
import useFormConfig from './useFormConfig';
import useFormData from './useFormData';

const PublicForm = () => {
    const { slug } = useParams();
    const { toast } = useToast();
    
    const {
        template,
        formConfig,
        isLoading,
        loadError,
        hasTimeout
    } = useFormConfig(slug, toast);
    
    const {
        formData,
        setFormData,
        isSubmitting,
        selectedCategory,
        setSelectedCategory,
        submissionSuccess,
        submittedData,
        termsAccepted,
        setTermsAccepted,
        locationData,
        loadingLocation,
        handleInputChange,
        handleCategorySelect,
        handleSubmit,
        getSubmitButtonStatus
    } = useFormData(template, formConfig, toast);

    if (isLoading) {
        return <PublicFormLoading hasTimeout={hasTimeout} slug={slug} />;
    }

    if (loadError) {
        return <PublicFormError loadError={loadError} hasTimeout={hasTimeout} slug={slug} />;
    }

    if (submissionSuccess) {
        return (
            <PublicFormSuccess 
                template={template}
                submittedData={submittedData}
                getAfterSubmitMessage={() => {
                    if (template?.after_submit_message) return template.after_submit_message;
                    if (template?.form_config?.settings?.afterSubmitMessage) return template.form_config.settings.afterSubmitMessage;
                    return "Terima kasih telah mendaftar program kami.";
                }}
            />
        );
    }

    const getProgramName = () => {
        if (template) return template.program_name;
        if (formConfig?.programName) return formConfig.programName;
        return 'Program Impala';
    };

    const getFormTitle = () => {
        if (formConfig && formConfig.title) return formConfig.title;
        return `Pendaftaran Program ${getProgramName()}`;
    };

    const getFormHeaderTitle = () => {
        if (formConfig && formConfig.title) return `Form ${formConfig.title}`;
        return `Form Pendaftaran Program ${getProgramName()}`;
    };

    return (
        <PublicFormContent
            template={template}
            formConfig={formConfig}
            formData={formData}
            setFormData={setFormData}
            isSubmitting={isSubmitting}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            termsAccepted={termsAccepted}
            setTermsAccepted={setTermsAccepted}
            locationData={locationData}
            loadingLocation={loadingLocation}
            handleInputChange={handleInputChange}
            handleCategorySelect={handleCategorySelect}
            handleSubmit={handleSubmit}
            getSubmitButtonStatus={getSubmitButtonStatus}
            getProgramName={getProgramName}
            getFormTitle={getFormTitle}
            getFormHeaderTitle={getFormHeaderTitle}
        />
    );
};

export default PublicForm;