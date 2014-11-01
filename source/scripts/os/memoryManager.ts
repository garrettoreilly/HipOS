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
            return parseInt(this.memory.getAddress(addr + _Kernel.running.baseAddress), 16);
        }

        public setAddress(addr, value): void {
            this.memory.setAddress(addr + _Kernel.running.baseAddress, value.toString(16));
        }

        public loadProgram(program): number {
            var i = 0;
            var base = this.getSegment();
            if (base == -1) {
                return -1;
            }
            while (i < program.length) {
                this.memory.setAddress(base + i, program[i]);
                i++;
            }
            return base;
        }
    }
}
