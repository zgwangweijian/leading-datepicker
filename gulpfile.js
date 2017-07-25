/**
 * Created by wangwj on 2016/11/5.
 */
var fs = require('fs');
var gulp = require('gulp');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var minifycss = require('gulp-minify-css');
var header = require('gulp-header');
var footer = require('gulp-footer');
var rename = require('gulp-rename');
var es = require('event-stream');
var del = require('del');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');


var config = {
    pkg: JSON.parse(fs.readFileSync('./package.json')),
    banner: '/*!\n' +
    ' * <%= pkg.name %>\n' +
    ' * <%= pkg.homepage %>\n' +
    ' * Version: <%= pkg.version %> - <%= timestamp %>\n' +
    ' * License: <%= pkg.license %>\n' +
    ' */\n\n\n'
};

gulp.task('default',['build']);
gulp.task('build', ['scripts', 'stylesheet']);

gulp.task('watch', ['build'], function () {
    gulp.watch(['src/*.{js,css}'], ['build']);
});

gulp.task('clean', function (cb) {
    del(['dist'], cb);
});

gulp.task('stylesheet', function () {
    var buildLib = function () {
        return gulp.src(['src/*.css'])
            .pipe(plumber({
                errorHandler: handleError
            }))
            .pipe(minifycss())
    };
    return es.merge(buildLib())
        .pipe(plumber({
            errorHandler: handleError
        }))
        .pipe(concat('leading-datepicker.css'))
        .pipe(header(config.banner, {
            timestamp: (new Date()).toISOString(), pkg: config.pkg
        }))
        .pipe(gulp.dest('dist'))
        .pipe(rename({ext: '.min.css'}))
        .pipe(gulp.dest('dist'));
});

gulp.task('scripts', function () {
    var buildLib = function () {
        return gulp.src(['src/*.js'])
            .pipe(plumber({
                errorHandler: handleError
            }))
            .pipe(jshint())
            .pipe(jshint.reporter('jshint-stylish'))
            .pipe(jshint.reporter('fail'));
    };

    return es.merge(buildLib())
        .pipe(plumber({
            errorHandler: handleError
        }))
        .pipe(concat('leading-datepicker.js'))
        .pipe(header(config.banner, {
            timestamp: (new Date()).toISOString(), pkg: config.pkg
        }))
        .pipe(gulp.dest('dist'))
        .pipe(uglify({preserveComments: 'some'}))
        .pipe(rename({ext: '.min.js'}))
        .pipe(gulp.dest('dist'));

});

var handleError = function (err) {
    console.log(err.toString());
    this.emit('end');
};