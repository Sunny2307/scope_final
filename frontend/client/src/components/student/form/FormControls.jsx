import React from 'react';
import { CheckCircle } from 'lucide-react';

// Note: All form control components are in one file for brevity.

export const InputField = ({ label, name, type = 'text', value, onChange, error, required, readOnly = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors text-gray-900 ${error ? 'border-red-500' : 'border-gray-300'} ${readOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

export const SelectField = ({ label, name, value, onChange, error, required, disabled = false, children }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors text-gray-900 ${error ? 'border-red-500' : 'border-gray-300'} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        >
            {children}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

export const TextareaField = ({ label, name, value, onChange, error, required }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors text-gray-900 ${error ? 'border-red-500' : 'border-gray-300'}`}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

export const RadioInput = ({ name, value, checked, onChange, label }) => (
    <label className="flex items-center space-x-2 cursor-pointer">
        <input
            type="radio"
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            className="hidden peer"
        />
        <span className="w-5 h-5 border-2 border-gray-400 rounded-full peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></span>
        <span className="text-gray-700">{label}</span>
    </label>
);

export const CheckboxInput = ({ name, checked, onChange, label }) => (
    <label className="flex items-center space-x-2 cursor-pointer">
        <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            className="hidden peer"
        />
        <span className="w-5 h-5 border-2 border-gray-400 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center transition-all">
            {checked && <CheckCircle className="w-3 h-3 text-white" />}
        </span>
        <span className="text-gray-700">{label}</span>
    </label>
);