Automata
========

A web-based game to learn finite-state machines.

This application is under development.

[Try the demo in your browser now](http://trame.eseo.fr/~GuillaumeSavaton/Automata/).

[See a quick screencast](http://youtu.be/wxhwhlaHb0Q).

Firefox users should upgrade to Firefox 25 to get correct text rendering in the diagram view.

Dependencies
------------

These libraries are installed as Bower components:

* [normalize.css](http://necolas.github.io/normalize.css/)
* [jQuery](http://jquery.com/)
* [Nunjucks](http://jlongster.github.io/nunjucks/)
* [Snap.svg](http://snapsvg.io/)

Building
--------

    sudo npm install -g bower
    sudo npm install -g grunt-cli
    npm install
    bower install
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
