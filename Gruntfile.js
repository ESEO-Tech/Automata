module.exports = function(grunt) {
    var nunjucks = require('nunjucks');
    
    grunt.registerMultiTask("nunjucks-render", function () {
        var result = nunjucks.render(this.data.src, this.data.context);
        grunt.file.write(this.data.dest, result);
        grunt.log.writeln('File ' + this.data.dest + ' created.');
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
    
    var version = grunt.template.today("yy.mm.ddHHMM");
    
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
                    
                    'js/model/Object.js',
                    'js/view/View.js',

                    'js/model/State.js',
                    'js/model/Transition.js',
                    'js/model/StateMachine.js',
                    'js/model/World.js',
                    
                    'js/view/TransitionTable.js',
                    'js/view/ControlView.js',
                    'js/view/HelpView.js',
                    'js/view/ScoreView.js',
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
            options: {
                //mangle: false,
                //beautify: true
            },
            core: {
                src: "<%= sweet_js.core.dest %>",
                dest: 'build/dist/js/automata.core.min.js'
            }
        },
        
        cssmin: {
            core: {
                src: [
                    "css/main.css",
                    "css/booleans.css",
                    "css/games-menu.css",
                    "css/TransitionTable.css",
                    "css/Diagram.css",
                    "css/Score.css",
                    "css/Help.css",
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
                    {src: "icons/*.png", dest: "build/dist/"},
                    {src: "install.html", dest: "build/pkg/"},
                    {src: "js/webapp.js", dest: "build/dist/"}
                ]
            }
        },
        
        "nunjucks-render": {
            "manifest.webapp":  {src: "manifest.webapp",  dest: "build/dist/manifest.webapp", context: {version: version}},
            "package.manifest": {src: "package.manifest", dest: "build/pkg/package.manifest", context: {version: version}}
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
    
    var indexData = { categories: [] };
    var categoryList = grunt.file.readJSON("games/list.json");
    for (var catIndex = 0; catIndex < categoryList.contents.length; catIndex ++) {
        var catDir = "games/" + categoryList.contents[catIndex];
        var gamesList = grunt.file.readJSON(catDir + "/list.json");
        var indexCatData = {
            title: gamesList.title,
            games: []
        };
        indexData.categories.push(indexCatData);

        for (var gameIndex = 0; gameIndex < gamesList.contents.length; gameIndex ++) {
            var gameDir = catDir + "/" + gamesList.contents[gameIndex];
            var gameData = grunt.file.readJSON(gameDir + "/game.json");
            var gameHelp = gameData.help ? grunt.file.read(gameDir + "/" + gameData.help) : "";
            var gameKey = categoryList.id + "." + gamesList.id + "." + gameData.id;
            
            indexCatData.games.push({
                key: gameKey,
                title: gameData.title
            });
            
            function rebase(fileName) {
                return gameDir + "/" + fileName;
            }
            
            grunt.config.set(["concat", gameKey + "-js"], {
                src: gameData.js.map(rebase),
                dest: "build/tmp/" + gameKey + ".concat.js"
            });
            grunt.config.set(["sweet_js", gameKey], {
                src:  "build/tmp/" + gameKey + ".concat.js",
                dest: "build/tmp/" + gameKey + ".sweet.js"
            });
            grunt.config.set(["uglify", gameKey], {
                src:  "build/tmp/"   + gameKey + ".sweet.js",
                dest: "build/dist/js/" + gameKey + ".min.js"
            });
            
            grunt.config.set(["cssmin", gameKey], {
                src:  gameData.css.map(rebase),
                dest: "build/dist/css/" + gameKey + ".min.css"
            });
            
            grunt.config.set(["nunjucks-render", gameKey], {
                src: "templates/game.tpl.html",
                context: {
                    key: gameKey,
                    title: gameData.title,
                    content: gameHelp
                },
                dest: "build/dist/" + gameKey + ".html"
            });
            
            grunt.config.set(["copy", gameKey], {
                src: rebase(gameData.icon),
                dest: "build/dist/icons/" + gameKey + ".svg"
            });
        }
    }
    
    grunt.config.set(["nunjucks-render", "index"], {
        src: "templates/index.tpl.html",
        context: indexData,
        dest: "build/dist/index.html"
    });
    
    grunt.registerTask('default', ["nunjucks", "concat", "sweet_js", "uglify", "cssmin", "nunjucks-render", "copy", "zip"]);
};