module.exports = function(grunt) {

  grunt.initConfig({

          
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

  // load nodemon
  grunt.loadNpmTasks('grunt-nodemon');

  // register the nodemon task when we run grunt
  grunt.registerTask('default', ['bower','nodemon']);
  
};