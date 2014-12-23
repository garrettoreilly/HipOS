///<reference path="../globals.ts" />
///<reference path="../host/diskDrive.ts" />
var TSOS;
(function (TSOS) {
    var DiskDevice = (function () {
        function DiskDevice() {
        }
        DiskDevice.formatDisk = function () {
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 8; j++) {
                    for (var k = 0; k < 8; k++) {
                        TSOS.Disk.write(i.toString(10) + j.toString(10) + k.toString(10), Array(129).join("0"));
                    }
                }
            }
        };
        DiskDevice.createFile = function (name) {
            var name = name[0];
            var path = this.findEmptyBlock(0);
            if (path == "full") {
                _StdOut.putText("Disk is full.");
                return;
            }
            var newName = this.stringToHex(name);
            if (this.fileExists(newName) == "000") {
                newName = "01@@@@@@" + newName;
                TSOS.Disk.write(path, newName + Array(129 - newName.length).join("0"));
                return true;
            }
            else {
                _StdOut.putText("File already exists. ");
                return false;
            }
        };
        DiskDevice.writeFile = function (data, program) {
            var name = data.splice(0, 1)[0];
            data = data.join(" ").replace(/\"/g, "");
            var newName = this.stringToHex(name);
            if (!program) {
                data = this.stringToHex(data);
            }
            var path = this.fileExists(newName);
            if (path == "000") {
                _StdOut.putText("No file named " + name);
                return;
            }
            else {
                var numBlocks = Math.ceil(data.length / 120);
                var blockStrings = [];
                var blocks = [];
                var newPath = TSOS.Disk.read(path).substring(2, 8);
                if (newPath.indexOf("@") == -1) {
                    newPath = newPath[1] + newPath[3] + newPath[5];
                    this.deleteLinks(newPath);
                }
                for (var i = 0; i < numBlocks; i++) {
                    blockStrings[i] = data.substring(0, 120);
                    data = data.substring(120);
                }
                for (var i = 0; i < numBlocks; i++) {
                    for (var j = 1; j <= 3; j++) {
                        blocks[i] = this.findEmptyBlock(j);
                        if (blocks[i] != "full") {
                            TSOS.Disk.write(blocks[i], "01");
                            break;
                        }
                        else {
                            _StdOut.putText("Write failed.");
                            return;
                        }
                    }
                }
                TSOS.Disk.write(path, "010" + blocks[0].split("").join("0") + newName);
                for (var i = 0; i < numBlocks; i++) {
                    if (i != numBlocks - 1) {
                        TSOS.Disk.write(blocks[i], "010" + blocks[i + 1].split("").join("0") + blockStrings[i]);
                    }
                    else {
                        TSOS.Disk.write(blocks[i], "01@@@@@@" + blockStrings[i]);
                    }
                }
                _StdOut.putText("Write succeeded. ");
            }
        };
        DiskDevice.readFile = function (name) {
            var name = name[0];
            var newName = this.stringToHex(name);
            var hexContent = "";
            var originalPath = this.fileExists(newName);
            var path = TSOS.Disk.read(originalPath).substring(2, 8);
            path = path[1] + path[3] + path[5];
            while (path.indexOf("@") == -1) {
                path = TSOS.Disk.read(path);
                hexContent += path.substring(8);
                path = path[3] + path[5] + path[7];
            }
            if (TSOS.Disk.read(originalPath)[1] = "1") {
                return this.hexToString(hexContent);
            }
            else if (TSOS.Disk.read(originalPath)[1] == "2") {
                return hexContent;
            }
        };
        DiskDevice.findEmptyBlock = function (mode) {
            var path;
            for (var i = 0; i < 8; i++) {
                for (var j = 0; j < 8; j++) {
                    if (TSOS.Disk.read(mode.toString(10) + i.toString(10) + j.toString(10)).substring(0, 2) == "00") {
                        path = mode.toString(10) + i.toString(10) + j.toString(10);
                        if (path != "000") {
                            break;
                        }
                        path = undefined;
                    }
                }
                if (path != undefined) {
                    break;
                }
            }
            if (path == undefined) {
                return "full";
            }
            else {
                return path;
            }
        };
        DiskDevice.deleteFile = function (name) {
            var name = name[0];
            var newName = this.stringToHex(name);
            var path = this.fileExists(newName);
            if (path == "000") {
                _StdOut.putText("No file named " + name);
            }
            else {
                this.deleteLinks(path);
                _StdOut.putText("File deleted.");
            }
        };
        DiskDevice.listFiles = function () {
            var files = [];
            var test;
            for (var i = 0; i < 8; i++) {
                for (var j = 0; j < 8; j++) {
                    test = TSOS.Disk.read("0" + i + j);
                    if (test) {
                        test = test.substring(0, 2);
                        if (test != "00") {
                            files.push(this.hexToString(TSOS.Disk.read("0" + i + j).substring(8)));
                        }
                    }
                }
            }
            for (var i = 0; i < files.length; i++) {
                _StdOut.putText(files[i]);
                _StdOut.advanceLine();
            }
        };
        DiskDevice.fileExists = function (name) {
            for (var i = 0; i < 8; i++) {
                for (var j = 1; j < 8; j++) {
                    if (name == TSOS.Disk.read("0" + i + j).slice(8, 8 + name.length)) {
                        return "0" + i + j;
                    }
                }
            }
            return "000";
        };
        DiskDevice.deleteLinks = function (path) {
            if (path.indexOf("@") == -1) {
                var nextBlock = TSOS.Disk.read(path).substring(2, 8);
                this.deleteLinks(nextBlock[1] + nextBlock[3] + nextBlock[5]);
            }
            TSOS.Disk.write(path, "0");
        };
        DiskDevice.stringToHex = function (str) {
            var hex = "";
            for (var i = 0; i < str.length; i++) {
                hex += str.charCodeAt(i).toString(16);
            }
            return hex;
        };
        DiskDevice.hexToString = function (hex) {
            var str = "";
            for (var i = 0; i < hex.length; i += 2) {
                str += String.fromCharCode(parseInt(hex[i] + hex[i + 1], 16));
            }
            return str;
        };
        return DiskDevice;
    })();
    TSOS.DiskDevice = DiskDevice;
})(TSOS || (TSOS = {}));
