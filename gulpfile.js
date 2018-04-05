//Gulp file for building scripts
const gulp = require('gulp');
const babel = require('gulp-babel');
const nodemon = require('gulp-nodemon');
const eslint = require('gulp-eslint');
const concat = require('gulp-concat');

//Gulp tasks
gulp.task('buildApp',() => {
  gulp.src(['./client/app/*.js','./client/helper/*.js'])
  .pipe(babel({
    presets: ['env','react']
  }))
  .pipe(concat('bundle.js'))
  .pipe(gulp.dest('./hosted'));
});

gulp.task('buildLogin',() => {
  gulp.src(['./client/login/*.js','./client/helper/*.js'])
  .pipe(babel({
    presets: ['env','react']
  }))
  .pipe(concat('loginBundle.js'))
  .pipe(gulp.dest('./hosted'));
});

gulp.task('js',() => {
  gulp.start('buildApp');
  gulp.start('buildLogin');
});

gulp.task('lint',() => {
  return gulp.src(['./server/*.js'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());
});

gulp.task('build',() => {
  gulp.start('js');
  gulp.start('lint');
});

gulp.task('watch', () => {
  gulp.watch('./**/client/app/*.js',['buildApp']);
  gulp.watch('./**/client/login/*.js',['buildLogin']);
  gulp.watch('./**/client/helper/*.js',['js']);
  
  nodemon({
    script: './server/app.js',
    ext: 'js',
    tasks: ['lint']
  });
});

gulp.task('watch')