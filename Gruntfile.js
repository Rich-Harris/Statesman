/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON( 'package.json' ),

		qunit: {
			all: [ 'test/build/index.html' ]
		},

		concat: {
			options: {
				banner: grunt.file.read( 'wrapper/banner.js' ),
				process: {
					data: { version: '<%= pkg.version %>' }
				}
			},
			build: {
				src: [ 'tmp/Ractive.js'  ],
				dest: 'build/Ractive.js'
			}
		},

		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				unused: true,
				boss: true,
				eqnull: true,
				evil: true,
				globals: {
					module: true,
					define: true
				}
			},
			files: [ 'src/**/*.js' ]
		},

		uglify: {
			build: {
				src: [ 'build/Statesman.js' ],
				dest: 'build/Statesman.min.js'
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
		},

		requirejs: {
			compile: {
				options: {
					baseUrl: 'src/',
					name: 'Statesman',
					out: 'tmp/Statesman.js',
					optimize: 'none',
					findNestedDependencies: true,
					onBuildWrite: function( name, path, contents ) {
						return require( 'amdclean' ).clean( contents );
					},

					wrap: {
						startFile: 'wrapper/intro.js',
						endFile: 'wrapper/outro.js'
					}
				}
			}
		}
	});


	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-clean' );
	grunt.loadNpmTasks( 'grunt-contrib-requirejs' );

	// build task
	grunt.registerTask( 'build', [
		'jshint',
		'clean:tmp',
		'requirejs',
		'qunit',
		'concat',
		'uglify',
		'clean:build',
		'copy:build'
	]);

	grunt.registerTask( 'release', [ 'build', 'copy:release', 'copy:shortcut' ] );

	grunt.registerTask( 'default', [ 'build' ] );

};
