/*
 * grunt-vulcanize
 * https://github.com/Polymer/grunt-vulcanize
 *
 * Copyright (c) 2013 The Polymer Authors
 * Licensed under the BSD license.
 */

'use strict';

module.exports = function(grunt) {

  var vulcanize = require('vulcanize');
  var fileSystem = require('fs');

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('vulcanize', 'Inline HTML Imports', function() {
    var done = this.async();
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      abspath: '',
      excludes: [
      ],
      stripExcludes: false,
      inlineScripts: false,
      inlineCss: false,
      implicitStrip: true,
      stripComments: false
    });

    var filesCount = this.files ? this.files.length : 0;

    if (filesCount <= 0) {
      done();
      return;
    }

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      });

      //if abspath was set, strip it from the src file path, lest it get applied twice
      if (typeof options.abspath !== 'undefined' && options.abspath.length > 0) {
        if (src[0].indexOf(options.abspath) === 0) {
          src[0] = src[0].substr(options.abspath.length);
        }
      }

      // Handle options.
      options.output = f.dest;

      vulcanize.setOptions(options);

      vulcanize.process(src[0], function(err, inlinedHtml) {

        if (err) {
          return grunt.fatal(err);
        }

        var target = fileSystem.openSync(f.dest, 'w');
        fileSystem.writeSync(target, inlinedHtml);
        fileSystem.closeSync(target);

        grunt.log.ok(src[0] + " -> " + f.dest);

        filesCount--;

        if (filesCount <= 0) {
          done();
        }
      });

    });
  });

};
