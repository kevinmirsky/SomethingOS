///<reference path="../globals.ts" />

module TSOS {

    export class Memory {
        protected mainMem: number[];


        protected constructor(memSize: number = 256) {
            this.mainMem = new Array(memSize);
            this.init();
        }

        public init(): void {
            //Load up memory with empty values
            for (let i = 0; i < this.mainMem.length; i++) {
                this.mainMem[i] = 0x00;
            }
        }

        protected storeValue(index: number, value: number): void {
            if (value >= this.mainMem.length) {
                /*
                 Should the OS really crash when this happens? Maybe not, but this should make memory controller
                 issues glaringly obvious... If the memory controller is working properly, this sort of error should
                 never reach the memory. So in my mind, this strictness is preferred.
                 */

                _Kernel.krnTrapError("Memory instructed to store oversized value in memory: "
                    + value.toString(16));
            }
            this.mainMem[index] = value;
        }

        protected accessAddress(startIndex: number, length?: number): any {
            if (length) {
                let values = [];
                for (let i = startIndex;i <= length; i++) {
                    values.push(this.mainMem[i]);
                }
                return values;
            } else {
                return this.mainMem[startIndex];
            }
        }
        protected dumpMemory(): string {
            let memDisplay = "";
            for (let i = 0; i < this.mainMem.length; i++) {
                if (this.mainMem[i] < 10) {
                    //Add leading zero for consistency
                    memDisplay += "0";
                }
                memDisplay += this.mainMem[i].toString(16).toUpperCase() + " ";
            }
            return memDisplay;
        }
    }
}