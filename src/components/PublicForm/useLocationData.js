import { useState, useEffect, useCallback } from 'react';
import locationService from '../../services/locationService';

const useLocationData = (formConfig, toast) => {
    const [locationData, setLocationData] = useState({
        provinces: [],
        regencies: [],
        districts: [],
        villages: [],
    });
    const [loadingLocation, setLoadingLocation] = useState({
        provinces: false,
        regencies: false,
        districts: false,
        villages: false,
    });

    const loadProvinces = useCallback(async () => {
        try {
            setLoadingLocation(prev => ({ ...prev, provinces: true }));
            const provincesData = await locationService.getProvinces();
            
            if (provincesData && Array.isArray(provincesData)) {
                setLocationData(prev => ({ ...prev, provinces: provincesData }));
            } else {
                console.error('Failed to load provinces');
            }
        } catch (error) {
            console.error('Error loading provinces:', error);
            toast({
                title: "Error",
                description: "Failed to load province data",
                variant: 'destructive'
            });
        } finally {
            setLoadingLocation(prev => ({ ...prev, provinces: false }));
        }
    }, [toast]);

    const loadRegencies = useCallback(async (provinceId) => {
        if (!provinceId) {
            setLocationData(prev => ({ ...prev, regencies: [], districts: [], villages: [] }));
            return;
        }

        try {
            setLoadingLocation(prev => ({ ...prev, regencies: true }));
            const regenciesData = await locationService.getRegencies(provinceId);

            if (regenciesData && Array.isArray(regenciesData)) {
                setLocationData(prev => ({
                    ...prev,
                    regencies: regenciesData,
                    districts: [],
                    villages: []
                }));
            }
        } catch (error) {
            console.error('Error loading regencies:', error);
        } finally {
            setLoadingLocation(prev => ({ ...prev, regencies: false }));
        }
    }, []);

    const loadDistricts = useCallback(async (regencyId) => {
        if (!regencyId) {
            setLocationData(prev => ({ ...prev, districts: [], villages: [] }));
            return;
        }

        try {
            setLoadingLocation(prev => ({ ...prev, districts: true }));
            const districtsData = await locationService.getDistricts(regencyId);

            if (districtsData && Array.isArray(districtsData)) {
                setLocationData(prev => ({
                    ...prev,
                    districts: districtsData,
                    villages: []
                }));
            }
        } catch (error) {
            console.error('Error loading districts:', error);
        } finally {
            setLoadingLocation(prev => ({ ...prev, districts: false }));
        }
    }, []);

    const loadVillages = useCallback(async (districtId) => {
        if (!districtId) {
            setLocationData(prev => ({ ...prev, villages: [] }));
            return;
        }

        try {
            setLoadingLocation(prev => ({ ...prev, villages: true }));
            const villagesData = await locationService.getVillages(districtId);

            if (villagesData && Array.isArray(villagesData)) {
                setLocationData(prev => ({ ...prev, villages: villagesData }));
            }
        } catch (error) {
            console.error('Error loading villages:', error);
        } finally {
            setLoadingLocation(prev => ({ ...prev, villages: false }));
        }
    }, []);

    const handleLocationChange = useCallback((fieldName, value, currentFormData) => {
        const newData = { ...currentFormData, [fieldName]: value };
        
        if (fieldName === 'province_id') {
            newData.regency_id = '';
            newData.district_id = '';
            newData.village_id = '';
            loadRegencies(value);
        } else if (fieldName === 'regency_id') {
            newData.district_id = '';
            newData.village_id = '';
            loadDistricts(value);
        } else if (fieldName === 'district_id') {
            newData.village_id = '';
            loadVillages(value);
        }
        
        return newData;
    }, [loadRegencies, loadDistricts, loadVillages]);

    useEffect(() => {
        if (formConfig) {
            loadProvinces();
        }
    }, [formConfig, loadProvinces]);

    return {
        locationData,
        loadingLocation,
        handleLocationChange
    };
};

export default useLocationData;