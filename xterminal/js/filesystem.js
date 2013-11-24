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
                  me.root_dir = constructDataTree(data, null);
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
                var new_file = constructDataTree(data.files[file], data);
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
        //TODO: handle relative and absolute paths
        var split_file_path = file_path.split('/');
        return getObjectHelper(split_file_path, me.root_dir, null);
    }

    me.getFiles = function(directory_path) {
    }

    me.changeDirectory = function(directory_path) {
    }


};
