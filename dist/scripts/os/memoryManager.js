///<reference path="../globals.ts" />
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
            if (_Kernel.running != undefined) {
                addr += _Kernel.running.baseAddress;
            }
            if (addr > _Kernel.running.limitAddress) {
                _StdOut.putText("Memory out of bounds. Use your own memory!");
                _CPU.breakSys();
            }
            return parseInt(this.memory.getAddress(addr), 16);
        };
        Manager.prototype.setAddress = function (addr, value) {
            if (_Kernel.running != undefined) {
                addr += _Kernel.running.baseAddress;
            }
            if (addr > _Kernel.running.limitAddress) {
                _StdOut.putText("Memory out of bounds. Use your own memory!");
                _CPU.breakSys();
            }
            else {
                this.memory.setAddress(addr, value.toString(16));
            }
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
        Manager.prototype.clearMemory = function () {
            for (var i = 0; i < 768; i++) {
                this.setAddress(i, 0);
            }
        };
        return Manager;
    })();
    TSOS.Manager = Manager;
})(TSOS || (TSOS = {}));
