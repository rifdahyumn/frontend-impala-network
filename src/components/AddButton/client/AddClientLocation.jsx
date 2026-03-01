import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { locationService } from "../../../services/locationService";

// Di AddClientLocation.js
export const useLocationData = (formData) => {
    const [provinces, setProvinces] = useState([]);
    const [regencies, setRegencies] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);
    const [loadingLocation, setLoadingLocation] = useState({
        provinces: false,
        regencies: false,
        districts: false,
        villages: false
    });

    const loadProvinces = async () => {
        setLoadingLocation(prev => ({ ...prev, provinces: true }));
        try {
            const provincesData = await locationService.getProvinces();
            setProvinces(provincesData || []);
        } catch (error) {
            console.error('Error fetching provinces:', error);
            toast.error('Gagal memuat data provinsi');
        } finally {
            setLoadingLocation(prev => ({ ...prev, provinces: false }));
        }
    };

    const loadRegencies = async (provinceId) => {
        if (!provinceId) {
            setRegencies([]);
            return;
        }

        setLoadingLocation(prev => ({ ...prev, regencies: true }));
        try {
            const regenciesData = await locationService.getRegencies(provinceId);
            setRegencies(regenciesData || []);
        } catch (error) {
            console.error(`Error fetching regencies:`, error);
            toast.error('Error loading regency');
            setRegencies([]);
        } finally {
            setLoadingLocation(prev => ({ ...prev, regencies: false }));
        }
    };

    const loadDistricts = async (regencyId) => {
        if (!regencyId) {
            setDistricts([]);
            return;
        }

        setLoadingLocation(prev => ({ ...prev, districts: true }));
        try {
            const districtsData = await locationService.getDistricts(regencyId);
            setDistricts(districtsData || []);
        } catch (error) {
            console.error(`Error fetching districts:`, error);
            toast.error('Gagal memuat data kecamatan');
            setDistricts([]);
        } finally {
            setLoadingLocation(prev => ({ ...prev, districts: false }));
        }
    };

    const loadVillages = async (districtId) => {
        if (!districtId) {
            setVillages([]);
            return;
        }

        setLoadingLocation(prev => ({ ...prev, villages: true }));
        try {
            const villagesData = await locationService.getVillages(districtId);
            setVillages(villagesData || []);
        } catch (error) {
            console.error(`Error fetching villages:`, error);
            toast.error('Gagal memuat data desa/kelurahan');
            setVillages([]);
        } finally {
            setLoadingLocation(prev => ({ ...prev, villages: false }));
        }
    };

    useEffect(() => {
        loadProvinces()
    }, []);

    // Efek-efek yang sudah ada untuk reset data ketika pilihan berubah
    useEffect(() => {
        if (formData.province_id) {
            loadRegencies(formData.province_id);
        } else {
            setRegencies([]);
        }
    }, [formData.province_id]);

    useEffect(() => {
        if (formData.regency_id) {
            loadDistricts(formData.regency_id);
        } else {
            setDistricts([]);
        }
    }, [formData.regency_id]);

    useEffect(() => {
        if (formData.district_id) {
            loadVillages(formData.district_id);
        } else {
            setVillages([]);
        }
    }, [formData.district_id]);

    return {
        provinces,
        regencies,
        districts,
        villages,
        loadingLocation,
        loadProvinces,
        loadRegencies,    // ✅ EXPOSE FUNGSI INI
        loadDistricts,    // ✅ EXPOSE FUNGSI INI
        loadVillages      // ✅ EXPOSE FUNGSI INI
    };
};