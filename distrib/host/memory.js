var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory(memSize) {
            if (memSize === void 0) { memSize = 256; }
            this.mainMem = new Array(256);
            this.init();
        }
        Memory.prototype.init = function () {
            for (var i = 0; i < this.mainMem.length; i++) {
                this.mainMem[i] = 0x00;
            }
        };
        Memory.prototype.storeValue = function (index, value) {
            if (value > 0xFF) {
                _Kernel.krnTrapError("Memory instructed to store oversized value in memory: "
                    + value.toString(16));
            }
            this.mainMem[index] = value;
        };
        Memory.prototype.accessAddress = function (startIndex, endIndex) {
            if (endIndex) {
                var values = [];
                for (var i = startIndex; i <= endIndex; i++) {
                    values.push(this.mainMem[i]);
                }
                return values;
            }
            else {
                return this.mainMem[startIndex];
            }
        };
        Memory.prototype.dumpMemory = function () {
            var memDisplay = "";
            for (var i = 0; i < this.mainMem.length; i++) {
                if (this.mainMem[i] < 10) {
                    memDisplay += "0";
                }
                memDisplay += this.mainMem[i].toString(16).toUpperCase() + " ";
            }
            return memDisplay;
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map