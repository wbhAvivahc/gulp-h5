const {
    gulp,
    concat,
    cleanCSS,
    del,
    babel,
    uglify,
    rename,
    imagemin,
    rev,
    revCollector,
    runSequence,
    autoprefixer,
    fs,
    alioss,
    path,
    sourcemaps,
    minimist,
    gulpif
} = require('../index.js');

var prod = {
    baseUrl: '',
    css: '/css',
    js: '/js',
    images: '/images',
    dest: '/dest',
    prodBase: '/build',
    devBase: '/src',
}
var index = -1;

var filePath = 'files';
var pathArray = [];

var knownOptions = {
    string: 'env',
    default: { env: process.env.NODE_ENV || 'production' }
};

var options = minimist(process.argv.slice(2), knownOptions);

function getFolders(resolve, reject) {
    pathArray = fs.readdirSync(filePath);
    //删除 DS_Store
    if (pathArray.includes('.DS_Store')) {
        pathArray = pathArray.splice((pathArray.indexOf('.DS_Store') + 1));
    };
    resolve(pathArray);
}

function build_step() {
    index++;
    if (pathArray.length !== 0 && pathArray.length >= index + 1) {
        prod.baseUrl = filePath + '/' + pathArray[index]
        console.log('================ ' + pathArray[index] + ' is packing ================')
        runSequence('del:build', ['imagesmin', 'publish:html', 'publish:all-css', 'publish:all-js', 'publish:dest'], ['publish:single-js', 'publish:single-css', ], 'rev')
    } else {
        index = -1;
    }
};

function judgeUglifyAll() {
    var arg = JSON.parse(process.env.npm_config_argv).original;
    var middle = [];
    middle[0] = arg[arg.findIndex(function(value, index) {
        return value.includes('filename')
    })];

    arg = middle;
    if (arg[0] && arg[0].indexOf('filename') !== -1) {
        arg = arg[0].split('=')[1];
        //判断是否位数组
        if (arg.indexOf('[') !== -1 && arg.indexOf(']') !== -1) {
            arg = JSON.parse(arg);
        } else {
            //传入是all或者‘’也是执行单个文件。兼容jenkins只支持单个文件上传
            if (arg === 'all' || !arg) {
                return false
            };
            var array = [];
            array[0] = arg;
            arg = array;
        }
        pathArray = arg;
        return true
    }
    return false
};

//判断是否有此文件
function fileIsExit(data) {
    var state = true;
    pathArray.map(function(ele, index) {
        if (data.indexOf(ele) === -1) {
            console.log('File not found:' + ele)
            state = false;
        }
    });
    return state
};

//npm run build -- --filename:[11,22,333]
gulp.task('server:product', function() {
    console.log("================================ " + options.env + '正在打包 ================================')
        //--filename:[11,22,333]
    new Promise(
        getFolders
    ).then(function(data) {
        //打包指定
        if (judgeUglifyAll()) {
            if (fileIsExit(data)) {
                build_step()
            }
        } else {
            build_step()
        }
    })


});

//压缩图片，只限jpg和png
gulp.task('imagesmin', function() {

    var imagePath_dev = prod.baseUrl + prod.devBase + prod.images;
    var imagePath_prod = prod.baseUrl + prod.prodBase + prod.images + '/';
    return gulp.src(imagePath_dev + '/*.*')
        .pipe(imagemin())
        .pipe(gulp.dest(imagePath_prod))
});

gulp.task('publish:html', function() {
    return gulp.src(prod.baseUrl + prod.devBase + '/*.html')
        // .pipe(cached('scripts'))
        // .pipe(jshint())
        // .pipe(remember('scripts'))
        .pipe(gulp.dest(prod.baseUrl + prod.prodBase + '/'))
});

gulp.task('publish:all-js', function() {
    var jsPath_dev = prod.baseUrl + prod.devBase + prod.js + '/';
    var jsPath_prod = prod.baseUrl + prod.prodBase + prod.js + '/';
    //(function () {

    //整体流程 =》 all.min.js
    return gulp.src([jsPath_dev + '/*.js', '!' + jsPath_dev + '/all.js', '!' + jsPath_dev + '/all.min.js'])
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        // .pipe(gulp.dest(jsPath_prod))
        .pipe(concat('all.js'))
        .pipe(gulp.dest(jsPath_prod)) //输出一个未压缩版本
        .pipe(gulpif(options.env === 'development', sourcemaps.init()))
        .pipe(uglify()) // 仅在生产环境时候进行压缩
        .pipe(rename('./all.min.js'))
        .pipe(rev()) //发布新版本
        .pipe(gulpif(options.env === 'development', sourcemaps.write()))
        .pipe(gulp.dest(jsPath_prod)) //输出一个压缩版本
        .pipe(rev.manifest({
            path: prod.baseUrl + '/rev/js/rev-manifest.json',
            merge: true
        }))
        .pipe(gulp.dest('./'))

    .on('end', function() {
        uploadFile(jsPath_prod, 'all')
    })
});

