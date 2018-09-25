module TSOS {

    export class Memory {

        constructor(private mainMem: number[]) {

        }

        public init(): void {
            //Load up memory with empty values
            for (let i = 0; i < MAX_MEMORY; i++) {
                this.mainMem[i] = 0x00;
            }
        }

        public storeValue(value: number, index: number) {
            this.mainMem[index] = value;
        }
    }
}