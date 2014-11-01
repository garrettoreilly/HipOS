module TSOS {

    export class Memory {

        private memory = [];

        constructor() {
            for (var i = 0; i < 768; i++) {
                this.memory[i] = "00";
            }
            (<HTMLInputElement>document.getElementById("memory")).value = this.memory.join(" ");
        }

        public getAddress(addr): string {
            return this.memory[addr];
        }

        public setAddress(addr, value): void {
            if (value.length == 1) {
                value = "0" + value;
            }
            this.memory[addr] = value;
            (<HTMLInputElement>document.getElementById("memory")).value = this.memory.join(" ");
        }
    }
}
