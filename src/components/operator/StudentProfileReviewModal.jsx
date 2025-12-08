import React, { useState, useEffect } from 'react';
import { FiX, FiEdit2, FiSave, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiBookOpen, FiFileText, FiCheck, FiX as FiXIcon } from 'react-icons/fi';
import api from '../../lib/api';

const StudentProfileReviewModal = ({ student, onClose, onApprove, onReject, onProfileUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [guides, setGuides] = useState([]);
  const [loadingGuides, setLoadingGuides] = useState(true);

  // Fetch available guides
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

  useEffect(() => {
    if (student) {
      setEditedData({
        // Personal Details
        studentId: student.profile?.ugcId || student.studentId || '',
        employeeId: student.profile?.employeeId || '',
        studentName: student.name || '',
        institute: 'CHARUSAT',
        admissionDate: student.profile?.admissionDate ? new Date(student.profile.admissionDate).toISOString().split('T')[0] : '',
        registrationDate: student.profile?.registrationDate ? new Date(student.profile.registrationDate).toISOString().split('T')[0] : '',
        admissionYear: student.enrollmentYear || new Date().getFullYear(),
        currentSemester: student.profile?.currentSemester || '',
        gender: student.profile?.gender || '',
        birthDate: student.profile?.birthDate ? new Date(student.profile.birthDate).toISOString().split('T')[0] : '',
        admissionCastCategory: student.profile?.admissionCastCategory || '',
        actualCastCategory: student.profile?.actualCastCategory || '',
        nationality: student.profile?.nationality || '',
        
        // Contact Information
        localAddress: student.profile?.localFullAddress || '',
        permanentAddress: student.profile?.permanentFullAddress || '',
        country: student.profile?.country || '',
        mobileNo: student.profile?.mobileNo || '',
        guardianMobileNo: student.profile?.guardianMobileNo || '',
        guardianEmail: student.profile?.guardianEmail || '',
        personalEmail: student.profile?.personalEmail || '',
        institutionalEmail: student.institutionalEmail || student.email || '',
        
        // Academic Information
        isHandicapped: student.profile?.isHandicapped || false,
        disability: student.profile?.disability || '',
        belongsToSamaj: student.profile?.belongsToSamaj || false,
        hostelNameAddress: student.profile?.hostelNameAndAddress || '',
        nameOfGuide: student.profile?.nameOfGuide || '', // Keep for backward compatibility
        nameOfCoGuide: student.profile?.nameOfCoGuide || '', // Keep for backward compatibility
        guideId: (student.guideId || student.guide?.id) ? String(student.guideId || student.guide?.id) : '', // Use guideId from student, convert to string
        coGuideId: (student.coGuideId || student.coGuide?.id) ? String(student.coGuideId || student.coGuide?.id) : '', // Use coGuideId from student, convert to string
        ugcId: student.profile?.ugcId || '',
        scholarshipAmount: student.profile?.scholarshipAmount || student.scholarshipAmount || 30000,
        contingencyAmount: student.profile?.contingencyAmount || '',
        scholarshipType: student.profile?.scholarshipType || student.scholarshipType || '',
        
        // Documents
        aadhaarNumber: student.profile?.aadhaarNumber || '',
        pancardNumber: student.profile?.pancardNumber || '',
      });
    }
  }, [student]);

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Validate required fields that were disabled in student form
  const validateRequiredFields = () => {
    const requiredFields = {
      employeeId: 'Employee ID is required',
      guideId: 'Guide selection is required',
      aadhaarNumber: 'Aadhaar Number is required',
      pancardNumber: 'Pancard Number is required'
    };

    const errors = {};
    let isValid = true;

    Object.keys(requiredFields).forEach(field => {
      if (!editedData[field] || editedData[field].trim() === '') {
        errors[field] = requiredFields[field];
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/api/auth/operator/update-student-profile', {
        studentId: student.id,
        profileData: editedData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh the student data to get updated guide/co-guide information
      if (typeof onProfileUpdated === 'function') {
        await onProfileUpdated();
      }
      
      setIsEditing(false);
      setError('');
    } catch (error) {
      console.error('Error updating student profile:', error);
      setError('Failed to update student profile: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleActionSubmit = async () => {
    if (reason.trim() === '') {
      setError('A reason is required to proceed.');
      return;
    }

    // If approving, validate required fields first
    if (actionType === 'APPROVED') {
      if (!validateRequiredFields()) {
        setError('Please fill all required fields before approving the student.');
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      console.log('Processing student:', {
        studentId: student.id,
        action: actionType,
        reason: reason,
        editedData: editedData
      });
      
      // If approving, save the updated profile data first
      if (actionType === 'APPROVED') {
        console.log('Updating student profile...');
        const updateResponse = await api.post('/api/auth/operator/update-student-profile', {
          studentId: student.id,
          profileData: editedData
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Profile update response:', updateResponse.data);
      }

      console.log('Processing approval/rejection...');
      const actionResponse = await api.post('/api/auth/operator/approve-reject-student', {
        studentId: student.id,
        action: actionType,
        reason: reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Action response:', actionResponse.data);

      if (actionType === 'APPROVED') {
        onApprove && onApprove(student);
      } else {
        onReject && onReject(student);
      }
      if (typeof onProfileUpdated === 'function') {
        await onProfileUpdated();
      }
      onClose();
    } catch (error) {
      console.error('Error processing student:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      let errorMessage = 'Failed to process student. ';
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.response?.status === 404) {
        errorMessage += 'Student not found.';
      } else if (error.response?.status === 401) {
        errorMessage += 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage += 'Access denied. You do not have permission to perform this action.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error occurred.';
      }
      
      setError(errorMessage);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderField = (label, value, fieldName, type = 'text', options = [], isRequired = false, isEditable = true) => {
    const hasError = validationErrors[fieldName];
    const shouldShowEditable = isEditing && isEditable;
    
    if (shouldShowEditable) {
      if (type === 'select') {
        const currentValue = editedData[fieldName] || '';
        return (
          <select
            value={currentValue}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        );
      } else if (type === 'textarea') {
        return (
          <textarea
            value={editedData[fieldName] || ''}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            rows="3"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );
      } else if (type === 'checkbox') {
        return (
          <input
            type="checkbox"
            checked={editedData[fieldName] || false}
            onChange={(e) => handleInputChange(fieldName, e.target.checked)}
            className="custom-checkbox"
          />
        );
      } else {
        return (
          <input
            type={type}
            value={editedData[fieldName] || ''}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );
      }
    } else {
      return (
        <span className="text-gray-800 font-medium">
          {type === 'checkbox' ? (value ? 'Yes' : 'No') : (value || 'N/A')}
        </span>
      );
    }
  };

  if (!student) return null;

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scaleUp { animation: scaleUp 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        .custom-checkbox {
          appearance: none;
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          background-color: white;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease-in-out;
        }
        
        .custom-checkbox:hover {
          border-color: #60a5fa;
          background-color: #f0f9ff;
        }
        
        .custom-checkbox:checked {
          background-color: #2563eb;
          border-color: #2563eb;
        }
        
        .custom-checkbox:checked::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 14px;
          font-weight: bold;
          line-height: 1;
        }
        
        .custom-checkbox:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    <div 
      className="fixed inset-0 z-[60] flex justify-center items-center p-4 transition-opacity duration-300 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col transform transition-transform duration-300 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Student Profile Review</h2>
              <p className="text-gray-600">Review and manage student profile details</p>
            </div>
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <FiEdit2 className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <FiSave className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <FiXIcon className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 min-h-0">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {!isEditing && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg">
              <p className="text-sm">
                <strong>Note:</strong> Fields marked with <span className="text-red-500">*</span> are required and must be filled by the operator before approval.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Details */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-blue-600" />
                  Personal Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Student ID</label>
                    {renderField('Student ID', editedData.studentId, 'studentId', 'text', [], false, true)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Employee ID <span className="text-red-500">*</span>
                    </label>
                    {renderField('Employee ID', editedData.employeeId, 'employeeId', 'text', [], true, true)}
                    {validationErrors.employeeId && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.employeeId}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Student Name</label>
                    {renderField('Student Name', editedData.studentName, 'studentName', 'text', [], false, true)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Institute</label>
                    {renderField('Institute', editedData.institute, 'institute', 'text', [], false, true)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Admission Date</label>
                    {renderField('Admission Date', editedData.admissionDate, 'admissionDate', 'date', [], false, true)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Registration Date</label>
                    {renderField('Registration Date', editedData.registrationDate, 'registrationDate', 'date', [], false, true)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Current Semester</label>
                    {renderField('Current Semester', editedData.currentSemester, 'currentSemester', 'select', 
                      [1,2,3,4,5,6,7,8].map(sem => ({ value: sem, label: `Semester ${sem}` })), false, true
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Gender</label>
                    {renderField('Gender', editedData.gender, 'gender', 'select', 
                      ['MALE', 'FEMALE', 'OTHER'].map(g => ({ value: g, label: g.charAt(0) + g.slice(1).toLowerCase() })), false, true
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Birth Date</label>
                    {renderField('Birth Date', editedData.birthDate, 'birthDate', 'date', [], false, true)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Admission Cast Category</label>
                    {renderField('Admission Cast Category', editedData.admissionCastCategory, 'admissionCastCategory', 'select',
                      ['GENERAL', 'SC', 'ST', 'OBC', 'OTHER'].map(cat => ({ value: cat, label: cat.charAt(0) + cat.slice(1).toLowerCase() })), false, true
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Actual Cast Category</label>
                    {renderField('Actual Cast Category', editedData.actualCastCategory, 'actualCastCategory', 'select',
                      ['GENERAL', 'SC', 'ST', 'OBC', 'OTHER'].map(cat => ({ value: cat, label: cat.charAt(0) + cat.slice(1).toLowerCase() })), false, true
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Nationality</label>
                    {renderField('Nationality', editedData.nationality, 'nationality', 'text', [], false, true)}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiMapPin className="w-5 h-5 text-blue-600" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Local Address</label>
                    {renderField('Local Address', editedData.localAddress, 'localAddress', 'textarea', [], false, true)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Permanent Address</label>
                    {renderField('Permanent Address', editedData.permanentAddress, 'permanentAddress', 'textarea', [], false, true)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Country</label>
                    {renderField('Country', editedData.country, 'country', 'text', [], false, true)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Mobile No</label>
                    {renderField('Mobile No', editedData.mobileNo, 'mobileNo', 'tel', [], false, true)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Guardian Mobile No</label>
                    {renderField('Guardian Mobile No', editedData.guardianMobileNo, 'guardianMobileNo', 'tel', [], false, true)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Guardian Email</label>
                    {renderField('Guardian Email', editedData.guardianEmail, 'guardianEmail', 'email', [], false, true)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Personal Email</label>
                    {renderField('Personal Email', editedData.personalEmail, 'personalEmail', 'email', [], false, true)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Institutional Email</label>
                    {renderField('Institutional Email', editedData.institutionalEmail, 'institutionalEmail', 'email', [], false, true)}
                  </div>
                </div>
              </div>
            </div>

            {/* Academic & Other Information */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiBookOpen className="w-5 h-5 text-blue-600" />
                  Academic & Other Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => isEditing && handleInputChange('isHandicapped', !editedData.isHandicapped)}>
                      Differently-abled
                    </label>
                    {renderField('Differently-abled', editedData.isHandicapped, 'isHandicapped', 'checkbox', [], false, true)}
                  </div>
                  {editedData.isHandicapped && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Disability Details</label>
                      {renderField('Disability Details', editedData.disability, 'disability', 'text', [], false, true)}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => isEditing && handleInputChange('belongsToSamaj', !editedData.belongsToSamaj)}>
                      Belongs to Samaj
                    </label>
                    {renderField('Belongs to Samaj', editedData.belongsToSamaj, 'belongsToSamaj', 'checkbox', [], false, true)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Hostel Name and Address</label>
                    {renderField('Hostel Name and Address', editedData.hostelNameAddress, 'hostelNameAddress', 'textarea', [], false, true)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Select Guide <span className="text-red-500">*</span>
                    </label>
                    {renderField('Select Guide', editedData.guideId, 'guideId', 'select',
                      loadingGuides 
                        ? [{ value: '', label: 'Loading guides...' }]
                        : [
                            { value: '', label: 'Select Guide' },
                            ...guides.map(guide => ({ 
                              value: String(guide.id), 
                              label: guide.name || guide.email 
                            }))
                          ], 
                      true, true
                    )}
                    {validationErrors.guideId && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.guideId}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Select Co-Guide</label>
                    {renderField('Select Co-Guide', editedData.coGuideId, 'coGuideId', 'select',
                      loadingGuides 
                        ? [{ value: '', label: 'Loading guides...' }]
                        : [
                            { value: '', label: 'Select Co-Guide (optional)' },
                            ...guides.map(guide => ({ 
                              value: String(guide.id), 
                              label: guide.name || guide.email 
                            }))
                          ], 
                      false, true
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">UGC ID</label>
                    {renderField('UGC ID', editedData.ugcId, 'ugcId', 'text', [], false, true)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Scholarship Amount</label>
                    {renderField('Scholarship Amount', editedData.scholarshipAmount, 'scholarshipAmount', 'number', [], false, true)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Contingency Amount</label>
                    {renderField('Contingency Amount', editedData.contingencyAmount, 'contingencyAmount', 'number', [], false, true)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Scholarship Type</label>
                    {renderField('Scholarship Type', editedData.scholarshipType, 'scholarshipType', 'select',
                      ['CPSF', 'SODH', 'UGC_CSIR_JRF', 'DST_INSPIRE', 'OTHER'].map(type => ({ 
                        value: type, 
                        label: type.replace(/_/g, '/').replace('DST_INSPIRE', 'DST-INSPIRE') 
                      })), false, true
                    )}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiFileText className="w-5 h-5 text-blue-600" />
                  Identification Documents
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Aadhaar Number <span className="text-red-500">*</span>
                    </label>
                    {renderField('Aadhaar Number', editedData.aadhaarNumber, 'aadhaarNumber', 'text', [], true, true)}
                    {validationErrors.aadhaarNumber && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.aadhaarNumber}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Pancard Number <span className="text-red-500">*</span>
                    </label>
                    {renderField('Pancard Number', editedData.pancardNumber, 'pancardNumber', 'text', [], true, true)}
                    {validationErrors.pancardNumber && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.pancardNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white p-6 border-t border-gray-200 flex-shrink-0">
          {!actionType ? (
            // Only show approve/reject buttons if student is still pending
            student.approvalStatus === 'PENDING' ? (
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    // Check if required fields are filled before allowing approval
                    if (!validateRequiredFields()) {
                      setError('Please fill all required fields (marked with *) before approving the student.');
                      return;
                    }
                    setActionType('APPROVED');
                  }}
                  className="flex items-center gap-2 px-6 py-3 text-blue-700 bg-blue-100 hover:bg-blue-200 font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <FiCheck className="w-5 h-5" />
                  Approve Student
                </button>
                <button
                  onClick={() => setActionType('REJECTED')}
                  className="flex items-center gap-2 px-6 py-3 text-red-700 bg-red-100 hover:bg-red-200 font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <FiXIcon className="w-5 h-5" />
                  Reject Student
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600">
                  {student.approvalStatus === 'APPROVED' 
                    ? 'This student has already been approved.' 
                    : student.approvalStatus === 'REJECTED'
                    ? 'This student has been rejected.'
                    : 'Student status: ' + student.approvalStatus}
                </p>
              </div>
            )
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for {actionType === 'APPROVED' ? 'Approval' : 'Rejection'}:
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={`Please provide a clear reason for ${actionType.toLowerCase()}...`}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  rows="3"
                />
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleActionSubmit}
                  className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-sm transition-colors ${
                    actionType === 'APPROVED' 
                      ? 'text-blue-700 bg-blue-100 hover:bg-blue-200' 
                      : 'text-red-700 bg-red-100 hover:bg-red-200'
                  }`}
                >
                  {actionType === 'APPROVED' ? 'Confirm Approval' : 'Confirm Rejection'}
                </button>
                <button
                  onClick={() => {
                    setActionType(null);
                    setReason('');
                    setError('');
                  }}
                  className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default StudentProfileReviewModal;
