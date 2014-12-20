///<reference path="../globals.ts" />
///<reference path="../host/memory.ts" />

module TSOS {

    export class Manager {

        memory = new Memory();

        public segments: boolean[] = [true, true, true];

        public getSegment(): number {
            for (var i = 0; i < this.segments.length; i++) {
                if (this.segments[i]) {
                    this.segments[i] = false;
                    return i * 256;
                }
            }
            return -1;

        }

        public getAddress(addr): number {
            if (_Kernel.running != undefined) {
                addr += _Kernel.running.baseAddress;
            }
            if (addr > _Kernel.running.limitAddress) {
                _StdOut.putText("Memory out of bounds. Use your own memory!");
                _CPU.breakSys();
            }
            return parseInt(this.memory.getAddress(addr), 16);
        }

        public setAddress(addr, value): void {
            if (_Kernel.running != undefined) {
                addr += _Kernel.running.baseAddress;
                if (addr > _Kernel.running.limitAddress) {
                    _StdOut.putText("Memory out of bounds. Use your own memory!");
                    _CPU.breakSys();
                    return;
                }
            }
            this.memory.setAddress(addr, value.toString(16));
        }

        public loadProgram(program): number {
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
        }

        public clearMemory(): void {
            for (var i = 0; i < 768; i++) {
                this.setAddress(i, 0);
            }
        }

        public clearSegment(addr): void {
            for (var i = 0; i < 256; i++) {
                this.memory.setAddress(i + addr, "0");
            }
            this.segments[addr/256] = true;
        }
    }
}
