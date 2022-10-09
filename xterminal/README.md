[Ghost in the Shell](https://archiveofourown.org/works/1361308/chapters/2842792)
==========================================================================

Most of this code is in pure Javascript. The things I wrote are `js/filesystem.js` and
`js/terminal-control.js` as well as everything in `data`.

[Jasmine](https://pivotal.github.io/jasmine/) tests for filesystem code can be found in the `tests`
directory.

To see the underlying filesystem in the completed product, feel free to poke around at `data/files.json`. All of the other content can be found in the various directories underneath `data`.

Video support requires HTML5.



Credits
-------

[JQuery Terminal Emulator Plugin](https://github.com/jcubic/jquery.terminal) - this plugin did so
much of the heavy lifting on the interface, providing everything from login behavior to
tab-completion. I made a small code change in order to get the logout behavior I wanted.

[Magnific Popup](https://github.com/dimsemenov/Magnific-Popup) - provided lightboxes for images and
video.
