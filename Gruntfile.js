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

    zip: {
      extension: {
        cwd: 'src/',
        src: [
          'src/**/*',
          '!src/**/*.map',
          '!src/channel.json',
          '!src/vendor/**',
          'src/vendor/lodash/dist/lodash.min.js',
          'src/vendor/machina/lib/machina.min.js',
          'src/vendor/angular/angular.min.js',
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
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-zip');

  grunt.registerTask('default', ['test']);
  //
  grunt.registerTask('test', ['jshint', 'mocha']);
  grunt.registerTask('build-assets', ['sass']);
  grunt.registerTask('build', ['build-assets', 'test', 'zip']);
};
