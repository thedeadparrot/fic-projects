// Useful strings
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
Last login: Apr 25 08:42:24 EST 2006 \n \n";
CWD = '~'
USER = 'cxavier';
//TODO: change this to something better later
PASSWORD = 'hello';

// xterminal -
//  jquery terminal expects a function that maps commands to actions

function xterminal(command, term) {

    // rudimentary echo function
    term.echo(command);
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

$(document).ready(function() {
    $('body').terminal(
        xterminal,
        {
            login: login,
            greetings: GREETINGS_STRING,
            name: 'xterm',
            prompt: 'cxavier@xterminal:' + CWD + '$ '
        });
});
