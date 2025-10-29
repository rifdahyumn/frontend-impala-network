import { Card, CardContent, CardHeader } from '../ui/card'
import React from 'react';
import LoadingSkeleton from './LoadingSkeleton';

const LoadingCard = ({ title = true, contentLines = 4, showImage = false }) => {
    return (
        <Card>
            <CardHeader className="pb-4">
                {title && <LoadingSkeleton type="title" />}
            </CardHeader>
            <CardContent className="space-y-4">
                {showImage && (
                    <LoadingSkeleton type="avatar" className="mx-auto h-24 w-24" />
                )}
                <LoadingSkeleton type="text" count={contentLines} />
                <div className="flex gap-2 pt-2">
                    <LoadingSkeleton type="button" className="w-20" />
                    <LoadingSkeleton type="button" className="w-24" />
                </div>
            </CardContent>
        </Card>
    )
}

export default LoadingCard;