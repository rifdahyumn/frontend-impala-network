import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import EditMemberForm from "./EditMemberForm";

const EditMemberModal = ({ 
    isOpen, 
    setIsOpen, 
    memberData, 
    onMemberUpdated,
    detailFields = []
}) => {
    const isEditMode = !!memberData;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode 
                            ? `Edit Beneficiary: ${memberData?.full_name || memberData?.id}`
                            : 'Add New Beneficiary'
                        }
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update the beneficiary information below'
                            : 'Fill in the details below to add a new beneficiary'
                        }
                    </DialogDescription>
                </DialogHeader>

                <EditMemberForm
                    isEditMode={isEditMode}
                    memberData={memberData}
                    onMemberUpdated={onMemberUpdated}
                    setIsModalOpen={setIsOpen}
                    detailFields={detailFields}
                />
            </DialogContent>
        </Dialog>
    );
};

export default EditMemberModal;