/* jshint node */
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    manifest: grunt.file.readJSON('src/manifest.json'),

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      extension: ['src/**/*.js', '!src/vendor/**']
    },

    zip: {
      extension: {
        cwd: 'src/',
        src: [
          'src/**/*',
          '!src/vendor/**',
          'src/vendor/lodash/dist/lodash.min.js',
          'src/vendor/machina.js/lib/machina.min.js'
        ],
        dest: "dist/chrome-fip-<%= manifest.version %>.zip",
        dot: false
      }
    }
  });

  //grunt.loadNpmTasks('grunt-contrib-concat');
  //grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-zip');
  //grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('build', ['jshint', 'zip']);

};
