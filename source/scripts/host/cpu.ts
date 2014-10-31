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

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false,
                    public instruction: string = "") {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.instruction = "";
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.instruction = _Manager.getAddress(this.PC);
            this.PC++;
            if (this.instruction == "a9") {
                this.loadConstant();
                this.PC++;
            } else if (this.instruction == "ad") {
                this.loadFromMemory();
                this.PC++;
                this.PC++;
            } else if (this.instruction == "8d") {
                this.storeAcc();
                this.PC++;
                this.PC++;
            } else if (this.instruction == "6d") {
                this.addWithCarry();
                this.PC++;
                this.PC++;
            } else if (this.instruction == "a2") {
                this.loadXConstant();
                this.PC++;
            } else if (this.instruction == "ae") {
                this.loadXMemory();
                this.PC++;
                this.PC++;
            } else if (this.instruction == "a0") {
                this.loadYConstant();
                this.PC++;
            } else if (this.instruction == "ac") {
                this.loadYMemory();
                this.PC++;
                this.PC++;
            } else if (this.instruction == "ea") {

            } else if (this.instruction == "00") {
                this.breakSys;
            } else if (this.instruction == "ec") {
                this.compareToX();
                this.PC++;
                this.PC++;
            } else if (this.instruction == "d0") {
                this.branchN();
                this.PC++;
            } else if (this.instruction == "ee") {
                this.incrementByte();
                this.PC++;
                this.PC++;
            } else if (this.instruction == "ff") {
                this.systemCall();
            }
        }

        public loadConstant(): void {
            this.Acc = _Manager.getAddress(this.PC);
        }

        public loadFromMemory(): void {
            this.Acc = _Manager.getAddress(_Manager.getAddress(this.PC));
        }

        public storeAcc(): void {
            _Manager.setAddress(_Manager.getAddress(this.PC), this.Acc);
        }

        public addWithCarry(): void {
            this.Acc += _Manager.getAddress(_Manager.getAddress(this.PC));
        }

        public loadXConstant(): void {
            this.Xreg = _Manager.getAddress(this.PC);
        }

        public loadXMemory(): void {
            this.Xreg = _Manager.getAddress(_Manager.getAddress(this.PC));
        }

        public loadYConstant(): void {
            this.Yreg = _Manager.getAddress(this.PC);
        }

        public loadYMemory(): void {
            this.Yreg = _Manager.getAddress(_Manager.getAddress(this.PC));
        }

        public breakSys(): void {

        }

        public compareToX(): void {
            if (_Manager.getAddress(_Manager.getAddress(this.PC)) == this.Xreg) {
                this.Zflag = 1;
            }
        }

        public branchN(): void {
            if (this.Zflag == 0) {
                this.PC = (this.PC + 1 + _Manager.getAddress(this.PC)) % 256;
            }
        }

        public incrementByte(): void {
            _Manager.setAddress(_Manager.getAddress(this.PC), _Manager.getAddress(_Manager.getAddress(this.PC)) + 1);
        }

        public systemCall(): void {

        }
    }
}
