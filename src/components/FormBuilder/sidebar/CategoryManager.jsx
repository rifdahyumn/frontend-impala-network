// components/FormBuilder/sidebar/CategoryManager.jsx
import React, { useState } from 'react';

const CategoryManager = ({ categories, onCategoryChange }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Kelola Kategori</h3>
      <div className="space-y-2">
        {Object.entries(categories).map(([key, category]) => (
          <div key={key} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setExpandedCategory(expandedCategory === key ? null : key)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <span>{category.icon}</span>
                <span className="font-medium">{category.name}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">Sistem</span>
              </div>
              <span>{expandedCategory === key ? '▲' : '▼'}</span>
            </button>
            
            {expandedCategory === key && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                <div className="text-xs text-gray-500">
                  {category.fields.length} field tersedia
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;