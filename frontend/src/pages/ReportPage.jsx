import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ReportPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const generateReport = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await axios.get(`${baseUrl}/api/report/latest`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReportData(response.data);
      } catch (err) {
        setError("Could not compile your latest clinical profile. Please complete a screening first.");
      } finally {
        setLoading(false);
      }
    };
    generateReport();
  }, []);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.get(`${baseUrl}/api/report/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob' // Expect binary file stream
      });
      
      // Create matching browser download tag
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `hemavision_clinical_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert("Failed to export PDF report sheet.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center"><LoadingSpinner message="Assembling report cards..." /></div>;

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <span className="text-4xl mb-2">📑</span>
        <h2 className="text-lg font-bold text-slate-300">Report Compiler Idle</h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">{error}</p>
        <Button variant="primary" onClick={() => navigate('/screening')}>Perform First Screening</Button>
      </div>
    );
  }

  const patient = reportData.data?.patient_info || {};
  const diag = reportData.data?.diagnostics || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        
        {/* Navigation & Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-100">Export diagnostic Report</h1>
            <p className="text-xs text-slate-400">Generate medical-grade ReportLab PDF summaries.</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>Back</Button>
        </div>

        {/* Report Preview */}
        <Card className="bg-slate-900/60 border border-slate-800">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
            <span className="text-xs font-bold text-slate-300">HemaVision Clinical Card Preview</span>
            <span className="text-[10px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded font-extrabold uppercase">Ready</span>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Patient Name:</span>
              <span className="font-semibold text-slate-200">{patient.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Age / Gender:</span>
              <span className="font-semibold text-slate-200">{patient.age} / {patient.gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Determined Risk Tier:</span>
              <span className="font-semibold text-teal-400">{diag.final_risk_level} Anemia Risk</span>
            </div>
            <div className="flex justify-between border-t border-slate-800/60 pt-3">
              <span className="text-slate-400">Fused Risk Index:</span>
              <span className="font-semibold text-slate-200">{diag.final_risk_score}%</span>
            </div>
          </div>

          <Button 
            variant="primary" 
            onClick={handleDownload} 
            loading={downloading}
            className="w-full mt-6 py-3"
          >
            Download Compiled PDF Report
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default ReportPage;
