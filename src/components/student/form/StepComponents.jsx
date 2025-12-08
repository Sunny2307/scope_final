import React, { useContext, useState, useRef, useEffect } from 'react'; // Import useRef and useEffect
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../../../lib/api';
import { StudentFormContext } from '../../../context/StudentFormContext';
import { User, Home, BookOpen, FileText, CheckCircle, UploadCloud, Calendar } from 'lucide-react';
import { InputField, SelectField, TextareaField, RadioInput, CheckboxInput } from './FormControls';

export const StepProgressBar = () => {
    const { currentStep } = useContext(StudentFormContext);
    const steps = [
        { number: 1, title: 'Personal', icon: <User className="w-6 h-6" /> },
        { number: 2, title: 'Contact', icon: <Home className="w-6 h-6" /> },
        { number: 3, title: 'Academic', icon: <BookOpen className="w-6 h-6" /> },
        { number: 4, title: 'Documents', icon: <FileText className="w-6 h-6" /> },
        { number: 5, title: 'Review', icon: <CheckCircle className="w-6 h-6" /> },
    ];

    return (
        <div className="flex items-center justify-center">
            {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentStep >= step.number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {step.icon}
                        </div>
                        <p className={`mt-2 text-sm font-semibold ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'}`}>{step.title}</p>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 h-1 mx-4 ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export const PersonalDetails = () => {
    const { formData, handleChange, errors, handlePhotoUpload } = useContext(StudentFormContext);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const datePickerRef = useRef(null); // Create a ref for the DatePicker
    const admissionDateRef = useRef(null);
    const registrationDateRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create preview URL immediately
            const previewUrl = URL.createObjectURL(file);
            setPreviewUrl(previewUrl);
            setIsUploading(true);
            try {
                const uploadedPhotoUrl = await handlePhotoUpload(file);
                // Update preview with the uploaded base64 URL
                setPreviewUrl(uploadedPhotoUrl);
            } catch (error) {
                console.error('Photo upload failed:', error);
                // Reset preview on error
                setPreviewUrl(null);
            } finally {
                setIsUploading(false);
            }
        } else {
            setPreviewUrl(null);
        }
    };

    const handleDateChange = (date) => {
        const formattedDate = date ? date.toISOString().split('T')[0] : '';
        handleChange({
            target: {
                name: 'birthDate',
                value: formattedDate,
            },
        });
    };

    const handleAdmissionDateChange = (date) => {
        const formattedDate = date ? date.toISOString().split('T')[0] : '';
        handleChange({
            target: {
                name: 'admissionDate',
                value: formattedDate,
            },
        });
    };

    const handleRegistrationDateChange = (date) => {
        const formattedDate = date ? date.toISOString().split('T')[0] : '';
        handleChange({
            target: {
                name: 'registrationDate',
                value: formattedDate,
            },
        });
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-semibold text-gray-700">Personal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
                        ) : (
                            <UploadCloud className="w-8 h-8 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <label htmlFor="profilePhoto" className={`cursor-pointer ${isUploading ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'} font-semibold px-4 py-2 rounded-lg transition-colors`}>
                            {isUploading ? 'Uploading...' : 'Upload Photo'}
                        </label>
                        <input id="profilePhoto" type="file" name="profilePhoto" onChange={handleFileChange} accept="image/*" className="hidden" disabled={isUploading} />
                        <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                    </div>
                </div>
                <InputField label="Student ID" name="studentId" value={formData.studentId} onChange={handleChange} error={errors.studentId} required /> {/* Removed readOnly */}
                <InputField label="Employee ID" name="employeeId" value={formData.employeeId} onChange={handleChange} error={errors.employeeId} />
                <InputField label="Student Name" name="studentName" value={formData.studentName} onChange={handleChange} error={errors.studentName} required /> {/* Ensured editable */}
                <InputField label="Institute" name="institute" value={formData.institute} onChange={handleChange} readOnly />
                {/* Admission Date with DatePicker */}
                <div>
                    <label htmlFor="admissionDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Admission Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1">
                        <DatePicker
                            ref={admissionDateRef}
                            id="admissionDate"
                            selected={formData.admissionDate ? new Date(formData.admissionDate) : null}
                            onChange={handleAdmissionDateChange}
                            dateFormat="dd/MM/yyyy"
                            className="block w-full px-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            wrapperClassName="w-full"
                            placeholderText="DD/MM/YYYY"
                            showYearDropdown
                            scrollableYearDropdown
                            yearDropdownItemNumber={20}
                            maxDate={new Date()}
                        />
                        <div
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                            onClick={() => admissionDateRef.current.setOpen(true)}
                        >
                            <Calendar className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                    </div>
                    {errors.admissionDate && <p className="mt-2 text-sm text-red-600">{errors.admissionDate}</p>}
                </div>

                {/* Registration Date with DatePicker */}
                <div>
                    <label htmlFor="registrationDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1">
                        <DatePicker
                            ref={registrationDateRef}
                            id="registrationDate"
                            selected={formData.registrationDate ? new Date(formData.registrationDate) : null}
                            onChange={handleRegistrationDateChange}
                            dateFormat="dd/MM/yyyy"
                            className="block w-full px-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            wrapperClassName="w-full"
                            placeholderText="DD/MM/YYYY"
                            showYearDropdown
                            scrollableYearDropdown
                            yearDropdownItemNumber={20}
                            maxDate={new Date()}
                        />
                        <div
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                            onClick={() => registrationDateRef.current.setOpen(true)}
                        >
                            <Calendar className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                    </div>
                    {errors.registrationDate && <p className="mt-2 text-sm text-red-600">{errors.registrationDate}</p>}
                </div>
                <SelectField label="Admission Year" name="admissionYear" value={formData.admissionYear} onChange={handleChange} disabled>
                    <option value="">Select Year</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </SelectField>
                <SelectField label="Current Semester" name="currentSemester" value={formData.currentSemester} onChange={handleChange} error={errors.currentSemester} required>
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => <option key={sem} value={sem}>Semester {sem}</option>)}
                </SelectField>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender <span className="text-red-500">*</span></label>
                    <div className="flex gap-4">
                        {['MALE', 'FEMALE', 'OTHER'].map(gender => (
                            <RadioInput key={gender} name="gender" value={gender} checked={formData.gender === gender} onChange={handleChange} label={gender.charAt(0) + gender.slice(1).toLowerCase()} />
                        ))}
                    </div>
                    {errors.gender && <p className="mt-2 text-sm text-red-600">{errors.gender}</p>}
                </div>
                
                {/* --- UPDATED BIRTH DATE FIELD --- */}
                <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Birth Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1">
                        <DatePicker
                            ref={datePickerRef} // Assign the ref
                            id="birthDate"
                            selected={formData.birthDate ? new Date(formData.birthDate) : null}
                            onChange={handleDateChange}
                            dateFormat="dd/MM/yyyy"
                            className="block w-full px-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            wrapperClassName="w-full"
                            placeholderText="DD/MM/YYYY"
                            showYearDropdown
                            scrollableYearDropdown
                            yearDropdownItemNumber={80}
                            maxDate={new Date()}
                        />
                        <div
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" // Added cursor-pointer
                            onClick={() => datePickerRef.current.setOpen(true)} // Added onClick to open picker
                        >
                            <Calendar className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                    </div>
                    {errors.birthDate && <p className="mt-2 text-sm text-red-600">{errors.birthDate}</p>}
                </div>
                
                <SelectField label="Admission Cast Category" name="admissionCastCategory" value={formData.admissionCastCategory} onChange={handleChange} error={errors.admissionCastCategory} required>
                    <option value="">Select Category</option>
                    {['GENERAL', 'SC', 'ST', 'OBC', 'OTHER'].map(cat => <option key={cat} value={cat}>{cat.charAt(0) + cat.slice(1).toLowerCase()}</option>)}
                </SelectField>
                <SelectField label="Actual Cast Category" name="actualCastCategory" value={formData.actualCastCategory} onChange={handleChange} error={errors.actualCastCategory} required>
                    <option value="">Select Category</option>
                    {['GENERAL', 'SC', 'ST', 'OBC', 'OTHER'].map(cat => <option key={cat} value={cat}>{cat.charAt(0) + cat.slice(1).toLowerCase()}</option>)}
                </SelectField>
                <InputField label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} error={errors.nationality} required />
            </div>
        </div>
    );
};

