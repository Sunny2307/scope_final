import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiCalendar, FiCheck, FiX, FiEye } from 'react-icons/fi';
import api from '../../lib/api';
import StudentProfileReviewModal from '../../components/operator/StudentProfileReviewModal';

const PendingStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [action, setAction] = useState('');
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  const fetchPendingStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/auth/operator/pending-students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching pending students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async () => {
    if (!selectedStudent || !action) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await api.post('/api/auth/operator/approve-reject-student', {
        studentId: selectedStudent.id,
        action: action,
        reason: reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove the processed student from the list
      setStudents(students.filter(s => s.id !== selectedStudent.id));
      setShowModal(false);
      setSelectedStudent(null);
      setAction('');
      setReason('');
    } catch (error) {
      console.error('Error processing student:', error);
      alert('Error processing student: ' + (error.response?.data?.error || error.message));
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (student, actionType) => {
    setSelectedStudent(student);
    setAction(actionType);
    setShowModal(true);
  };

  const openDetailModal = (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const handleStudentApproved = (student) => {
    setStudents(students.filter(s => s.id !== student.id));
    setShowDetailModal(false);
    setSelectedStudent(null);
  };

  const handleStudentRejected = (student) => {
    setStudents(students.filter(s => s.id !== student.id));
    setShowDetailModal(false);
    setSelectedStudent(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className={`p-6 transition-all duration-300 ${showDetailModal ? 'blur-sm pointer-events-none' : ''}`} style={showDetailModal ? { filter: 'blur(4px)' } : {}}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Pending Students</h1>
          <p className="text-gray-600">Review and approve student registrations</p>
        </div>

      {students.length === 0 ? (
        <div className="text-center py-12">
          <FiUser className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending students</h3>
          <p className="text-gray-500">All student registrations have been processed.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                    Department
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
                {students.map((student) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.department || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(student.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openDetailModal(student)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <FiEye className="h-4 w-4 mr-2" />
                        Review & Process
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>

      {/* Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-xl bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {action === 'APPROVED' ? 'Approve Student' : 
                   action === 'REJECTED' ? 'Reject Student' : 'Student Details'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">{selectedStudent.name}</h4>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Email:</strong> {selectedStudent.email}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Institutional Email:</strong> {selectedStudent.institutionalEmail}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Student ID:</strong> {selectedStudent.studentId || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Department:</strong> {selectedStudent.department || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Applied:</strong> {formatDate(selectedStudent.createdAt)}
                  </p>
                </div>
              </div>

              {action && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {action === 'REJECTED' ? 'Reason for rejection:' : 'Approval notes (optional):'}
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder={action === 'REJECTED' ? 'Please provide a reason for rejection...' : 'Optional notes...'}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                {action && (
                  <button
                    onClick={handleApproveReject}
                    disabled={processing}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                      action === 'APPROVED' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    } disabled:opacity-50`}
                  >
                    {processing ? 'Processing...' : (action === 'APPROVED' ? 'Approve' : 'Reject')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Student Profile Modal */}
      {showDetailModal && selectedStudent && (
        <StudentProfileReviewModal
          student={selectedStudent}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedStudent(null);
          }}
          onApprove={handleStudentApproved}
          onReject={handleStudentRejected}
        />
      )}
    </>
  );
};

export default PendingStudentsPage;
