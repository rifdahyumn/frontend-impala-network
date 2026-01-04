export const formatInstructorsForExport = (instructors) => {
    try {
        if (!instructors) return '-'

        if (typeof instructors === 'string') {
            if (instructors.startsWith('[') || instructors.startsWith('{')) {
                try {
                    const parsed = JSON.parse(instructors)
                    if (Array.isArray(parsed)) {
                        return parsed.filter(i => i).join(', ')
                    }
                } catch {
                    //
                }
            }

            return instructors
        }

        if (Array.isArray(instructors)) {
            return instructors
                .filter(instructor => instructor && instructor.trim() !== '')
                .join(', ')
        }

        return '-'
    } catch (error) {
        console.error('Error formatting instructors:', error)
        return '-'
    }
}

export const formatTagsForExport = (tags) => {
    try {
        if (!tags) return '-'

        if (typeof tags === 'string') {
            if (tags.startsWith('[')) {
                try {
                    const parsed = JSON.parse(tags)
                    if (Array.isArray(parsed)) {
                        return parsed.filter(t => t).join(', ')
                    }
                } catch {
                    //
                }
            }

            return tags
        }

        if (Array.isArray(tags)) {
            return tags
                .filter(tag => tag && tag.trim() !== '')
                .join(', ') 
        }

        return '-'
    } catch (error) {
        console.error('Error formatting tags:', error)
        return '-'
    }
}