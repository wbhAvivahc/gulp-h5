const {
    gulp,
    less,
    concat,
    babel,
    browserSync,
    cleanCSS,
    uglify,
    rename,
    watch,
    path
} = require('../index.js');

var reload = browserSync.reload;
var dev = {
    basePath: 'files',
    css: '/src/css/',
    js: '/src/js/',
    images: '/src/images/',
    less: '/src/less/',
    file_path: ''
}

var currentFile = ''
gulp.task('server:dev', ['watchFilePath'], function () {
    browserSync.init({
        server: {
            baseDir: dev.basePath,
            index: 'index.html',
        },
        logPrefix: "browser-sync is running",
        port: 8080,
        open: false
    });

});

gulp.task('watchFilePath', function () {
    gulp.watch(['files/**/src/**','!files/**/src/js/all.*js','!files/**/src/css/all.*css'], function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        if (event.path.includes('/')) {
            var pathArray = event.path.split('/');
        } else if (event.path.indexOf('\\') > -1) {
            var pathArray = event.path.split('\\');
        } else {
            console.log('error pathArray' + pathArray)
        }
        if (pathArray.indexOf('files') + 1 <= pathArray.length) {
            var pathIndex = pathArray.indexOf('files') + 1;
            //当前文件的地址
            currentFile = pathArray.slice(pathArray.indexOf('files')).join(path.sep)
            dev.file_path = dev.basePath + '/' + pathArray[pathIndex];
            var file_end_name = pathArray[pathArray.length - 1].split('.')
            
            switch (file_end_name[file_end_name.length - 1]) {
                case 'html':
                    html_dev();
                    break;
                case 'less':
                    less_dev();
                    break;
                case 'js':
                    js_dev();
                    break;
                case 'css':
                    css_dev();
                    break;
            }
        }
    })
})

gulp.task('html:dev', function () {
    html_dev();
});

gulp.task('less', function () {
    less_dev()
});

gulp.task('css:dev', function () {
    css_dev()
});

gulp.task('js:dev', function () {
    js_dev()
});

function css_dev() {
    gulp.src([dev.file_path + dev.css + '*.css', '!' + dev.file_path + dev.css + 'all.min.css', '!' + dev.file_path + dev.css + 'all.css'])
        .pipe(concat('all.css'))
        .pipe(gulp.dest(dev.file_path + dev.css)) //输出一个未压缩版本
        .pipe(cleanCSS())
        .pipe(rename('./all.min.css'))
        .pipe(gulp.dest(dev.file_path + dev.css)) //输出一个压缩版本
        .pipe(reload(
            {
                stream: true
            }
        ))
}

function js_dev() {
    gulp.src([dev.file_path + dev.js + '*.js', '!' + dev.file_path + dev.js + 'all.js', '!' + dev.file_path + dev.js + 'all.min.js'])
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(concat('all.js'))
        .pipe(gulp.dest(dev.file_path + dev.js)) //输出一个未压缩版本
        .pipe(uglify())
        .pipe(rename('./all.min.js'))
        .pipe(gulp.dest(dev.file_path + dev.js)) //输出一个压缩版本
        .pipe(reload(
            {
                stream: true
            }
        ))
        
}

function html_dev() {
    gulp.src([
        //dev.file_path + '/src/*.html'
        currentFile
    ])
    .pipe(gulp.dest(dev.file_path + '/src/'))

    .pipe(reload({
        stream: true
    }))
}

function less_dev() {
    gulp.src(dev.file_path + dev.less + '*.less')
        .pipe(less())
        // .pipe(gulp.dest(dev.file_path + dev.css))
        .pipe(concat('all.css'))
        .pipe(gulp.dest(dev.file_path + dev.css))
        .pipe(reload(
            {
                stream: true
            }
        ))
}