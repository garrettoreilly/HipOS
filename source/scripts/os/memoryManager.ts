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

        public getAddress(addr): string {
            return this.memory.getAddress(addr);
        }

        public setAddress(addr, value): void {
            this.memory.setAddress(addr, value);
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
