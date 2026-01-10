import { XCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'

const ConfirmModal = ({ isOpen, config, onConfirm, onCancel }) => {
    if (!isOpen) return null

    const getIcon = () => {
        switch (config.type) {
            case 'danger':
                return <XCircle className="h-6 w-6 text-red-600" />
            case 'warning':
                return <AlertTriangle className="h-6 w-6 text-yellow-600" />
            case 'success':
                return <CheckCircle className="h-6 w-6 text-green-600" />
            default:
                return <Info className='h-6 w-6 text-blue-600' />
        }
    }

    const getButtonClass = () => {
        switch (config.type) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 text-white'
            case 'warning':
                return 'bg-yellow-600 hover:bg-yellow-700 text-white';
            case 'success':
                return 'bg-green-600 hover:bg-green-700 text-white';
            default:
                return 'bg-blue-600 hover:bg-blue-700 text-white';
        }
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
            <div className='bg-white rounded-lg shadow-xl max-w-md w-full mx-4'>
                <div className='p-6'>
                    <div className='flex items-start mb-4'>
                        <div className='flex-shrink-0 mr-4'>
                            {getIcon()}
                        </div>

                        <div>
                            <h3 className='text-lg font-semibold text-gray-900'>
                                {config.title}
                            </h3>
                            <p className='mt-2 text-sm text-gray-600'>
                                {config.message}
                            </p>
                        </div>
                    </div>

                    <div className='mt-6 flex justify-end space-x-3'>
                        <button
                            type='button'
                            onClick={onCancel}
                            className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                        >
                            {config.cancelText || 'Cancel'}
                        </button>
                        <button
                            type='button'
                            onClick={onConfirm}
                            className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonClass()}`}
                        >
                            {config.confirmText  || 'Confirm'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal;