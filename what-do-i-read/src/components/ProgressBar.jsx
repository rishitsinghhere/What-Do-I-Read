import React, { useState, useEffect } from 'react';
import { useLibrary } from '../context/LibraryContext';

const ProgressBar = ({ bookId, totalPages, initialProgress = 0, onProgressChange }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const { setProgress, saved } = useLibrary();

  // Initialize progress from saved books or props
  useEffect(() => {
    const savedProgress = saved[bookId]?.progress || initialProgress || 0;
    setCurrentPage(savedProgress);
    setInputValue(savedProgress.toString());
  }, [bookId, initialProgress, saved]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    const pageNum = parseInt(value);
    if (!isNaN(pageNum) && pageNum >= 0 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const handleInputBlur = async () => {
    const pageNum = parseInt(inputValue) || 0;
    const validPage = Math.max(0, Math.min(pageNum, totalPages));
    
    setCurrentPage(validPage);
    setInputValue(validPage.toString());
    
    // Update progress in database
    await setProgress(bookId, validPage);
    
    // Call callback if provided
    if (onProgressChange) {
      onProgressChange(bookId, validPage);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  const progressPercentage = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  return (
    <div style={{ marginTop: '16px' }}>
      <div className="label" style={{ marginBottom: '8px' }}>
        Reading Progress
      </div>
      
      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '8px'
      }}>
        <div style={{
          width: `${Math.min(progressPercentage, 100)}%`,
          height: '100%',
          backgroundColor: progressPercentage === 100 ? '#4caf50' : '#2196f3',
          transition: 'width 0.3s ease',
          borderRadius: '4px'
        }} />
      </div>
      
      {/* Input and Status */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        fontSize: '14px'
      }}>
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyPress={handleKeyPress}
          min="0"
          max={totalPages}
          style={{
            width: '80px',
            padding: '4px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            textAlign: 'center'
          }}
          placeholder="Page"
        />
        <span>/ {totalPages} pages</span>
        <span style={{ 
          marginLeft: 'auto',
          fontWeight: 'bold',
          color: progressPercentage === 100 ? '#4caf50' : '#666'
        }}>
          {progressPercentage.toFixed(1)}%
          {progressPercentage === 100 && ' ✓ Complete!'}
        </span>
      </div>
      
      {/* Quick buttons for common actions */}
      <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
        {currentPage === 0 && (
          <button 
            className="btn"
            onClick={() => {
              const startPage = 1;
              setCurrentPage(startPage);
              setInputValue(startPage.toString());
              setProgress(bookId, startPage);
              if (onProgressChange) onProgressChange(bookId, startPage);
            }}
            style={{ fontSize: '12px', padding: '4px 8px' }}
          >
            Start Reading
          </button>
        )}
        {currentPage > 0 && currentPage < totalPages && (
          <button 
            className="btn"
            onClick={() => {
              setCurrentPage(totalPages);
              setInputValue(totalPages.toString());
              setProgress(bookId, totalPages);
              if (onProgressChange) onProgressChange(bookId, totalPages);
            }}
            style={{ fontSize: '12px', padding: '4px 8px' }}
          >
            Mark Complete
          </button>
        )}
        {currentPage > 0 && (
          <button 
            className="btn"
            onClick={() => {
              setCurrentPage(0);
              setInputValue('0');
              setProgress(bookId, 0);
              if (onProgressChange) onProgressChange(bookId, 0);
            }}
            style={{ fontSize: '12px', padding: '4px 8px' }}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;