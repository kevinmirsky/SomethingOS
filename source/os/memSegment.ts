module TSOS {

    export class MemSegment {

        public isOccupied:boolean = false;

        constructor(public firstByte, public lastByte) {

        }

        public getSize(): number {
            return (this.lastByte - this.firstByte) + 1;
        }
    }
}