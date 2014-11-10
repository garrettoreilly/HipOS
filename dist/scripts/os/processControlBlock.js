///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Pcb = (function () {
        function Pcb(pid, base) {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = true;
            this.instruction = 0;
            this.pid = 0;
            this.baseAddress = 0;
            this.limitAddress = 0;
            this.pid = pid;
            this.baseAddress = base;
            this.limitAddress = base + 255;
        }
        Pcb.prototype.setCpuState = function () {
            _CPU.PC = this.PC;
            _CPU.Acc = this.Acc;
            _CPU.Xreg = this.Xreg;
            _CPU.Yreg = this.Yreg;
            _CPU.Zflag = this.Zflag;
            _CPU.isExecuting = this.isExecuting;
            _CPU.instruction = this.instruction;
            _CPU.baseAddress = this.baseAddress;
            _CPU.limitAddress = this.limitAddress;
        };
        Pcb.prototype.copyCpuState = function (PC, Acc, Xreg, Yreg, Zflag, isExecuting, instruction, baseAddress, limitAddress) {
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.instruction = instruction;
            this.baseAddress = baseAddress;
            this.limitAddress = limitAddress;
        };
        return Pcb;
    })();
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
