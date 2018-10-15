///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory(memSize) {
            if (memSize === void 0) { memSize = 256; }
            this.mainMem = new Array(256);
            this.init();
        }
        Memory.prototype.init = function () {
            //Load up memory with empty values
            for (var i = 0; i < this.mainMem.length; i++) {
                this.mainMem[i] = 0x00;
            }
        };
        Memory.prototype.storeValue = function (index, value) {
            if (value > 0xFF) {
                /*
                 Should the OS really crash when this happens? Maybe not, but this should make memory controller
                 issues glaringly obvious... If the memory controller is working properly, this sort of error should
                 never reach the memory. So in my mind, this strictness is preferred.
                 */
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
                    //Add leading zero for consistency
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