export const ContactInfo = ({ /* ... */ }) => {
    const { formData, handleChange, errors } = useContext(StudentFormContext);
    return (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-semibold text-gray-700">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <TextareaField label="Local Address" name="localAddress" value={formData.localAddress} onChange={handleChange} error={errors.localAddress} required />
                </div>
                <div className="md:col-span-2">
                    <TextareaField label="Permanent Address" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} error={errors.permanentAddress} required />
                </div>
                <InputField label="Country" name="country" value={formData.country} onChange={handleChange} error={errors.country} required />
                <InputField label="Mobile No" name="mobileNo" type="tel" value={formData.mobileNo} onChange={handleChange} error={errors.mobileNo} required />
                <InputField label="Guardian Mobile No" name="guardianMobileNo" type="tel" value={formData.guardianMobileNo} onChange={handleChange} />
                <InputField label="Guardian Email" name="guardianEmail" type="email" value={formData.guardianEmail} onChange={handleChange} />
                <InputField label="Personal Email" name="personalEmail" type="email" value={formData.personalEmail} onChange={handleChange} error={errors.personalEmail} required />
                <InputField label="Institutional Email" name="institutionalEmail" type="email" value={formData.institutionalEmail} onChange={handleChange} error={errors.institutionalEmail} required readOnly />
            </div>
        </div>
    );
};

