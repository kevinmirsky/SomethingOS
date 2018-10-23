var TSOS;
(function (TSOS) {
    class Memory {
        constructor(memSize = 256) {
            this.mainMem = new Array(256);
            this.init();
        }
        init() {
            for (let i = 0; i < this.mainMem.length; i++) {
                this.mainMem[i] = 0x00;
            }
        }
        storeValue(index, value) {
            if (value > 0xFF) {
                _Kernel.krnTrapError("Memory instructed to store oversized value in memory: "
                    + value.toString(16));
            }
            this.mainMem[index] = value;
        }
        accessAddress(startIndex, endIndex) {
            if (endIndex) {
                let values = [];
                for (let i = startIndex; i <= endIndex; i++) {
                    values.push(this.mainMem[i]);
                }
                return values;
            }
            else {
                return this.mainMem[startIndex];
            }
        }
        dumpMemory() {
            let memDisplay = "";
            for (let i = 0; i < this.mainMem.length; i++) {
                if (this.mainMem[i] < 10) {
                    memDisplay += "0";
                }
                memDisplay += this.mainMem[i].toString(16).toUpperCase() + " ";
            }
            return memDisplay;
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map