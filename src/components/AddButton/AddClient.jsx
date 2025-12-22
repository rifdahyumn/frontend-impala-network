import AddClientForm from "../AddButton/client/AddClientForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

const AddClient = ({ isAddUserModalOpen, setIsAddUserModalOpen, onAddClient, editData = null, onEditClient = null }) => {
    const isEditMode = !!editData;

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
                />
            </DialogContent>
        </Dialog>
    );
};

export default AddClient;