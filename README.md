Automata
========

A web-based game to learn finite-state machines.

This application is under development.

[Try the demo in your browser now](https://guillaume-savaton-eseo.github.io/Automata/).

Dependencies
------------

These libraries are installed as Bower components:

* [normalize.css](http://necolas.github.io/normalize.css/)
* [jQuery](http://jquery.com/)
* [Nunjucks](http://jlongster.github.io/nunjucks/)
* [Snap.svg](http://snapsvg.io/)

Building
--------

These commands install the dependencies and build Automata into the `docs/` folder:

```
sudo npm install -g bower
sudo npm install -g grunt-cli
npm install
bower install
grunt
```

Testing
-------

Run the local server:

```
grunt connect
```

Connect to http://localhost:8000
The port can be changed in the ``connect`` task in ``Gruntfile.js``.
