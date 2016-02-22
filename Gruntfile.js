module.exports = function(grunt) {

  grunt.initConfig({

    ngconstant: {
      // Environment targets
        options: {
            name: 'config',
            dest: 'public/config/config.js',
        },
        development: {
            constants: {
                ENV: {
                    name: 'development',
                    apiEndpoint: 'http://localhost:3000'
                }
            }
        },
        production: {
            constants: {
                ENV: {
                    name: 'production',
                    apiEndpoint: 'https://wesizeit.herokuapp.com'
                }
            }
        }
    },
      
    bower_concat: {
      all: {
        dest: 'public/dist/js/bower.js'
      }
    },
      
    uglify: {
       bower: {
        options: {
          mangle: false,
          compress: {}
        },
        files: {
          'public/dist/js/bower.min.js': 'public/dist/js/bower.js'
        }
      }
    },
      
    bower: {
        install: {
            options: {
              verbose: true,
              targetDir: 'public/libs'
            }
        //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
        }
    },
      
    'string-replace': {
        inline: {
            files: {
                'public/views/home.html': 'public/views/home.html'
            },
            options: {
                replacements: [
                    {
                        pattern: '<!--start PROD imports',
                        replacement: '<!--start PROD imports-->'
                    },
                    {
                        pattern: 'end PROD imports-->',
                        replacement: '<!--end PROD imports-->'
                    },
                    {
                        pattern: '<!--start DEV imports-->',
                        replacement: '<!--start DEV imports'
                    },
                    {
                        pattern: '<!--end DEV imports-->',
                        replacement: 'end DEV imports-->'
                    }
                ]
            }
        }
    },
      
    // configure nodemon
    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

  });
    
   // run bower install
  grunt.loadNpmTasks('grunt-bower-task');
   
   // run tasks to link to uglified js file in html pages  
  grunt.loadNpmTasks('grunt-string-replace');
    
   // concats all js file before minification    
  grunt.loadNpmTasks('grunt-bower-concat');
   
   // run uglify tasks
  grunt.loadNpmTasks('grunt-contrib-uglify');

   // run grunt ng-constant
  grunt.loadNpmTasks('grunt-ng-constant');

  // load nodemon
  grunt.loadNpmTasks('grunt-nodemon');
    
  grunt.registerTask('buildbower', [
      'bower',
      'bower_concat',
      'uglify:bower',
      'string-replace'
    ]);
 
  grunt.registerTask('default', ['ngconstant:production', 'buildbower']);
  grunt.registerTask('dev', ['ngconstant:development', 'bower', 'nodemon']);
    
  
};