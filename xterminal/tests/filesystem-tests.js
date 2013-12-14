$(document).ready(function() {
        var filesystem = new FileSystem();
        filesystem.loadFile('test-data.json');
        filesystem.loaded(
            function() {
                //test changeDirectory
                filesystem.changeDirectory('photos');
                console.log('should be: photos/');
                console.log('current working directory: ' + filesystem.cwd);
                console.log('***')
                
                filesystem.changeDirectory('..');
                console.log('should be blank (root)');
                console.log('current working directory: ' + filesystem.cwd);
                console.log('***')
                
                filesystem.changeDirectory('photos/');
                console.log('should be: photos/');
                console.log('current working directory: ' + filesystem.cwd);
                console.log('***')
                
                filesystem.changeDirectory('~/');
                console.log('should be blank (root)');
                console.log('current working directory: ' + filesystem.cwd);
                console.log('***')

                try {
                    filesystem.changeDirectory('.hello');
                }
                catch(e) {
                    console.log("Error: " + e.error_msg);
                }
                console.log('should be an error');
                console.log('***')
                
                //test getFile with simple relative paths from root
                var file = filesystem.getFile('photos/photo.jpg');
                console.log('should be: photo');
                console.log('filetype: ' + file.type);
                console.log('***');

                var file = filesystem.getFile('photos');
                console.log('should be: directory');
                console.log('filetype: ' + file.type);
                console.log('***');

                var file = filesystem.getFile('photos/');
                console.log('filetype: ' + file.type);
                console.log('should be: directory');
                console.log('***');

                var file = filesystem.getFile('photos/./');
                console.log('filetype: ' + file.type);
                console.log('should be: directory');
                console.log('***');

                var file = filesystem.getFile('./photos');
                console.log('filetype: ' + file.type);
                console.log('should be: directory');
                console.log('***');

                var file = filesystem.getFile('photos/../');
                console.log('filetype: ' + file.type);
                console.log('should be: directory');
                console.log('should be true');
                console.log('contains photos: ' + file.files.hasOwnProperty('photos'));
                console.log('***');

                try {
                    var file = filesystem.getFile('photo.jpg');
                }
                catch(e) {
                    console.log("Error: " + e.error_msg);
                }
                console.log('should be an error');
                console.log('***');

                try {

                    var file = filesystem.getFile('photo.jpg/');
                }
                catch(e) {
                    console.log("Error: " + e.error_msg);
                }
                console.log('should be an error');
                console.log('***');

                // test getFile with relative path after changing root
                filesystem.changeDirectory('photos');
                var file = filesystem.getFile('photo.jpg');
                console.log('should be: photo');
                console.log('filetype: ' + file.type);
                console.log('***');

                var file = filesystem.getFile('../photos/photo.jpg');
                console.log('should be: photo');
                console.log('filetype: ' + file.type);
                console.log('***');

                try {
                    var file = filesystem.getFile('.hello');
                }
                catch(e) {
                    console.log("Error: " + e.error_msg);
                }
                console.log('should be an error');
                console.log('***');
                filesystem.changeDirectory('~/');

                // test getFile with absolute paths
                var file = filesystem.getFile('~/photos/photo.jpg');
                console.log('should be: photo');
                console.log('filetype: ' + file.type);
                console.log('***');

                var file = filesystem.getFile('~/photos');
                console.log('should be: directory');
                console.log('filetype: ' + file.type);
                console.log('***');

                // test getFiles with various parameters
                var files = filesystem.getFiles('~/');
                for( var file in files) {
                    console.log('file in directory: ' + file + " type: " + files[file].type);
                }
                console.log('***');

                var files = filesystem.getFiles('', true);
                for( var file in files) {
                    console.log('file in directory: ' + file + " type: " + files[file].type);
                }
                console.log('***');

                var files = filesystem.getFiles('photos', true);
                for( var file in files) {
                    console.log('file in directory: ' + file + " type: " + files[file].type);
                }
                console.log('***');

                var files = filesystem.getFiles('photos/photo.jpg', true);
                for( var file in files) {
                    console.log('file in directory: ' + file + " type: " + files[file].type);
                }
                console.log('***');

                var files = filesystem.getFiles('.hello', true);
                for( var file in files) {
                    console.log('file in directory: ' + file + " type: " + files[file].type);
                }
                console.log('***');

                var filenames = filesystem.getFileNames('photos/', true);
                for(var i=0; i < filenames.length; i++) {
                    console.log('file in directory: ' + filenames[i]);
                }
                console.log('***');

                var filenames = filesystem.getFileNames('', true);
                for(var i=0; i < filenames.length; i++) {
                    console.log('file in directory: ' + filenames[i]);
                }
                console.log('***');
            }
        );
});
