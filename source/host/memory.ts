///<reference path="../globals.ts" />

module TSOS {

    export class Memory {
        private mainMem: number[];

        constructor(memSize: number = 256) {
            this.mainMem = new Array(256);
            this.init();
        }

        public init(): void {
            //Load up memory with empty values
            for (let i = 0; i < MAX_MEMORY; i++) {
                this.mainMem[i] = 0x00;
            }
        }

        public storeValue(value: number, index: number): void {
            if (value > 0xFF) {
                /*
                 Should the OS really crash when this happens? Maybe not, but this should make memory controller
                 issues glaringly obvious... If the memory controller is working properly, this sort of error should
                 never reach the memory. So in my mind, this strictness is preferred.
                 */

                _Kernel.krnTrapError("Memory instructed to store oversized value in memory");
            }
            this.mainMem[index] = value;
        }

        public accessAddress(startIndex: number, endIndex?: number): any {
            if (endIndex) {
                let values = [];
                for (let i = startIndex;i <= endIndex; i++) {
                    values.push(this.mainMem[i]);
                }
                return values;
            } else {
                return this.mainMem[startIndex];
            }
        }
    }
}