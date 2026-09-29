import { useEffect, useState } from 'react';
import { Canvas } from 'fabric';
import { ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { useCanvasContext } from '@/hooks/useCanvasContext';

const LayersList = () => {
  const [layers, setLayers] = useState([]); // Store canvas layers
  const [selectedLayer, setSelectedLayer] = useState(null); // Currently selected layer

  const { canvasEditor } = useCanvasContext();

  useEffect(() => {
    if (canvasEditor) {
      // Update layer list on canvas changes
      canvasEditor.on('object:added', updateLayers);
      canvasEditor.on('object:removed', updateLayers);
      canvasEditor.on('object:modified', updateLayers);

      // Track selected object
      canvasEditor.on('selection:created', handleObjectSelected);
      canvasEditor.on('selection:updated', handleObjectSelected);
      canvasEditor.on('selection:cleared', () => setSelectedLayer(null));

      updateLayers();

      return () => {
        // Cleanup listeners
        canvasEditor.off('object:added', updateLayers);
        canvasEditor.off('object:removed', updateLayers);
        canvasEditor.off('object:modified', updateLayers);

        canvasEditor.off('selection:created', handleObjectSelected);
        canvasEditor.off('selection:updated', handleObjectSelected);
        canvasEditor.off('selection:cleared', () => setSelectedLayer(null));
      };
    }
  }, [canvasEditor]);

  // Toggle visibility of selected layer
  const hideSelectedLayer = () => {
    if (!selectedLayer) return;

    const object = canvasEditor
      .getObjects()
      .find((obj) => obj.id === selectedLayer.id);
    if (!object) return;

    if (object.opacity === 0) {
      object.opacity = object.prevOpacity || 1;
      object.prevOpacity = undefined;
    } else {
      object.prevOpacity = object.opacity || 1;
      object.opacity = 0;
    }
    canvasEditor.renderAll();
    updateLayers();

    setSelectedLayer({ ...selectedLayer, opacity: object.opacity });
  };

  // Move selected layer up or down in z-order
  const moveSelectedLayer = (direction) => {
    if (!selectedLayer) return;

    const objects = canvasEditor.getObjects();
    const object = objects.find((obj) => obj.id === selectedLayer.id);

    if (object) {
      const currentIndex = objects.indexOf(object);

      if (direction === 'up' && currentIndex < objects.length - 1) {
        const temp = objects[currentIndex];
        objects[currentIndex] = objects[currentIndex + 1];
        objects[currentIndex + 1] = temp;
      } else if (direction === 'down' && currentIndex > 0) {
        const temp = objects[currentIndex];
        objects[currentIndex] = objects[currentIndex - 1];
        objects[currentIndex - 1] = temp;
      }

      const backgroundColor = canvasEditor.backgroundColor;

      canvasEditor.clear(); // Clear and re-add objects to update order

      objects.forEach((obj) => canvasEditor.add(obj));

      canvasEditor.backgroundColor = backgroundColor;

      canvasEditor.renderAll();

      // Update zIndex for each object
      objects.forEach((obj, index) => {
        obj.zIndex = index;
      });

      canvasEditor.setActiveObject(object);

      canvasEditor.renderAll();

      updateLayers();
    }
  };

  // Assign unique ID to an object if missing
  const addIdToObject = (object) => {
    if (!object.id) {
      object.id = `${object.type}_${crypto.randomUUID()}`;
    }
  };

  // Extend Canvas to update zIndex for all objects
  Canvas.prototype.updateZIndices = function () {
    const objects = this.getObjects();
    objects.forEach((obj, index) => {
      addIdToObject(obj);
      obj.zIndex = index;
    });
  };

  // Refresh layers list
  const updateLayers = () => {
    if (canvasEditor) {
      canvasEditor.updateZIndices();
      const objects = canvasEditor
        .getObjects()
        .filter(
          (obj) =>
            !(
              obj.id.startsWith('vertical-') || obj.id.startsWith('horizontal-')
            )
        )
        .map((obj) => ({
          id: obj.id,
          zIndex: obj.zIndex,
          type: obj.type,
          opacity: obj.opacity,
        }));
      setLayers([...objects].reverse()); // Show top layer first
    }
  };

  // Handle object selection in canvas
  const handleObjectSelected = (e) => {
    const selectedObject = e.selected ? e.selected[0] : null;

    if (selectedObject) {
      setSelectedLayer({
        id: selectedObject.id,
        opacity: selectedObject.opacity,
      });
    } else {
      setSelectedLayer(null);
    }
  };

  // Select a layer by clicking in the list
  const selectLayerInCanvas = (layerId) => {
    const object = canvasEditor.getObjects().find((obj) => obj.id === layerId);

    if (object) {
      canvasEditor.setActiveObject(object);
      canvasEditor.renderAll();

      setSelectedLayer({
        id: object.id,
        opacity: object.opacity,
      });
    }
  };

  // Show message if canvas is empty
  if (layers?.length === 0)
    return (
      <div className='flex flex-col gap-1 text-gray-400 text-sm text-center'>
        <p>Your canvas is empty.</p>
        <p>Add objects to manage layers.</p>
      </div>
    );

  return (
    <div className='flex flex-col text-white space-y-2'>
      {/* Layer controls */}
      <div className='flex justify-start gap-4 mb-4'>
        <button
          onClick={() => moveSelectedLayer('up')}
          disabled={!selectedLayer || layers[0]?.id === selectedLayer.id}
          className='p-2 rounded bg-[var(--primary-color)] disabled:bg-[var(--primary-color)] hover:bg-[var(--button-hover-color-on)]'
        >
          <ArrowUp size={16} />
        </button>
        <button
          onClick={() => moveSelectedLayer('down')}
          disabled={
            !selectedLayer || layers[layers.length - 1]?.id === selectedLayer.id
          }
          className='p-2 rounded bg-[var(--primary-color)] disabled:bg-[var(--primary-color)] hover:bg-[var(--button-hover-color-on)]'
        >
          <ArrowDown size={16} />
        </button>
        <button
          onClick={hideSelectedLayer}
          disabled={!selectedLayer}
          className='p-2 rounded bg-[var(--primary-color)] disabled:bg-[var(--primary-color)] hover:bg-[var(--button-hover-color-on)]'
        >
          {selectedLayer?.opacity === 0 ? (
            <EyeOff size={16} />
          ) : (
            <Eye size={16} />
          )}
        </button>
      </div>

      {/* Layers list */}
      <ul className='space-y-1 flex flex-col items-center'>
        {layers.map(({ id, type, zIndex }) => (
          <li
            key={id}
            onClick={() => selectLayerInCanvas(id)}
            className={`
              w-full px-3 py-1 rounded cursor-pointer text-[0.75rem] text-white
              ${
                id === selectedLayer?.id
                  ? 'bg-[var(--secondary-color)]'
                  : 'bg-[var(--primary-color)] hover:bg-[var(--quaternary-color)]'
              }
            `}
          >
            {type} ({zIndex})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LayersList;
