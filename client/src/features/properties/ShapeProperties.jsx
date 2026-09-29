import { shapeProperties } from '@/constants/editorSettings';

const ShapeProperties = () => {
  return (
    <>
      {/* Section title */}
      <h2 className='text-base'>Shape</h2>
      <hr className='my-4' />

      {/* Render each shape property control from configuration */}
      <div className='space-y-3'>
        {shapeProperties.map(({ name, component: ShapeProperty }) => (
          <ShapeProperty key={name} />
        ))}
      </div>
    </>
  );
};

export default ShapeProperties;
