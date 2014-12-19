///<reference path="../globals.ts" />
module TSOS {

    export class Scheduler {

        public quantum: number = 6;
        public ticks: number = 0;

        public setQuantum(newQ): void {
            this.quantum = newQ;
        }

        public incTicks(): void {
            this.ticks++;
            if (this.ticks > this.quantum) {
                this.ticks = 0;
                this.roundRobin();
            }
        }

        public roundRobin(): void {
            if (_Kernel.readyQueue.length > 0) {
                _Kernel.running.copyCpuState(_CPU.PC, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag, _CPU.isExecuting, _CPU.instruction, _CPU.baseAddress, _CPU.limitAddress, _CPU.pid)
                _Kernel.readyQueue.push(_Kernel.running);
                _Kernel.running = _Kernel.readyQueue.shift();
                _Kernel.running.setCpuState();
                _Kernel.krnTrace("Context switching to the max!! pid = " + _Kernel.running.pid);
            }
        }
    }
}
