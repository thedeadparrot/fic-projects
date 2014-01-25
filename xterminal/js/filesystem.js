// Exceptions used

function InvalidFileObject(error_msg) {
    this.error_msg = error_msg;
};

function AccessDenied(error_msg) {
    this.error_msg = error_msg;
};

var FileSystem = function() {
    me = this;
    me.root_dir = null; 
    me.cwd = '';

    // object methods
    // load the specified json file
    me.loadFile = function(json_file) {
        $.get(json_file, 
              function(data) {
                  // set the root_dir to the data we get
                  if(typeof data === 'object') {
                      json_data = data;
                  }
                  else {
                      json_data = $.parseJSON(data);
                  }
                  me.root_dir = constructDataTree(json_data, null);
              }).fail(function(jqXHR, textStatus, errorThrown) {
                  // on failure, log the error
                  console.log(errorThrown);
              });
    }

    // construct the file tree such that we have references to the parents
    var constructDataTree = function(data, parent_node) {

        if(data.type == 'directory') {
            var new_files = {};
            var new_data = {'type': 'directory'};
            for(var file in data.files) {
                var new_file = constructDataTree(data.files[file], new_data);
                new_files[file] = new_file;
            }
            new_data.files = new_files;
            new_data.parent = parent_node;
            return new_data;
        }
        else {
            data.parent = parent_node;
            return data;
        }

    }
    
    //  perform callback when the files have been loaded
    me.loaded = function(callback) {
        if(me.isLoaded()){
            callback();
        }
        else {
            setTimeout(function(){ me.loaded(callback); }, 100);
        }
    }


    // check to see that the files have been loaded
    me.isLoaded = function() { return me.root_dir != null; }

    // convert all paths into useful absolute paths
    var normalizePaths = function(path) {
        // cases to handle:
        if(path.length > 0) {
            // don't let them go above ~/
            if(path[0] === '/') {
                throw new AccessDenied("You do not have access to the root filesystem.");  
            }
            if(path.length > 1) {
                // path is an absolute path already
                if(path.substring(0,2) === '~/') {
                    return path.substring(2);
                }
            }
            // if none of the special cases fit, construct the absolute path
            // from the given relative path
            return me.cwd + path;
        }
        return path;
    }

    var getObjectHelper = function(split_file_path, data) {
        // we're assuming if we end up with a blank ending,
        // the filename ended on a '/' indicating a directory
        // Assumes we don't get empty file paths
        if(split_file_path.length == 1 && split_file_path[0] == ''){
            if(data['type'] != 'directory') {
                throw new InvalidFileObject('Not a directory');
            }
            else
            {
                return data;
            }
        }
        // we have finished searching, and we need to return the data
        else if(split_file_path.length == 0){
            return data;
        }
        // we should be in a directory and must go deeper down the tree
        else{
            // if we are not at a directory right now, and we have to go deeper,
            // make sure we can do it
            if(split_file_path.length > 0 && data.type != 'directory') {
                throw new InvalidFileObject('No such file or directory.');
            }
            var name = split_file_path[0];
            // special cases for .. and .
            if(name === '..') {
                // go back up the stack
                if(data.parent === null){
                    throw new InvalidFileObject('No such file or directory.');
                }
                else {
                    return getObjectHelper(split_file_path.slice(1), data.parent);
                }
            }
            if(name === '.') {
                return getObjectHelper(split_file_path.slice(1), data);
            }

            // find the file or directory and drill down deeper
            if(name in data.files) {
                return getObjectHelper(split_file_path.slice(1), data.files[name]);
            }
            // otherwise, it does exist
            else {
                throw new InvalidFileObject('No such file or directory.');
            }
        }
    }

    // returns the file or directory at the given path
    me.getFile = function(file_path) {
        // use the absolute path before splitting
        var absolute_file_path = normalizePaths(file_path);
        var split_file_path = absolute_file_path.split('/');
        return getObjectHelper(split_file_path, me.root_dir, null);
    }

    // either gets the files in the given directory or returns the single file
    // all - a boolean indicating that we want all of the file, including the hidden ones
    me.getFiles = function(path, all) {
        var file = me.getFile(path);
        if(file.type === 'directory') {
            if(all) {
                return file.files;
            }
            else {
                // filter out files that begin with '.'
                var files_to_return = {};
                for(var directory_file in file.files) {
                    if(directory_file[0] !== '.') {
                        files_to_return[directory_file] = file.files[directory_file];
                    }
                }
                return files_to_return;
            }
        }
        // if we ls a specific file, it returns that particular file
        else {
            var new_file = {};
            new_file[path] = file;
            return new_file;
        } 
    }

    // return just the file names in the path sorted and formated correctly
    // for directories
    me.getFileNames = function(path, all) {
        var files = me.getFiles(path, all);
        var filenames = Object.keys(files);
        filenames.sort();
        // special casing for directories
        var formatted_names = filenames.map(function(filename) {
            if(files[filename].type === 'directory') {
                return filename + '/';
            }
            else {
                return filename;
            }
        })
        return formatted_names;
    }

    // if we need to reconstruct the absolute file path of a file, use this to do so
    var constructPathFromFile = function(file) {
        if(file.parent === null) {
            return '';
        }
        else {
            // this is sort of a hack from the way we can't get the name from the file
            // but it shouldn't be too expensive

            // parent is always a directory
            for(var child_file in file.parent.files) {
                if(file.parent.files[child_file] === file) {
                    // put a slash on the end if it's a directory
                    var decorator = file.type === 'directory' ? '/': ''
                    return constructPathFromFile(file.parent) + child_file + decorator;
                }

            }
        }

    }

    // change the working directory to the given path.
    // must be a valid directory
    me.changeDirectory = function(directory_path) {
        var directory = me.getFile(directory_path);
        if(directory.type === 'directory') {
            me.cwd = constructPathFromFile(directory);
        }
        else {
            throw new InvalidFileObject('Not a directory.');
        }
    }


};
