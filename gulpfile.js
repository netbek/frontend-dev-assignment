/**
 * Build
 *
 * @author Hein Bekker <hein@netbek.co.za>
 * @copyright (c) 2015 Hein Bekker
 * @license http://www.gnu.org/licenses/agpl-3.0.txt AGPLv3
 */

'use strict';

// Workaround for `Promise is not defined` error thrown by gulp-autoprefixer
// https://github.com/sindresorhus/gulp-autoprefixer/issues/45#issuecomment-142812102
global.Promise = require('bluebird');

var autoprefixer = require('gulp-autoprefixer');
var base64 = require('gulp-base64');
var concat = require('gulp-concat');
var cssmin = require('gulp-cssmin');
var gulp = require('gulp');
var jquery = require('gulp-jquery');
var jshint = require('gulp-jshint');
var modernizr = require('gulp-modernizr');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');

var sassParams = {
  includePaths: [
    'bower_components/normalize-scss/',
    'bower_components/compass-mixins/lib/',
    'bower_components/foundation/scss/',
    'src/sass/'
  ],
  errLogToConsole: true
};

var sources = {
  jsIE8: [
    'bower_components/html5shiv/dist/html5shiv.min.js',
    'bower_components/respond/dest/respond.src.js'
  ],
  jsVendor: [
    'src/js/vendor/modernizr/modernizr.js',
    'bower_components/fastclick/lib/fastclick.js',
    'bower_components/loadjs/loadJS.js',
    'bower_components/filament-fixed/fixedfixed.js',
    'src/js/vendor/jquery/jquery.custom.js'
  ],
  jsApp: [
    'src/js/util.js',
    'src/js/util/breakpoint.js',
    'src/js/app.js',
    'src/js/init.js'
  ]
};

gulp.task('jshint', function (cb) {
  return gulp
    .src(sources.jsApp)
    .pipe(jshint())
    .pipe(jshint.reporter('default', {verbose: true}));
});

gulp.task('jquery', function (cb) {
  jquery
    .src({
      release: 1, // For IE8
      flags: ['-ajax']
    })
    .pipe(gulp.dest('src/js/vendor/jquery'))
    .on('end', cb);
});

gulp.task('modernizr', function (cb) {
  gulp
    .src('src/sass/**/*.scss')
    .pipe(modernizr({
      'cache': false,
      'crawl': false,
      'options': [
        'setClasses'
//        'addTest',
//        'testProp',
//        'fnBind'
      ],
      'tests': [
//        'svg'
      ]
    }))
    .pipe(gulp.dest('src/js/vendor/modernizr'))
    .on('end', cb);
});

// Polyfills for HTML5 elements and media queries (for legacy IE)
gulp.task('js:ie8', function (cb) {
  gulp
    .src(sources.jsIE8)
    .pipe(concat('ie8.js'))
    .pipe(gulp.dest('js'))
    .pipe(rename('ie8.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('js'))
    .on('end', cb);
});

gulp.task('js:app', function (cb) {
  gulp
    .src([].concat(sources.jsVendor, sources.jsApp))
    .pipe(concat('app.js'))
    .pipe(gulp.dest('js'))
    .pipe(rename('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('js'))
    .on('end', cb);
});

gulp.task('sass', function (cb) {
  gulp.src('src/sass/**/*.scss')
//    .pipe(sourcemaps.init())
    .pipe(sass(sassParams).on('error', sass.logError))
    .pipe(base64({
      extensions: ['woff'],
      maxImageSize: 128 * 1024
    }))
    .pipe(autoprefixer({
      browsers: ['last 2 versions', 'ie >= 8', 'ff >= 5', 'chrome >= 20', 'opera >= 12', 'safari >= 4', 'ios >= 6', 'android >= 2', 'bb >= 6']
    }))
    .pipe(gulp.dest('css'))
    .pipe(cssmin({advanced: false}))
    .pipe(rename({suffix: '.min'}))
//    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('css'))
    .on('end', cb);
});

gulp.task('build', function (cb) {
  runSequence(
    'jshint',
    'jquery',
    'modernizr',
    'js:ie8',
    'js:app',
    'sass',
    cb
    );
});

gulp.task('watch', function () {
  watch(['!bower_components', 'src/sass/**/*.*', 'src/js/**/*.*'], function () {
    gulp.start('build');
  });
});

gulp.task('default', function () {
  runSequence('build', 'watch');
});
