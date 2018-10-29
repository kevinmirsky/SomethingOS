module TSOS {

    export class MemManager extends Memory {

        constructor(size: number) {
            {super(size)}
        }

        public readMemory(startIndex: number, endIndex?: number): any {
            return super.accessAddress(startIndex, endIndex);
        }

        //Whoo, go multiple definitions!
        public writeMemory(index: number, input: number[]): void;
        public writeMemory(index: number, input: number): void;
        public writeMemory(index, input): void {
            if (input instanceof Array) {
                console.log("Writing from array");
                for (let i = 0; i < input.length; i++) {
                    let parsedInput = parseInt(input[i], 16);
                    if (parsedInput <= super.mainMem.length) {
                        super.storeValue(i + index, parsedInput);
                    } else {
                        //Be kind and tell them what was the problem?
                        console.log(input[i]);
                        throw "Memory storage exception: Attempted to store out of bounds";
                    }
                }
            } else {
                //Single Value
                if (input <= super.mainMem.length) {
                    super.storeValue(index, input);
                } else {
                    throw "Memory storage exception: Attempted to store out of bounds";
                }
            }
        }

        public refreshMemoryViewer() {
            //Should we move this to some display controller at some point? Maybe.

            //Fun fact, concat is faster than array join!
            var inputElement = <HTMLInputElement>document.getElementById("taMemory");
            inputElement.value = super.dumpMemory();
            //inputElement.value = super.mainMem.join(" ");
        }

        public memDump(): string[] {
            let output = [];
            for (let i = 0; i < this.mainMem.length; i++) {
                let preparedValue = this.mainMem[i].toString(16).toUpperCase().padStart(2, "0");
                output.push(preparedValue);
            }
            return output;
        }
    }
}