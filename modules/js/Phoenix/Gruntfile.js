'use strict';

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/* \n * <%= pkg.name %> <%= pkg.version %>\n * <%= pkg.homepage %>\n * \n * Licensed under the <%= pkg.license %> license\n */',
        concat: {
            options: {
                stripBanners: true
            },
            phoenix: {
                src: [
                    'js/core.js',
                    'js/locale.js',
                    'js/layout.js',
                    'js/layout.component.js',
                    'js/toolbox.js',
                    'js/toolbox.component.js',
                    'js/widget.js',
                    'js/widget.component.js'
                ],
                dest: 'dist/js/<%= pkg.name %>.js'
            },
            phoenixangular: {
                src: [
                    'js/angular/core.js',
                    'js/angular/layout.js',
                    'js/angular/widget.js'
                ],
                dest: 'dist/js/<%= pkg.name %>.angular.js'
            },
            phoenixangularwidgets: {
                src: [
                    'js/angular/widgets/test/test.js'
                ],
                dest: 'dist/js/<%= pkg.name %>.widgets.angular.js'
            },

            phoenixcss: {
                src: [
                    'css/layout.css',
                    'css/widget.css',
                    'css/core.css'
                ],
                dest: 'dist/css/<%= pkg.name %>.css'
            }
        },
        less: {
            development: {
                options: {},
                files: {
                    "css/core.css": "css/less/core.less",
                    "css/layout.css": "css/less/layout.less",
                    "css/widget.css": "css/less/widget.less"
                }
            }
        },
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'dist/css',
                    src: ['*.css', '!*.min.css'],
                    dest: 'dist/css',
                    ext: '.min.css'
                }]
            }
        },

        uglify: {
            options: {
                preserveComments: 'some'
            },
            core: {
                src: '<%= concat.phoenix.dest %>',
                dest: 'dist/js/<%= pkg.name %>.min.js'
            },
            angular: {
                src: '<%= concat.phoenixangular.dest %>',
                dest: 'dist/js/<%= pkg.name %>.angular.min.js'
            },
            angularwidgets: {
                src: '<%= concat.phoenixangularwidgets.dest %>',
                dest: 'dist/js/<%= pkg.name %>.widgets.angular.min.js'
            }


        },
        clean: {
            dist: 'dist/*'
        },
        copy: {
            proto: {
                files: [
                    // includes files within path
                    {
                        expand: true,
                        cwd: 'dist/',
                        src: ['**'],
                        dest: '../../../app/lib/public/phoenix/'
                    }
                ]

            }
        },
        jsvalidate: {
            options: {
                globals: {},
                esprimaOptions: {},
                verbose: false
            },
            targetName: {
                files: {
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
        }

    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-jsvalidate');
    grunt.loadNpmTasks('grunt-bump');

    grunt.registerTask('default', ['build']);
    grunt.registerTask('validate', ['jsvalidate', 'jshint']);
    grunt.registerTask('build', ['clean', 'less', 'concat', 'cssmin', 'uglify', 'copy:proto']);
};
