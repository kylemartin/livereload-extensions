/* jshint node: true */

module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        options: {
            firefox: {
                build: 'Firefox/content'
            },
            chrome: {
                build: 'Chrome/LiveReload',
                key: 'keys/chrome.pem'
            },
            safari: {
                build: 'LiveReload.safariextension'
            }
        },

        coffee: {
            options: {
                bare: true
            },
            firefox: {
                files: {
                    '<%= options.firefox.build %>/firefox.js': 'src/firefox.coffee',
                    '<%= options.firefox.build %>/injected.js': 'src/injected.coffee'
                }
            },
            chrome: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        cwd: 'src',
                        src: ['global-chrome.coffee', 'devtools.coffee',
                              'devtools-chrome.coffee'],
                        dest: '<%= options.chrome.build %>',
                        ext: '.js'
                    }, {
                        src: ['src/injected.coffee', 'src/injected-chrome.coffee'],
                        dest: '<%= options.chrome.build %>/injected.js'
                    }
                ]
            },
            safari: {
                files: {
                    '<%= options.safari.build %>/global-safari.js': 'src/global-safari.coffee',
                    '<%= options.safari.build %>/injected.js': ['src/injected.coffee', 'src/injected-safari.coffee']
                }
            }
        },

        browserify: {
            options: {
                transform: ['coffeeify']
            },
            firefox: {
                src:  'src/global.coffee',
                dest: '<%= options.firefox.build %>/global.js'
            },
            chrome: {
                src: 'src/global.coffee',
                dest: '<%= options.chrome.build %>/global.js'
            },
            safari: {
                src: 'src/global.coffee',
                dest: '<%= options.safari.build %>/global.js'
            }
        },

        compress: {
            firefox: {
                options: {
                    archive: 'dist/<%= pkg.name %>-<%= pkg.version %>.xpi',
                    mode: 'zip'
                },
                expand: true,
                cwd: 'Firefox/',
                src: '**',
                dest: '.'
            }
        },

        crx: {
            chrome: {
                src: '<%= options.chrome.build %>',
                dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.crx',
                privateKey: '<%= options.chrome.key %>'
            }
        },

        clean: {
            build: 'build',
            all: ['<%= clean.build %>', 'dist']
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('firefox', ['clean:build', 'coffee:common', 'coffee:firefox',
                                   'browserify:firefox', 'compress:firefox']);
    grunt.registerTask('chrome', ['clean:build', 'coffee:common', 'coffee:chrome',
                                  'browserify:chrome', 'crx:chrome']);
    grunt.registerTask('default', ['clean:build', 'coffee', 'browserify',
                                   'compress', 'crx']);
};
