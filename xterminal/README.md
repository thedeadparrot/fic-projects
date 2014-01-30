XTerminal
=========

Most of this code is in pure Javascript. The things I wrote are `js/filesystem.js` and
`js/terminal-control.js` as well as everything in `data`.

They aren't proper [Jasmine](http://pivotal.github.io/jasmine/) tests, but you can find the tests
for the filesystem code in the `tests` directory. Super useful. I probably should have turned them
into proper tests, though.

To see the underlying filesystem in the completed product, feel free to poke around at `data/files.json`.

Video support requires HTML5.



Credits
-------

[JQuery Terminal Emulator Plugin](https://github.com/jcubic/jquery.terminal) - this plugin did so
much of the heavy lifting on the interface, providing everything from login behavior to
tab-completion.

[Magnific Popup](https://github.com/dimsemenov/Magnific-Popup) - provided lightboxes for images and
video.
