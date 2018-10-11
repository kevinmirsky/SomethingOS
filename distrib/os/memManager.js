var TSOS;
(function (TSOS) {
    var MemManager = /** @class */ (function () {
        function MemManager(memory) {
            this.memory = memory;
        }
        MemManager.prototype.init = function () {
        };
        MemManager.prototype.readMemory = function (startIndex, endIndex) {
            return this.memory.accessAddress(startIndex, endIndex);
        };
        MemManager.prototype.writeMemory = function (index, input) {
            if (input instanceof Array) {
                console.log("Writing from array");
            }
            else {
                //Single Value
                console.log("Writing single value");
                for (var i = 0; i < input.length + 1; i++) {
                    this.memory.storeValue(i + index, input[i]);
                }
                if (input <= 0xFF) {
                    this.memory.storeValue(index, input);
                }
                else {
                    throw "Memory storage exception: Attempted to store value larger than 0xFF";
                }
            }
        };
        MemManager.prototype.refreshMemoryViewer = function () {
            //Should we move this to some display controller at some point? Maybe.
            var inputElement = document.getElementById("taMemory");
            inputElement.value = this.memory.mainMem.join(" ");
        };
        return MemManager;
    }());
    TSOS.MemManager = MemManager;
})(TSOS || (TSOS = {}));
