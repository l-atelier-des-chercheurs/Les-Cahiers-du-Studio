// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var jshint       = require('gulp-jshint');
var browserSync  = require('browser-sync').create();
var uglify       = require('gulp-uglify');

var pluginsScripts = [
  'client/bower_components/jquery/dist/jquery.js',
  'client/bower_components/moment/min/moment-with-locales.js',
  'client/bower_components/store-js/store.min.js',
  'client/bower_components/interact/dist/interact.js',
  'client/bower_components/recordrtc/RecordRTC.min.js',
];
var userScripts = [
  'client/js/_fixedSlideEngine.js',
  'client/js/_currentStream.js',
  'client/js/_global.js'
];
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
  return gulp.src( userScripts)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Concatenate JS plugin
gulp.task('script-plugins', function() {
  return gulp.src(pluginsScripts)
    .pipe(concat('plugins.js'))
    .pipe(uglify())
    .pipe(gulp.dest('client/development'))
    .pipe(browserSync.stream());
});

// Concatenate user scripts and minify them.
gulp.task('scripts', ['script-plugins'], function (done) {
  return gulp.src(userScripts)
    .pipe(concat('main.js'))
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
  gulp.watch( userScripts, ['lint', 'script-plugins', 'scripts']);
  gulp.watch('client/sass/*.scss', ['sass', 'css-prod']);
});

// Default Task
gulp.task('default', ['sass', 'css-prod', 'lint', 'script-plugins', 'scripts', 'scripts-prod', 'watch']);
