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
      
    bower: {
        install: {
            options: {
              verbose: true,
              targetDir: 'public/libs'
            }
        //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
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

   // run grunt ng-constant
  grunt.loadNpmTasks('grunt-ng-constant');

  // load nodemon
  grunt.loadNpmTasks('grunt-nodemon');

  // register the nodemon task when we run grunt
  grunt.registerTask('default', ['bower', 'ngconstant:production']);
  grunt.registerTask('dev', ['bower','ngconstant:development', 'nodemon']);
  
};