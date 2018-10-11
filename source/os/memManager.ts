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
                    if (parsedInput <= 0xFF) {
                        super.storeValue(i + index, parsedInput);
                    } else {
                        //Be kind and tell them what was the problem?
                        console.log(input[i]);
                        throw "Memory storage exception: Attempted to store value larger than 0xFF";
                    }
                }
            } else {
                //Single Value
                super.storeValue(index, input);
                console.log("Writing single value");
                if (input <= 0xFF) {
                    super.storeValue(index, input);
                } else {
                    throw "Memory storage exception: Attempted to store value larger than 0xFF";
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
    }
}