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
        }

    });

    grunt.loadNpmTasks('grunt-html-build');

    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', ['htmlbuild']);
};
