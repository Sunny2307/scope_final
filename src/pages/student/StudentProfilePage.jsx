import React, { useContext, useMemo, useState } from 'react';
import { StudentContext } from '../../context/StudentContext';
import DashboardHeader from '../../components/layout/DashboardHeader';
import DashboardFooter from '../../components/layout/DashboardFooter';
import Sidebar from '../../components/layout/Sidebar';

const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return value;
  return `₹${numericValue.toLocaleString('en-IN')}`;
};

const booleanLabel = (value) => (value ? 'Yes' : 'No');

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-sm font-medium text-gray-900 break-words">{value || 'N/A'}</p>
  </div>
);

const normalizeProfile = (user) => {
  if (!user) return {};
  const base = user.profile ?? {};
  const raw = user.profileRaw ?? {};

  const pick = (primary, ...fallbacks) => {
    for (const value of [primary, ...fallbacks]) {
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
    return '';
  };

  const admissionDate = pick(base.admissionDate, raw.admissionDate);
  const registrationDate = pick(base.registrationDate, raw.registrationDate);
  const birthDate = pick(base.birthDate, raw.birthDate);

  return {
    studentId: pick(base.studentId, raw.ugcId, user.studentId),
    employeeId: pick(base.employeeId, raw.employeeId),
    studentName: pick(base.studentName, user.name),
    institute: pick(base.institute, user.institute, 'CHARUSAT'),
    admissionDate,
    registrationDate,
    admissionYear: pick(base.admissionYear, raw.admissionDate ? new Date(raw.admissionDate).getFullYear() : undefined, user?.admissionYear),
    currentSemester: pick(base.currentSemester, raw.currentSemester),
    gender: pick(base.gender, raw.gender),
    birthDate,
    admissionCastCategory: pick(base.admissionCastCategory, raw.admissionCastCategory),
    actualCastCategory: pick(base.actualCastCategory, raw.actualCastCategory),
    nationality: pick(base.nationality, raw.nationality),
    localAddress: pick(base.localAddress, raw.localFullAddress),
    permanentAddress: pick(base.permanentAddress, raw.permanentFullAddress),
    country: pick(base.country, raw.country),
    mobileNo: pick(base.mobileNo, raw.mobileNo),
    guardianMobileNo: pick(base.guardianMobileNo, raw.guardianMobileNo),
    guardianEmail: pick(base.guardianEmail, raw.guardianEmail),
    personalEmail: pick(base.personalEmail, raw.personalEmail),
    institutionalEmail: pick(base.institutionalEmail, user.institutionalEmail, user.email),
    isHandicapped: base.isHandicapped ?? raw.isHandicapped ?? false,
    disability: pick(base.disability, raw.disability),
    belongsToSamaj: base.belongsToSamaj ?? raw.belongsToSamaj ?? false,
    hostelNameAddress: pick(base.hostelNameAddress, raw.hostelNameAndAddress),
    nameOfGuide: pick(base.nameOfGuide, raw.nameOfGuide, user.guide),
    nameOfCoGuide: pick(base.nameOfCoGuide, raw.nameOfCoGuide),
    ugcId: pick(base.ugcId, raw.ugcId, user.collegeId),
    scholarshipType: pick(base.scholarshipType, raw.scholarshipType, user.scholarshipType),
    scholarshipAmount: pick(base.scholarshipAmount, raw.scholarshipAmount, user.scholarshipAmount),
    contingencyAmount: pick(base.contingencyAmount, raw.contingencyAmount),
    aadhaarNumber: pick(base.aadhaarNumber, raw.aadhaarNumber),
    pancardNumber: pick(base.pancardNumber, raw.pancardNumber),
  };
};

const StudentProfilePage = () => {
  const { user, isLoading } = useContext(StudentContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const profile = useMemo(() => normalizeProfile(user), [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-600">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md text-center bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Profile unavailable</h2>
          <p className="text-sm text-gray-600 mb-6">
            We could not load your profile information. Please log in again or contact support if the issue persists.
          </p>
          <a href="/" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const statusBadge = () => {
    if (!user.isActive) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">Inactive</span>;
    }
    switch ((user.approvalStatus || '').toUpperCase()) {
      case 'APPROVED':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Approved</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Rejected</span>;
      case 'PENDING':
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Pending</span>;
    }
  };

  return (
    <div className="w-screen h-screen bg-white flex flex-col">
      <DashboardHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen((prev) => !prev)}
          activeItem="Profile"
        />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50">
          <div className="max-w-5xl mx-auto space-y-6">
            <header className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap items-start gap-4 justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-500">Student Profile</p>
                  <h1 className="text-3xl font-bold text-gray-900 mt-2">{profile.studentName || user.name || 'Student'}</h1>
                  <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                      <span className="font-semibold">Student ID:</span>
                      {profile.studentId || user.studentId || 'N/A'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 text-purple-700">
                      <span className="font-semibold">Employee ID:</span>
                      {profile.employeeId || 'N/A'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                      <span className="font-semibold">Department:</span>
                      {user.department || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  {statusBadge()}
                  <div className="text-right text-sm text-gray-500">
                    <p className="font-semibold text-gray-700">Guide</p>
                    <p>{profile.nameOfGuide || user.guide || 'N/A'}</p>
                    {profile.nameOfCoGuide && <p className="text-gray-500">Co-Guide: {profile.nameOfCoGuide}</p>}
                  </div>
                </div>
              </div>
            </header>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <article className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Academic Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InfoItem label="Institute" value={profile.institute || 'CHARUSAT'} />
                  <InfoItem label="Admission Year" value={profile.admissionYear ? String(profile.admissionYear) : 'N/A'} />
                  <InfoItem label="Admission Date" value={formatDate(profile.admissionDate)} />
                  <InfoItem label="Registration Date" value={formatDate(profile.registrationDate)} />
                  <InfoItem label="Current Semester" value={profile.currentSemester ? `Semester ${profile.currentSemester}` : 'N/A'} />
                  <InfoItem label="Gender" value={profile.gender || 'N/A'} />
                  <InfoItem label="Birth Date" value={formatDate(profile.birthDate)} />
                  <InfoItem label="Nationality" value={profile.nationality || 'N/A'} />
                  <InfoItem label="Admission Cast Category" value={profile.admissionCastCategory || 'N/A'} />
                  <InfoItem label="Actual Cast Category" value={profile.actualCastCategory || 'N/A'} />
                </div>
              </article>

              <article className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Scholarship</h2>
                <div className="space-y-4">
                  <InfoItem label="Scholarship Type" value={profile.scholarshipType ? profile.scholarshipType.replace(/_/g, ' / ') : 'N/A'} />
                  <InfoItem label="Scholarship Amount" value={formatCurrency(profile.scholarshipAmount)} />
                  <InfoItem label="Contingency Amount" value={formatCurrency(profile.contingencyAmount)} />
                  <InfoItem label="UGC ID" value={profile.ugcId || 'N/A'} />
                </div>
              </article>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <article className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <InfoItem label="Institutional Email" value={profile.institutionalEmail} />
                  <InfoItem label="Personal Email" value={profile.personalEmail} />
                  <InfoItem label="Mobile Number" value={profile.mobileNo} />
                  <InfoItem label="Guardian Mobile Number" value={profile.guardianMobileNo} />
                  <InfoItem label="Guardian Email" value={profile.guardianEmail} />
                  <InfoItem label="Country" value={profile.country} />
                </div>
              </article>

              <article className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Addresses</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Local Address</p>
                    <p className="text-sm font-medium text-gray-900 whitespace-pre-line min-h-[3rem]">
                      {profile.localAddress || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Permanent Address</p>
                    <p className="text-sm font-medium text-gray-900 whitespace-pre-line min-h-[3rem]">
                      {profile.permanentAddress || 'N/A'}
                    </p>
                  </div>
                  <InfoItem label="Hostel Name & Address" value={profile.hostelNameAddress} />
                </div>
              </article>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <article className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InfoItem label="Differently-abled" value={booleanLabel(profile.isHandicapped)} />
                  <InfoItem label="Belongs to Samaj" value={booleanLabel(profile.belongsToSamaj)} />
                  <InfoItem label="Disability Details" value={profile.disability} />
                  <InfoItem label="Name of Guide" value={profile.nameOfGuide || user.guide} />
                  <InfoItem label="Name of Co-Guide" value={profile.nameOfCoGuide} />
                </div>
              </article>

              <article className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Identification</h2>
                <div className="space-y-4">
                  <InfoItem label="Aadhaar Number" value={profile.aadhaarNumber} />
                  <InfoItem label="PAN Card Number" value={profile.pancardNumber} />
                </div>
              </article>
            </section>
          </div>
        </main>
      </div>
      <DashboardFooter />
    </div>
  );
};

export default StudentProfilePage;
