import React from 'react';

const categoryOptions = [
    { id: 'umkm', name: 'UMKM', description: 'Pelaku Usaha / UMKM / Wirausaha / StartUp', icon: '🏢' },
    { id: 'mahasiswa', name: 'Mahasiswa', description: 'Pelajar/Mahasiswa Aktif', icon: '🎓' },
    { id: 'profesional', name: 'Profesional', description: '(Karyawan Swasta / ASN / BUMN / Profesional)', icon: '💼' },
    { id: 'komunitas', name: 'Komunitas', description: 'Organisasi/Komunitas', icon: '👥' },
    { id: 'umum', name: 'Umum', description: 'Umum', icon: '👤' },
];

const CategorySelector = ({ selectedCategory, handleCategorySelect }) => {
    return (
        <div className="space-y-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Pilih Kategori Profil Anda
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryOptions.map((cat) => (
                    <div
                        key={cat.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            selectedCategory === cat.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                        }`}
                        onClick={() => handleCategorySelect(cat.id)}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{cat.icon}</span>
                            <div>
                                <h4 className="font-semibold text-gray-800">{cat.name}</h4>
                                <p className="text-sm text-gray-600">{cat.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategorySelector;