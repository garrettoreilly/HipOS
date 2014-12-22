var TSOS;
(function (TSOS) {
    var Disk = (function () {
        function Disk() {
        }
        Disk.write = function (addr, data) {
            if (data.length < 128) {
                data += Array(129 - data.length).join("0");
            }
            localStorage[addr] = data;
            var diskContents = "";
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 8; j++) {
                    for (var k = 0; k < 8; k++) {
                        diskContents += this.read(i.toString(10) + j.toString(10) + k.toString(10)) + "\n";
                    }
                }
            }
            document.getElementById("disk").value = diskContents;
        };
        Disk.read = function (addr) {
            return localStorage[addr];
        };
        return Disk;
    })();
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
