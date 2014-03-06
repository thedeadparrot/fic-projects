describe("test all the various and sundry filesystem functionality", function() {
    var filesystem;

    beforeEach(function() {
        filesystem = new FileSystem();
        filesystem.loadFile('test-data.json');
        waitsFor(filesystem.isLoaded);
    });

    describe("testing changing directories", function() {
        it("single change from root to working dir", function() {
            filesystem.changeDirectory('photos');
            expect(filesystem.cwd).toEqual('photos/');
        });

        it("test going down a directory and then back up", function() {
            filesystem.changeDirectory('photos');
            filesystem.changeDirectory('..');
            expect(filesystem.cwd).toEqual('');
        });

        it("test using a trailing slash in directory names", function() {
            filesystem.changeDirectory('photos/');
            expect(filesystem.cwd).toEqual('photos/');
        });

        it("test going back to the root directory", function() {
            filesystem.changeDirectory('photos/');
            filesystem.changeDirectory('~/');

            expect(filesystem.cwd).toEqual('');
        });

        it("test that we're getting errors back for trying to change into a file, not a directory", function() {
            var missingDirectory = function() {
                filesystem.changeDirectory('.hello');
            }
            expect(missingDirectory).toThrow();
        });


        it("test that we can't access the root filesystem", function() {
            var accessRoot = function() {
                filesystem.changeDirectory('/');
            }
            expect(accessRoot).toThrow(new AccessDenied("You do not have access to the root filesystem."));
        });


    });

    describe("testing getting individual files", function() {
        it("get a single file with relative path", function() {
            var file = filesystem.getFile('photos/photo.jpg');
            expect(file.type).toEqual('photo');
        });

        it("get a directory", function() {
            var file = filesystem.getFile("photos");
            expect(file.type).toEqual('directory');
        });

        it("get a directory with a trailing slash", function() {
            var file = filesystem.getFile("photos/");
            expect(file.type).toEqual('directory');
        });

        it("get a directory with a funky path", function() {
            var file = filesystem.getFile("photos/./");
            expect(file.type).toEqual('directory');

            file = filesystem.getFile("./photos");
            expect(file.type).toEqual('directory');

            file = filesystem.getFile("photos/../");
            expect(file.type).toEqual('directory');
            expect(file.files.hasOwnProperty('photos')).toBe(true);
        });

        it("throws an error when the files don't exist", function() {
            expect(function() { filesystem.getFile('photo.jpg'); }).toThrow();
            expect(function() { filesystem.getFile('photo.jpg/'); }).toThrow();
        });

        it("test getting files after changing the current working directory", function() {
            filesystem.changeDirectory('photos');
            var file = filesystem.getFile('photo.jpg');
            expect(file.type).toEqual('photo');

            file = filesystem.getFile('../photos/photo.jpg');
            expect(file.type).toEqual('photo');

            expect(function() { filesystem.getFile('.hello'); }).toThrow();
        });

        it("test getting files with absolute paths", function () {
            var file = filesystem.getFile('~/photos/photo.jpg');
            expect(file.type).toEqual('photo');
            file = filesystem.getFile('~/photos');
            expect(file.type).toEqual('directory');

        });

    });

    describe("testing getting all the files in a directory", function() {
        // convenience function for matching
        var matchFileNamesAndTypes = function(files, filenames, filetypes) {
            var i = 0;
            // match everything up and check to make sure it looks right
            for(var file in files) {
                expect(file).toEqual(filenames[i]);
                expect(files[file].type).toEqual(filetypes[i]);
                i++;
            }
            // we want to make sure we have the correct length of filenames and types
            expect(i).toEqual(filenames.length);
            expect(i).toEqual(filetypes.length);
        }

        it("get all the files in the root directory", function() {
            var filenames = ['photos', '.hello'];
            var filetypes = ['directory', 'text'];
            var files = filesystem.getFiles('~/', true);
            matchFileNamesAndTypes(files, filenames, filetypes);
        });

        it("get only visible files in the root directory", function() {
            files = filesystem.getFiles('', false);
            filenames = ['photos'];
            filetypes = ['directory'];
            matchFileNamesAndTypes(files, filenames, filetypes);
        });

        it("get the files in a subdirectory", function() {
            files = filesystem.getFiles('photos', false);
            filenames = ['photo.jpg'];
            filetypes = ['photo'];
            matchFileNamesAndTypes(files, filenames, filetypes);
        });

        it("get individual files and not a directory", function() {
            files = filesystem.getFiles('photos/photo.jpg', false);
            filenames = ['photos/photo.jpg'];
            filetypes = ['photo'];
            matchFileNamesAndTypes(files, filenames, filetypes);

            files = filesystem.getFiles('.hello', false);
            filenames = ['.hello'];
            filetypes = ['text'];
            matchFileNamesAndTypes(files, filenames, filetypes);
        });

    });

    describe("test getting all the filenames in a directory", function() {
        it("using the root directory", function() {
            var filenames = filesystem.getFileNames('', false);
            expected_names = ['photos/'];
            expect(filenames).toEqual(expected_names);

            filenames = filesystem.getFileNames('~/', true);
            expected_names = ['.hello', 'photos/'];
            expect(filenames).toEqual(expected_names);
        });

        it("using a subdirectory", function() {
            var filenames = filesystem.getFileNames('photos/', false);
            expected_names = ['photo.jpg'];
            expect(filenames).toEqual(expected_names);
        });

    });
});

