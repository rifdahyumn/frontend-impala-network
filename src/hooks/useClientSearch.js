import { useState } from "react";
import clientService from "../services/clientService";

const useClientSearch = (isEditMode) => {
    const [clientExists, setClientExists] = useState(false);
    const [existingClientId, setExistingClientId] = useState(null);
    const [showClientInfo, setShowClientInfo] = useState(false);
    const [clientSearchResults, setClientSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchingClient, setSearchingClient] = useState(false);

    const handleSelectClient = (client) => {
        setClientExists(true)
        setExistingClientId(client.id)
        setShowClientInfo(true)

        setShowSearchResults(false)
        setClientSearchResults([])
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

    return {
        clientExists,
        existingClientId,
        showClientInfo,
        clientSearchResults,
        showSearchResults,
        searchingClient,
        checkExistingClient,
        handleSelectClient,
        setClientExists,
        setExistingClientId,
        setShowClientInfo,
        setClientSearchResults,
        setShowSearchResults
    };
};

export default useClientSearch;