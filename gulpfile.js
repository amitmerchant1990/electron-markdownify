'use strict';

const fs = require('fs');
const gulp = require('gulp');
const packager = require('electron-packager');

const config = JSON.parse(fs.readFileSync('package.json'));
const appVersion = config.version;
const electronVersion = config.devDependencies['electron'].match(/[\d.]+/)[0];
const options = {
	asar: true,
	dir: '.',
	icon: './app/img/markdownify.icns',
	name: 'Markdownify',
	out: 'dist',
	overwrite: true,
	prune: true,
	version: electronVersion,
	'app-version': appVersion
};

gulp.task('build:osx', (done) => {
	options.arch = 'x64';
	options.platform = 'darwin';
	options['app-bundle-id'] = 'com.amitmerchant.markdownify';
	options['helper-bundle-id'] = 'com.amitmerchant.markdownify.helper';

	packager(options, (err, paths) => {
		if (err) {
			console.error(err);
		}

		done();
	});
});

gulp.task('build:linux', () => {
	// @TODO
});

gulp.task('build:windows', () => {
	options.arch = 'x64';
	options.platform = 'win32';
	packager(options, (err, paths) => {
		if (err) {
			console.error(err);
		}

		done();
	});
});

gulp.task('build', ['build:osx', 'build:linux', 'build:windows']);
