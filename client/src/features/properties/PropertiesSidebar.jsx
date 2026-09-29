import { useState } from 'react';
import { useActiveObject } from '@/hooks/useActiveObject';
import TextProperties from './TextProperties';
import ShapeProperties from './ShapeProperties';
import ImageProperties from './ImageProperties';
import LayersList from './LayersList';

const PropertiesSidebar = () => {
  const [activeTab, setActiveTab] = useState('Properties'); // Current active tab

  const activeObject = useActiveObject(); // Currently selected canvas object

  return (
    <aside
      className='flex flex-col h-full w-64 transition-all duration-300 bg-[#373737] text-white'
      style={{ background: 'var(--gradient-dark-color)' }}
    >
      {/* Tabs */}
      <div className='flex flex-col items-start p-4 transition-all duration-300'>
        <div className='flex gap-2 w-full'>
          {['Properties', 'Layers'].map((tab) => (
            <button
              key={tab}
              className={`flex-1 px-3 py-2 text-sm font-semibold border-b-2 transition-opacity duration-200 rounded-tl rounded-tr ${
                activeTab === tab
                  ? 'border-white opacity-100'
                  : 'border-gray-600 opacity-40 hover:opacity-80 hover:bg-[#4A4A4A]'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className='flex-1 p-6 pt-0 overflow-y-auto transition-all duration-300'>
        {activeTab === 'Properties' && (
          <div className='space-y-2'>
            {['i-text', 'textbox', 'dynamic-field-text'].includes(
              activeObject?.type
            ) ? (
              <TextProperties />
            ) : ['rect', 'circle', 'triangle'].includes(activeObject?.type) ? (
              <ShapeProperties />
            ) : activeObject?.type === 'image' ? (
              <ImageProperties />
            ) : (
              <div className='flex flex-col gap-1 text-gray-400 text-sm text-center'>
                <p>No object selected.</p>
                <p>Click an object to see and customize its properties.</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'Layers' && <LayersList />}
      </div>
    </aside>
  );
};

export default PropertiesSidebar;
