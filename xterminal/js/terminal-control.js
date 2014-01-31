// Useful constants to keep around
GREETINGS_STRING = "Welcome to Xavier's School for the Gifted \n\
____      ___ \n\
`MM(      )M' \n\
 `MM.     d'  \n\
  `MM.   d'   \n\
   `MM. d'    \n\
    `MMd      \n\
     dMM.     \n\
    d'`MM.    \n\
   d'  `MM.   \n\
  d'    `MM.  \n\
_M(_    _)MM_ \n\n\
Last login: Mar 25 08:42:24 EST 2006 \n \
\n\
Type 'help' for a list of available commands.\n";
ROOT_DIR = '~'
USER = 'cxavier';
PASSWORD = 'ihavereachedthemountaintop';
BASE_PROMPT = USER +'@xterminal:';
// TODO: replace this with actual outro page
OUTRO_URL = 'http://thedeadparrot.dreamwidth.org';
DATA_FILE = 'data/files.json';

var filesystem = new FileSystem();
filesystem.loadFile(DATA_FILE);

/*************************
 *
 * Terminal setup functions
 *   - these are used by jQuery Terminal directly
 *
 ****************************/


// xterminal -
//  jquery terminal expects a function that maps commands to actions
// This also handles any special case handling of the inputs before
// passing them to the individual functions
function xterminal(command, term) {
    parsed_command = $.terminal.parseCommand(command);
    switch(parsed_command['name'])
    {
        case 'help':
            help(term, parsed_command['args']);
            break;
        case 'cd':
            cd(term, parsed_command['args']);
            break;
        case 'ls':
            ls(term, parsed_command['args']);
            break;
        case 'cat':
            cat(term, parsed_command['args']);
            break;
        case 'view':
            view(term, parsed_command['args']);
            break;
        case 'play':
            play(term, parsed_command['args']);
            break;
        default:
            term.echo(parsed_command['name'] + ': Command not found.');
            break;
    }
}

// the most insecure login function ever
function login(user, passwd, callback) {
    if(user === USER && passwd == PASSWORD) {
        callback(true);
    }
    else {
        callback(false);
    }
}

function complete_file(cmd) {
    // split the cmd so that we can separate out the filename from the path

    var split_cmd = cmd.split('/');
    var len = split_cmd.length;

    // assume we are using the current working directory
    var directory = '~/' + filesystem.cwd;
    var file_name = cmd;
    var modify_names = false;

    //  if we have a path other than the current working directory to search
    //  change directory and all
    if(len > 1) {
        modify_names = true;
        file_name = split_cmd.pop();

        // join everything back up without the file name as part of it
        path = split_cmd.join('/');

        if(path.charAt(0) != '~') {
            directory = "~/" + filesystem.cwd + path;
        }
        else {
            directory = path + '/';
        }
    }

    // then use the splits information to find the files that could match 
    var file_names = filesystem.getFileNames(directory, true);
    // we could do something cool with this
    file_names = file_names.filter(function(name) {
        return name.substring(0, file_name.length) === file_name;
    });
    if(modify_names) {
        file_names = file_names.map(function(name) {
            return path + '/' + name;
        });
    }
    return file_names;

}

// handle tab completion for various commands
function tab_completion(term, command, callback) {
    try {
        var names = complete_file(command);
    } catch(e) {
        term.echo(e.error_msg);
    }
    callback(names);
}

// exit the terminal by redirecting
function exitTerm(term) {
    window.location.href = OUTRO_URL;
}

/**********************
 *
 * Command functions
 *  - these handle the individual commands that get typed
 *    into the terminal
 *
 **********************/

function displayFile(file_src, term) {
    $.get(file_src, function(data) {
        // print the associated file to the terminal
        term.echo(data);
    }).fail( function() {
        console.log('failure retrieving ' + file.src);
    });
}

// Display help text to the user
// If called without arguments, displays the list of commands with general descriptions
// If we have been passed in a command (e.g. ls, cd), display help text
//  for that particular command
function help(term, args) {
    if(args.length > 0)
    {
        command = args[0];
        switch(command) {
            case 'ls':
            case 'cd':
            case 'cat':
            case 'view':
            case 'play':
            case 'filenames':
                displayFile('data/help/' + command + '.txt', term);
                break;
            default:
                term.echo("Sorry, there is no help file for that.");
                break;
        }
    }
    else
    {
        displayFile('data/help/general.txt', term);
    }
}


