const gulp = require("gulp");
const concat = require("gulp-concat");
const sass = require("gulp-sass");
const cssmin = require("gulp-cssmin");
const rename = require("gulp-rename");
const babel = require("gulp-babel");
const wrap = require("gulp-wrap");
const scssimport = require("gulp-shopify-sass");
const stripCssComments = require("gulp-strip-css-comments");
const strip = require("gulp-strip-comments");
const banner = require("gulp-banner");

const rollup = require("rollup");

const BANNER_TEMPLATE = require("../partials/banner");
const { PACKAGE_INFO, CSS_DIST, JS_DIST } = require("./constants");

function snake2Camel( str ) {
  return str.split("-").map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join("");
}

function resolveBanner() {
  return banner(BANNER_TEMPLATE, {pkg: PACKAGE_INFO});  
}

function resolveRollupTask( opts ) {
  return rollup
    .rollup({input: opts.input, plugins: opts.plugins})
    .then(bundle => bundle.write({file: opts.file, format: (opts.format || "umd"), name: opts.name}));
}

function resolveScssTask( src, opts = {} ) {
  return () => {
    if ( typeof opts === "string" ) {
      opts = {renameTo: opts};
    }
    
    const { renameTo, imported } = opts;

    let task = gulp.src(src);

    if ( imported ) {
      task = task.pipe(scssimport());
    }
    
    if ( renameTo ) {
      task = task.pipe(Array.isArray(src) ? concat(renameTo) : rename(renameTo));
    }

    task = task
      .pipe(sass({outputStyle: "expanded", noLineComments: true, keepSpecialComments: 0}).on("error", sass.logError))
      .pipe(stripCssComments({preserve: false}));
    
    if ( opts.minify ) {
      task = task.pipe(cssmin());
    }
    
    if ( opts.hasBanner !== false ) {
      task = task.pipe(resolveBanner());
    }

    return task.pipe(gulp.dest(opts.dest || CSS_DIST));
  }
}

function resolveJsTask( src, opts = {} ) {
  return () => {
    if ( typeof opts === "string" ) {
      opts = {renameTo: opts};
    }

    const { renameTo } = opts;

    let task = gulp.src(src);
    
    if ( renameTo ) {
      task = task.pipe(Array.isArray(src) ? concat(renameTo) : rename(renameTo));
    }

    return task
      .pipe(babel({presets: ["es2015"]}))
      .pipe(strip())
      .pipe(wrap(`(function() {\n\n<%= contents %>\n\n})();`))
      .pipe(gulp.dest(opts.dest || JS_DIST));
  }
}

module.exports = {
  snake2Camel,
  resolveBanner,
  resolveRollupTask,
  resolveScssTask,
  resolveJsTask
};
