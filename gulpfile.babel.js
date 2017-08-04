// Include gulp
var gulp = require('gulp')
// Include Our Plugins
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var jshint       = require('gulp-jshint');
var browserSync  = require('browser-sync').create();
var uglify       = require('gulp-uglify');

var fs   = require('fs');
var browserify   = require('browserify')
var vueify       = require('vueify')
var babelify     = require('babelify')

import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
import gutil from "gulp-util";

var userScripts = [
  'client/js/global.js'
];
var components = [
  'client/js/components/*.vue'
];

var nodeScripts = [
  'main.js',
  'server.js',
  'router.js',
  'sockets.js',
  'bin/*.js'
]

var localDevUrl = 'https://localhost:8080/';

// Compile Our Sass
gulp.task('sass', function() {
  return gulp.src('client/sass/*.scss')
    .pipe(plumber({
        errorHandler: function (err) {
            console.log(err);
            this.emit('end');
        }
    }))
    .pipe(sass())
    .pipe(gulp.dest('client/development'))
    .pipe(browserSync.stream());
});

// Concatenate & Minify CSS
gulp.task('css-prod', function() {
  return gulp.src('client/development/*.css')
    .pipe(concat('all.css'))
    .pipe(minifyCss({compatibility: 'ie9'}))
    .pipe(rename('all.min.css'))
    .pipe(gulp.dest('client/production'));
});



// Lint Task
gulp.task('lint', function() {
  return gulp.src(nodeScripts.concat(userScripts))
    .pipe(jshint({
      esversion: 6
    }))
    .pipe(jshint.reporter('default'));
});

gulp.task('scripts', function () {
  return browserify(userScripts)
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
  .pipe(source('main.js'))
  .pipe(buffer())
  .pipe(gulp.dest('client/development'))
});

// Concatenate user scripts and minify them.
gulp.task('scripts-prod', ['scripts'], function (done) {
  return gulp.src('client/development/*.js')
    .pipe(concat('all.min.js'))
    .pipe(gulp.dest('client/production'))
});

// Live reload sync on every screen connect to localhost
gulp.task('init-live-reload', function() {
  browserSync.init({
    proxy: localDevUrl,
    notify: false
  });
});


// Watch Files For Changes with live reload sync on every screen connect to localhost.
gulp.task('dev-watch-sync', ['init-live-reload', 'watch']);

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch([userScripts, components, nodeScripts], ['lint', 'scripts']);
  gulp.watch('client/sass/*.scss', ['sass', 'css-prod']);
});

// Default Task
gulp.task('default', ['sass', 'css-prod', 'lint', 'scripts', 'scripts-prod', 'watch']);
