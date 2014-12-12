/* jshint node */
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    manifest: grunt.file.readJSON('src/manifest.json'),

    sass: {
      "now-playing": {
        files: {
          "src/now-playing/popup.css": [
            "src/now-playing/popup.scss"
          ]
        }
      },
      options: {
        compass: true,
        sourcemap: true,
        loadPath: "src/resources/sass"
      }
    },

    crx: {
      extension: {
        src: [
          'src/**/*',
          '!src/**/*.map',
          '!src/channel.json',
          '!src/vendor/**',
          'src/vendor/lodash/dist/lodash.min.js',
          'src/vendor/machina/lib/machina.min.js',
          'src/vendor/angular/angular.min.js',
          'src/vendor/js-md5/js/md5.min.js',
          '!src/resources/fip-tile-*',
          '!src/resources/showcase.png',
          '!src/resources/icons/font/*',
          '!src/resources/icons/css/animation.css',
          '!src/resources/icons/css/fontello.css',
          '!src/resources/icons/*'
        ],
        dest: "dist/chrome-fip-<%= manifest.version %>.crx",
        zipDest: "dist/chrome-fip-<%= manifest.version %>.zip"
      }
    },

    watch: {
      "now-playing": {
        files: ['src/**/*.scss'],
        tasks: ['build-assets']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-crx');

  grunt.registerTask('default', ['build']);
  //
  grunt.registerTask('build', ['sass', 'crx']);
};
