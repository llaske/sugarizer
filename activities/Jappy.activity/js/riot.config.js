export default {
  parsers: {
    js: {
      Rapyd: function(js, options) {
          var RapydScript = require ('../lib/rapydscript.js').RapydScript

          var compiler = RapydScript.create_embedded_compiler()

          return ( compiler.compile(js, {js_version: 5} ) )
      },
    },
  },
  // special options that may be used to extend
  // the default riot parsers options
  parserOptions: {
    js: {},
    template: {},
    style: {}
  }
};
