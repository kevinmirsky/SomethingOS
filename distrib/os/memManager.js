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
                for (var i = 0; i < input.length; i++) {
                    var parsedInput = parseInt(input[i], 16);
                    if (parsedInput <= 0xFF) {
                        this.memory.storeValue(i + index, parsedInput);
                    }
                    else {
                        //Be kind and tell them what was the problem?
                        console.log(input[i]);
                        throw "Memory storage exception: Attempted to store value larger than 0xFF";
                    }
                }
            }
            else {
                //Single Value
                this.memory.storeValue(index, input);
                console.log("Writing single value");
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
            //Fun fact, concat is faster than array join!
            var memDisplay = "";
            for (var i = 0; i < this.memory.mainMem.length; i++) {
                if (this.memory.mainMem[i] < 10) {
                    //Add leading zero for consistency
                    memDisplay += "0";
                }
                memDisplay += this.memory.mainMem[i].toString(16).toUpperCase() + " ";
            }
            var inputElement = document.getElementById("taMemory");
            inputElement.value = memDisplay;
            //inputElement.value = this.memory.mainMem.join(" ");
        };
        return MemManager;
    }());
    TSOS.MemManager = MemManager;
})(TSOS || (TSOS = {}));
