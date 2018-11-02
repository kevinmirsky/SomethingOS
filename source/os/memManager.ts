module TSOS {

    export class MemManager extends Memory {

        public static SEGMENT_SIZE = 256;
        public segments;

        constructor(size: number) {
            {super(size)}
            {this.segments = []}
            this.createSegments();
        }

        private createSegments() {
            for (let i = 0; i < this.mainMem.length; i += MemManager.SEGMENT_SIZE) {
                if (i + MemManager.SEGMENT_SIZE <= this.mainMem.length) {
                    this.segments.push(new MemSegment(i, i + MemManager.SEGMENT_SIZE - 1));
                }
            }
            console.log(this.segments);
        }

        /**
         * Gets the first available segment, with the optional parameter to look for a segment
         * of a certain size.
         * If a segment is available, the first segment is returned.
         * If no segment is available, returns false.
         */
        public getFreeSegment(size?: number): any {
            for (let i = 0; i < this.segments.length; i++) {
                if (!this.segments[i].isOccupied){
                    if (size) {
                        //run che
                        if ((this.segments[i].lastByte - this.segments[i].firstByte) > size) {
                            return this.segments[i];
                    } else {
                            return this.segments[i];
                        }
                    }

                }
            }
            return false;
        }
        /**
         * Gets the first available segment, no extra logic.
         * If no segment exists, returns false
         */
        public AgetFreeSegment(size): any {
            for (let i = 0; i < this.segments.length; i++) {
                if (!this.segments[i].isOccupied) {
                    if ((this.segments[i].lastByte - this.segments[i].firstByte) > size) {
                        return this.segments[i];
                    }
                }
            }
            return false;
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
                    if (parsedInput <= this.mainMem.length) {
                        super.storeValue(i + index, parsedInput);
                    } else {
                        //Be kind and tell them what was the problem?
                        console.log(input[i]);
                        throw "Memory storage exception: Attempted to store out of bounds";
                    }
                }
            } else {
                //Single Value
                if (input <= this.mainMem.length) {
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