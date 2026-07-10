import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ResultCard from '../components/screening/ResultCard';
import GradCAMViewer from '../components/screening/GradCAMViewer';
import FoodCard from '../components/nutrition/FoodCard';

const ResultsPage = () => {
  const [latestScreening, setLatestScreening] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestResult = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = BASE_URL;
        const response = await axios.get(`${baseUrl}/api/v1/screening/latest`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLatestScreening(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || "No screening logs found.");
      } finally {
        setLoading(false);
      }
    };
    fetchLatestResult();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center"><LoadingSpinner /></div>;
  
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <span className="text-4xl mb-2">⚠️</span>
        <h2 className="text-lg font-bold text-slate-300">Screening Data Unavailable</h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">{error}</p>
        <Button variant="primary" onClick={() => navigate('/screening')}>Perform First Screening</Button>
      </div>
    );
  }

  const exp = latestScreening.explanation || {};
  const shap = exp.shap || {};
  const diet = latestScreening.diet_recommendations || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Navigation & Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">Screening Outcomes</h1>
            <p className="text-xs text-slate-400">Deep learning and clinical symptom risk synthesis.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>Dashboard</Button>
            <Button variant="primary" onClick={() => navigate('/report')}>Export PDF</Button>
          </div>
        </div>

        {/* Fused Risk Card */}
        <ResultCard result={latestScreening} />

        {/* Grad-CAM & SHAP Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GradCAMViewer explanation={exp} />
          
          {/* SHAP Table */}
          <Card className="bg-slate-900/50 border border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 mb-4 border-b border-slate-800 pb-2">
              Symptom attribution matrix (SHAP)
            </h3>
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
              {Object.keys(shap).length === 0 ? (
                <p className="text-xs text-slate-500 italic">No symptom questionnaire data tracked.</p>
              ) : (
                Object.entries(shap).map(([feat, weight]) => {
                  const isPositive = weight > 0;
                  return (
                    <div key={feat} className="flex justify-between items-center py-2 border-b border-slate-800/40">
                      <span className="text-xs text-slate-300 capitalize">{feat.replace(/_/g, ' ')}</span>
                      <span className={`text-xs font-bold ${isPositive ? 'text-rose-400' : 'text-teal-400'}`}>
                        {isPositive ? '+' : ''}{weight}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Diet Plan */}
        <Card className="bg-slate-900/50 border border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 mb-4 border-b border-slate-800 pb-2">
            Personalized Dietary Guidelines
          </h3>
          <p className="text-xs text-slate-300 mb-2"><b>Care Summary:</b> {diet.summary}</p>
          <p className="text-xs text-slate-300 mb-4"><b>Frequency:</b> {diet.frequency}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-teal-400 font-bold uppercase tracking-wider block mb-2">Recommended Iron Foods</span>
              <div className="flex flex-col gap-2">
                {diet.iron_sources?.map((item, idx) => <FoodCard key={idx} name={item} detail="Iron-dense source" />)}
              </div>
            </div>
            <div>
              <span className="text-[11px] text-yellow-400 font-bold uppercase tracking-wider block mb-2">Absorption Boosters (Vit C)</span>
              <div className="flex flex-col gap-2">
                {diet.vitamin_c_sources?.map((item, idx) => <FoodCard key={idx} name={item} detail="Vitamin C enhancer" />)}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResultsPage;
