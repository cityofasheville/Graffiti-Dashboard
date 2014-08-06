'use strict';

module.exports = function(grunt) {

    //Define build locations
    var  globalConfig = {
       dev : "dev/",
       dist : "dist/"
    }

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        globalConfig : globalConfig,
        pkg : grunt.file.readJSON('package.json'),
        // Empties folders or files to start fresh
        clean : {
            app : {
                src : ['dev/js/Graffiti-Dashboard.js']
            },
            dependencies : {
                src : ['dev/dependencies/js/dependencies.js']
            },
            ie : {
                src : ['dev/dependencies/ie-specific/ie-specific.js']
            }   
        },
        //Copies files from a source(src) to a destination(dest)
        copy : {
            dev : {
                src : [
                    'dependencies/css/bw-superhero-bootstrap.min.css',
                    'dependencies/css/leaflet.css',
                    //These are leaflet's hardcode images
                    'dependencies/css/images/*.png',
                    'dependencies/js/images/*.png',
                    'images/*.{png,jpg,ico}',
                    'dependencies/fonts/*.{eot,svg,ttf,woff}',
                    'css/main.css',
                    'html-templates/*.html',
                    'data/data.js'
                ],
                dest : '<%= globalConfig.dev %>',
                expand: false
            },
            dist : {
                src : [
                    'dependencies/css/bw-superhero-bootstrap.min.css',
                    'dependencies/css/leaflet.css',
                    //These are leaflet's hardcode images
                    'dependencies/css/images/*.png',
                    'dependencies/js/images/*.png',
                    'images/*.{png,jpg,ico}',
                    'dependencies/fonts/*.{eot,svg,ttf,woff}',
                    'css/main.css',
                    'html-templates/*.html',
                    'data/data.js'
                ],
                dest : '<%= globalConfig.dist %>',
                expand : false
            },
            ghpages : {
                cwd : 'dist/',
                src : '**/*',
                dest : '../gh-pages/Graffiti-Dashboard/',
                expand : true
            }
        },
        //Concatenates files into a single file
        concat : {
            app : {
                src : ['js/*.js', 'js/*/*.js'],
                dest : 'dev/js/Graffiti-Dashboard.js'
            },
            dependencies : {
                src : [
                    'dependencies/js/angular.js', 
                    'dependencies/js/angular-route.js', 
                    'dependencies/js/jquery.js', 
                    'dependencies/js/bootstrap.js', 
                    'dependencies/js/leaflet.js', 
                    ],
                dest : 'dev/dependencies/js/dependencies.js'
            },
            ie : {
                src : ['dependencies/ie-specific/*.js'],
                dest : 'dev/dependencies/ie-specific/ie-specific.js'
            }
        },
        //Minifies JS files
        uglify: {
            options : {
                banner : '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            app : {
                src : ['dev/js/Graffiti-Dashboard.js'],
                dest : 'dist/js/Graffiti-Dashboard.min.js'
            },
            dependencies : {
                src : ['dev/dependencies/js/dependencies.js'],
                dest : 'dist/dependencies/js/dependencies.min.js'
            },
            ie : {
                src : ['dev/dependencies/ie-specific/ie-specific.js'],
                dest : 'dist/dependencies/ie-specific/ie-specific.min.js'
            }
        },
        // The actual grunt server settings
        connect: {
            dev: {
                options :{
                    open : true,
                    port: 9000,
                    hostname: 'localhost',
                    base : 'dev',
                    middleware : function(connect, options){
                        return [
                            connect.static('dev'),
                            connect.directory('dev')
                        ]  
                    }
                } 
            }
        },
        // Watches files for changes and runs tasks based on the changed files
        watch: {
            js: {
                files: ['js/*.js', 'js/*/*.js'],
                tasks: ['clean:app', 'concat', 'copy:dev'],
                options: {
                    livereload: 35729
                }
            },
            html: {
                files: ['html-templates/*.html'],
                tasks: ['copy:dev'],
                options: {
                    livereload: 35729
                }
            }
        }
    });


    // Default task(s).
    grunt.registerTask('default', []);

    grunt.registerTask('dev', [
        'clean', 
        'concat',
        'copy:dev',
        'connect:dev',
        'watch'
        ]);
    grunt.registerTask('dist', [
        'clean', 
        'concat',
        'copy',
        'uglify',
        'copy:ghpages'
        ]);
};