import React from 'react';

const FormHeader = ({ formTitle }) => {
    return (
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {formTitle}
            </h1>
            <p className="text-gray-600">
                Isi data diri Anda dengan lengkap dan benar
            </p>
        </div>
    );
};

export default FormHeader;