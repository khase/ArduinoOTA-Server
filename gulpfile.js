let gulp = require("gulp");
let sourcemaps = require("gulp-sourcemaps");
let ts = require("gulp-typescript");
let nodemon = require("gulp-nodemon");
let tslint = require("gulp-tslint");
let runSequence = require("run-sequence");
let rimraf = require("rimraf");
let tsProject = ts.createProject("tsconfig.json");

const CLEAN_BUILD = "clean:build";
const TSLINT = "tslint";
const COMPILE_TYPESCRIPT = "compile:typescript";
const BUILD = "build";
const WATCH = "watch";
const WATCH_POLL = "watch:poll";

const TS_SRC_GLOB = "./src/**/*.ts";
const TS_DIST_GLOB = "./dist";

// Runs all required steps for the build in sequence.
gulp.task(BUILD, function (callback) {
  runSequence(CLEAN_BUILD, TSLINT, COMPILE_TYPESCRIPT, callback);
});

// Removes the ./build directory with all its content.
gulp.task(CLEAN_BUILD, function (callback) {
  rimraf("./build", callback);
});

// Checks all *.ts-files if they are conform to the rules specified in tslint.json.
gulp.task(TSLINT, function () {
  return gulp.src(TS_SRC_GLOB)
    .pipe(tslint({formatter: "verbose"}))
    .pipe(tslint.report({
      // set this to true, if you want the build process to fail on tslint errors.
      emitError: true
    }));
});

// Compiles all *.ts-files to *.js-files.
gulp.task(COMPILE_TYPESCRIPT, function () {
  return gulp.src(TS_SRC_GLOB, {base: "."})
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./build"));
});

gulp.task("default", function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest(TS_DIST_GLOB));
});

// Runs the build task and starts the server every time changes are detected.
gulp.task(WATCH, [BUILD], function () {
  return nodemon({
    ext: "ts js json",
    script: "build/src/server.js",
    watch: ["src/*", "test/*"],
    tasks: [BUILD]
  });
});

// Runs the build task and starts the server every time changes are detected WITH LEGACY-WATCH ENABLED.
gulp.task(WATCH_POLL, [BUILD], function () {
  return nodemon({
    ext: "ts js json",
    script: "build/src/server.js",
    watch: ["src/*", "test/*"],
    legacyWatch: true, // Uses the legacy polling to get changes even on docker/vagrant-mounts
    tasks: [BUILD]
  });
});