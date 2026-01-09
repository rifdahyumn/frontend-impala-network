import { useState, useCallback } from "react";

export const useConfirmDialog = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [config, setConfig] = useState({
        title: 'Confirm Action',
        message: 'Are you sure you want to proceed?',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: () => {},
        onCancel: () => {},
        type: 'warning'
    })

    const showConfirm = useCallback((newConfig) => {
        setConfig({
            ...config,
            ...newConfig
        })
        setIsOpen(true)
    }, [config])

    const hideConfirm = useCallback(() => {
        setIsOpen(false)
    }, [])

    const handleConfirm = useCallback(() => {
        config.onConfirm?.()
        hideConfirm()
    }, [config, hideConfirm])

    const handleCancel = useCallback(() => {
        config.onCancel?.()
        hideConfirm()
    }, [config, hideConfirm])

    return { isOpen, config, showConfirm, hideConfirm, handleConfirm, handleCancel }
}