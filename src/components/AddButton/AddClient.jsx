import { useEffect, useState } from "react";
import AddClientForm from "../AddButton/client/AddClientForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import locationService from "../../services/locationService";
import toast from "react-hot-toast";

const AddClient = ({ isAddUserModalOpen, setIsAddUserModalOpen, onAddClient, editData = null, onEditClient = null }) => {
    const isEditMode = !!editData;

    const [regencies, setRegencies] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);

    const resetLocationData = () => {
        setRegencies([]);
        setDistricts([]);
        setVillages([]);
    };

    const handleLocationChange = async ({ province_id, regency_id, district_id }) => {
        try {
            if (province_id) {
                const regenciesData = await locationService.getRegencies(province_id);
                setRegencies(regenciesData);
            }

            if (regency_id) {
                const districtsData = await locationService.getDistricts(regency_id);
                setDistricts(districtsData);
            }

            if (district_id) {
                const villagesData = await locationService.getVillages(district_id);
                setVillages(villagesData);
            }
            
        } catch (error) {
            console.error('Error loading location data:', error);
            toast.error('Gagal memuat data lokasi');
        }
    };

    useEffect(() => {
        if (!isAddUserModalOpen) {
            resetLocationData();
        }
    }, [isAddUserModalOpen]);

    useEffect(() => {
        resetLocationData();
    }, [isEditMode, editData]);

    return (
        <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
            <DialogContent className="max-h-[90vh] max-w-[900px] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? 'Edit Client' : 'Add New Client'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update the client information below'
                            : 'Fill in the details below to add a new client to the system'
                        }
                    </DialogDescription>
                </DialogHeader>

                <AddClientForm
                    isEditMode={isEditMode}
                    editData={editData}
                    onAddClient={onAddClient}
                    onEditClient={onEditClient}
                    setIsAddUserModalOpen={setIsAddUserModalOpen}
                    onLocationChange={handleLocationChange}
                    setRegencies={setRegencies}
                    setDistricts={setDistricts}
                    setVillages={setVillages}
                    regencies={regencies}
                    districts={districts}
                    villages={villages}
                />
            </DialogContent>
        </Dialog>
    );
};

export default AddClient;