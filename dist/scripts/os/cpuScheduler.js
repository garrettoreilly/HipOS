///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Scheduler = (function () {
        function Scheduler() {
            this.quantum = 6;
            this.ticks = 0;
        }
        Scheduler.prototype.setQuantum = function (newQ) {
            this.quantum = newQ;
        };
        Scheduler.prototype.incTicks = function () {
            this.ticks++;
            if (this.ticks > this.quantum) {
                this.ticks = 0;
                this.roundRobin();
            }
        };
        Scheduler.prototype.roundRobin = function () {
            if (_Kernel.readyQueue.length > 0) {
                _Kernel.running.copyCpuState(_CPU.PC, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag, _CPU.isExecuting, _CPU.instruction, _CPU.baseAddress, _CPU.limitAddress, _CPU.pid);
                _Kernel.readyQueue.push(_Kernel.running);
                _Kernel.running = _Kernel.readyQueue.shift();
                _Kernel.running.setCpuState();
            }
        };
        return Scheduler;
    })();
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
