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


        public static createFile(name: string): void {
            var name = name[0];
            var path = this.findEmptyBlock(0);
            if (path == "full") {
                _StdOut.putText("Disk is full.");
                return;
            }
            var newName = "";
            var temp: number;
            for (var i = 0; i < name.length; i++) {
                newName += name.charCodeAt(i).toString(16);
            }
            if (this.fileExists(newName) == "000") {
                newName = "01@@@@@@" + newName;
                Disk.write(path, newName + Array(129 - newName.length).join("0"));
            } else {
                _StdOut.putText("File already exists.");
            }
        }

        public static writeFile(data, program): void {
            var name = data.splice(0, 1)[0];
            data = data.join(" ").replace(/\"/g, "");
            var newName = "";
            for (var i = 0; i < name.length; i++) {
                newName += name.charCodeAt(i).toString(16);
            }
            if (!program) {
                var newData = "";
                for (var i = 0; i < data.length; i++) {
                    newData += data.charCodeAt(i).toString(16);
                }
            }
            var path = this.fileExists(newName);
            if (path == "000") {
                _StdOut.putText("No file named " + name);
                return;
            } else {
                var numBlocks = Math.ceil(newData.length/120);
                var blockStrings = [];
                var blocks = [];
                var newPath = Disk.read(path).substring(2, 8);
                if (newPath.indexOf("@") == -1) {
                    newPath = newPath[1] + newPath[3] + newPath[5];
                    this.deleteLinks(newPath);
                }
                for (var i = 0; i < numBlocks; i++) {
                    blockStrings[i] = newData.substring(0, 120);
                    newData = newData.substring(120);
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
                _StdOut.putText("Write succeeded.");
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
    }
}
