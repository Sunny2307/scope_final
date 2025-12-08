import React, { useState, useEffect } from 'react';
import { FiDownload, FiCalendar, FiFileText } from 'react-icons/fi';
import api from '../../lib/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import DeanDashboardHeader from '../../components/dean/DeanDashboardHeader';
import DeanSidebar from '../../components/dean/DeanSidebar';
import DashboardFooter from '../../components/layout/DashboardFooter';

const DeanReportGenerationPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/dean/monthly-report', {
        params: {
          year: selectedYear,
          month: selectedMonth,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      setReportData(response.data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err.response?.data?.error || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    // Format as Indian currency - use Rs. instead of ₹ for PDF compatibility
    const formatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(amount);
    return `Rs. ${formatted}`;
  };

  const downloadPDF = async () => {
    if (!reportData || !reportData.students || reportData.students.length === 0) {
      alert('No report data available to download');
      return;
    }

    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    
    // Load and add logo
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = '/logo/charusat_logo.jpg';
      
      await new Promise((resolve, reject) => {
        if (logoImg.complete) {
          resolve();
        } else {
          logoImg.onload = resolve;
          logoImg.onerror = () => {
            console.log('Logo not found, continuing without logo');
            resolve(); // Don't reject, just continue without logo
          };
          setTimeout(() => {
            console.log('Logo loading timeout, continuing without logo');
            resolve(); // Don't reject, just continue without logo
          }, 2000);
        }
      });
      
      // Add logo at top left (scaled to fit) if loaded successfully - make it bigger
      if (logoImg.complete && logoImg.naturalWidth > 0) {
        const logoWidth = 40; // Increased from 25 to 40
        const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
        doc.addImage(logoImg, 'JPEG', margin, 5, logoWidth, logoHeight);
      }
    } catch (err) {
      console.log('Logo loading error, continuing without logo:', err);
    }

    // Header - Institute Name (centered)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PDPIAS - P D Patel Institute of Applied Sciences - CHARUSAT', pageWidth / 2, 15, { align: 'center' });

    // Report Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Monthly Scholarship Report (Dean)', pageWidth / 2, 22, { align: 'center' });

    // Month and Year
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${monthNames[selectedMonth - 1]} ${selectedYear}`,
      pageWidth / 2,
      28,
      { align: 'center' }
    );

    // Report generation date and time (very top right corner)
    const now = new Date();
    const dateTimeStr = `Generated on: ${now.toLocaleDateString('en-IN')} at ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(dateTimeStr, pageWidth - margin, 5, { align: 'right' });

    const tableStartY = 35;

    // Table data (with signature column for PDF)
    const tableData = reportData.students.map((student, index) => [
      index + 1,
      student.name,
      student.ugcId,
      student.department,
      student.clDays || 0,
      student.dlDays || 0,
      student.lwpDays || 0,
      formatCurrency(student.finalAmount),
      '', // Signature column (empty)
    ]);

    // Table columns
    const columns = [
      'Sr. No.',
      'Student Name',
      'UGC ID',
      'Department',
      'CL',
      'DL',
      'LWP',
      'Final Amount',
      'Signature',
    ];

    // Generate table using autoTable
    const autoTableModule = await import('jspdf-autotable');
    const autoTable = autoTableModule.default || autoTableModule;
    
    // Calculate table width to center it
    const totalColumnWidth = 15 + 40 + 30 + 35 + 15 + 15 + 15 + 30 + 30; // Sum of all column widths
    const tableMargin = (pageWidth - totalColumnWidth) / 2;
    
    // Use autoTable function directly with centered table
    autoTable(doc, {
      head: [columns],
      body: tableData,
      startY: tableStartY,
      margin: { left: tableMargin, right: tableMargin },
      tableWidth: totalColumnWidth,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        halign: 'center', // Center align all cells
      },
      headStyles: {
        fillColor: [14, 116, 144], // cyan-700
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' }, // Sr. No.
        1: { cellWidth: 40, halign: 'center' }, // Name
        2: { cellWidth: 30, halign: 'center' }, // UGC ID
        3: { cellWidth: 35, halign: 'center' }, // Department
        4: { cellWidth: 15, halign: 'center' }, // CL
        5: { cellWidth: 15, halign: 'center' }, // DL
        6: { cellWidth: 15, halign: 'center' }, // LWP
        7: { cellWidth: 30, halign: 'center' }, // Final Amount
        8: { cellWidth: 30, halign: 'center' }, // Signature
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251], // gray-50
      },
    });

    // Get final Y position from the autoTable result
    let finalY = tableStartY + (tableData.length * 5) + 10;
    if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
      finalY = doc.lastAutoTable.finalY + 15;
    }

    // Signature sections at the bottom
    const signatureY = Math.min(finalY + 20, pageHeight - 30);
    const signatureLineY = signatureY + 10;
    const signatureNameY = signatureLineY + 5;

    // Guide signature (left side)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.line(margin + 20, signatureLineY, margin + 60, signatureLineY);
    doc.text('Guide Signature', margin + 40, signatureNameY, { align: 'center' });

    // Dean signature (right side)
    doc.line(pageWidth - margin - 60, signatureLineY, pageWidth - margin - 20, signatureLineY);
    doc.text('Dean Signature', pageWidth - margin - 40, signatureNameY, { align: 'center' });

    // Save PDF
    const fileName = `Dean_Monthly_Report_${monthNames[selectedMonth - 1]}_${selectedYear}.pdf`;
    doc.save(fileName);
  };

  // Generate report on mount with current month
  useEffect(() => {
    generateReport();
  }, []);

  return (
    <div className="w-screen h-screen bg-white flex flex-col">
      <DeanDashboardHeader />
      <div className="flex flex-1 overflow-y-auto relative">
        <DeanSidebar
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          activeItem="Report Generation"
        />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Report Generation</h1>
          <p className="text-gray-600">Generate monthly reports for student scholarships and leaves</p>
        </div>

        {/* Month/Year Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <FiCalendar className="text-cyan-700" size={20} />
              <label className="text-sm font-medium text-gray-700">Select Month:</label>
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-900 bg-white"
            >
              {monthNames.map((month, index) => (
                <option key={index + 1} value={index + 1} className="text-gray-900">
                  {month}
                </option>
              ))}
            </select>

            <label className="text-sm font-medium text-gray-700">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-900 bg-white"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                <option key={year} value={year} className="text-gray-900">
                  {year}
                </option>
              ))}
            </select>

            <button
              onClick={generateReport}
              disabled={loading}
              className="ml-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <FiFileText size={18} />
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {/* Report Table */}
        {reportData && reportData.students && reportData.students.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Report Header */}
            <div className="bg-cyan-50 px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-center flex-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    Monthly Report - {reportData.monthName} {reportData.year}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Total Students: {reportData.students.length}
                  </p>
                </div>
                <button
                  onClick={downloadPDF}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center gap-2 transition-colors"
                >
                  <FiDownload size={18} />
                  Download PDF
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-cyan-100">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-cyan-900 uppercase tracking-wider">
                      Sr. No.
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-cyan-900 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-cyan-900 uppercase tracking-wider">
                      UGC ID
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-cyan-900 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-cyan-900 uppercase tracking-wider">
                      CL
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-cyan-900 uppercase tracking-wider">
                      DL
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-cyan-900 uppercase tracking-wider">
                      LWP
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-cyan-900 uppercase tracking-wider">
                      Final Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.students.map((student, index) => (
                    <tr key={student.studentId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                        {student.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">
                        {student.ugcId}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">
                        {student.department}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
                        {student.clDays || 0}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
                        {student.dlDays || 0}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
                        {student.lwpDays || 0}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-semibold text-green-700">
                        {formatCurrency(student.finalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {reportData && reportData.students && reportData.students.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FiFileText className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">
              No students found for {monthNames[selectedMonth - 1]} {selectedYear}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && !reportData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Generating report...</p>
          </div>
        )}
          </div>
        </main>
      </div>
      <DashboardFooter />
    </div>
  );
};

export default DeanReportGenerationPage;

