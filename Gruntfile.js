/* jshint node */
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    manifest: grunt.file.readJSON('src/manifest.json'),

    zip: {
      extension: {
        cwd: 'src/',
        src: [
          'src/**/*',
          '!src/**/*.map',
          '!src/vendor/**',
          '!src/resources/fip-tile-*',
          '!src/resources/showcase.png',
          '!src/resources/icons/font/*',
          '!src/resources/icons/css/animation.css',
          '!src/resources/icons/css/fontello.css',
          '!src/resources/icons/*'
        ],
        dest: "dist/chrome-fip-<%= manifest.version %>.zip",
        dot: false
      }
    }
  });

  grunt.loadNpmTasks('grunt-zip');

  grunt.registerTask('default', ['build']);
  //
  grunt.registerTask('build', ['zip']);
};
