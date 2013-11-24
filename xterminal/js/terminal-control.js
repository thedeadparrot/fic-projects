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
Last login: Apr 25 08:42:24 EST 2006 \n \
\n\
Type 'help' for a list of available commands.\n \
\n";
ROOT_DIR = '~'
USER = 'cxavier';
//TODO: change this to something better later
PASSWORD = 'hello';
BASE_PROMPT = USER +'@xterminal:';
DATA_FILE = '../data/files.json';

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
    parsedCommand = $.terminal.parseCommand(command);
    switch(parsedCommand['name'])
    {
        case 'help':
            help(term, parsedCommand['args']);
            break;
        case 'cd':
            cd(term, parsedCommand['args']);
            break;
        default:
            // rudimentary echo function
            term.echo(command);
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


/**********************
 *
 * Command functions
 *  - these handle the individual commands that get typed
 *    into the terminal
 *
 **********************/


// Display help text to the user
// If called without arguments, displays the list of commands with general descriptions
// If we have been passed in a command (e.g. ls, cd), display help text
//  for that particular command
function help(term, args) {
    if(args.length > 0)
    {
        command = args[0];
        term.echo(command);
    }
    else
    {
        term.echo('help!');
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
    filesystem.changeDirectory(directory_path);
    // update the prompt so that it 'looks right'
    root_dir = filesystem.cwd === '' ? '~' : '~/';
    term.set_prompt(BASE_PROMPT + root_dir + filesystem.cwd.slice(0, -1) + '$ ');
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
                    prompt: BASE_PROMPT + ROOT_DIR + '$ '
                });
        });
});
