var BaseImageFormat = Quill.import('formats/image');
const ImageFormatAttributesList = [
    'alt',
    'height',
    'width',
    'style'
];

class ImageFormat extends BaseImageFormat {
  static formats(domNode) {
    return ImageFormatAttributesList.reduce(function(formats, attribute) {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }
  format(name, value) {
    if (ImageFormatAttributesList.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

Quill.register(ImageFormat, true);
// Register font families
var Font = Quill.import('formats/font');
Font.whitelist = ['comic', 'arial','Verdana'];
Quill.register(Font, true);
// Register Font sizes
var fontSizeStyle = Quill.import('attributors/style/size');
fontSizeStyle.whitelist = ['24px', '48px', '75px', '100px'];
Quill.register(fontSizeStyle, true);
