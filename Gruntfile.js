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

    compass: {
      "now-playing": {
        options: {
          sassDir: "src/now-playing",
          cssDir: "src/now-playing",
          imagesDir: "src/resources",
          httpPath: "../",
          httpImagesPath: "../resources",
          raw: [
            "sass_options = { :sourcemap => true, :debug_info => false }",
            "enable_sourcemaps = true"
          ].join("\n")
        }
      },
      options: {
        importPath: "src/resources/sass"
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
        tasks: ['compass']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-zip');

  grunt.registerTask('default', ['test']);
  //
  grunt.registerTask('test', ['jshint', 'mocha']);
  grunt.registerTask('build-assets', ['compass']);
  grunt.registerTask('build', ['build-assets', 'test', 'zip']);
};
