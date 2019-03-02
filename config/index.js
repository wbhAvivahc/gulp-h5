var gulp = require('gulp');
//less处理
var less = require('gulp-less');
//文件合并
var concat = require('gulp-concat');
//压缩css
var cleanCSS = require('gulp-clean-css');
//删除文件
var del = require('del'); 
//es转译
var babel = require('gulp-babel');
//js压缩
var uglify = require('gulp-uglify');
//文件重命名
var rename = require('gulp-rename');
//图片压缩
var imagemin = require('gulp-imagemin');
//服务热更新
var browserSync = require('browser-sync').create();
//版本管理
var rev  = require('gulp-rev');
var revCollector  = require('gulp-rev-collector'); 
//通知
var notify  = require('gulp-notify'); 
//顺序标记器
var runSequence = require('run-sequence');
//自动不全css
var autoprefixer = require('gulp-autoprefixer');

var alioss = require('ali-oss');
var fs = require('fs');
var path = require('path');

//sourcemap
var sourcemaps = require('gulp-sourcemaps');

//命令行参数
var minimist = require('minimist');

var gulpif = require('gulp-if');

module.exports = {
    gulp,
    less,
    concat,
    cleanCSS,
    del,
    babel,
    uglify,
    rename,
    imagemin,
    browserSync,
    rev,
    revCollector,
    notify,
    runSequence,
    autoprefixer,
    fs,
    alioss,
    path,
    sourcemaps,
    minimist,
    gulpif
    
}