gulp.task('publish:single-js', function() {
    var jsPath_dev = prod.baseUrl + prod.devBase + prod.js + '/';
    var jsPath_prod = prod.baseUrl + prod.prodBase + prod.js + '/';
    //(function () {

    //分步流程 => 单个文件
    return gulp.src([jsPath_dev + '/*.js', '!' + jsPath_dev + '/all.js', '!' + jsPath_dev + '/all.min.js', '!' + jsPath_dev + '/all-*.js'])
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        //发布新版本
        .pipe(gulpif(options.env === 'development', sourcemaps.init()))
        .pipe(uglify()) // 仅在生产环境时候进行压缩
        .pipe(gulpif(options.env === 'development', sourcemaps.write()))
        .pipe(rev())
        .pipe(gulp.dest(jsPath_prod))
        .pipe(rev.manifest({
            path: prod.baseUrl + '/rev/js/rev-manifest.json',
            merge: true
        }))
        .pipe(gulp.dest('./'))
        .on('end', function() {
            uploadFile(jsPath_prod)
        })
        // })()
});

gulp.task('publish:all-css', function() {
    // prod.baseUrl ./files/h5Bin
    var cssPath_dev = prod.baseUrl + prod.devBase + prod.css + '/';
    var cssPath_prod = prod.baseUrl + prod.prodBase + prod.css + '/';

    //输出all.js
    return gulp.src([cssPath_dev + '/*.css', '!' + cssPath_dev + '/all.css', '!' + cssPath_dev + '/all.min.css'])
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: true, //是否美化属性值 默认：true
            remove: true //是否去掉不必要的前缀 默认：true 
        }))
        .pipe(concat('all.css'))
        .pipe(gulp.dest(cssPath_prod)) //输出一个未压缩版本
        .pipe(cleanCSS())
        .pipe(rename('./all.min.css'))
        .pipe(rev()) //发布新版本
        .pipe(gulp.dest(cssPath_prod))
        .pipe(rev.manifest({
            path: prod.baseUrl + '/rev/css/rev-manifest.json',
            merge: true
        }))
        .pipe(gulp.dest('./'))
        .on('end', function() {
            uploadFile(cssPath_prod, 'all')
        })
});

gulp.task('publish:single-css', function() {
    // prod.baseUrl ./files/h5Bin
    var cssPath_dev = prod.baseUrl + prod.devBase + prod.css + '/';
    var cssPath_prod = prod.baseUrl + prod.prodBase + prod.css + '/';
    //对于单个文件处理
    return gulp.src([cssPath_dev + '/*.css', '!' + cssPath_dev + '/all.css', '!' + cssPath_dev + '/all.min.css'])
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: true, //是否美化属性值 默认：true
            remove: true //是否去掉不必要的前缀 默认：true 
        }))
        .pipe(cleanCSS())
        .pipe(rev()) //发布新版本
        .pipe(gulp.dest(cssPath_prod))
        .pipe(rev.manifest({
            path: prod.baseUrl + '/rev/css/rev-manifest.json',
            merge: true
        }))
        .pipe(gulp.dest('./'))
        .on('end', function() {
            uploadFile(cssPath_prod)
        })
});

gulp.task('publish:dest', function() {
    // prod.baseUrl ./files/h5Bin
    var destPath_dev = prod.baseUrl + prod.devBase + prod.dest + '/';
    var destPath_prod = prod.baseUrl + prod.prodBase + prod.dest + '/';

    return gulp.src([destPath_dev + '/**/*'])
        .pipe(gulp.dest(destPath_prod))
});

gulp.task('rev', function() {
    return gulp.src([prod.baseUrl + '/rev/**/*.json', prod.baseUrl + prod.prodBase + '/*.html'])
        .pipe(revCollector({
            replaceReved: true,
            dirReplacements: {
                'css/': '//yxs-web.oss-cn-beijing.aliyuncs.com',
                'js/': '//yxs-web.oss-cn-beijing.aliyuncs.com',
                './css': '//yxs-web.oss-cn-beijing.aliyuncs.com',
                './js': '//yxs-web.oss-cn-beijing.aliyuncs.com',
            }
        }))
        .pipe(gulp.dest(prod.baseUrl + prod.prodBase + '/'))
        .on('end', function() {
            build_step()

        });
});

gulp.task('del:build', function() {
    return del([
        prod.baseUrl + prod.prodBase, prod.baseUrl + '/rev', prod.baseUrl + prod.prodBase + prod.dest
    ]);
});

const oss_options = {
    internal: false,
    region: 'oss-cn-beijing1',
    accessKeyId: 'J0A9BNrnwamiBE9t1',
    accessKeySecret: 'JgDCS20hnGRv1dQ1xvylE29F5p2Q7X1',
    bucket: 'yxs-web1',
    secure: true
};

var client = new alioss(oss_options);

function uploadFile(filepath, type) {
    var allJsReg = /^all-.*\.min\.js$/;
    var allCssReg = /^all-.*\.min\.css$/;

    const jsFileList = fs.readdirSync(filepath).filter((filePath) => {
        if (type === 'all') {
            return allJsReg.test(filePath) || allCssReg.test(filePath)
        } else {
            return !(allJsReg.test(filePath) || allCssReg.test(filePath))
        }
    });
    jsFileList.map((ele, index) => {
            uploadFileToOss(jsFileList[index], filepath)
        })
        // console.log('== upload files end ==')

};

async function uploadFileToOss(file, filepath) {
    try {
        let result = await client.put(
            file, filepath + '/' + file
        );
        console.log(result.url, '===============')
    } catch (err) {
        console.log(err)
    }
}