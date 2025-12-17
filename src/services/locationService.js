const API_BASE = 'https://ibnux.github.io/data-indonesia'

const fetchWithTimeout = async (url, options = {}) => {
    const timeout = 10000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const locationService = {
    getProvinces: async () => {
        try {
            const data = await fetchWithTimeout(`${API_BASE}/provinsi.json`);
            
            if (data && Array.isArray(data)) {
                const formattedData = data.map(prov => ({
                    value: prov.id,
                    label: prov.nama
                }));
                
                return formattedData;
            } else {
                console.error('Invalid API response:', data);
                // return getFallbackProvinces();
            }
        } catch (error) {
            console.error('Error fetching provinces:', error.message);
            // return getFallbackProvinces();
        }
    },

    getRegencies: async (provinceId) => {
        if (!provinceId) {
            return [];
        }
        
        try {
            const data = await fetch(`${API_BASE}/kabupaten/${provinceId}.json`);
            const response = await data.json();
            
            if (response && Array.isArray(response)) {
                return response.map(regency => ({
                    value: regency.id,
                    label: regency.nama
                }));
            }
            return [];
        } catch (error) {
            console.error(`Error fetching regencies for ${provinceId}:`, error.message);
            return [];
        }
    },

    getDistricts: async (regencyId) => {
        if (!regencyId) {
            return [];
        }
        
        try {
            const data = await fetch(`${API_BASE}/kecamatan/${regencyId}.json`);
            const response = await data.json();
            
            if (response && Array.isArray(response)) {
                return response.map(district => ({
                    value: district.id,
                    label: district.nama 
                }));
            }
            return [];
        } catch (error) {
            console.error(`Error fetching districts for ${regencyId}:`, error.message);
            return [];
        }
    },

    getVillages: async (districtId) => {
        if (!districtId) {
            return [];
        }
        
        try {
            const data = await fetch(`${API_BASE}/kelurahan/${districtId}.json`);
            const response = await data.json();
            
            if (response && Array.isArray(response)) {
                return response.map(village => ({
                    value: village.id,
                    label: village.nama
                }));
            }
            return [];
        } catch (error) {
            console.error(`Error fetching villages for ${districtId}:`, error.message);
            return [];
        }
    },

    getLocationNameById: async (type, id) => {
        if (!id) return '';

        try {
            let endpoint = '';
            switch(type) {
                case 'province': 
                    const provinces = await fetch(`${API_BASE}/provinsi.json`);
                    const provincesData = await provinces.json();
                    const province = provincesData.find(p => p.id === id);
                    return province ? province.nama : '';
                case 'regency': 
                    return `Kabupaten ${id}`;
                case 'district': 
                    return `Kecamatan ${id}`;
                case 'village': 
                    return `Kelurahan ${id}`;
                default: return '';
            }
        } catch (error) {
            console.error(`Error getting ${type} name:`, error);
            return '';
        }
    }
};
export default locationService;