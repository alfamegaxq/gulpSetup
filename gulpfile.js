var lazyReq = require('lazy-req')(require),
    gulp = require('gulp'),
    cssMin = require('gulp-cssmin'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    svgSprite = require('gulp-svg-sprite'),
    rev = require('gulp-rev'),
    merge = require('gulp-merge-json');
env = process.env.GULP_ENV;

var settings = {
    bundleName: 'AppBundle',
    manifests: [
        'web/assets/rev-manifest-copycss.json',
        'web/assets/rev-manifest-copyjs.json'
    ],
    paths: {
        styles: {
            src: 'src/AppBundle/Resources/public/css',
            files: './src/AppBundle/Resources/public/scss/style.scss',
            filesWatch: [
                './src/AppBundle/Resources/public/scss/*/*/*.scss',
                './src/AppBundle/Resources/public/scss/*/*.scss',
                './src/AppBundle/Resources/public/scss/*.scss'
            ],
            dest: './src/AppBundle/Resources/public/css'
        },
        svg: {
            sourceFolder: './src/AppBundle/Resources/public/scss/sprites/svg/',
            spriteFolder: './web/assets/img/sprite/',
            scssMapFolder: './src/AppBundle/Resources/public/scss/core/'
        }
    }
};

var svgConfig = {
    shape: {
        spacing: {
            padding: 0
        }
    },
    mode: {
        css: {
            bust: false,
                dest: './',
                layout: 'diagonal',
                sprite: settings.paths.svg.spriteFolder + 'sprite.svg',
                render: {
                scss: {
                    dest: settings.paths.svg.scssMapFolder + '_svg-sprite-map.scss',
                        template: settings.paths.svg.scssMapFolder + '_svg-sprite-template.txt'
                }
            }
        }
    }
};

var functions = {
    sass: function() {
        return gulp.src(settings.paths.styles.files)
            .pipe(sass({
                includePaths: [settings.paths.styles.src]
            }))
            .pipe(gulp.dest(settings.paths.styles.dest));
    },
    copycss: function() {
        return gulp.src([
            'node_modules/bootstrap/dist/css/bootstrap.min.css',
            'node_modules/bootstrap/dist/css/bootstrap-theme.min.css',
            'src/' + settings.bundleName + '/Resources/public/libs/css/*',
            settings.paths.styles.dest + '/*'
        ])
            .pipe(sourcemaps.init())
            .pipe(concat('style.min.css'))
            .pipe(cssMin())
            .pipe(concat('assets/css/style.min.css'))
            .pipe(rev())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./web'))
            .pipe(rev.manifest('web/assets/rev-manifest-copycss.json', {merge: true}))
            .pipe(gulp.dest('.'));
    },
    copyjs: function () {
        return gulp.src([
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/bootstrap/dist/js/bootstrap.min.js',
            'src/' + settings.bundleName + '/Resources/public/js/libs/*',
            'src/' + settings.bundleName + '/Resources/public/js/*'
        ])
            .pipe(sourcemaps.init())
            .pipe(concat('assets/js/script.js'))
            .pipe(uglify())
            .pipe(rev())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./web'))
            .pipe(rev.manifest('web/assets/rev-manifest-copyjs.json', {merge: true}))
            .pipe(gulp.dest('.'));
    },
    manifest: function() {
        return gulp.src(settings.manifests)
            .pipe(merge('web/assets/rev-manifest.json'))
            .pipe(gulp.dest('.'));
    }
};

gulp.task('svg-sprite', function () {
    gulp.src(settings.paths.svg.sourceFolder + '*.svg')
        .pipe(svgSprite(svgConfig))
        .pipe(gulp.dest('./'));
});

gulp.task('sass', ['svg-sprite'], functions.sass);
gulp.task('copycss', ['svg-sprite', 'sass'], functions.copycss);


//task move bootstrap files
gulp.task('copyboostrapfonts', function () {
    gulp.src([
        'node_modules/bootstrap/dist/fonts/*.{ttf,woff,woff2,eof,svg}'
    ])
        .pipe(gulp.dest('web/assets/fonts'));
});

gulp.task('copyjs', ['svg-sprite', 'sass', 'copycss'], functions.copyjs);
gulp.task('manifest', ['svg-sprite', 'sass', 'copycss', 'copyjs'], functions.manifest);

//Tasks for single reason

gulp.task('js', functions.copyjs);
gulp.task('css-sass', functions.sass);
gulp.task('css', ['css-sass'], functions.copycss);
gulp.task('merge-js', ['js'], functions.manifest);
gulp.task('merge-css', ['css-sass', 'css'], functions.manifest);
gulp.task('merge-manifests', functions.manifest);

//watchers

gulp.task('watch', function () {
    gulp.watch([
        './src/' + settings.bundleName + '/Resources/public/scss/*/*/*.scss',
        './src/' + settings.bundleName + '/Resources/public/scss/*/*.scss',
        './src/' + settings.bundleName + '/Resources/public/scss/*.scss',
        './src/' + settings.bundleName + '/Resources/public/js/*'
    ], ['sass', 'copycss', 'copyjs', 'manifest' ]);
});

gulp.task('watch-js', function () {
    gulp.watch([
        './src/' + settings.bundleName + '/Resources/public/js/*'
    ], ['js', 'merge-js' ]);
});

gulp.task('watch-css', function () {
    gulp.watch(settings.paths.styles.filesWatch, ['css-sass', 'css', 'merge-css' ]);
});

//default gulp

gulp.task('default', [
    'svg-sprite',
    'sass',
    'copycss',
    'copyjs',
    'manifest',
    'copyboostrapfonts'
]);
