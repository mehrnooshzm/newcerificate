import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SquarePen } from 'lucide-react';
import { toast } from 'sonner';
import { useSelector, useDispatch } from 'react-redux';
import { updateDesign } from '@/reducers/designReducer';
import { useCanvasContext } from '@/hooks/useCanvasContext';

const CertificateName = () => {
  const [tempName, setTempName] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const { id } = useParams(); // undefined when the URL is `/designs/new`
  const { name, setName } = useCanvasContext();

  // If the path is not "new", look up design in redux
  const design = useSelector(({ designs }) => {
    if (!id) return null; // new design -> no canvas data

    return designs.find((design) => design.id === id) || null;
  });

  const dispatch = useDispatch();

  // Initialize canvas name when design is loaded
  useEffect(() => {
    if (design) {
      setName(design.name);
    }
  }, [design]);

  // Start editing mode
  const handleEditClick = () => {
    setTempName(name.trim());
    setIsEditing(true);
  };

  // Commit name changes on blur or Enter
  const handleBlur = async () => {
    const newName = name.trim() || 'New Certificate'; // fallback name
    setName(newName);

    if (tempName === newName) {
      setIsEditing(false);
      return;
    }

    try {
      if (design) {
        const updatedDesign = {
          ...design,
          name: newName,
        };

        await dispatch(updateDesign(updatedDesign));
        toast('Certificate name updated successfully!');
      }
    } catch (e) {
      console.error(e);
      toast('Failed to updated the certificate name.');
    } finally {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBlur(); // commit on Enter
    }
  };

  return (
    <div className='flex items-center space-x-2 border border-transparent min-w-0'>
      {isEditing ? (
        <input
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleBlur} // commit on blur
          onKeyDown={handleKeyDown} // commit on Enter
          autoFocus
          className='border border-gray-300 rounded px-2 py-1 text-md text-white font-medium focus:outline-none min-w-0 w-full max-w-[40vw] sm:max-w-none'
        />
      ) : (
        <span className='py-1 text-md text-white font-medium truncate max-w-[40vw] sm:max-w-none'>
          {name}
        </span>
      )}

      {/* Edit button */}
      <button
        onClick={handleEditClick}
        className='p-1.5 rounded hover:bg-[var(--secondary-color)] transition shrink-0'
      >
        <SquarePen className='w-5 h-5 text-white' />
      </button>
    </div>
  );
};

export default CertificateName;
