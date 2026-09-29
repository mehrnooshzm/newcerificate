import { ChromePicker, CirclePicker } from 'react-color';

const ColorPicker = ({
  value,
  handleColorChange,
  handleColorChangeComplete,
  handleCircleColorChange,
}) => {
  return (
    <div className='flex flex-col justify-center items-center gap-[20px]'>
      <ChromePicker
        color={value}
        onChange={(e) => handleColorChange(e.rgb)}
        onChangeComplete={(e) =>
          handleColorChangeComplete?.(e.rgb)
        }
      />

      <CirclePicker
        color={value}
        onChange={(e) =>
          handleCircleColorChange(e.rgb)
        }
      />
    </div>
  );
};

export default ColorPicker;