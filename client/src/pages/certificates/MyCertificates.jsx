import { useDispatch, useSelector } from 'react-redux';
import { deleteDesign } from '@/reducers/designReducer';
import uploadService from '@/services/uploads';
import { Link } from 'react-router-dom';
import CertificatesList from './CertificatesList';

const MyCertificates = () => {
  const dispatch = useDispatch();
  const designs = useSelector(({ designs }) => designs);

  const handleDeleteDesign = async (id) => {
    // Find the design to check for an associated CSV upload
    const design = designs.find((design) => design.id === id);

    // Delete associated CSV upload if it exists
    if (design?.csvUploadId) {
      await uploadService.remove(design.csvUploadId);
    }

    // Delete the design itself
    dispatch(deleteDesign(id));
  };

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6'>
      {/* Always show Create New card as first */}
      <Link
        to='/designs/new'
        className='relative bg-white border-1 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition aspect-[4/3] flex flex-col items-center justify-center'
      >
        <span className='text-5xl text-gray-500'>+</span>
        <p className='mt-2 text-sm font-semibold text-gray-700'>
          Create a new certificate
        </p>
      </Link>

      {/* Render saved designs if any */}
      {designs.length > 0 && (
        <CertificatesList
          certificates={designs}
          onDelete={handleDeleteDesign}
        />
      )}
    </div>
  );
};

export default MyCertificates;
