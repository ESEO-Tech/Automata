module.exports = function(grunt) {
    var nunjucks = require('nunjucks');
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        jshint: {
            options: {
                undef: true,
                unused: true,
                newcap: false,
                
                browser: true,
                devel: true,
                jquery: true,
                
                globals: {
                    namespace: true,
                    automata: true,
                    Snap: true,
                    nunjucks: true
                }
            },
            all: [
                "js/**/*.js",
                "games/**/*.js"
            ]
        },
        
        nunjucks: {
            precompile: {
                src: "templates/*",
                dest: "build/automata.templates.js"
            }
        },
        
        uglify: {
            "automata.core": {
                src: [
                    'js/namespace.js',
                    'js/main.js',
                    'js/shims/*.js',
                    
                    'js/model/Model.js',
                    'js/view/View.js',

                    'js/model/State.js',
                    'js/model/Transition.js',
                    'js/model/StateMachine.js',
                    'js/model/World.js',
                    
                    'js/view/TransitionTable.js',
                    'js/view/ControlView.js',
                    'js/view/Diagram.js',
                    
                    'js/storage/LocalStorage.js',
                    "<%= nunjucks.precompile.dest %>"
                ],
                dest: 'dist/js/automata.core.min.js'
            }
        },
        
        concat: {
            "automata.core": {
                src: [
                    "css/main.css",
                    "css/TransitionTable.css",
                    "css/Diagram.css",
                    "css/Control.css"
                ],
                dest: "build/automata.core.css"
            }
        },
        
        cssmin: {
            "automata.core": {
                src: "build/automata.core.css",
                dest: "dist/css/automata.core.min.css"
            }
        },
        
        copy: {
            "font/Arsenal": {
                src: "fonts/Arsenal/*.otf",
                dest: "dist/"
            },
            "font/Heydings": {
                src: "fonts/Heydings/*.ttf",
                dest: "dist/"
            },
            "vendor": {
                src: "vendor/*",
                dest: "dist/"
            },
            "index": {
                src: "index.html",
                dest: "dist/"
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-nunjucks");
    
    grunt.registerMultiTask("nunjucks-render", function () {
        var result = nunjucks.render(this.data.src, this.data.context);
        grunt.file.write(this.data.dest, result);
    });
    
    var games = {
        "automata.games.robot.InTheOpenField": {
            js: ['games/robot/World.js', 'games/robot/WorldView.js', 'games/robot/InTheOpenField.js'],
            css: ['games/robot/WorldView.css']
        },
        "automata.games.robot.RightAndAhead": {
            js: ['games/robot/World.js', 'games/robot/WorldView.js', 'games/robot/RightAndAhead.js'],
            css: ['games/robot/WorldView.css']
        },
        "automata.games.robot.Cornered": {
            js: ['games/robot/World.js', 'games/robot/WorldView.js', 'games/robot/Cornered.js'],
            css: ['games/robot/WorldView.css']
        },
        "automata.games.robot.BehindTheWall": {
            js: ['games/robot/World.js', 'games/robot/WorldView.js', 'games/robot/BehindTheWall.js'],
            css: ['games/robot/WorldView.css']
        },
        "automata.games.robot.Maze": {
            js: ['games/robot/World.js', 'games/robot/WorldView.js', 'games/robot/Maze.js'],
            css: ['games/robot/WorldView.css']
        }
    };
    
    for (var key in games) {
        grunt.config.set(["concat", key], {
            src: games[key].css,
            dest: "build/" + key + ".css"
        });
        grunt.config.set(["cssmin", key], {
            src: "build/" + key + ".css",
            dest: "dist/css/" + key + ".min.css"
        });
        grunt.config.set(["uglify", key], {
            src: games[key].js,
            dest: "dist/js/" + key + ".min.js"
        });
        grunt.config.set(["nunjucks-render", key], {
            src: "templates/game.tpl.html",
            context: {key: key},
            dest: "dist/" + key + ".html"
        });
    }
    
    grunt.registerTask('default', ["nunjucks", "uglify", "concat", "cssmin", "nunjucks-render", "copy"]);
};