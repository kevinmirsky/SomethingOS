module TSOS {

    export class MemManager {

        constructor(private memory: Memory) {

        }

        public init(): void {

        }

        public readMemory(startIndex: number, endIndex?: number): any {
            return this.memory.accessAddress(startIndex, endIndex);
        }

        public writeMemory(index: number, value: number): any {
            if (value <= 0xFF) {
                this.memory.storeValue(index, value);
            } else {
                throw "Memory storage exception: Attempted to store value larger than 0xFF";
            }
        }

    }
}