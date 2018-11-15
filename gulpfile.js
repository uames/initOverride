// 引入 gulp
var gulp = require('gulp'),
  uglify = require('gulp-uglify');

// 压缩js文件
gulp.task('minjs', function() {
    gulp.src('resource/**/*.js')
        .pipe(uglify({
            mangle: false
        }))
        .pipe(gulp.dest('override/'));
});
