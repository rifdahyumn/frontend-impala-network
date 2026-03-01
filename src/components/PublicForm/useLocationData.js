import { useState, useEffect, useCallback, useRef } from 'react';
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

    const loadedRef = useRef({
        regencies: false,
        districts: false,
        villages: false
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
            return;
        }

        if (loadedRef.current.regencies && locationData.regencies.length > 0) {
            return;
        }

        try {
            setLoadingLocation(prev => ({ ...prev, regencies: true }));
            const regenciesData = await locationService.getRegencies(provinceId);

            if (regenciesData && Array.isArray(regenciesData)) {
                setLocationData(prev => ({
                    ...prev,
                    regencies: regenciesData,
                }));
                loadedRef.current.regencies = true; 
            }
        } catch (error) {
            console.error('Error loading regencies:', error);
        } finally {
            setLoadingLocation(prev => ({ ...prev, regencies: false }));
        }
    }, [locationData.regencies.length]);

    const loadDistricts = useCallback(async (regencyId) => {
        if (!regencyId) {
            return;
        }

        if (loadedRef.current.districts && locationData.districts.length > 0) {
            return;
        }

        try {
            setLoadingLocation(prev => ({ ...prev, districts: true }));
            const districtsData = await locationService.getDistricts(regencyId);

            if (districtsData && Array.isArray(districtsData)) {
                setLocationData(prev => ({
                    ...prev,
                    districts: districtsData,
                }));
                loadedRef.current.districts = true; 
            }
        } catch (error) {
            console.error('Error loading districts:', error);
        } finally {
            setLoadingLocation(prev => ({ ...prev, districts: false }));
        }
    }, [locationData.districts.length]);

    const loadVillages = useCallback(async (districtId) => {
        if (!districtId) {
            return;
        }

        if (loadedRef.current.villages && locationData.villages.length > 0) {
            return;
        }

        try {
            setLoadingLocation(prev => ({ ...prev, villages: true }));
            const villagesData = await locationService.getVillages(districtId);

            if (villagesData && Array.isArray(villagesData)) {
                setLocationData(prev => ({ ...prev, villages: villagesData }));
                loadedRef.current.villages = true; 
            }
        } catch (error) {
            console.error('Error loading villages:', error);
        } finally {
            setLoadingLocation(prev => ({ ...prev, villages: false }));
        }
    }, [locationData.villages.length]);

    const handleLocationChange = useCallback((fieldName, value, currentFormData) => {
        const newData = { ...currentFormData, [fieldName]: value };
        
        if (fieldName === 'province_id') {
            newData.regency_id = '';
            newData.district_id = '';
            newData.village_id = '';
            loadedRef.current.regencies = false;
            loadedRef.current.districts = false;
            loadedRef.current.villages = false;
            loadRegencies(value);
        } else if (fieldName === 'regency_id') {
            newData.district_id = '';
            newData.village_id = '';
            loadedRef.current.districts = false;
            loadedRef.current.villages = false;
            loadDistricts(value);
        } else if (fieldName === 'district_id') {
            newData.village_id = '';
            loadedRef.current.villages = false;
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