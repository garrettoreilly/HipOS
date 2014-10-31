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
        }

        public getAddress(addr): number {
            return parseInt(this.memory.getAddress(addr), 16);
        }

        public setAddress(addr, value): void {
            this.memory.setAddress(addr, value.toString(16));
        }

        public loadProgram(program, pcb): number {
            var i = 0;
            var base = this.getSegment();
            while (i < program.length) {
                this.memory.setAddress(base + i, program[i]);
                i++;
            }
            return base;
        }
    }
}
