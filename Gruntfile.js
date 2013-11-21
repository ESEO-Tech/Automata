module.exports = function(grunt) {

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
                    'js/model/State.js',
                    'js/model/Transition.js',
                    'js/model/StateMachine.js',
                    'js/model/World.js',
                    'js/view/View.js',
                    'js/view/TransitionTable.js',
                    'js/view/ControlView.js',
                    'js/view/Diagram.js',
                    'js/storage/LocalStorage.js',
                    "<%= nunjucks.precompile.dest %>"
                ],
                dest: 'build/automata.core.min.js'
            },
            "automata.games.robot.Maze": {
                src: [
                    'games/robot/World.js',
                    'games/robot/WorldView.js',
                    'games/robot/Maze.js'
                ],
                dest: "build/automata.games.robot.Maze.min.js"
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
                dest: "build/automata.core.min.css"
            },
            "automata.games.robot.Maze": {
                src: 'games/robot/WorldView.css',
                dest: "build/automata.games.robot.Maze.min.css"
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-nunjucks");
    
    grunt.registerTask('default', ["nunjucks", "uglify", "concat", "cssmin"]);

};