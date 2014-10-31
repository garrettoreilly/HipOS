///<reference path="../globals.ts" />
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
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting, instruction) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (instruction === void 0) { instruction = ""; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.instruction = instruction;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.instruction = "";
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.instruction = _Manager.getAddress(this.PC);
            this.PC++;
            if (this.instruction == "a9") {
                this.loadConstant();
                this.PC++;
            }
            else if (this.instruction == "ad") {
                this.loadFromMemory();
                this.PC++;
                this.PC++;
            }
            else if (this.instruction == "8d") {
                this.storeAcc();
                this.PC++;
                this.PC++;
            }
            else if (this.instruction == "6d") {
                this.addWithCarry();
                this.PC++;
                this.PC++;
            }
            else if (this.instruction == "a2") {
                this.loadXConstant();
                this.PC++;
            }
            else if (this.instruction == "ae") {
                this.loadXMemory();
                this.PC++;
                this.PC++;
            }
            else if (this.instruction == "a0") {
                this.loadYConstant();
                this.PC++;
            }
            else if (this.instruction == "ac") {
                this.loadYMemory();
                this.PC++;
                this.PC++;
            }
            else if (this.instruction == "ea") {
            }
            else if (this.instruction == "00") {
                this.breakSys;
            }
            else if (this.instruction == "ec") {
                this.compareToX();
                this.PC++;
                this.PC++;
            }
            else if (this.instruction == "d0") {
                this.branchN();
                this.PC++;
            }
            else if (this.instruction == "ee") {
                this.incrementByte();
                this.PC++;
                this.PC++;
            }
            else if (this.instruction == "ff") {
                this.systemCall();
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
        };
        Cpu.prototype.compareToX = function () {
            if (_Manager.getAddress(_Manager.getAddress(this.PC)) == this.Xreg) {
                this.Zflag = 1;
            }
        };
        Cpu.prototype.branchN = function () {
            if (this.Zflag == 0) {
                this.PC = (this.PC + 1 + _Manager.getAddress(this.PC)) % 256;
            }
        };
        Cpu.prototype.incrementByte = function () {
            _Manager.setAddress(_Manager.getAddress(this.PC), _Manager.getAddress(_Manager.getAddress(this.PC)) + 1);
        };
        Cpu.prototype.systemCall = function () {
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
