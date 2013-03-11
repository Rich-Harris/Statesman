/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON( 'package.json' ),
		meta: {
			banner: '/**\n' +
				'* <%= pkg.title || pkg.name %> - <%= pkg.description %>\n' +
				'*\n' +
				'* v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'*\n' +
				'* <%= pkg.repository.url %>\n' +
				'*\n' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
				'* Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
				'*/'
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			files: [ 'Gruntfile.js', 'src/Statesman.js' ]
		},
		qunit: {
			all: [ 'test/index.html' ]
		},
		concat: {
			options: {
				banner: '<%= meta.banner %>'
			},
			build: {
				src: [ 'src/Statesman.js' ],
				dest: 'Statesman.js'
			}
		},
		uglify: {
			build: {
				src: [ 'Statesman.js' ],
				dest: 'Statesman.min.js'
			}
		},
		watch: {
			files: '<config:jshint.files>',
			tasks: 'jshint test'
		}
	});


	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );

	// default task
	grunt.registerTask( 'default', [ 'jshint', 'qunit', 'concat', 'uglify' ] );

};
