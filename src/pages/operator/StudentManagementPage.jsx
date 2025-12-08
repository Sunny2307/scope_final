import React, { useState, useEffect } from 'react';
import { FiUser, FiToggleLeft, FiToggleRight, FiEye } from 'react-icons/fi';
import api from '../../lib/api';
import StudentProfileReviewModal from '../../components/operator/StudentProfileReviewModal.jsx';

const StudentManagementPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, APPROVED, REJECTED, PENDING
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchAllStudents();
  }, []);

  const fetchAllStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/auth/operator/all-students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data.students);
      // Update selected student if modal is open to reflect latest data including guide/co-guide
      if (selectedStudent) {
        const updatedStudent = response.data.students.find((student) => student.id === selectedStudent.id);
        if (updatedStudent) {
          setSelectedStudent(updatedStudent);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (studentId, currentStatus) => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await api.post('/api/auth/operator/toggle-student-status', {
        studentId: studentId,
        isActive: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the student status in the local state
      setStudents(students.map(s => 
        s.id === studentId ? { ...s, isActive: !currentStatus } : s
      ));
    } catch (error) {
      console.error('Error toggling student status:', error);
      alert('Error updating student status: ' + (error.response?.data?.error || error.message));
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const handleStudentApproved = (student) => {
    setStudents(prevStudents => prevStudents.map(s => 
      s.id === student.id ? { ...s, approvalStatus: 'APPROVED', isApproved: true } : s
    ));
    setSelectedStudent(prev => prev && prev.id === student.id ? { ...prev, approvalStatus: 'APPROVED', isApproved: true } : prev);
  };

  const handleStudentRejected = (student) => {
    setStudents(prevStudents => prevStudents.map(s => 
      s.id === student.id ? { ...s, approvalStatus: 'REJECTED', isApproved: false } : s
    ));
    setSelectedStudent(prev => prev && prev.id === student.id ? { ...prev, approvalStatus: 'REJECTED', isApproved: false } : prev);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status, isApproved, isActive) => {
    if (!isActive) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>;
    }
    
    if (status === 'APPROVED' && isApproved) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>;
    } else if (status === 'REJECTED') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
    } else if (status === 'PENDING') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
  };

  const filteredStudents = students.filter(student => {
    if (filter === 'ALL') return true;
    if (filter === 'APPROVED') return student.approvalStatus === 'APPROVED' && student.isApproved;
    if (filter === 'REJECTED') return student.approvalStatus === 'REJECTED';
    if (filter === 'PENDING') return student.approvalStatus === 'PENDING';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Management</h1>
        <p className="text-gray-600">Manage all student accounts and their status</p>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'ALL' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Students
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'APPROVED' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'PENDING' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('REJECTED')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'REJECTED' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <FiUser className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-500">No students match the current filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {student.studentId || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.email}</div>
                      <div className="text-sm text-gray-500">{student.institutionalEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(student.approvalStatus, student.isApproved, student.isActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(student.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleStatus(student.id, student.isActive)}
                          disabled={processing}
                          className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded ${
                            student.isActive 
                              ? 'text-red-700 bg-red-100 hover:bg-red-200' 
                              : 'text-green-700 bg-green-100 hover:bg-green-200'
                          } disabled:opacity-50`}
                        >
                          {student.isActive ? (
                            <>
                              <FiToggleLeft className="h-3 w-3 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <FiToggleRight className="h-3 w-3 mr-1" />
                              Activate
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => openModal(student)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <FiEye className="h-3 w-3 mr-1" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedStudent && (
        <StudentProfileReviewModal 
          student={selectedStudent}
          onClose={closeModal}
          onApprove={handleStudentApproved}
          onReject={handleStudentRejected}
          onProfileUpdated={fetchAllStudents}
        />
      )}
    </div>
  );
};

export default StudentManagementPage;
