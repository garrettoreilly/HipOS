var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory() {
            this.memory = [];
            for (var i = 0; i < 768; i++) {
                this.memory[i] = "00";
            }
        }
        Memory.prototype.getAddress = function (addr) {
            return this.memory[addr];
        };
        Memory.prototype.setAddress = function (addr, value) {
            this.memory[addr] = value;
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
