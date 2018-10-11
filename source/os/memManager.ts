module TSOS {

    export class MemManager {

        constructor(private memory: Memory) {

        }

        public init(): void {

        }

        public readMemory(startIndex: number, endIndex?: number): any {
            return this.memory.accessAddress(startIndex, endIndex);
        }

        //Whoo, go multiple definitions!
        public writeMemory(index: number, input: number[]): void;
        public writeMemory(index: number, input: number): void;
        public writeMemory(index, input): void {
            if (input instanceof Array) {
                console.log("Writing from array");
            } else {
                //Single Value
                console.log("Writing single value");
                for (let i = 0; i < input.length + 1; i++) {
                    this.memory.storeValue(i + index, input[i]);
                }
                if (input <= 0xFF) {
                    this.memory.storeValue(index, input);
                } else {
                    throw "Memory storage exception: Attempted to store value larger than 0xFF";
                }
            }
        }

        public refreshMemoryViewer() {
            //Should we move this to some display controller at some point? Maybe.

            var inputElement = <HTMLInputElement>document.getElementById("taMemory");
            inputElement.value = this.memory.mainMem.join(" ");
        }
    }
}