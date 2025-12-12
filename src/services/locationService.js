import axios from 'axios'

const API_BASE = 'https://ibnux.github.io/data-indonesia'

export const locationService = {
    getProvinces: async () => {
        try {
            const response = await axios.get(`${API_BASE}/provinsi.json`, {
                timeout: 10000
            })
            
            if (response.data && Array.isArray(response.data)) {
                const formattedData = response.data.map(prov => ({
                    value: prov.id,
                    label: prov.nama
                }))
                
                return formattedData
            } else {
                console.error('Invalid API response:', response.data)
                return getFallbackProvinces()
            }
        } catch (error) {
            console.error('Error fetching provinces:', error.message)
            return getFallbackProvinces()
        }
    },

    getRegencies: async (provinceId) => {
        if (!provinceId) {
            return []
        }
        
        try {
            const response = await axios.get(`${API_BASE}/kabupaten/${provinceId}.json`)
            
            if (response.data && Array.isArray(response.data)) {
                return response.data.map(regency => ({
                    value: regency.id,
                    label: regency.nama
                }))
            }
            return []
        } catch (error) {
            console.error(`Error fetching regencies for ${provinceId}:`, error.message)
            return []
        }
    },

    getDistricts: async (regencyId) => {
        if (!regencyId) {
            return []
        }
        
        try {
            const response = await axios.get(`${API_BASE}/kecamatan/${regencyId}.json`)
            
            if (response.data && Array.isArray(response.data)) {
                return response.data.map(district => ({
                    value: district.id,
                    label: district.nama 
                }))
            }
            return []
        } catch (error) {
            console.error(`Error fetching districts for ${regencyId}:`, error.message)
            return []
        }
    },

    getVillages: async (districtId) => {
        if (!districtId) {
            return []
        }
        
        try {
            const response = await axios.get(`${API_BASE}/kelurahan/${districtId}.json`)
            
            if (response.data && Array.isArray(response.data)) {
                return response.data.map(village => ({
                    value: village.id,
                    label: village.nama // 'nama' bukan 'name'
                }))
            }
            return []
        } catch (error) {
            console.error(`Error fetching villages for ${districtId}:`, error.message)
            return []
        }
    },

    getLocationNameById: async (type, id) => {
        if (!id) return ''

        try {
            let endpoint = ''
            switch(type) {
                case 'province': 
                    // Untuk ibnux API, kita harus fetch semua provinces
                    const provinces = await axios.get(`${API_BASE}/provinsi.json`)
                    const province = provinces.data.find(p => p.id === id)
                    return province ? province.nama : ''
                case 'regency': 
                    // Harus tahu provinceId dulu - ini limitation
                    // Untuk simple, coba cari di semua data
                    return `Kabupaten ${id}`
                case 'district': 
                    return `Kecamatan ${id}`
                case 'village': 
                    return `Kelurahan ${id}`
                default: return '';
            }
        } catch (error) {
            console.error(`Error getting ${type} name:`, error)
            return ''
        }
    }
}

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
    ]
}