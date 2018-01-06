/* jshint node: true */

(function () {
  "use strict";

  var ngrok = require('ngrok');

  module.exports = function(grunt) {

  // Load grunt tasks

  require('load-grunt-tasks')(grunt);

  // Grunt configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
          dev: {
            src: ['dist']
          },
    },
    uglify: {
        my_target: {
          files: [{
              expand: true,
              cwd: 'js',
              src: '*.js',
              dest: 'dist/js',
              ext: '.min.js'
          }]
        }
    },
    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'css',
          src: '*.css',
          dest: 'dist/css',
          ext: '.min.css'
        }]
      }
    },
    pagespeed: {
      options: {
        nokey: true,
        locale: "en_GB",
        threshold: 20
      },
      local: {
        options: {
          strategy: "desktop"
        }
      },
      mobile: {
        options: {
          strategy: "mobile"
        }
      }
    }

  });

    // Register customer task for ngrok
    grunt.registerTask('psi-ngrok', 'Run pagespeed with ngrok', function() {
      var done = this.async();
      var port = 8080;

      ngrok.connect(port, function(err, url) {
        if (err !== null) {
          grunt.fail.fatal(err);
          return done();
        }
        grunt.config.set('pagespeed.options.url', url);
        grunt.task.run('pagespeed');
        done();
      });
    });

    // Register default tasks
    grunt.registerTask('default', ['clean', 'uglify','cssmin', 'psi-ngrok']);
  };
}());