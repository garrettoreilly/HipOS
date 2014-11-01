///<reference path="../host/memory.ts" />
var TSOS;
(function (TSOS) {
    var Manager = (function () {
        function Manager() {
            this.memory = new TSOS.Memory();
            this.segments = [true, true, true];
        }
        Manager.prototype.getSegment = function () {
            for (var i = 0; i < this.segments.length; i++) {
                if (this.segments[i]) {
                    this.segments[i] = false;
                    return i * 256;
                }
            }
            return -1;
        };
        Manager.prototype.getAddress = function (addr) {
            return parseInt(this.memory.getAddress(addr + _Kernel.running.baseAddress), 16);
        };
        Manager.prototype.setAddress = function (addr, value) {
            this.memory.setAddress(addr + _Kernel.running.baseAddress, value.toString(16));
        };
        Manager.prototype.loadProgram = function (program) {
            var base = this.getSegment();
            if (base == -1) {
                return -1;
            }
            var i = 0;
            while (i < program.length) {
                this.memory.setAddress(base + i, program[i]);
                i++;
            }
            return base;
        };
        return Manager;
    })();
    TSOS.Manager = Manager;
})(TSOS || (TSOS = {}));
