import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import ConfirmationDialog from '@/components/reusable/ConfirmationDialog';

const CertificateItem = ({ certificate, onDelete }) => {
  const [showDialog, setShowDialog] = useState(false); // Track if delete confirmation is open

  const { id, name, designPreview } = certificate;

  return (
    <div className='relative bg-gray-50 border-1 border-gray-200 rounded-lg overflow-hidden'>
      {/* Clickable area to navigate to the certificate design */}
      <Link to={`/designs/${id}`} className='aspect-[4/3] flex flex-col'>
        {/* Certificate preview image */}
        <div className='flex-1 overflow-hidden'>
          <img
            src={designPreview.url}
            alt='Design preview image'
            className='w-full h-full object-cover'
          />
        </div>
        {/* Certificate name */}
        <div className='bg-[var(--secondary-color)] text-white text-[0.65rem] text-left px-3 py-2 font-semibold flex items-center justify-start'>
          <span className='truncate'>{name || 'New Certificate'}</span>
        </div>
      </Link>
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowDialog(true);
        }}
        className='absolute top-2 right-2 bg-gray-50 p-1.5 rounded-lg hover:bg-gray-200 flex items-center justify-center'
      >
        <Trash2 className='w-5 h-5 text-black' />
      </button>
      {/* Modal dialog confirming the user's action - deleting a certificate */}
      <ConfirmationDialog
        open={showDialog}
        setOpen={setShowDialog}
        dialogTitle='Delete a certificate'
        dialogText={`Are you sure you want to delete the certificate:\n"${name || 'New Certificate'}"?\nThis action cannot be undone.`}
        confirmButtonText='Delete'
        onConfirm={() => {
          setShowDialog(false);
          onDelete(id);
        }}
        onCancel={() => setShowDialog(false)}
      />
    </div>
  );
};

export default CertificateItem;
