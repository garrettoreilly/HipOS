module TSOS {

    export class Pcb {

        public PC: number = 0;
        public Acc: number = 0;
        public Xreg: number = 0;
        public Yreg: number = 0;
        public Zflag: number = 0;
        public isExecuting: boolean = true;
        public instruction: string = "";
        public pid: number = 0;
        public segment: number = 0;

        constructor(pid, segment) {
            this.pid = pid;
            this.segment = segment;
        }

        public setCpuState(PC, Acc, Xreg, Yreg, Zflag, isExecuting, instruction): void {
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.instruction = instruction;
        }

    }
}
