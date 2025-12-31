import { useState, useEffect } from 'react';
import formTemplateService from '../../services/formTemplateService';

const useFormConfig = (slug, toast) => {
    const [template, setTemplate] = useState(null);
    const [formConfig, setFormConfig] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [hasTimeout, setHasTimeout] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const loadFormFromAPI = async () => {
            try {
                setIsLoading(true);
                setLoadError(null);
                setHasTimeout(false);

                if (!slug) {
                    throw new Error('Slug tidak ditemukan di URL');
                }
                
                const timeoutId = setTimeout(() => {
                    if (isMounted) {
                        setHasTimeout(true);
                        setLoadError('Waktu memuat formulir habis. Silakan coba lagi.');
                        setIsLoading(false);
                    }
                }, 10000);

                const response = await formTemplateService.getFormTemplateBySlug(slug);
                clearTimeout(timeoutId);
                
                if (isMounted && response.success && response.data) {
                    const templateData = response.data;
                    setTemplate(templateData);
                    setFormConfig(templateData.form_config);
                    
                    toast({
                        title: "Form Dimuat",
                        description: `Form "${templateData.program_name}" berhasil dimuat`,
                        variant: "default"
                    });
                } else if (isMounted) {
                    throw new Error(response.message || 'Form tidak ditemukan di database');
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error loading form from API:', error);
                    if (!hasTimeout) {
                        setLoadError(error.message || 'Gagal memuat form');
                        toast({
                            title: "Form Tidak Ditemukan",
                            description: `Form dengan slug "${slug}" tidak tersedia.`,
                            variant: "destructive"
                        });
                    }
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadFormFromAPI();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [slug, toast]);

    useEffect(() => {
        if (template) {
            let tabTitle = 'Impala Network';
            
            if (template.program_name) {
                tabTitle = `${template.program_name} | Impala Network`;
            } else if (template.form_config && template.form_config.title) {
                const fullTitle = template.form_config.title;
                if (fullTitle.includes('Program ')) {
                    const parts = fullTitle.split('Program ');
                    if (parts.length > 1) {
                        tabTitle = `${parts[1]} | Impala Network`;
                    } else {
                        tabTitle = `${fullTitle} | Impala Network`;
                    }
                } else {
                    tabTitle = `${fullTitle} | Impala Network`;
                }
            }
            
            document.title = tabTitle;
        } else {
            document.title = 'Impala Network';
        }
        
        return () => {
            document.title = 'Impala Network';
        };
    }, [template]);

    return {
        template,
        formConfig,
        isLoading,
        loadError,
        hasTimeout
    };
};

export default useFormConfig;