export const getDisplayStatus = (program) => {
    if (program.status && program.status.toLowerCase() !== 'active') {
        return program.status;
    }
    
    if (program.end_date) {
        const endDate = new Date(program.end_date);
        const today = new Date();
        
        today.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        
        if (endDate < today) {
            return 'Inactive (Expired)';
        }
        
        const daysUntilEnd = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        if (daysUntilEnd <= 7 && daysUntilEnd > 0) {
            return `Active (Ends in ${daysUntilEnd} day${daysUntilEnd > 1 ? 's' : ''})`;
        }
    }
    
    return program.status || 'Active';
};

export const updateExpiredPrograms = async (programs, updateProgram) => {
    const expiredPrograms = programs.filter(program => {
        if (program.status === 'Active' && program.end_date) {
            const endDate = new Date(program.end_date);
            const today = new Date();
            
            today.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            
            return endDate < today;
        }
        return false;
    });

    for (const program of expiredPrograms) {
        try {
            await updateProgram(program.id, { status: 'Inactive' });
        } catch (error) {
            console.error('Error updating program status:', error);
        }
    }
};