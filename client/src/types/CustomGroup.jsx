import { Group, classRegistry } from 'fabric';

// Extend Fabric's Group class to create a custom group
class CustomGroup extends Group {
  static type = 'custom-group';

  constructor(objects = [], options = {}) {
    // Pass objects to the parent Group constructor
    super(objects, { objectCaching: false, ...options });
    this.set('field', options.field || '');
  }

  toObject() {
    return {
      ...super.toObject(),
      metadata: this.metadata || {},
    };
  }
}

// Register the custom class
classRegistry.setClass(CustomGroup); // for JSON deserialization
classRegistry.setSVGClass(CustomGroup); // optional if exporting SVG

export default CustomGroup;
