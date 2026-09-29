import { useState } from 'react';
import { createContext } from 'react';

// Create context to share CSV data across components
export const CSVDataContext = createContext(null);

export const CSVDataProvider = ({ children }) => {
  // State to hold the uploaded CSV data
  const [CSVData, setCSVData] = useState(null);

  // State to track which row is currently being previewed
  const [previewRowIndex, setPreviewRowIndex] = useState(null);

  // State to track records selected for batch export
  const [selectedRecords, setSelectedRecords] = useState([]);

  return (
    <CSVDataContext
      value={{
        CSVData,
        setCSVData,
        previewRowIndex,
        setPreviewRowIndex,
        selectedRecords,
        setSelectedRecords,
      }}
    >
      {children}
    </CSVDataContext>
  );
};