describe("Test filesystem behavior when things are encrypted", function() {
    var filesystem;

    beforeEach(function() {
        filesystem = new FileSystem();
        filesystem.loadFile('test-encryption-data.json');
        waitsFor(filesystem.isLoaded);
    });

    it("Test accessing an encrypted file", function () {
        var accessFile = function() {
            filesystem.getFile('.hello');
        }
        expect(accessFile).toThrow(new AccessDenied('.hello is encrypted and cannot be accessed'));

    });

    it("Test accessing a file in an encrypted directory", function () {
        var accessFile = function() {
            filesystem.getFile('photos/photo.jpg');
        }
        expect(accessFile).toThrow(new AccessDenied('photos/ is encrypted and cannot be accessed'));

    });

    it("Test changing into an encrypted directory", function () {
        var changeDirectory = function() {
            filesystem.changeDirectory('photos');
        }
        expect(changeDirectory).toThrow(new AccessDenied('photos/ is encrypted and cannot be accessed'));
    });

    it("Test getting the directory listing of an encrypted directory", function() {
        var getEncryptedDirFiles = function() {
            filesystem.getFiles('photos');
        }
        expect(getEncryptedDirFiles).toThrow(new AccessDenied('photos/ is encrypted and cannot be accessed'));

        getEncryptedDirFiles = function() {
            filesystem.getFileNames('photos');
        }
        expect(getEncryptedDirFiles).toThrow(new AccessDenied('photos/ is encrypted and cannot be accessed'));
        
        getEncryptedDirFiles = function() {
            filesystem.getFiles('photos/more-photos');
        }
        expect(getEncryptedDirFiles).toThrow(new AccessDenied('photos/ is encrypted and cannot be accessed'));
    });

    it("Test that we can access files if we're claiming to be encryption safe", function() {
        var file = filesystem.getFile('.hello', true);
        expect(file.type).toEqual('text');

        file = filesystem.getFile('photos/photo.jpg', true);
        expect(file.type).toEqual('photo');

    });

    it("Test decrypting a file with an invalid password", function() {
        var decryptFiles = function() {
            filesystem.decryptFile('photos', 'pass');
        }
        expect(decryptFiles).toThrow(new AccessDenied('Incorrect password for decryption'));
        decryptFiles = function() {
            filesystem.decryptFile('.hello', 'pass');
        }
        expect(decryptFiles).toThrow(new AccessDenied('Incorrect password for decryption'));
    });

    it("Test decrypting a file with a valid password", function() {
        filesystem.decryptFile('.hello', 'password');
        var file = filesystem.getFile('.hello');
        expect(file.type).toEqual('text');
    });

    it("Test decrypting a directory with a valid password", function() {
        filesystem.decryptFile('photos', 'password');
        var file = filesystem.getFile('photos/photo.jpg');
        expect(file.type).toEqual('photo');

        var files = filesystem.getFiles('photos');
        expect(Object.keys(files)).toEqual(['photo.jpg', 'more-photos']);
    });

    it("Test decrypting a file that is not encrypted", function() {
        filesystem.decryptFile('photos', 'password');
        
        decryptUnencrypted = function() {
            filesystem.decryptFile('photos/photo.jpg');
        }

        expect(decryptUnencrypted).toThrow(new InvalidFileObject("File or directory is not encrypted"));
                
    });
});
