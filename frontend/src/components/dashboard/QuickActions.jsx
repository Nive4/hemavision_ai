import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-3">
      <Button 
        variant="primary" 
        onClick={() => navigate('/screening')}
        className="w-full justify-between group"
      >
        <span>Start Clinical Screening</span>
        <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
      </Button>
      
      <Button 
        variant="secondary" 
        onClick={() => navigate('/chat')}
        className="w-full justify-between"
      >
        <span>Consult Health Assistant</span>
        <span>💬</span>
      </Button>

      <Button 
        variant="secondary" 
        onClick={() => navigate('/progress')}
        className="w-full justify-between"
      >
        <span>Track Risk Trends</span>
        <span>📈</span>
      </Button>
    </div>
  );
};

export default QuickActions;
