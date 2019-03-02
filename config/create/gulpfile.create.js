var gulp = require('gulp');
var inject = require('gulp-inject');

gulp.task('index', function () {
    var target = gulp.src('./files/**/src/*.html');
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    //   var sources = gulp.src(['./files/**/src/**/*.css', './files/**/src/**/*.js'], {read: false});

     target.pipe(inject(gulp.src(['./*.js'], {read: false}),{
        name: 'hdcommon',
        transform: function(){
            return '<script src="//yxs-web.oss-cn-beijing.aliyuncs.com/js/hdcommon.js" type="text/javascript"></script>\n'
        }
        })) 
    .pipe(gulp.dest('./files'))

});