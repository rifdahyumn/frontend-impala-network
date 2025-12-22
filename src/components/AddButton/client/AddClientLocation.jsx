import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { locationService } from "../../../services/locationService";

export const useLocationData = (formData, setFormData) => {
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

    useEffect(() => {
        loadProvinces()
    }, [])

    useEffect(() => {
        const loadRegencies = async () => {
            if (!formData.province_id) {
                setRegencies([]);
                return;
            }

            setLoadingLocation(prev => ({ ...prev, regencies: true }));
            try {
                const regenciesData = await locationService.getRegencies(formData.province_id);
                setRegencies(regenciesData || []);
                
                setFormData(prev => ({
                    ...prev,
                    regency_id: '',
                    district_id: '',
                    village_id: '',
                    regency_name: '',
                    district_name: '',
                    village_name: ''
                }));
                setDistricts([]);
                setVillages([]);
            } catch (error) {
                console.error(`Error fetching regencies:`, error);
                toast.error('Error loading regency');
                setRegencies([]);
            } finally {
                setLoadingLocation(prev => ({ ...prev, regencies: false }));
            }
        };

        loadRegencies();
    }, [formData.province_id]);

    useEffect(() => {
        const loadDistricts = async () => {
            if (!formData.regency_id) {
                setDistricts([]);
                return;
            }

            setLoadingLocation(prev => ({ ...prev, districts: true }));
            try {
                const districtsData = await locationService.getDistricts(formData.regency_id);
                setDistricts(districtsData || []);
                
                setFormData(prev => ({
                    ...prev,
                    district_id: '',
                    village_id: '',
                    district_name: '',
                    village_name: ''
                }));
                setVillages([]);
            } catch (error) {
                console.error(`Error fetching districts:`, error);
                toast.error('Gagal memuat data kecamatan');
                setDistricts([]);
            } finally {
                setLoadingLocation(prev => ({ ...prev, districts: false }));
            }
        };

        loadDistricts();
    }, [formData.regency_id]);

    useEffect(() => {
        const loadVillages = async () => {
            if (!formData.district_id) {
                setVillages([]);
                return;
            }

            setLoadingLocation(prev => ({ ...prev, villages: true }));
            try {
                const villagesData = await locationService.getVillages(formData.district_id);
                setVillages(villagesData || []);
                
                setFormData(prev => ({
                    ...prev,
                    village_id: '',
                    village_name: ''
                }));
            } catch (error) {
                console.error(`Error fetching villages:`, error);
                toast.error('Gagal memuat data desa/kelurahan');
                setVillages([]);
            } finally {
                setLoadingLocation(prev => ({ ...prev, villages: false }));
            }
        };

        loadVillages();
    }, [formData.district_id]);

    return {
        provinces,
        regencies,
        districts,
        villages,
        loadingLocation,
        loadProvinces
    };
};