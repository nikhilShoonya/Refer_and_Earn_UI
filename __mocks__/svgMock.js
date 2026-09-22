// Metro turns .svg imports into components; Jest needs the same shape.
const React = require('react');
module.exports = {
  __esModule: true,
  default: (props) => React.createElement('Svg', props),
};
