module.exports = {
	manifest: {
		expand: true,
		cwd: '<%= dirs.src %>',
		src: '*/app-manifest.json',
		dest: '<%= dirs.build %>/'
	},
	js: {
		expand: true,
		cwd: '<%= dirs.src %>',
		src: ['<%= sources.js %>', '!*/third-party/*'],
		dest: '<%= dirs.build %>/'
	},
	'third-party': {
		expand: true,
		cwd: '<%= dirs.src %>',
		src: [
			'*/third-party/**/*.js',
			'*/third-party/**/*.css'
		],
		dest: '<%= dirs.build %>/'
	}
};
