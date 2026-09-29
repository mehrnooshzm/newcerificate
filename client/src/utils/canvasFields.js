import { IText } from 'fabric';
import DynamicFieldText from '@/types/DynamicFieldText';
import CustomGroup from '@/types/CustomGroup';

// Create a new dynamic field group
export const createDynamicFieldGroup = (columnName, text, original) => {
  const clonedProps = original
    ? original.toObject([
        'top',
        'left',
        'originX',
        'originY',
        'scaleX',
        'scaleY',
        'angle',
        'fontFamily',
        'fontSize',
        'fontWeight',
        'textAlign',
        'fill',
        'stroke',
        'strokeWidth',
        'flipX',
        'flipY',
        'opacity',
      ])
    : {};

  // Prevent forbidden props from being spread into DynamicFieldText
  delete clonedProps.type;
  delete clonedProps.version;

  const fieldTextFontSize = clonedProps.fontSize ?? 30;
  const fieldTextScaleY = clonedProps.scaleY ?? 1;

  // Calculate the caption font size relative to visual size of field text
  const visualFontSize = fieldTextFontSize * fieldTextScaleY;
  const captionFontSize = Math.max(14, Math.round(visualFontSize * 0.4)); // 40% of field text

  // Caption (small label above)
  const captionText = new IText(columnName, {
    originX: 'left',
    originY: 'top', // anchor to bottom so it sits just above dynamic field text
    fontFamily: 'Lato',
    fontSize: captionFontSize,
    fill: 'gray',
    selectable: false,
    evented: false,
  });

  // Dynamic field text (inherits original styles)
  const fieldText = new DynamicFieldText(text, {
    ...clonedProps,
    originX: 'left',
    originY: 'top',
    fontSize: fieldTextFontSize,
    angle: 0,
    selectable: false,
    evented: false,
    isDynamicFieldText: true, // custom propery to mark this object as dynamic field text for CSV data
  });

  // Children positions relative to the group
  fieldText.top = captionFontSize; // align fieldText to original canvas position
  fieldText.left = 0;

  captionText.top = 0; // caption sits above
  captionText.left = 0;

  // Adjust group position so fieldText aligns with original
  const groupTop =
    clonedProps.top !== undefined ? clonedProps.top - captionFontSize : 100;
  const groupLeft = clonedProps.left ?? 100;

  // Wrap in a group, place where the original text was
  const group = new CustomGroup([captionText, fieldText], {
    top: groupTop,
    left: groupLeft,
    originX: 'left',
    originY: 'top',
    angle: clonedProps.angle ?? 0,
    selectable: true,
    evented: true,
    metadata: { field: columnName }, // custom propery to mark this object as a group for dynamic field text
  });

  // Recalculate group coordinates for selection box
  group.setCoords();

  return group;
};
