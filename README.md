Automata
========

A web-based game to learn finite-state machines.

This application is under development.
[Try the demo in your browser now](http://trame.eseo.fr/~GuillaumeSavaton/Automata/).

<iframe width="420" height="315" src="//www.youtube.com/embed/wxhwhlaHb0Q" frameborder="0" allowfullscreen></iframe>

Firefox users should upgrade to Firefox 25 to get correct text rendering in the diagram view.

Dependencies
------------

* [normalize.css](http://necolas.github.io/normalize.css/) (installed as vendor/normalize.css)
* [jQuery](http://jquery.com/) (installed as vendor/jquery-2.0.3-min.js)
* [Nunjucks](http://jlongster.github.io/nunjucks/) (installed as vendor/nunjucks-slim.min.js)
* [Snap.svg](http://snapsvg.io/) (installed as vendor/snap.svg-min.js)

Building
--------

    sudo npm install -g grunt-cli
    npm install
    grunt

Testing
-------

Run the local server:

    grunt connect

Connect to http://localhost:8000
The port can be changed in the ``connect`` task in ``Gruntfile.js``.

Installing
----------

Upload to the remote server:

    grunt rsync

The host can be changed in the ``rsync`` task in ``Gruntfile.js``.

Automata can also be installed as a [packaged Open Web App](https://developer.mozilla.org/en-US/Apps/Developing/Packaged_apps)
for the desktop and mobile Firefox browser.
