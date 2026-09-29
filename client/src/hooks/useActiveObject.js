import { useState, useEffect, useCallback } from 'react';
import { useCanvasContext } from '@/hooks/useCanvasContext';

// Custom hook to get the currently active object on the Fabric.js canvas
export const useActiveObject = () => {
  const { canvasEditor } = useCanvasContext();

  // Helper to unwrap dynamic field text if needed
  const getActualActiveObject = useCallback(() => {
    if (!canvasEditor) return null;

    const obj = canvasEditor.getActiveObject();
    if (!obj) return null;

    // If it’s a dynamic field group, return the field text inside
    if (obj.type === 'custom-group' && obj.metadata?.field) {
      return obj.getObjects().find((o) => o.isDynamicFieldText) || obj;
    }

    return obj;
  }, [canvasEditor]);

  const [activeObject, setActiveObject] = useState(getActualActiveObject);

  useEffect(() => {
    if (!canvasEditor) return;

    const handleSelection = () => setActiveObject(getActualActiveObject());
    const handleClear = () => setActiveObject(null);

    // Clear when clicking empty space
    const handleMouseDown = (opt) => {
      if (!opt.target) handleClear();
    };

    // Listen to canvas events
    canvasEditor.on('selection:created', handleSelection);
    canvasEditor.on('selection:updated', handleSelection);
    canvasEditor.on('selection:cleared', handleClear);
    canvasEditor.on('mouse:down', handleMouseDown);

    return () => {
      // Clean up event listeners
      canvasEditor.off('selection:created', handleSelection);
      canvasEditor.off('selection:updated', handleSelection);
      canvasEditor.off('selection:cleared', handleClear);
      canvasEditor.off('mouse:down', handleMouseDown);
    };
  }, [canvasEditor, getActualActiveObject]);

  return activeObject; // Return the currently selected object (or null)
};
