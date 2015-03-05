'use strict';

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/* \n * <%= pkg.name %> <%= pkg.version %>\n * <%= pkg.homepage %>\n * \n * Licensed under the <%= pkg.license %> license\n */',
        htmlbuild: {
            dist: {
                src: 'lib/public/html/index.html',
                dest: 'lib/public/',
                options: {
                    beautify: true
                }
            }
        },
        ngtemplates: {
            "phoenix.authoring": {
                cwd: 'lib/public/app/authoring/templates/',
                src: '*.html',
                dest:'lib/public/app/authoring/authoring-tpls.js',
                options: {
                    htmlmin: {
                        collapseWhitespace: true, 
                        collapseBooleanAttributes: true,
                        removeComments: true
                    },
                    prefix: './authoring/'
                }
            }
        }        

    });

    grunt.loadNpmTasks('grunt-html-build');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', ['ngtemplates', 'htmlbuild']);
};
