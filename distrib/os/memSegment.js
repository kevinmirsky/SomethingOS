var TSOS;
(function (TSOS) {
    class MemSegment {
        constructor(firstByte, lastByte) {
            this.firstByte = firstByte;
            this.lastByte = lastByte;
            this.isOccupied = false;
        }
        getSize() {
            return this.lastByte - this.firstByte;
        }
    }
    TSOS.MemSegment = MemSegment;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memSegment.js.map