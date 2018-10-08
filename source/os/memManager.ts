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
            this.memory.storeValue(index, value);
        }

    }
}