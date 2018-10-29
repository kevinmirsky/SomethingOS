var TSOS;
(function (TSOS) {
    class MemManager extends TSOS.Memory {
        constructor(size) {
            {
                super(size);
            }
            this.createSegments();
        }
        createSegments() {
            for (let i = 0; i < this.mainMem.length; i += MemManager.SEGMENT_SIZE) {
                if (i + MemManager.SEGMENT_SIZE <= this.mainMem.length) {
                    MemManager.segments.push(new TSOS.MemSegment(i, i + MemManager.SEGMENT_SIZE - 1));
                }
            }
            console.log(MemManager.segments);
        }
        readMemory(startIndex, endIndex) {
            return super.accessAddress(startIndex, endIndex);
        }
        writeMemory(index, input) {
            if (input instanceof Array) {
                console.log("Writing from array");
                for (let i = 0; i < input.length; i++) {
                    let parsedInput = parseInt(input[i], 16);
                    if (parsedInput <= this.mainMem.length) {
                        super.storeValue(i + index, parsedInput);
                    }
                    else {
                        console.log(input[i]);
                        throw "Memory storage exception: Attempted to store out of bounds";
                    }
                }
            }
            else {
                if (input <= this.mainMem.length) {
                    super.storeValue(index, input);
                }
                else {
                    throw "Memory storage exception: Attempted to store out of bounds";
                }
            }
        }
        refreshMemoryViewer() {
            var inputElement = document.getElementById("taMemory");
            inputElement.value = super.dumpMemory();
        }
        memDump() {
            let output = [];
            for (let i = 0; i < this.mainMem.length; i++) {
                let preparedValue = this.mainMem[i].toString(16).toUpperCase().padStart(2, "0");
                output.push(preparedValue);
            }
            return output;
        }
    }
    MemManager.SEGMENT_SIZE = 256;
    MemManager.segments = [];
    TSOS.MemManager = MemManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memManager.js.map