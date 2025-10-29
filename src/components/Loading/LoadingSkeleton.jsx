const LoadingSkeleton = ({ type = 'text', count = 1, className = '' }) => {
    const skeletonTypes = {
        text: 'h-4 bg-gray-200 rounded',
        title: 'h-6 bg-gray-200 rounded',
        avatar: 'h-10 w-10 bg-gray-200 rounded-full',
        card: 'h-32 bg-gray-200 rounded-lg',
        tableRow: 'h-12 bg-gray-200 rounded',
        button: 'h-10 bg-gray-200 rounded'
    };

    const skeletonClass = skeletonTypes[type] || skeletonTypes.text;

    if (count > 1) {
        return (
            <div className={`space-y-2 ${className}`}>
                {Array.from({ length: count }).map((_, index) => (
                    <div
                        key={index}
                        className={`${skeletonClass} animate-pulse`}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className={`${skeletonClass} animate-pulse ${className}`} />
    )
}

export default LoadingSkeleton