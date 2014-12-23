///<reference path="../globals.ts" />
///<reference path="../host/diskDrive.ts" />
module TSOS {
    export class DiskDevice {
        
        public static formatDisk(): void {
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 8; j++) {
                    for (var k = 0; k < 8; k++) {
                        Disk.write(i.toString(10)+j.toString(10)+k.toString(10), Array(129).join("0"));
                    }
                }
            }
        }


        public static createFile(name): boolean {
            var name = name[0];
            var path = this.findEmptyBlock(0);
            if (path == "full") {
                _StdOut.putText("Disk is full.");
                return;
            }
            var newName = this.stringToHex(name);
            if (this.fileExists(newName) == "000") {
                newName = "01@@@@@@" + newName;
                Disk.write(path, newName + Array(129 - newName.length).join("0"));
                return true;
            } else {
                _StdOut.putText("File already exists. ");
                return false;
            }
        }

        public static writeFile(data, program): void {
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
            } else {
                var numBlocks = Math.ceil(data.length/120);
                var blockStrings = [];
                var blocks = [];
                var newPath = Disk.read(path).substring(2, 8);
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
                            Disk.write(blocks[i], "01");
                            break;
                        } else {
                            _StdOut.putText("Write failed.");
                            return;
                        }
                    }
                }
                Disk.write(path, "010" + blocks[0].split("").join("0") + newName);
                for (var i = 0; i < numBlocks; i++) {
                    if (i != numBlocks - 1) {
                        Disk.write(blocks[i], "010" + blocks[i+1].split("").join("0") + blockStrings[i]);
                    } else {
                        Disk.write(blocks[i], "01@@@@@@" + blockStrings[i]);
                    }
                }
                _StdOut.putText("Write succeeded. ");
            }
        }

        public static readFile(name): string {
            var name = name[0];
            var newName = this.stringToHex(name);
            var hexContent = "";
            var originalPath = this.fileExists(newName);
            var path = Disk.read(originalPath).substring(2, 8);
            path = path[1] + path[3] + path[5];
            while (path.indexOf("@") == -1) {
                path = Disk.read(path);
                hexContent += path.substring(8);
                path = path[3] + path[5] + path[7];
            }
            if (Disk.read(originalPath)[1] = "1") {
                return this.hexToString(hexContent);
            } else if (Disk.read(originalPath)[1] == "2") {
                return hexContent;
            }
        }
        
        private static findEmptyBlock(mode: number): string {
            var path: string;
            for (var i = 0; i < 8; i++) {
                for (var j = 0; j < 8; j++) {
                    if (Disk.read(mode.toString(10) + i.toString(10) + j.toString(10)).substring(0, 2) == "00") {
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
            } else {
                return path;
            }
        }

        public static deleteFile(name): void {
            var name = name[0];
            var newName = this.stringToHex(name);
            var path = this.fileExists(newName);
            if (path == "000") {
                _StdOut.putText("No file named " + name);
            } else {
                this.deleteLinks(path);
                _StdOut.putText("File deleted.");
            }
        }

        public static listFiles(): void {
            var files = [];
            var test: string;
            for (var i = 0; i < 8; i++) {
                for (var j = 0; j < 8; j++) {
                    test = Disk.read("0" + i + j);
                    if (test) {
                        test = test.substring(0, 2);
                        if (test != "00") {
                            files.push(this.hexToString(Disk.read("0" + i + j).substring(8)));
                        }
                    }
                }
            }
            for (var i = 0; i < files.length; i++) {
                _StdOut.putText(files[i]);
                _StdOut.advanceLine();
            }
        }

        private static fileExists(name: string): string {
            for (var i = 0; i < 8; i++) {
                for (var j = 1; j < 8; j++) {
                    if (name == Disk.read("0" + i + j).slice(8, 8 + name.length)) {
                        return "0" + i + j;
                    }
                }
            }
            return "000";
        }

        private static deleteLinks(path: string): void {
            if (path.indexOf("@") == -1) {
                var nextBlock = Disk.read(path).substring(2, 8);
                this.deleteLinks(nextBlock[1] + nextBlock[3] + nextBlock[5]);
            }
            Disk.write(path, "0");
        }

        private static stringToHex(str: string): string {
            var hex = "";
            for (var i = 0; i < str.length; i++) {
                hex += str.charCodeAt(i).toString(16);
            }
            return hex;
        }

        private static hexToString(hex: string): string {
            var str = "";
            for (var i = 0; i < hex.length; i+=2) {
                str += String.fromCharCode(parseInt(hex[i] + hex[i+1], 16));
            }
            return str;
        }
    }
}
