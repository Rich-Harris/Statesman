/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: '<json:package.json>',
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
		lint: {
			files: ['grunt.js', 'src/Statesman.js']
		},
		qunit: {
			all: ['test/index.html']
		},
		concat: {
			dist: {
				src: ['<banner:meta.banner>', 'src/Statesman.js'],
				dest: '<%= pkg.name %>-<%= pkg.version %>.js'
			}
		},
		min: {
			dist: {
				src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
				dest: '<%= pkg.name %>-<%= pkg.version %>.min.js'
			}
		},
		watch: {
			files: '<config:lint.files>',
			tasks: 'lint test'
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true
			},
			globals: {}
		},
		uglify: {}
	});

	// Default task.
	grunt.registerTask('default', 'lint qunit concat min');

};
