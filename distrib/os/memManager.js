var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TSOS;
(function (TSOS) {
    var MemManager = /** @class */ (function (_super) {
        __extends(MemManager, _super);
        function MemManager(size) {
            var _this = this;
            {
                _this = _super.call(this, size) || this;
            }
            return _this;
        }
        MemManager.prototype.readMemory = function (startIndex, endIndex) {
            return _super.prototype.accessAddress.call(this, startIndex, endIndex);
        };
        MemManager.prototype.writeMemory = function (index, input) {
            if (input instanceof Array) {
                console.log("Writing from array");
                for (var i = 0; i < input.length; i++) {
                    var parsedInput = parseInt(input[i], 16);
                    if (parsedInput <= 0xFF) {
                        _super.prototype.storeValue.call(this, i + index, parsedInput);
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
                if (input <= 0xFF) {
                    console.log(input.toString(16));
                    _super.prototype.storeValue.call(this, index, input);
                }
                else {
                    throw "Memory storage exception: Attempted to store value larger than 0xFF";
                }
            }
        };
        MemManager.prototype.refreshMemoryViewer = function () {
            //Should we move this to some display controller at some point? Maybe.
            //Fun fact, concat is faster than array join!
            var inputElement = document.getElementById("taMemory");
            inputElement.value = _super.prototype.dumpMemory.call(this);
            //inputElement.value = super.mainMem.join(" ");
        };
        return MemManager;
    }(TSOS.Memory));
    TSOS.MemManager = MemManager;
})(TSOS || (TSOS = {}));
