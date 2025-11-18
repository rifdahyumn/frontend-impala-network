import React from 'react';

const ProgramNameField = ({ value, onChange, isEditing = true }) => {
    return (
        <div className="form-field program-name-field">
            <label className="required">Nama Program</label>
            {isEditing ? (
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Masukkan nama program"
                    className="form-input"
                />
            ) : (
                <div className="preview-value">
                    {value || 'Nama Program Belum Diisi'}
                </div>
            )}
        </div>
    );
};

export default ProgramNameField;