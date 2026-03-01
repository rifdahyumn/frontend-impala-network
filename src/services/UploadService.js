import clientService from './clientService';

class UploadService {
    async uploadLogo(file) {
        return clientService.uploadLogo(file);
    }

    async deleteLogo(logoUrl) {
        return clientService.deleteLogo(logoUrl);
    }

    validateImage(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        const maxSize = 2 * 1024 * 1024; 

        if (!validTypes.includes(file.type)) {
            return {
                valid: false,
                error: 'Invalid file type. Please upload an image file (JPEG, PNG, GIF, WEBP, SVG)'
            };
        }

        if (file.size > maxSize) {
            return {
                valid: false,
                error: 'File too large. Maximum size is 2MB'
            };
        }

        return { valid: true };
    }

    getLogoPreviewUrl(file) {
        if (!file) return null;
        return URL.createObjectURL(file);
    }

    revokePreviewUrl(url) {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    }
}

export default new UploadService();