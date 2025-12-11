let programsData = [];

/**
 * Save programs data to localStorage for Form Builder access
 * @param {Array} data - Array of program objects
 */
export const setProgramsData = (data) => {
    try {
        programsData = Array.isArray(data) ? data : [];
        localStorage.setItem('programsData', JSON.stringify(programsData));
    } catch (error) {
        console.error('Error saving programs data:', error);
    }
};

/**
 * Get programs data from localStorage
 * @returns {Array} Array of program objects
 */
export const getProgramsData = () => {
    try {
        const stored = localStorage.getItem('programsData');
        if (stored) {
            const parsedData = JSON.parse(stored);
            return Array.isArray(parsedData) ? parsedData : [];
        }
        return programsData;
    } catch (error) {
        console.error('❌ Error loading programs data:', error);
        return [];
    }
};

/**
 * Get only program names for dropdown in Form Builder
 * @returns {Array} Array of program names
 */
export const getProgramNames = () => {
    try {
        const data = getProgramsData();
        const programNames = data
            .map(program => program.program_name)
            .filter(name => name && name.trim() !== '')
            .sort();
        
        return programNames;
    } catch (error) {
        console.error('Error getting program names:', error);
        return [];
    }
};

/**
 * Get program by ID
 * @param {string|number} programId 
 * @returns {Object|null} Program object or null if not found
 */
export const getProgramById = (programId) => {
    try {
        const data = getProgramsData();
        return data.find(program => program.id === programId || program.id == programId) || null;
    } catch (error) {
        console.error('❌ Error getting program by ID:', error);
        return null;
    }
};

/**
 * Check if program data is available
 * @returns {boolean} True if programs data exists
 */
export const hasProgramsData = () => {
    return getProgramsData().length > 0;
};

/**
 * Get program count
 * @returns {number} Number of available programs
 */
export const getProgramsCount = () => {
    return getProgramsData().length;
};

/**
 * Clear programs data (for testing/reset)
 */
export const clearProgramsData = () => {
    programsData = [];
    localStorage.removeItem('programsData');
};

// Default programs for fallback
const defaultPrograms = [
    { id: 1, program_name: "Impala Management" },
];

/**
 * Initialize with default programs if no data exists
 */
export const initializeDefaultPrograms = () => {
    if (!hasProgramsData()) {
        setProgramsData(defaultPrograms);
    }
};