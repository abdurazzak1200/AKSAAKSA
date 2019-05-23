'use strict';
const gulp = require('gulp'), // Подключаем Gulp
  sass = require('gulp-sass'), //Подключаем Sass пакет,
  browserSync = require('browser-sync'), // Подключаем Browser Sync
  concat = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
  uglify = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
  cssnano = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
  rename = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
  del = require('del'), // Подключаем библиотеку для удаления файлов и папок
  imagemin = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
  cache = require('gulp-cache'), // Подключаем библиотеку кеширования
  autoprefixer = require('gulp-autoprefixer'), // Подключаем библиотеку для автоматического добавления префиксов
  plumber = require('gulp-plumber'), // Ловим ошибки
  notify = require('gulp-notify'), // Украшаем ошибки
  sourcemaps = require('gulp-sourcemaps'), // Правильный путь по CSS
  pug = require('gulp-pug'), // Препроцессор pug
  bourbon = require('node-bourbon'), // mixin'ы для sass
  groupMedia = require('gulp-group-css-media-queries'); // mixin'ы для sass

  
const path = {
  src: {
    sass: 'app/sass/**/*.sass',
    pug: 'app/pug/pages/*.pug',
    img: 'app/img/**/*'
  },
  root: 'app'
}


gulp.task('sass', function () { // Создаем таск Sass
  return gulp.src(path.src.sass) // Берем источник
    .pipe(plumber({
      errorHandler: notify.onError(function (err) {
        return {
          title: 'Styles',
          message: err.message
        }
      })
    }))
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: require('node-bourbon').includePaths
    })) // Преобразуем Sass в CSS посредством gulp-sass
    .pipe(autoprefixer(['last 15 versions', '> 5%', 'ie 8', 'ie 7'], {
      cascade: true
    })) // Создаем префиксы
    .pipe(groupMedia())
    .pipe(cssnano()) // Сжимаем
    .pipe(rename({
      suffix: '.min'
    })) // Добавляем суффикс .min
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
    .pipe(browserSync.reload({
      stream: true
    })) // Обновляем CSS на странице при изменении
});

gulp.task('pug', function () {
  return gulp.src(path.src.pug)
    .pipe(plumber({
      errorHandler: notify.onError(function (err) {
        return {
          title: 'Styles',
          message: err.message
        }
      })
    }))
    .pipe(pug({
      pretty: '\t'
    }))
    .pipe(gulp.dest(path.root));
});

gulp.task('browser-sync', function () { // Создаем таск browser-sync
  browserSync({ // Выполняем browserSync
    server: { // Определяем параметры сервера
      baseDir: path.root // Директория для сервера - app
    },
    notify: false // Отключаем уведомления
  });
});

gulp.task('scripts', function () {
  return gulp.src([ // Берем все необходимые библиотеки
      'node_modules/jquery/dist/jquery.min.js'
    ])
    .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
    .pipe(uglify()) // Сжимаем JS файл
    .pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});

gulp.task('css-production', function () { // Создаем таск для css продакшн
  return gulp.src(path.src.sass) // Берем источник
    .pipe(sass({
      includePaths: require('node-bourbon').includePaths
    })) // Преобразуем Sass в CSS посредством gulp-sass
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
      cascade: true
    })) // Создаем префиксы
    .pipe(cssnano()) // Сжимаем
    .pipe(rename({
      suffix: '.min'
    })) // Добавляем суффикс .min
    .pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
});

gulp.task('watch', ['browser-sync', 'pug', 'sass', 'scripts'], function () {
  gulp.watch('app/sass/**/*.sass', ['sass']); // Наблюдение за sass файлами в папке sass
  gulp.watch('app/pug/**/*.pug', ['pug']); // Наблюдение за pug файлами в корне проекта
  gulp.watch('app/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
  gulp.watch('app/js/**/*.js', browserSync.reload); // Наблюдение за JS файлами в папке js
});

gulp.task('clean', function () {
  return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function () {
  return gulp.src(path.src.img) // Берем все изображения из app
    .pipe(cache(imagemin([ // сжатие изображений без потери качества
        imagemin.gifsicle(), // сжатие gif
        imagemin.jpegtran(), // сжатие jpeg
        imagemin.optipng() // сжатие png
      ]))) 
      .pipe(gulp.dest(`dist/img`));
});

gulp.task('build', ['clean', 'img', 'css-production', 'scripts'], function () {

  gulp.src('app/css/**.css')
    .pipe(gulp.dest('dist/css'))

  gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
    .pipe(gulp.dest('dist/fonts'))

  gulp.src('app/js/**/*') // Переносим скрипты в продакшен
    .pipe(gulp.dest('dist/js'))

  gulp.src('app/*.html') // Переносим HTML в продакшен
    .pipe(gulp.dest('dist'));

});

gulp.task('clear', function () {
  return cache.clearAll();
})

gulp.task('rsync', function () {
  return gulp.src('dist/**')
    .pipe(rsync({
      root: 'dist/',
      hostname: 'username@yousite.com',
      destination: 'yousite/public_html/',
      // include: ['*.htaccess'], // Includes files to deploy
      exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
      recursive: true,
      archive: true,
      silent: false,
      compress: true
    }))
});

gulp.task('default', ['watch']);