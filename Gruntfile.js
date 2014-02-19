module.exports = function (grunt) {
  'use strict';

  require('load-grunt-tasks')(grunt);

  // Default task.
  grunt.registerTask('default', ['jshint', 'karma:unit']);
  grunt.registerTask('serve', ['connect:continuous', 'karma:continuous', 'watch']);
  grunt.registerTask('dist', ['clean', 'ngTemplateCache', 'concat', 'ngmin', 'uglify', 'copy']);


  grunt.registerTask('karma:continuous', ['karma:wjqlite_bg', 'karma:wjquery_bg']);
  grunt.registerTask('karma:unit', ['karma:wjqlite:unit', 'karma:wjquery:unit']);
  grunt.registerTask('karma:unit:run', ['karma:wjqlite:unit:run', 'karma:wjquery:unit:run']);

  // HACK TO MAKE TRAVIS WORK
  var testConfig = function(configFile, customOptions) {
    var options = { configFile: configFile, singleRun: true };
    var travisOptions = process.env.TRAVIS && { browsers: ['Firefox', 'PhantomJS'], reporters: ['dots'] };
    return grunt.util._.extend(options, customOptions, travisOptions);
  };
  //


  // HACK TO ACCESS TO THE COMPONENT-PUBLISHER
  function fakeTargetTask(prefix){
    return function(){

      if (this.args.length !== 1) return grunt.log.fail('Just give the name of the ' + prefix + ' you want like :\ngrunt ' + prefix + ':bower');

      var done = this.async();
      var spawn = require('child_process').spawn;
      spawn('./node_modules/.bin/gulp', [ prefix, '--branch='+this.args[0] ].concat(grunt.option.flags()), {
        cwd : './node_modules/angular-ui-publisher',
        stdio: 'inherit'
      }).on('close', done);
    };
  }

  grunt.registerTask('build', fakeTargetTask('build'));
  grunt.registerTask('publish', fakeTargetTask('publish'));
  //


  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: ['/**',
        ' * <%= pkg.name %> - <%= pkg.description %>',
        ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
        ' * @link <%= pkg.homepage %>',
        ' * @license <%= pkg.license %>',
        ' */',
        ''].join('\n')
    },

    // JS QUALITY
    jshint: {
      src: {
        files:{ src : ['src/*.js', 'demo/**/*.js'] },
        options: { jshintrc: '.jshintrc' }
      },
      test: {
        files:{ src : [ 'test/*.spec.js', 'publish.js', 'gruntFile.js'] },
        options: grunt.util._.extend({}, grunt.file.readJSON('.jshintrc'), {
          node: true,
          globals: {
            angular: false,
            inject: false,
            _jQuery: false,

            jasmine: false,
            afterEach: false,
            beforeEach: false,
            describe: false,
            expect: false,
            it: false,
            spyOn: false
          }
        })
      }
    },

    karma: {
      wjquery: testConfig('test/karma-jquery.conf.js'),
      wjqlite: testConfig('test/karma-jqlite.conf.js'),
      wjquery_bg: {configFile: 'test/karma-jquery.conf.js', background: true },
      wjqlite_bg: {configFile: 'test/karma-jqlite.conf.js', background: true }
    },

    changelog: {
      options: {
        dest: 'CHANGELOG.md'
      }
    },

    clean: {
      dist: ['.tmp/', 'dist/']
    },

    ngTemplateCache: {
      views: {
        files: {
          '.tmp/templates.js': 'src/**/*.tpl.html'
        },
        options: {
          trim: 'src/',
          module: 'ui.select'
        }
      }
    },

    concat: {
      dist: {
        src: [
          'src/select.js',
          '.tmp/templates.js'
        ],
        dest: 'dist/select.js'
      }
    },

    ngmin: {
      main: {
        expand: true,
        cwd: 'dist',
        src: ['*.js'],
        dest: 'dist'
      }
    },


    uglify: {
      options: {banner: '<%= meta.banner %>'},
      build: {
        expand: true,
        cwd: 'dist',
        src: ['*.js'],
        ext: '.min.js',
        dest: 'dist'
      }
    },

    copy: {
      dist: {
        files: [{
          src: 'src/select.css',
          dest: 'dist/select.css'
        }]
      }
    },

    watch: {
      src: {
        files: ['src/**/*'],
        tasks: ['karma:unit:run', 'dist', 'build:gh-pages']
      },
      test: {
        files: ['test/*.spec.js'],
        tasks: ['karma:unit:run']
      },
      demo: {
        files: ['examples/**', 'publish.js'],
        tasks: ['build:gh-pages']
      },
      livereload: {
        files: ['out/built/gh-pages/**/*'],
        options: { livereload: true }
      }
    },

    connect: {
      options: {
        base : 'out/built/gh-pages',
        open: true,
        livereload: true
      },
      server: { options: { keepalive: true } },
      continuous: { options: { keepalive: false } }
    }


  });
};
