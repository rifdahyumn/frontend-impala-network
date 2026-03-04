import { useState } from "react";
import clientService from "../services/clientService";

const useClientSearch = (isEditMode) => {
    const [clientExists, setClientExists] = useState(false);
    const [existingClientId, setExistingClientId] = useState(null);
    const [showClientInfo, setShowClientInfo] = useState(false);
    const [clientSearchResults, setClientSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchingClient, setSearchingClient] = useState(false);
    const [selectedClientData, setSelectedClientData] = useState(null);

    const handleSelectClient = (client) => {
        setSelectedClientData(client);
        setClientExists(true);
        setExistingClientId(client.id);
        setShowClientInfo(true);
        setShowSearchResults(false);
        setClientSearchResults([]);

        return client
    }

    const checkExistingClient = async (name, email) => {
        if (isEditMode) return;
        
        if (!name || name.trim().length < 3) {
            return;
        }

        setSearchingClient(true);
        try {
            const response = await clientService.searchClient(name.trim(), email?.trim());
            if (response?.data?.length > 0) {
                setClientSearchResults(response.data);
                setShowSearchResults(true);
            } else {
                setClientSearchResults([]);
                setShowSearchResults(false);
            }
        } catch (error) {
            console.error('Error checking existing client:', error);
            setClientSearchResults([]);
            setShowSearchResults(false);
        } finally {
            setSearchingClient(false);
        }
    };

    const resetClientSearch = () => {
        setClientExists(false);
        setExistingClientId(null);
        setShowClientInfo(false);
        setClientSearchResults([]);
        setShowSearchResults(false);
        setSelectedClientData(null);
    };

    return {
        clientExists,
        existingClientId,
        showClientInfo,
        clientSearchResults,
        showSearchResults,
        searchingClient,
        selectedClientData, 
        checkExistingClient,
        handleSelectClient,
        setClientExists,
        setExistingClientId,
        setShowClientInfo,
        setClientSearchResults,
        setShowSearchResults,
        resetClientSearch
    };
};

export default useClientSearch;