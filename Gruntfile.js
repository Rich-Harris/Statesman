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
				' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n' +
				'\n' +
				'/*jslint eqeq: true, plusplus: true */\n' +
				'/*global document, HTMLElement */\n' +
				'\n\n',
			wrapper: {
				start: '(function ( global ) {\n\n' +
						'\'use strict\';\n\n',
				end: '\n\n// export\n' +
						'if ( typeof module !== "undefined" && module.exports ) module.exports = Statesman // Common JS\n' +
						'else if ( typeof define === "function" && define.amd ) define( function () { return Statesman } ) // AMD\n' +
						'else { global.Statesman = Statesman }\n\n' +
						'}( this ));'
			}
		},

		watch: {
			js: {
				files: [ 'src/**/*.js' ],
				tasks: 'concat',
				interrupt: true
			}
		},

		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			files: [ 'Gruntfile.js', 'build/Statesman.js' ]
		},
		qunit: {
			all: [ 'test/index.html' ]
		},
		concat: {
			options: {
				banner: '<%= meta.banner %><%= meta.wrapper.start %>',
				footer: '<%= meta.wrapper.end %>'
			},
			build: {
				src: [ 'src/_internal.js', 'src/events.js', 'src/Statesman.js', 'src/Subset.js' ],
				dest: 'build/Statesman.js'
			}
		},
		uglify: {
			build: {
				src: [ 'build/Statesman.js' ],
				dest: 'build/Statesman.min.js'
			}
		},
		copy: {
			release: {
				files: {
					'release/<%= pkg.version %>/Statesman.js': '<%= concat.build.dest %>',
					'release/<%= pkg.version %>/Statesman.min.js': '<%= uglify.build.dest %>'
				}
			},
			shortcut: {
				files: {
					'Statesman.js': '<%= concat.build.dest %>',
					'Statesman.min.js': '<%= uglify.build.dest %>'
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

	// default task
	grunt.registerTask( 'default', [ 'concat', 'uglify', 'qunit' ] );
	grunt.registerTask( 'release', [ 'default', 'copy' ] );

};
