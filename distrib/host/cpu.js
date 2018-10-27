var TSOS;
(function (TSOS) {
    class Cpu {
        constructor(PC = 0, Acc = 0, Xreg = 0, Yreg = 0, Zflag = 0, isExecuting = false) {
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        init() {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }
        cycle() {
            _Kernel.krnTrace('CPU cycle');
            TSOS.deviceDisplayDriver.resetMemoryHighlights();
            this.fetch();
            if (singleStep) {
                canStep = false;
            }
        }
        fetch() {
            let instruction = _MemManager.readMemory(this.PC);
            TSOS.deviceDisplayDriver.setCurrentOp(this.PC);
            this.PC++;
            switch (instruction) {
                case 0xA9: {
                    TSOS.deviceDisplayDriver.setCurrentParam(this.PC);
                    this.loadAcc(_MemManager.readMemory(this.PC));
                    break;
                }
                case 0xAD: {
                    TSOS.deviceDisplayDriver.setCurrentParam(this.PC);
                    TSOS.deviceDisplayDriver.setCurrentParam(this.PC + 1);
                    this.loadAccFromMem(_MemManager.readMemory(this.PC), _MemManager.readMemory(++this.PC));
                    break;
                }
                case 0x8D: {
                    TSOS.deviceDisplayDriver.setCurrentParam(this.PC);
                    TSOS.deviceDisplayDriver.setCurrentParam(this.PC + 1);
                    this.storeAcc(_MemManager.readMemory(this.PC), _MemManager.readMemory(++this.PC));
                    break;
                }
                case 0x6D: {
                    TSOS.deviceDisplayDriver.setCurrentParam(this.PC);
                    TSOS.deviceDisplayDriver.setCurrentParam(this.PC + 1);
                    this.addWithCarry(_MemManager.readMemory(this.PC), _MemManager.readMemory(++this.PC));
                    break;
                }
                case 0xA2: {
                    TSOS.deviceDisplayDriver.setCurrentParam(this.PC);
                    this.loadXReg(_MemManager.readMemory(this.PC));
                    break;
                }
                case 0xAE: {
                    TSOS.deviceDisplayDriver.setCurrentParam(this.PC);
                    TSOS.deviceDisplayDriver.setCurrentParam(this.PC + 1);
                    this.loadXRegFromMem(_MemManager.readMemory(this.PC), _MemManager.readMemory(++this.PC));
                    break;
                }
                case 0xA0: {
                    TSOS.deviceDisplayDriver.setCurrentParam(this.PC);
                    this.loadYReg(_MemManager.readMemory(this.PC));
                    break;
                }
                case 0xAC: {
                    TSOS.deviceDisplayDriver.setCurrentParam(this.PC);
                    TSOS.deviceDisplayDriver.setCurrentParam(this.PC + 1);
                    this.loadYRegFromMem(_MemManager.readMemory(this.PC), _MemManager.readMemory(++this.PC));
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
                    TSOS.deviceDisplayDriver.setCurrentParam(this.PC);
                    TSOS.deviceDisplayDriver.setCurrentParam(this.PC + 1);
                    this.compareToXReg(_MemManager.readMemory(this.PC), _MemManager.readMemory(++this.PC));
                    break;
                }
                case 0xD0: {
                    TSOS.deviceDisplayDriver.setCurrentParam(this.PC);
                    this.branchOnNotEqual(_MemManager.readMemory(this.PC));
                    break;
                }
                case 0xEE: {
                    TSOS.deviceDisplayDriver.setCurrentParam(this.PC);
                    TSOS.deviceDisplayDriver.setCurrentParam(this.PC + 1);
                    this.incrementByte(_MemManager.readMemory(this.PC), _MemManager.readMemory(++this.PC));
                    break;
                }
                case 0xFF: {
                    this.sysCall();
                    break;
                }
                default: {
                    _StdOut.putText("[ERROR] Invalid Opcode " + instruction.toString(16)
                        + ". Terminating.");
                    this.isExecuting = false;
                }
            }
            if (this.isExecuting == false) {
                let program = TSOS.Pcb.getRunning();
                if (program) {
                    program.state = "COMPLETE";
                    program.PC = this.PC;
                    program.Acc = this.Acc;
                    program.Xreg = this.Xreg;
                    program.Yreg = this.Yreg;
                    program.Zflag = this.Zflag;
                }
            }
        }
        loadAcc(input) {
            this.Acc = input;
            this.PC++;
        }
        loadAccFromMem(smallNum, bigNum) {
            console.log("Byte stitch is " + TSOS.Utils.byteStitch(smallNum, bigNum).toString(16));
            this.Acc = _MemManager.readMemory(TSOS.Utils.byteStitch(smallNum, bigNum));
            this.PC++;
        }
        storeAcc(smallNum, bigNum) {
            let memLoc = TSOS.Utils.byteStitch(smallNum, bigNum);
            _MemManager.writeMemory(memLoc, TSOS.Utils.byteWrap(this.Acc));
            this.PC++;
        }
        addWithCarry(smallNum, bigNum) {
            this.Acc += this.Acc = _MemManager.readMemory(TSOS.Utils.byteStitch(smallNum, bigNum));
            this.Acc = TSOS.Utils.byteWrap(this.Acc);
            this.PC++;
        }
        loadXReg(input) {
            this.Xreg = input;
            this.PC++;
        }
        loadXRegFromMem(smallNum, bigNum) {
            this.Xreg = _MemManager.readMemory(TSOS.Utils.byteStitch(smallNum, bigNum));
            this.PC++;
        }
        loadYReg(input) {
            this.Yreg = input;
            this.PC++;
        }
        loadYRegFromMem(smallNum, bigNum) {
            this.Yreg = _MemManager.readMemory(TSOS.Utils.byteStitch(smallNum, bigNum));
            this.PC++;
        }
        compareToXReg(smallNum, bigNum) {
            if (this.Xreg == _MemManager.readMemory(TSOS.Utils.byteStitch(smallNum, bigNum))) {
                this.Zflag = 1;
            }
            else {
                this.Zflag = 0;
            }
            this.PC++;
        }
        branchOnNotEqual(input) {
            if (this.Zflag == 0) {
                this.PC += input;
                this.PC = TSOS.Utils.byteWrap(this.PC);
            }
            this.PC++;
        }
        incrementByte(smallNum, bigNum) {
            let value = _MemManager.readMemory(TSOS.Utils.byteStitch(smallNum, bigNum)) + 1;
            _MemManager.writeMemory(TSOS.Utils.byteStitch(smallNum, bigNum), TSOS.Utils.byteWrap(value));
            this.PC++;
        }
        sysCall() {
            switch (this.Xreg) {
                case 0x01: {
                    _StdOut.putText(this.Yreg.toString(16));
                    break;
                }
                case 0x02: {
                    let outBuffer = "";
                    let i = this.Yreg;
                    let nextValue;
                    let terminated = false;
                    while (!terminated) {
                        nextValue = _MemManager.readMemory(TSOS.Utils.byteWrap(i));
                        if (!(nextValue == 0x00)) {
                            outBuffer += String.fromCharCode(nextValue);
                        }
                        else {
                            _StdOut.putText(outBuffer);
                            terminated = true;
                        }
                        i++;
                    }
                }
            }
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map