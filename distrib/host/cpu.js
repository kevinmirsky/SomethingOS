var TSOS;
(function (TSOS) {
    var Cpu = (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            this.fetch();
        };
        Cpu.prototype.fetch = function () {
            var instruction = _MemManager.readMemory(this.PC);
            this.PC++;
            switch (instruction) {
                case 0xA9: {
                    this.loadAcc(_MemManager.readMemory(this.PC));
                    break;
                }
                case 0xAD: {
                    this.loadAccFromMem(_MemManager.readMemory(this.PC));
                    break;
                }
                case 0x8D: {
                    this.storeAcc(_MemManager.readMemory(this.PC));
                    break;
                }
                case 0x6D: {
                    this.addWithCarry(_MemManager.readMemory(this.PC));
                    break;
                }
                case 0xA2: {
                    this.loadXReg(_MemManager.readMemory(this.PC));
                    break;
                }
                case 0xAE: {
                    this.loadXRegFromMem(_MemManager.readMemory(this.PC));
                    break;
                }
                case 0xA0: {
                    this.loadYReg(_MemManager.readMemory(this.PC));
                    break;
                }
                case 0xAC: {
                    this.loadYRegFromMem(_MemManager.readMemory(this.PC));
                    break;
                }
                case 0xEA: {
                    break;
                }
                case 0x00: {
                    this.isExecuting = false;
                    break;
                }
                case 0xEC: {
                    this.compareToXReg(_MemManager.readMemory(this.PC));
                    break;
                }
                case 0xD0: {
                    this.branchOnNotEqual(_MemManager.readMemory(this.PC));
                    break;
                }
                case 0xEE: {
                    this.incrementByte(_MemManager.readMemory(this.PC));
                    break;
                }
                default: {
                    this.isExecuting = false;
                }
            }
        };
        Cpu.prototype.loadAcc = function (input) {
            this.Acc = input;
            this.PC++;
        };
        Cpu.prototype.loadAccFromMem = function (input) {
            this.Acc = _MemManager.readMemory(input);
            this.PC++;
        };
        Cpu.prototype.storeAcc = function (input) {
            _MemManager.writeMemory(input, this.Acc);
            this.PC++;
        };
        Cpu.prototype.addWithCarry = function (input) {
            this.Acc += _MemManager.readMemory(input);
            this.PC++;
        };
        Cpu.prototype.loadXReg = function (input) {
            this.Xreg = input;
            this.PC++;
        };
        Cpu.prototype.loadXRegFromMem = function (input) {
            this.Xreg = _MemManager.readMemory(input);
            this.PC++;
        };
        Cpu.prototype.loadYReg = function (input) {
            this.Yreg = input;
            this.PC++;
        };
        Cpu.prototype.loadYRegFromMem = function (input) {
            this.Yreg = _MemManager.readMemory(input);
            this.PC++;
        };
        Cpu.prototype.compareToXReg = function (input) {
            if (this.Xreg == _MemManager.readMemory(input)) {
                this.Zflag = 1;
            }
            this.PC++;
        };
        Cpu.prototype.branchOnNotEqual = function (input) {
            if (this.Zflag == 0) {
                this.PC += input;
            }
            this.PC++;
        };
        Cpu.prototype.incrementByte = function (input) {
            var value = _MemManager.readMemory(input) + 1;
            _MemManager.writeMemory(input, value);
        };
        Cpu.prototype.sysCall = function () {
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map