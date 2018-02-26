// Include gulp
var gulp = require('gulp')
// Include Our Plugins
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var less         = require('gulp-less');
var jshint       = require('gulp-jshint');
var uglify       = require('gulp-uglify');

var fs   = require('fs');
var browserify   = require('browserify')
var vueify       = require('vueify')
var babelify     = require('babelify')

import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
import gutil from "gulp-util";

var userScripts = [
  'client/js/main.js'
];
var vueMain = [
  'client/js/app.js'
];
var watchedScriptsAndComponents = [
  'client/js/*.js',
  'client/js/*.vue',
  'client/js/components/*.vue',
  'client/js/components/modals/*.vue',
  'client/js/components/subcomponents/*.vue',
  'client/js/components/sidebar/*.vue'
];

var nodeScripts = [
  'main.js',
  'server.js',
  'router.js',
  'sockets.js',
  'bin/*.js'
]

// Compile Our Less
gulp.task('less', function() {
  return gulp.src('client/less/[^_]*.less')
    .pipe(plumber({
        errorHandler: function (err) {
            console.log(err.message);
            this.emit('end');
        }
    }))
    .pipe(less())
    .pipe(autoprefixer({
      browsers: ['last 3 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('client/development'));
});

// Concatenate & Minify CSS
gulp.task('css-prod', ['less'], function() {
  return gulp.src('client/development/*.css')
    .pipe(concat('all.css'))
    .pipe(minifyCss({compatibility: 'ie9'}))
    .pipe(rename('all.min.css'))
    .pipe(gulp.dest('client/production'));
});



// Lint Task
gulp.task('lint', function() {
  return gulp.src(nodeScripts.concat(userScripts, vueMain))
    .pipe(jshint({
      esversion: 6
    }))
    .pipe(jshint.reporter('default'));
});

gulp.task('vue', function() {
  return browserify(vueMain)
    .transform(vueify)
    .transform(babelify, { presets: ['es2015'], plugins: ['transform-runtime'] })
    .bundle()
    .on('error', function(err) {
      gutil.log(
        gutil.colors.red('Browserify compile error:'),
        err.message
      );
      gutil.beep();
      this.emit('end'); // Ends the task
    })
    .pipe(source('vue.js'))
    .pipe(buffer())
//     .pipe(uglify())
    .pipe(gulp.dest('client/development'))
});

gulp.task('scripts', function () {
  return browserify(userScripts)
    .transform(babelify, { presets: ['es2015'], plugins: ['transform-runtime'] })
    .bundle()
    .on('error', function(err) {
      gutil.log(
        gutil.colors.red('Browserify compile error:'),
        err.message
      );
      gutil.beep();
      this.emit('end'); // Ends the task
    })
    .pipe(source('main.js'))
    .pipe(buffer())
//     .pipe(uglify())
    .pipe(gulp.dest('client/development'));
    ;
});

// Concatenate user scripts and minify them.
gulp.task('scripts-prod', ['vue', 'scripts'], function (done) {
  return gulp.src('client/development/*.js')
    .pipe(concat('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('client/production'))
});

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch([userScripts, vueMain, watchedScriptsAndComponents, nodeScripts], ['lint', 'vue', 'scripts']);
  gulp.watch('client/less/*.less', ['less']);
});

// Default Task
gulp.task('default', ['less', 'css-prod', 'lint', 'vue', 'scripts', 'scripts-prod']);