// change the current working directory
function cd(term, args) {
    if(args.length > 0) {
        directory_path = args[0];
    }
    else{
        directory_path = '~/';
    }
    try {
        filesystem.changeDirectory(directory_path);
        // update the prompt so that it 'looks right'
        root_dir = filesystem.cwd === '' ? '~' : '~/';
        term.set_prompt(BASE_PROMPT + root_dir + filesystem.cwd.slice(0, -1) + '$ ');
    } catch (e) {
        term.echo(e.error_msg);
    }
}

// list the files in a directory. Defaults to the current directory if none given
// will hide hidden files unless an option is specified 
function ls(term, args){
    // use the current working directory by default
    var directory = '~/' + filesystem.cwd;
    var all = false;
    if(args.length > 0) {
        // if the -a option exists, show all files
        if(args[0] == '-a') {
            all = true;
            // if we have a second argument, assume that's what we're listing
            directory = args.length > 1 ? args[1] : directory; 
        }
        // otherwise, assume that our only argument is what we're listing
        else {
            directory = args[0];
        }
    }

    // now get the files from the given directory
    try {
        var file_names = filesystem.getFileNames(directory, all);
        for(var i = 0; i < file_names.length; i++){
            term.echo(file_names[i]);
        }
    } catch(e) {
        console.log(e);
        term.echo(e.error_msg);
    }

}

// Cat - concatenate files and dump to the standard output
// grabs the text file and prints it to the terminal
function cat(term, args) {
    for(var i = 0; i < args.length; i++) {
        var filename = args[i];
        try{
            var file = filesystem.getFile(filename);
            // only want the files that are text files and are not encrypted
            if(file.type === 'text' && !file.hasOwnProperty('encrypted')) {
                displayFile(file.src, term);
            }
            else {
                term.echo(filename + ": not a text file.");
            }
        } catch(e) {
            console.log(e);
            term.echo(e.error_msg);
        }
    }
}

// View - view the given image file in a modal dialog
function view(term, args) {
    if(args.length > 0) {
        // only use the first argument
        var filename = args[0];
        try {
            // get the file
            var file = filesystem.getFile(filename);
            if(file.type === 'image' && !file.hasOwnProperty('encrypted')) {
                // display the image in a modal lightbox
                $.magnificPopup.open({
                    items: {
                        src: file.src,
                    },
                    image: {
                        titleSrc: function(item) { return file.title; }
                    },
                    type: "image",
                    cursor: null
                });
            }
            else {
                term.echo(filename + ": not an image and cannot be viewed");
            }
        } catch(e) {
            console.log(e);
            term.echo(e.error_msg);
        }

    }
    else {
        term.echo('No image to view.');
    }
}

// play - play a video file
function play(term, args) {
    if(args.length > 0) {
        var filename = args[0];
        try {
            var file = filesystem.getFile(filename);

            // only allow for video elements
            if(file.type === 'video' && !file.hasOwnProperty('encrypted')) {
                // construct video DOM element
                var container = $('<div>').addClass('video-container');
                var video = $('<video controls>');
                var webm_src = $('<source>').attr('type', 'video/webm;codecs="vp8"');
                webm_src.attr('src', file.webm_src);
                var mp4_src = $('<source>').attr('type', 'video/webm;codecs="vp8"');
                mp4_src.attr('src', file.mp4_src);
                video.append(webm_src, mp4_src);
                container.append(video);

                //create the video modal
                $.magnificPopup.open({
                    items: {
                        src: container
                    },
                    type: "inline",
                    closeBtnInside: false
                });
            }
            else {
                term.echo(filename + ": not a video and cannot be played.");
            }
        } catch(e) {
            console.log(e);
            term.echo(e.error_msg);
        }

    }
    else {
        term.echo('No video to play.');
    }
}
/******************
  *
  * Set up the terminal
  *
  ***************/

$(document).ready(function() {
    filesystem.loaded(
        function() {
            $('body').terminal(
                xterminal,
                {
                    login: login,
                    greetings: GREETINGS_STRING,
                    name: 'xterm',
                    prompt: BASE_PROMPT + ROOT_DIR + '$ ',
                    onExit: exitTerm,
                    tabcompletion: true,
                    completion: tab_completion
                });
        });
});