export const AcademicInfo = () => {
    const { formData, handleChange, errors } = useContext(StudentFormContext);
    const [guides, setGuides] = useState([]);
    const [loadingGuides, setLoadingGuides] = useState(true);

    useEffect(() => {
        const fetchGuides = async () => {
            try {
                const response = await api.get('/api/auth/available-guides');
                setGuides(response.data.guides || []);
            } catch (error) {
                console.error('Error fetching guides:', error);
            } finally {
                setLoadingGuides(false);
            }
        };
        fetchGuides();
    }, []);

    return (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-semibold text-gray-700">Academic & Other Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex items-center gap-8">
                    <CheckboxInput name="isHandicapped" checked={formData.isHandicapped} onChange={handleChange} label="Are you differently-abled?" />
                    <CheckboxInput name="belongsToSamaj" checked={formData.belongsToSamaj} onChange={handleChange} label="Do you belong to Samaj?" />
                </div>
                {formData.isHandicapped && (
                    <InputField label="Disability Details" name="disability" value={formData.disability} onChange={handleChange} />
                )}
                <div className="md:col-span-2">
                    <TextareaField label="Hostel Name and Address" name="hostelNameAddress" value={formData.hostelNameAddress} onChange={handleChange} />
                </div>
                <SelectField label="Select Guide" name="guideId" value={formData.guideId} onChange={handleChange} error={errors.guideId} required>
                    <option value="">Select Guide</option>
                    {loadingGuides ? (
                        <option disabled>Loading guides...</option>
                    ) : (
                        guides.map(guide => (
                            <option key={guide.id} value={guide.id}>{guide.name || guide.email}</option>
                        ))
                    )}
                </SelectField>
                <SelectField label="Select Co-Guide" name="coGuideId" value={formData.coGuideId} onChange={handleChange}>
                    <option value="">Select Co-Guide (optional)</option>
                    {loadingGuides ? (
                        <option disabled>Loading guides...</option>
                    ) : (
                        guides.map(guide => (
                            <option key={guide.id} value={guide.id}>{guide.name || guide.email}</option>
                        ))
                    )}
                </SelectField>
                <InputField label="UGC ID" name="ugcId" value={formData.ugcId} onChange={handleChange} readOnly />
                <InputField label="Scholarship Amount" name="scholarshipAmount" type="number" value={formData.scholarshipAmount} onChange={handleChange} readOnly />
                <InputField label="Contingency Amount" name="contingencyAmount" type="number" value={formData.contingencyAmount} onChange={handleChange} readOnly />
                <SelectField label="Scholarship Type" name="scholarshipType" value={formData.scholarshipType} onChange={handleChange} disabled>
                    <option value="">Select Scholarship</option>
                    {['CPSF', 'SODH', 'UGC_CSIR_JRF', 'DST_INSPIRE', 'OTHER'].map(type => <option key={type} value={type}>{type.replace(/_/g, '/').replace('DST_INSPIRE', 'DST-INSPIRE')}</option>)}
                </SelectField>
            </div>
        </div>
    );
};

export const Documents = () => {
    const { formData, handleChange, errors } = useContext(StudentFormContext);
    return (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-semibold text-gray-700">Identification Documents</h2>
            <p className="text-gray-500">Please provide your identification details.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                <InputField label="Aadhaar Number" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} error={errors.aadhaarNumber} required />
                <InputField label="Pancard Number" name="pancardNumber" value={formData.pancardNumber} onChange={handleChange} error={errors.pancardNumber} required />
            </div>
        </div>
    );
};

export const Review = ({ /* ... */ }) => {
    const { formData } = useContext(StudentFormContext);
    const renderValue = (value, key) => {
        // Handle profile photo URL specially - show simple text instead of long base64 URL
        if (key === 'profilePhotoUrl') {
            return value ? 'Photo uploaded' : 'No photo';
        }
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        if (value instanceof File) {
            return value.name;
        }
        return value || 'N/A';
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-2xl font-semibold text-gray-700 text-center">Review Your Information</h2>
            <div className="bg-gray-50 p-6 rounded-lg overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {Object.entries(formData).map(([key, value]) => (
                        <div key={key} className="break-words min-w-0 overflow-hidden">
                            <p className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="font-semibold text-gray-800">
                                {renderValue(value, key)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};