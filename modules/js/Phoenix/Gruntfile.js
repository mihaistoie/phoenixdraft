'use strict';

module.exports = function( grunt ) {
  grunt.initConfig({
    pkg    : grunt.file.readJSON('package.json'),
    banner : '/* \n * <%= pkg.name %> <%= pkg.version %>\n * <%= pkg.homepage %>\n * \n * Licensed under the <%= pkg.license %> license\n */',
    concat: {
      options: {
        stripBanners: true
      },
      phoenix:{
        src: [
          'js/core.js',
		  'js/locale.js',
          'js/layout.js',
		  'js/layout.widget.js',
		  'js/toolbox.js',
		  'js/toolbox.widget.js'
        ],
        dest: 'dist/js/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        preserveComments: 'some'
      },
      core: {
        src: '<%= concat.phoenix.dest %>',
        dest: 'dist/js/<%= pkg.name %>.min.js'
      }
    },	
    clean: {
      dist: 'dist/*'
    },
    jsvalidate: {
      options:{
        globals: {},
        esprimaOptions: {},
        verbose: false
      },
      targetName:{
        files:{
          src: [
            'Gruntfile.js',
            'js/*.js'
          ]
        }
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        'js/*.js'
      ]
    },
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-jsvalidate');
  grunt.loadNpmTasks('grunt-bump');

  grunt.registerTask('default', ['build']);
  grunt.registerTask('validate', ['jsvalidate', 'jshint']);
  grunt.registerTask('build', ['clean', 'concat', 'uglify']);
};
