// locationService.js - Menggunakan Fetch API
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
                return getFallbackProvinces();
            }
        } catch (error) {
            console.error('Error fetching provinces:', error.message);
            return getFallbackProvinces();
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

const getFallbackProvinces = () => {
    return [
        { value: '11', label: 'ACEH' },
        { value: '12', label: 'SUMATERA UTARA' },
        { value: '13', label: 'SUMATERA BARAT' },
        { value: '14', label: 'RIAU' },
        { value: '15', label: 'JAMBI' },
        { value: '16', label: 'SUMATERA SELATAN' },
        { value: '17', label: 'BENGKULU' },
        { value: '18', label: 'LAMPUNG' },
        { value: '19', label: 'KEPULAUAN BANGKA BELITUNG' },
        { value: '21', label: 'KEPULAUAN RIAU' },
        { value: '31', label: 'DKI JAKARTA' },
        { value: '32', label: 'JAWA BARAT' },
        { value: '33', label: 'JAWA TENGAH' },
        { value: '34', label: 'DI YOGYAKARTA' },
        { value: '35', label: 'JAWA TIMUR' },
        { value: '36', label: 'BANTEN' },
        { value: '51', label: 'BALI' },
        { value: '52', label: 'NUSA TENGGARA BARAT' },
        { value: '53', label: 'NUSA TENGGARA TIMUR' },
        { value: '61', label: 'KALIMANTAN BARAT' },
        { value: '62', label: 'KALIMANTAN TENGAH' },
        { value: '63', label: 'KALIMANTAN SELATAN' },
        { value: '64', label: 'KALIMANTAN TIMUR' },
        { value: '65', label: 'KALIMANTAN UTARA' },
        { value: '71', label: 'SULAWESI UTARA' },
        { value: '72', label: 'SULAWESI TENGAH' },
        { value: '73', label: 'SULAWESI SELATAN' },
        { value: '74', label: 'SULAWESI TENGGARA' },
        { value: '75', label: 'GORONTALO' },
        { value: '76', label: 'SULAWESI BARAT' },
        { value: '81', label: 'MALUKU' },
        { value: '82', label: 'MALUKU UTARA' },
        { value: '91', label: 'PAPUA' },
        { value: '92', label: 'PAPUA BARAT' }
    ];
};

export default locationService;