var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory() {
            this.memory = [];
            for (var i = 0; i < 768; i++) {
                this.memory[i] = "00";
            }
            document.getElementById("memory").value = this.memory.join(" ");
        }
        Memory.prototype.getAddress = function (addr) {
            return this.memory[addr];
        };
        Memory.prototype.setAddress = function (addr, value) {
            if (value.length == 1) {
                value = "0" + value;
            }
            this.memory[addr] = value;
            document.getElementById("memory").value = this.memory.join(" ");
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
