module TSOS {

    export class MemSegment {

        constructor(public firstByte, public lastByte) {

        }

        public getSize(): number {
            return this.lastByte - this.firstByte;
        }
    }
}