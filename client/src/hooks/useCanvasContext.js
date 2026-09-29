import { useContext } from 'react';
import { CanvasContext } from '../context/canvas/CanvasContext';

// Custom hook to access the canvas context
export const useCanvasContext = () => {
  const context = useContext(CanvasContext);

  // Ensure the hook is used within a CanvasContext provider
  if (!context) {
    throw new Error('useCanvasContext hook must be used within CanvasContext');
  }

  return context; // Return the canvas context (canvasEditor, size, orientation, etc.)
};
