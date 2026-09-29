import { textProperties } from '@/constants/editorSettings';

const TextProperties = () => {
  return (
    <>
      {/* Section title */}
      <h2 className='text-base'>Text</h2>
      <hr className='my-4' />

      {/* Render each text property control from configuration */}
      <div className='space-y-3'>
        {textProperties.map(({ name, component: TextProperty }) => (
          <TextProperty key={name} />
        ))}
      </div>
    </>
  );
};

export default TextProperties;
