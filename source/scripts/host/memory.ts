module TSOS {

    export class Memory {

        private memory = [];

        for (var i = 0; i < 768; i++) {
            this.memory[i] = "00";
        }

        public getAddress(addr): string {
            return this.memory[addr];
        }

        public setAddress(addr, value): void {
            this.memory[addr] = value;
        }
    }
}
