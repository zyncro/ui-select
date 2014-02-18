/* jshint node:true */

'use strict';

var fs = require('fs');

module.exports = function() {

  var css_dependencies =[
    'http://cdnjs.cloudflare.com/ajax/libs/select2/3.4.5/select2.css',
    'http://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.8.5/css/selectize.default.css'
  ];

  return {
    humaName : 'UI.Select',
    repoName : 'ui-select',
    inlineHTML : fs.readFileSync(__dirname + '/examples/demo.html'),
    css : css_dependencies.concat(['dist/select.css']),
    js : ['dist/select.js', 'vendor/demo.js'],
    tocopy : ['examples/demo.js']
  };

};
