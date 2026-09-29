import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import templateService from '@/services/templates';
import TemplateItem from '@/features/designToolbox/TemplateItem';

const TemplatesGallery = () => {
  const [templates, setTemplates] = useState([]); // Store templates fetched from service

  const navigate = useNavigate();

  // Fetch templates once when component mounts
  useEffect(() => {
    const getTemplates = async () => {
      const templates = await templateService.getAll();
      setTemplates(templates); // Save templates to state
    };

    getTemplates();
  }, []);

  // Handle clicking a template
  const handleTemplateClick = (id) => {
    const template = templates.find((t) => t.id === id);

    // Navigate to new design page, passing selected template in state
    navigate('/designs/new', { state: { template } });
  };

  // Show nothing while templates are loading
  if (templates.length === 0) return;

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6'>
      {templates.map((template) => (
        <div key={template.id} className='relative group'>
          {/* Template preview component */}
          <TemplateItem template={template} />

          {/* Hover overlay with "Use this template" button */}
          <div className='hidden group-hover:flex absolute top-0 left-0 w-full h-full justify-center items-center rounded-lg bg-[var(--secondary-color)]/20'>
            <button
              className='text-white bg-[var(--secondary-color)] px-3 py-2 rounded-md hover:bg-[var(--button-hover-color-out)] hover:text-[var(--primary-color)]'
              onClick={() => handleTemplateClick(template.id)}
            >
              Use this template
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TemplatesGallery;
