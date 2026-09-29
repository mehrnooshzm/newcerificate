import { IText, classRegistry } from 'fabric';

// Extend Fabric's IText to create a text object with a dynamic field flag
class DynamicFieldText extends IText {
  static type = 'dynamic-field-text';

  constructor(text = '', options = {}) {
    super(text, options);
    // Only keep the isDynamicFieldText flag
    this.set('isDynamicFieldText', options.isDynamicFieldText || false);
  }

  // Ensure the custom property is included during serialization
  toObject(propertiesToInclude = []) {
    return super.toObject([...propertiesToInclude, 'isDynamicFieldText']);
  }
}

// Register the custom class
classRegistry.setClass(DynamicFieldText); // for JSON deserialization
classRegistry.setSVGClass(DynamicFieldText); // optional if exporting SVG

export default DynamicFieldText;
