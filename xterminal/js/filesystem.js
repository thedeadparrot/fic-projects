// Exceptions used

function InvalidFileObject(error_msg) {
    this.error_msg = error_msg;
};

var FileSystem = function() {
    me = this;
    me.root_dir = null; 
    me.cwd = '~';
    // load the file
    me.loadFile = function(json_file) {
        $.get(json_file, 
              function(data) {
                  // set the root_dir to the data we get
                  me.root_dir = data;
              }).fail(function(jqXHR, textStatus, errorThrown) {
                  // on failure, log the error
                  console.log(errorThrown);
              });
    }
    
    // wait until loaded
    me.loaded = function(callback) {
        if(me.isLoaded()){
            callback();
        }
        else {
            setTimeout(function(){ me.loaded(callback); }, 100);
        }
    }

    // object methods

    // check to see that the files have been loaded
    me.isLoaded = function() { return me.root_dir != null; }

    // all the logic to check to make sure we're handling relative and 
    var normalizePaths = function(path) {
    }

    var getObjectHelper = function(split_file_path, data) {
        // we're assuming if we end up with a blank ending,
        // the filename ended on a '/' indicating a directory
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
        else if(split_file_path.length == 1){
            name = split_file_path[0];
            if(name in data.files) {
                return data.files[name];
            }
            else {
                throw new InvalidFileObject('No such file or directory.');
            }
        }
        // we should be in a directory and must go deeper down the tree
        else{
            if(data.type != 'directory') {
                throw new InvalidFileObject('No such file or directory.');
            }
            name = split_file_path[0];
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
        if(me.isLoaded()) {
            //TODO: handle relative and absolute paths
            split_file_path = file_path.split('/');
            return getObjectHelper(split_file_path, me.root_dir);

        }
        else {
            console.log('Files not loaded');
        }
    }

    me.getFiles = function(directory_path) {
        if(me.isLoaded()) {
            
        }
    }

    me.changeDirectory = function(directory_path) {
        if(me.isLoaded()) {
            
        }
    }


};
