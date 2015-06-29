var matchdep = require('matchdep')
    , fs = require('fs')
    , q = require('q')
    , request = require('request')
    , services = [
        'introduction.md',
        'substitutions_reference.md',
        'metrics_api.md',
        'recipient_list_api.md',
        'sending_domains_api.md',
        'suppression_list_api.md',
        'templates_api.md',
        'transmissions_api.md',
        'webhooks_api.md',
        'smtp_api.md'
    ];

module.exports = function(grunt) {
    // Dynamically load any preexisting grunt tasks/modules
    matchdep.filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Configure existing grunt tasks and create custom ones
    grunt.initConfig({
        concat: {
            options: {
                banner: 'FORMAT: X-1A' + grunt.util.linefeed +
                    'HOST: https://api.sparkpost.com/api/v1' +
                    grunt.util.linefeed + grunt.util.linefeed
            },
            prod: {
                src: services.map(function(s) { return 'services/' + s; }),
                dest: 'apiary.apib'
            }
        },
        connect: {
            apiary: {
                options: {
                    port: 4000,
                    hostname: '0.0.0.0',
                    open: true,
                    middleware: function(connect) {
                        return [
                            require('connect-livereload')(),
                            connect.static('apiary-previews'),
                            connect.directory('apiary-previews')
                        ];
                    }
                }
            }
        },
        shell: {
            test: {
                command : function(file) {
                    if (file) {
                        file = './services/' + file
                    } else {
                        file = 'apiary.apib'
                    }
                    return 'node ./bin/api-blueprint-validator ' + file;
                },
                options : {
                    stdout : true,
                    stderr: false,
                    failOnError : true
                }
            }
        },
        watch: {
            apiaryDocs: {
                files: [ 'services/*.md' ],
                tasks: [ 'generate-apiary-preview' ],
                options: {
                    livereload: true
                }
            }
        }
    });

    /**
     * Generates an apiary preview for an .md file
     * @param file The .md file
     * @returns {*|promise}
     */
    function generatePreview(file) {
        var deferred = q.defer()
            , options = {
                url: 'https://api.apiary.io/blueprint/generate',
                headers: {
                    'Accept': 'text/html',
                    'Content-Type': 'text/plain'
                }
            };

        options.body = 'FORMAT: X-1A' + 
            grunt.util.linefeed + 
            'HOST: https://api.sparkpost.com/api/v1' + 
            grunt.util.linefeed + grunt.util.linefeed + 
            '# SparkPost API v1' + 
            grunt.util.linefeed +
            fs.readFileSync('./services/' + file, 'utf-8');
    
        request.post(options, function(err, response, body) {
            var output = file.split('\.')[0] + '.html';
            
            if (err || response.statusCode !== 200) {
                grunt.log.error('There was an error trying to generate the preview for ' + file, err, response.statusCode, response.body);
                return deferred.reject(err || response.body);
            } else {
                fs.writeFile('./apiary-previews/' + output, body, function(err) {
                    if (err) {
                        grunt.log.error('There was an error trying to write to apiary.html', err);
                        return deferred.reject(err);
                    }
                    return deferred.resolve();
                });
            }
        });
        
        return deferred.promise;
    }

    // grunt generate-apiary-preview - creates apiary previews for all meta 
    grunt.registerTask('generate-apiary-preview', 'Creates preview files for all md files in services', function() {
        var done = this.async();
        try {
            fs.mkdirSync('./apiary-previews');
        } catch(e){}
        
        fs.readdir('./services', function(err, files) {
            q.all(files.map(generatePreview)).then(done, done);
        });
    });

    // grunt testFiles - runs apiary-blueprint-validator on individual blueprint files
    grunt.registerTask('testFiles', 'Validates individual blueprint files', services.map(function(s) {
        return 'shell:test:' + s;
    }));

    //grunt preview - creates a live-reloaded preview of the docs, Apiary-style
    grunt.registerTask('preview', 'View the apiary generated HTML files in the browser with all that live-reload goodness', [
        'generate-apiary-preview',
        'connect:apiary',
        'watch:apiaryDocs'
    ]);

    // grunt test - runs apiary-blueprint-validator on combined apiary.apib file
    grunt.registerTask('test', [ 'shell:test' ]);

    // grunt compile - concatenates all the individual blueprint files and validates it
    grunt.registerTask('compile', [ 'concat:prod', 'test' ]);

    // register default grunt command as grunt test
    grunt.registerTask('default', [ 'testFiles' ]);
};
