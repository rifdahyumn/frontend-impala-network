// eslint-disable-next-line no-undef
const API_BASE_URL = process.env.BASE_API_URL || 'http://localhost:3000/api';

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
            const response = await fetch(`${API_BASE_URL}/form-templates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(templateData)
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
}

export default new FormTemplateService()