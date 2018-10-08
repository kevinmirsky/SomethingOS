///<reference path="../globals.ts" />

module TSOS {

    export class Memory {
        private mainMem: number[];

        constructor(memSize: number = 256) {
            this.mainMem = new Array(256);
        }

        public init(): void {
            //Load up memory with empty values
            for (let i = 0; i < MAX_MEMORY; i++) {
                this.mainMem[i] = 0x00;
            }
        }

        public storeValue(value: number, index: number): void {
            this.mainMem[index] = value;
        }

        public accessAddress(startIndex: number, endIndex?: number): any {
            if (endIndex) {
                let values = [];
                for (let i = startIndex;i < startIndex; i++) {
                    values.push(this.mainMem[i]);
                }
                return values;
            } else {
                return this.mainMem[startIndex];
            }
        }
    }
}