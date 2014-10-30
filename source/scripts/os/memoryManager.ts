///<reference path="../host/memory.ts" />

module TSOS {

    export class Manager {

        memory = new Memory();

        public segments: boolean[] = [false, false, false];

        public getSegment(): number {
            for (var i = 0; i < this.segments.length; i++) {
                if (this.segments[i]) {
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
    }
}
