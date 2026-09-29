import { imageProperties } from '@/constants/editorSettings';

const ImageProperties = () => {
  return (
    <>
      {/* Section title */}
      <h2 className='text-base'>Image</h2>
      <hr className='my-4' />

      {/* Render all image property controls */}
      <div className='space-y-3'>
        {imageProperties.map(({ name, component: ImageProperty }) => (
          <ImageProperty key={name} />
        ))}
      </div>
    </>
  );
};

export default ImageProperties;
