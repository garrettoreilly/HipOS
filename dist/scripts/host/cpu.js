///<reference path="../globals.ts" />
///<reference path="../os/interrupt.ts" />
/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Cpu = (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting, instruction, baseAddress, limitAddress, pid) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (instruction === void 0) { instruction = 0; }
            if (baseAddress === void 0) { baseAddress = 0; }
            if (limitAddress === void 0) { limitAddress = 0; }
            if (pid === void 0) { pid = 0; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.instruction = instruction;
            this.baseAddress = baseAddress;
            this.limitAddress = limitAddress;
            this.pid = pid;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.instruction = 0;
            this.baseAddress = 0;
            this.limitAddress = 0;
            this.pid = 0;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.instruction = _Manager.getAddress(this.PC);
            this.PC++;
            if (this.instruction == 0xA9) {
                this.loadConstant();
                this.PC++;
            }
            else if (this.instruction == 0xAD) {
                this.loadFromMemory();
                this.PC++;
                this.PC++;
            }
            else if (this.instruction == 0x8D) {
                this.storeAcc();
                this.PC++;
                this.PC++;
            }
            else if (this.instruction == 0x6D) {
                this.addWithCarry();
                this.PC++;
                this.PC++;
            }
            else if (this.instruction == 0xA2) {
                this.loadXConstant();
                this.PC++;
            }
            else if (this.instruction == 0xAE) {
                this.loadXMemory();
                this.PC++;
                this.PC++;
            }
            else if (this.instruction == 0xA0) {
                this.loadYConstant();
                this.PC++;
            }
            else if (this.instruction == 0xAC) {
                this.loadYMemory();
                this.PC++;
                this.PC++;
            }
            else if (this.instruction == 0xEA) {
            }
            else if (this.instruction == 0x00) {
                this.breakSys();
            }
            else if (this.instruction == 0xEC) {
                this.compareToX();
                this.PC++;
                this.PC++;
            }
            else if (this.instruction == 0xD0) {
                this.branchN();
                this.PC++;
            }
            else if (this.instruction == 0xEE) {
                this.incrementByte();
                this.PC++;
                this.PC++;
            }
            else if (this.instruction == 0xFF) {
                this.systemCall();
            }
            else {
                this.breakSys();
            }
        };
        Cpu.prototype.loadConstant = function () {
            this.Acc = _Manager.getAddress(this.PC);
        };
        Cpu.prototype.loadFromMemory = function () {
            this.Acc = _Manager.getAddress(_Manager.getAddress(this.PC));
        };
        Cpu.prototype.storeAcc = function () {
            _Manager.setAddress(_Manager.getAddress(this.PC), this.Acc);
        };
        Cpu.prototype.addWithCarry = function () {
            this.Acc += _Manager.getAddress(_Manager.getAddress(this.PC));
        };
        Cpu.prototype.loadXConstant = function () {
            this.Xreg = _Manager.getAddress(this.PC);
        };
        Cpu.prototype.loadXMemory = function () {
            this.Xreg = _Manager.getAddress(_Manager.getAddress(this.PC));
        };
        Cpu.prototype.loadYConstant = function () {
            this.Yreg = _Manager.getAddress(this.PC);
        };
        Cpu.prototype.loadYMemory = function () {
            this.Yreg = _Manager.getAddress(_Manager.getAddress(this.PC));
        };
        Cpu.prototype.breakSys = function () {
            this.PC = 0;
            _Manager.clearSegment(_Kernel.running.baseAddress);
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(BREAK_IRQ, []));
        };
        Cpu.prototype.compareToX = function () {
            if (_Manager.getAddress(_Manager.getAddress(this.PC)) == this.Xreg) {
                this.Zflag = 1;
            }
            else {
                this.Zflag = 0;
            }
        };
        Cpu.prototype.branchN = function () {
            if (this.Zflag == 0) {
                this.PC = (this.PC + _Manager.getAddress(this.PC)) % 256;
            }
        };
        Cpu.prototype.incrementByte = function () {
            _Manager.setAddress(_Manager.getAddress(this.PC), _Manager.getAddress(_Manager.getAddress(this.PC)) + 1);
        };
        Cpu.prototype.systemCall = function () {
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SOFTWARE_IRQ, [this.Xreg, this.Yreg]));
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
