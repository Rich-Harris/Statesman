/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON( 'package.json' ),
		
		meta: {
			banner: '/*! Statesman - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'* <%= pkg.description %>\n\n' +
				'* <%= pkg.homepage %>\n' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
				' MIT Licensed */\n' +
				'/*jslint eqeq: true, plusplus: true */\n' +
				'\n\n'
		},

		watch: {
			js: {
				files: [ 'src/**/*.js', 'wrapper/**/*.js' ],
				tasks: [ 'clean:tmp', 'concat', 'jshint' ],
				interrupt: true,
				options: {
					force: true
				}
			}
		},

		qunit: {
			all: [ 'test/index.html' ]
		},
		concat: {
			options: {
				banner: '<%= meta.banner %>',
				process: {
					data: { version: '<%= pkg.version %>' }
				}
			},
			build: {
				src: [ 'wrapper/begin.js', 'src/**/*.js', 'wrapper/end.js' ],
				dest: 'tmp/Statesman.js'
			},
			legacy: {
				src: [ 'wrapper/begin.js', 'legacy.js', 'src/**/*.js', 'wrapper/end.js' ],
				dest: 'tmp/Statesman-legacy.js'
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			files: [ 'tmp/Statesman.js' ]
		},
		uglify: {
			build: {
				src: [ 'tmp/Statesman.js' ],
				dest: 'tmp/Statesman.min.js'
			},
			legacy: {
				src: [ 'tmp/Statesman-legacy.js' ],
				dest: 'tmp/Statesman-legacy.min.js'
			}
		},
		copy: {
			build: {
				files: [{
					cwd: 'tmp',
					expand: true,
					src: '**',
					dest: 'build/'
				}]
			},
			release: {
				files: [{
					cwd: 'build',
					expand: true,
					src: '**',
					dest: 'release/<%= pkg.version %>/'
				}]
			},
			shortcut: {
				files: [{
					cwd: 'build',
					expand: true,
					src: '**',
					dest: ''
				}]
			}
		},
		clean: {
			tmp: [ 'tmp' ],
			build: [ 'build' ]
		}
	});


	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-clean' );

	// build task
	grunt.registerTask( 'build', [
		'clean:tmp',
		'concat',
		'jshint',
		'uglify',
		'qunit',
		'clean:build',
		'copy:build'
	]);
	
	grunt.registerTask( 'release', [ 'build', 'copy:release', 'copy:shortcut' ] );

	grunt.registerTask( 'default', [ 'build' ] );

};
