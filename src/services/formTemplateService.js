const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

class FormTemplateService {
    async getAllFormTemplates() {
        try {
            const response = await fetch(`${API_BASE_URL}/form-templates`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            return await response.json()
        } catch (error) {
            console.error('Error fetching form templates:', error)
            throw error
        }
    }

    async createFormTemplate(templateData) {
        try {
            const whatsapp_group_link = templateData.form_config?.settings?.whatsappGroupLink || "";
            const after_submit_message = templateData.form_config?.settings?.afterSubmitMessage || 
                "Terima kasih telah mendaftar!";

            const payload = {
                program_name: templateData.program_name,
                form_config: templateData.form_config,
                whatsapp_group_link: whatsapp_group_link,
                after_submit_message: after_submit_message
            }

            const response = await fetch(`${API_BASE_URL}/form-templates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            return await response.json()
        } catch (error) {
            console.error('Error creating form templates:', error)
            throw error
        }
    }

    async publishFormTemplate(templateId) {
        try {
            const response = await fetch(`${API_BASE_URL}/form-templates/${templateId}/publish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            return await response.json()
        } catch (error) {
            console.error('Error publishing form template:', error)
            throw error
        }
    }

    async getFormTemplateBySlug(slug) {
        try {
            const response = await fetch(`${API_BASE_URL}/form-templates/${slug}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            if (result.data && result.data.form_config) {
                result.data.form_config.settings = {
                    whatsappGroupLink: result.data.whatsapp_group_link || 
                                     result.data.form_config?.settings?.whatsappGroupLink || "",
                    afterSubmitMessage: result.data.after_submit_message || 
                                       result.data.form_config?.settings?.afterSubmitMessage || 
                                       "Terima kasih telah mendaftar!"
                };
            }

            return result;
        } catch (error) {
            console.error('Error fetching form template by slug:', error);
            throw error;
        }
    }

    async deleteFormTemplate(templateId) {
        try {
            const response = await fetch(`${API_BASE_URL}/form-templates/${templateId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`)
            }

            return result
        } catch (error) {
            console.error('Error deleing form:', error)
            throw error
        }
    }

    async getPublishedFormTemplates() {
        try {
            const response = await fetch(`${API_BASE_URL}/form-templates/published`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const result = await response.json();

                if (result.data && Array.isArray(result.data)) {
                    result.data = result.data.map(template => ({
                        ...template,
                        has_whatsapp_group: !!(template.whatsapp_group_link || template.form_config?.settings?.whatsappGroupLink),
                        form_config: {
                            ...template.form_config,
                            settings: {
                                whatsappGroupLink: template.whatsapp_group_link || 
                                                 template.form_config?.settings?.whatsappGroupLink || "",
                                afterSubmitMessage: template.after_submit_message || 
                                                  template.form_config?.settings?.afterSubmitMessage || 
                                                  "Terima kasih telah mendaftar!"
                            }
                        }
                    }))
                }

                return result
            }

            const allTemplates = await this.getAllFormTemplates();
            const publishedTemplates = allTemplates.data?.filter(t => t.is_published) || [];

            const processedTemplates = publishedTemplates.map(template => ({
                ...template,
                has_whatsapp_group: !!(template.whatsapp_group_link || template.form_config?.settings?.whatsappGroupLink),
                form_config: {
                    ...template.form_config,
                    settings: {
                        whatsappGroupLink: template.whatsapp_group_link || 
                                         template.form_config?.settings?.whatsappGroupLink || "",
                        afterSubmitMessage: template.after_submit_message || 
                                          template.form_config?.settings?.afterSubmitMessage || 
                                          "Terima kasih telah mendaftar!"
                    }
                }
            }))

            return {
                success: true,
                message: 'Published templates retrieved successfully',
                data: processedTemplates
            };

        } catch (error) {
            console.error('Error fetching published templates:', error);
            
            return {
                success: false,
                message: 'Failed to fetch published templates',
                data: []
            };
        }
    }

    async updateFormTemplate(templateId, templateData) {
        try {
            const whatsapp_group_link = templateData.form_config?.settings?.whatsappGroupLink || ""
            const after_submit_message = templateData.form_config?.settings?.afterSubmitMessage || "Terima kasih telah mendaftar program ini!"

            const payload = {
                program_name: templateData.program_name,
                form_config: templateData.form_config,
                whatsapp_group_link: whatsapp_group_link,
                after_submit_message: after_submit_message
            }

            const response = await fetch(`${API_BASE_URL}/form-templates/${templateId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            return result
        } catch (error) {
            console.error('Error updating form template:', error);
            throw error;
        }
    }
}

export default new FormTemplateService()