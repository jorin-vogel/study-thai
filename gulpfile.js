var gulp       = require('gulp');
var concat     = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify     = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');


var JS_PATHS = ['public/app/**/*.js'];
var JS_OUT   = 'public/build.js';

gulp.task('build', function () {
  gulp.src(JS_PATHS)
    .pipe(concat(JS_OUT))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(gulp.dest('.'));
});


gulp.task('dev', function () {
  gulp.src(JS_PATHS)
    .pipe(sourcemaps.init())
      .pipe(concat(JS_OUT))
      .pipe(ngAnnotate())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'));
});


gulp.task('watch', ['dev'], function () {
  gulp.watch(JS_PATHS, ['dev']);
});