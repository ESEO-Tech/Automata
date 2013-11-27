module.exports = function(grunt) {
    var nunjucks = require('nunjucks');
    
    grunt.registerMultiTask("nunjucks-render", function () {
        var result = nunjucks.render(this.data.src, this.data.context);
        grunt.file.write(this.data.dest, result);
    });
    
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-sweet.js');
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-nunjucks");
    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks("grunt-rsync");
    
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
            core: {
                src: "templates/*",
                dest: "build/tmp/automata.templates.js"
            }
        },
        
        concat: {
            "core-js": {
                src: [
                    "macros/arrays.js",
                    
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
                    "<%= nunjucks.core.dest %>"
                ],
                dest: 'build/tmp/automata.core.concat.js'
            }
        },
        
        sweet_js: {
            core: {
                src: "<%= concat['core-js'].dest %>",
                dest: 'build/tmp/automata.core.sweet.js'
            }
        },
        
        uglify: {
            core: {
                src: "<%= sweet_js.core.dest %>",
                dest: 'build/dist/js/automata.core.min.js'
            }
        },
        
        cssmin: {
            core: {
                src: [
                    "css/main.css",
                    "css/games-menu.css",
                    "css/TransitionTable.css",
                    "css/Diagram.css",
                    "css/Control.css"
                ],
                dest: "build/dist/css/automata.core.min.css"
            }
        },
        
        copy: {
            core: {
                files: [
                    {src: "fonts/Arsenal/*.otf", dest: "build/dist/"},
                    {src: "fonts/Heydings/*.ttf", dest: "build/dist/"},
                    {src: "vendor/*", dest: "build/dist/"},
                    {src: "index.html", dest: "build/dist/"},
                    {src: "manifest.webapp", dest: "build/dist/"},
                    {src: "icons/*.png", dest: "build/dist/"},
                    {src: "install.html", dest: "build/pkg/"},
                    {src: "package.manifest", dest: "build/pkg/"}
                ]
            }
        },
        
        connect: {
            server: {
                options: {
                    port: 8000,
                    base: "build/dist",
                    keepalive: true
                }
            }
        },
        
        rsync: {
            options: {
                args: ["--verbose", "--update"]
            },
            dist: {
                options: {
                    src: ["build/dist/", "build/pkg/"],
                    dest: "/home/GuillaumeSavaton/public_html/Automata/",
                    host: "GuillaumeSavaton@trame.eseo.fr",
                    syncDest: true,
                    recursive: true
                }
            }
        },
        
        zip: {
            webapp: {
                src: "build/dist/**/*",
                dest: "build/pkg/Automata.zip",
                cwd: "build/dist"
            }
        }
    });
    
    var games = {
        "automata.games.robot.RightAndAhead": {
            js: ["macros/arrays.js", 'games/robot/World.js', 'games/robot/WorldView.js', 'games/robot/RightAndAhead.js'],
            css: ['games/robot/WorldView.css'],
            icon: "games/robot/RightAndAhead.icon.svg"
        },
        "automata.games.robot.Diagonally": {
            js: ["macros/arrays.js", 'games/robot/World.js', 'games/robot/WorldView.js', 'games/robot/Diagonally.js'],
            css: ['games/robot/WorldView.css'],
            icon: "games/robot/Diagonally.icon.svg"
        },
        "automata.games.robot.Cornered": {
            js: ["macros/arrays.js", 'games/robot/World.js', 'games/robot/WorldView.js', 'games/robot/Cornered.js'],
            css: ['games/robot/WorldView.css'],
            icon: "games/robot/Cornered.icon.svg"
        },
        "automata.games.robot.BehindTheWall": {
            js: ["macros/arrays.js", 'games/robot/World.js', 'games/robot/WorldView.js', 'games/robot/BehindTheWall.js'],
            css: ['games/robot/WorldView.css'],
            icon: "games/robot/BehindTheWall.icon.svg"
        },
        "automata.games.robot.Maze": {
            js: ["macros/arrays.js", 'games/robot/World.js', 'games/robot/WorldView.js', 'games/robot/Maze.js'],
            css: ['games/robot/WorldView.css'],
            icon: "games/robot/Maze.icon.svg"
        }
    };
    
    for (var key in games) {
        grunt.config.set(["concat", key + "-js"], {
            src: games[key].js,
            dest: "build/tmp/" + key + ".concat.js"
        });
        grunt.config.set(["sweet_js", key], {
            src:  "build/tmp/" + key + ".concat.js",
            dest: "build/tmp/" + key + ".sweet.js"
        });
        grunt.config.set(["uglify", key], {
            src:  "build/tmp/"   + key + ".sweet.js",
            dest: "build/dist/js/" + key + ".min.js"
        });

        grunt.config.set(["cssmin", key], {
            src:  games[key].css,
            dest: "build/dist/css/" + key + ".min.css"
        });

        grunt.config.set(["nunjucks-render", key], {
            src: "templates/game.tpl.html",
            context: {key: key},
            dest: "build/dist/" + key + ".html"
        });

        grunt.config.set(["copy", key], {
            src: games[key].icon,
            dest: "build/dist/icons/" + key + ".svg"
        });
    }
    
    grunt.registerTask('default', ["nunjucks", "concat", "sweet_js", "uglify", "cssmin", "nunjucks-render", "copy", "zip"]);
};