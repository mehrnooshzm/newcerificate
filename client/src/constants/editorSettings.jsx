import CanvasText from '@/features/designToolbox/CanvasText';
import ImageUpload from '@/features/designToolbox/ImageUpload';
import ShapesOptions from '@/features/designToolbox/ShapesOptions';
import BackgroundSetting from '@/features/designToolbox/BackgroundSetting';
import FillColor from '@/features/controls/FillColor';
import FontSize from '@/features/controls/FontSize';
import FontFamily from '@/features/controls/FontFamily';
import FontStyles from '@/features/controls/FontStyles';
import TextContent from '@/features/controls/TextContent';
import Flip from '@/features/controls/Flip';
import Rotation from '@/features/controls/Rotation';
import TextAlignment from '@/features/controls/TextAlignment';
import Opacity from '@/features/controls/Opacity';
import StrokeColor from '@/features/controls/StrokeColor';
import StrokeWidth from '@/features/controls/StrokeWidth';
import Position from '@/features/controls/Position';
import Size from '@/features/controls/Size';

// Toolbox main options shown in design panel
export const toolboxOptions = [
  {
    name: 'Text',
    component: <CanvasText />,
  },
  {
    name: 'Images',
    component: <ImageUpload />,
  },
  {
    name: 'Shapes',
    component: <ShapesOptions />,
  },
  {
    name: 'Background',
    component: <BackgroundSetting />,
  },
];

// Properties available for text objects
export const textProperties = [
  {
    name: 'Position',
    component: Position,
  },
  {
    name: 'Size',
    component: Size,
  },
  {
    name: 'Fill',
    component: FillColor,
  },
  {
    name: 'Stroke Color',
    component: StrokeColor,
  },
  {
    name: 'Stroke Width',
    component: StrokeWidth,
  },
  {
    name: 'Font Family',
    component: FontFamily,
  },
  {
    name: 'Font Size',
    component: FontSize,
  },
  {
    name: 'Font Styles',
    component: FontStyles,
  },
  {
    name: 'Text',
    component: TextContent,
  },
  {
    name: 'Text Alignment',
    component: TextAlignment,
  },
  {
    name: 'Flip',
    component: Flip,
  },
  {
    name: 'Rotation',
    component: Rotation,
  },
  {
    name: 'Opacity',
    component: Opacity,
  },
];

// Properties available for shape objects
export const shapeProperties = [
  {
    name: 'Position',
    component: Position,
  },
  {
    name: 'Size',
    component: Size,
  },
  {
    name: 'Fill',
    component: FillColor,
  },
  {
    name: 'Stroke Color',
    component: StrokeColor,
  },
  {
    name: 'Stroke Width',
    component: StrokeWidth,
  },
  {
    name: 'Flip',
    component: Flip,
  },
  {
    name: 'Rotation',
    component: Rotation,
  },
  {
    name: 'Opacity',
    component: Opacity,
  },
];

// Properties available for image objects
export const imageProperties = [
  {
    name: 'Position',
    component: Position,
  },
  {
    name: 'Size',
    component: Size,
  },
  {
    name: 'Flip',
    component: Flip,
  },
  {
    name: 'Rotation',
    component: Rotation,
  },
  {
    name: 'Opacity',
    component: Opacity,
  },
];
