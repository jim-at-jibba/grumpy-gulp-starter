/**
 * Created by jbest on 2/12/2015.
 */
var basePaths = {
    src: 'src/assets/',
    dest: 'public/assets/',
    bower: 'bower_components/'
};
var paths = {
    images: {
        src: basePaths.src + 'images/',
        dest: basePaths.dest + 'images/min/'
    },
    scripts: {
        src: basePaths.src + 'js/',
        dest: basePaths.dest + 'js/min/'
    },
    styles: {
        src: basePaths.src + 'sass/',
        dest: basePaths.dest + 'css/min/'
    },
    coffee: {
        src: basePaths.src + 'coffee/',
        dest: basePaths.dest + 'js/min/'
    }
};

// Project Source Code
var appFiles = {
    styles: paths.styles.src + '**/main.scss',
    scripts: [paths.scripts.src + '**/*.js'],
    coffee: [paths.coffee.src + '**/*.coffee']

};

// Plugin Files usually from Bower
var vendorFiles = {
    styles: '',
    scripts: [
        basePaths.bower + 'fullpage.js/vendors/jquery.slimscroll.min.js',
        basePaths.bower + 'fullpage.js/jquery.fullPage.min.js'
    ]
};

/*
 Let the magic begin
 */
var gulp = require('gulp');
var es = require('event-stream');
var gutil = require('gulp-util');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var plugins = require("gulp-load-plugins")({
    pattern: ['gulp-*', 'gulp.*'],
    replaceString: /\bgulp[\-.]/
});

// Set up liveReload server
// browser-sync task for starting the server.
gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: "./public/"
        }
    });
});

// Allows gulp --dev to be run for a more verbose output
var isProduction = true;
var sassStyle = 'compressed';
var sourceMap = false;

if (gutil.env.dev === true) {
    sassStyle = 'expanded';
    sourceMap = true;
    isProduction = false;
}
var changeEvent = function (evt) {
    gutil.log('File', gutil.colors.cyan(evt.path.replace(new RegExp('/.*(?=/' + basePaths.src + ')/'), '')), 'was', gutil.colors.magenta(evt.type));
};
gulp.task('css', function () {
    var sassFiles = gulp.src(appFiles.styles)
        .pipe(plugins.sass(
            {
                style: sassStyle,
                errLogToConsole: true
            }))
        .on('error', function (err) {
            new gutil.PluginError('CSS', err, {showStack: true});
        });
    return es.concat(gulp.src(vendorFiles.styles), sassFiles)
        .pipe(plugins.concat('style.min.css'))
        .pipe(plugins.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4', 'Firefox >= 4'))
        .pipe(isProduction ? plugins.combineMediaQueries({
            log: true
        }) : gutil.noop())
        .pipe(isProduction ? plugins.cssmin() : gutil.noop())
        .pipe(plugins.size())
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(reload({stream: true}));
});

gulp.task('coffee', function(){

    gulp.src(appFiles.coffee)
        .pipe(plugins.coffee())
        .on('error', function (err) {
            new gutil.PluginError('Coffee', err, {showStack: true});
        })
        .pipe(gulp.dest(paths.scripts.src));

});


    gulp.task('scripts', function(){

        gulp.src(vendorFiles.scripts.concat(appFiles.scripts))
            .pipe(plugins.concat('app.js'))
            .pipe(gulp.dest(paths.scripts.dest))
            .pipe(isProduction ? plugins.uglify() : gutil.noop())
            .pipe(isProduction ? plugins.stripDebug() : gutil.noop())
            .pipe(plugins.size())
            .pipe(gulp.dest(paths.scripts.dest));

    });


gulp.task('watch', ['css', 'scripts', 'coffee', 'browser-sync'], function () {
    gulp.watch(appFiles.styles, ['css']).on('change', function (evt) {
        changeEvent(evt);
    });
    gulp.watch(paths.scripts.src + '*.js', ['scripts', browserSync.reload]).on('change', function (evt) {
        changeEvent(evt);
    });
    gulp.watch(paths.coffee.src + '*.coffee', ['coffee', browserSync.reload]).on('change', function (evt) {
        changeEvent(evt);
    });
});
gulp.task('default', ['css', 'scripts', 'coffee', 'browser-sync']);
