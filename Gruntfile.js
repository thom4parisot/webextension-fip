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

    mocha: {
      all: {
        src: ['test/*.html'],
        options: {
          ui: 'tdd',
          run: true
        }
      }
    },

    zip: {
      extension: {
        cwd: 'src/',
        src: [
          'src/**/*',
          '!src/channel.json',
          '!src/vendor/**',
          'src/vendor/lodash/dist/lodash.min.js',
          'src/vendor/machina/lib/machina.min.js',
          'src/vendor/angular/angular.min.js',
          '!src/resources/icons/font/*',
          '!src/resources/icons/*'
        ],
        dest: "dist/chrome-fip-<%= manifest.version %>.zip",
        dot: false
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-zip');

  grunt.registerTask('default', ['test']);
  grunt.registerTask('test', ['jshint', 'mocha']);
  grunt.registerTask('build', ['test', 'zip']);
};
