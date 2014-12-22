module TSOS {
    export class Disk {
        public static write(addr, data): void {
            if (data.length < 128) {
                data += Array(129 - data.length).join("0");
            }
            localStorage[addr] = data;
            var diskContents = "";
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 8; j++) {
                    for (var k = 0; k < 8; k++) {
                        diskContents += this.read(i.toString(10)+j.toString(10)+k.toString(10)) + "\n";
                    }
                }
            }
            (<HTMLInputElement>document.getElementById("disk")).value = diskContents;
        }

        public static read(addr): string {
            return localStorage[addr];
        }
    }
}
