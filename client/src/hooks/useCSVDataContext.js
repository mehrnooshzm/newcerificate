import { useContext } from 'react';
import { CSVDataContext } from '../context/csvData/CSVDataContext';

// Custom hook to access CSV data context
export const useCSVDataContext = () => {
  const context = useContext(CSVDataContext);

  // Ensure the hook is used within a CSVDataContext provider
  if (!context) {
    throw new Error(
      'useCSVDataContext hook must be used within CSVDataContext'
    );
  }

  return context; // Return CSV data and related functions
};
