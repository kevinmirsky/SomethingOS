module TSOS {

    export class memManager {

        constructor(private memory: number[]) {

        }

        public init(): void {

        }

        public readMemory(startIndex: number, endIndex?: number): any {
            if (endIndex) {
                let values = [];
                for (let i = startIndex;i < startIndex; i++) {
                    values.push(this.memory[i]);
                }
                return values;
            } else {
                return this.memory[startIndex];
            }
        }

        public writeMemory(startIndex: number, endIndex?: number): any {
            if (endIndex) {
                let values = [];
                for (let i = startIndex;i < startIndex; i++) {
                    values.push(this.memory[i]);
                }
                return values;
            } else {
                return this.memory[startIndex];
            }
        }

    }
}