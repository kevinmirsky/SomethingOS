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
            this.currentPCB = null;
        }
        cycle() {
            _Kernel.krnTrace('CPU cycle');
            TSOS.deviceDisplayDriver.resetMemoryHighlights();
            try {
                this.fetch();
            }
            catch (e) {
                this.crash(e);
            }
            if (singleStep) {
                canStep = false;
            }
            _Scheduler.incrementQbit();
        }
        getPC() {
            return this.PC + this.currentPCB.memoryOffset;
        }
        plusPlusGetPC() {
            ++this.PC;
            return this.PC + this.currentPCB.memoryOffset;
        }
        fetch() {
            let instruction = this.protectedRead(this.getPC());
            TSOS.deviceDisplayDriver.setCurrentOp(this.getPC());
            this.PC++;
            switch (instruction) {
                case 0xA9: {
                    TSOS.deviceDisplayDriver.setCurrentParam(this.getPC());
                    this.loadAcc(this.protectedRead(this.getPC()));
                    break;
                }
                case 0xAD: {
                    TSOS.deviceDisplayDriver.setCurrentParam(this.getPC());
                    TSOS.deviceDisplayDriver.setCurrentParam(this.getPC() + 1);
                    this.loadAccFromMem(this.protectedRead(this.getPC()), this.protectedRead(this.plusPlusGetPC()));
                    break;
                }
                case 0x8D: {
                    TSOS.deviceDisplayDriver.setCurrentParam(this.getPC());
                    TSOS.deviceDisplayDriver.setCurrentParam(this.getPC() + 1);
                    this.storeAcc(this.protectedRead(this.getPC()), this.protectedRead(this.plusPlusGetPC()));
                    break;
                }
                case 0x6D: {
                    TSOS.deviceDisplayDriver.setCurrentParam(this.getPC());
                    TSOS.deviceDisplayDriver.setCurrentParam(this.getPC() + 1);
                    this.addWithCarry(this.protectedRead(this.getPC()), this.protectedRead(this.plusPlusGetPC()));
                    break;
                }
                case 0xA2: {
                    TSOS.deviceDisplayDriver.setCurrentParam(this.getPC());
                    this.loadXReg(this.protectedRead(this.getPC()));
                    break;
                }
                case 0xAE: {
                    TSOS.deviceDisplayDriver.setCurrentParam(this.getPC());
                    TSOS.deviceDisplayDriver.setCurrentParam(this.getPC() + 1);
                    this.loadXRegFromMem(this.protectedRead(this.getPC()), this.protectedRead(this.plusPlusGetPC()));
                    break;
                }
                case 0xA0: {
                    TSOS.deviceDisplayDriver.setCurrentParam(this.getPC());
                    this.loadYReg(this.protectedRead(this.getPC()));
                    break;
                }
                case 0xAC: {
                    TSOS.deviceDisplayDriver.setCurrentParam(this.getPC());
                    TSOS.deviceDisplayDriver.setCurrentParam(this.getPC() + 1);
                    this.loadYRegFromMem(this.protectedRead(this.getPC()), this.protectedRead(this.plusPlusGetPC()));
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
                    TSOS.deviceDisplayDriver.setCurrentParam(this.getPC());
                    TSOS.deviceDisplayDriver.setCurrentParam(this.getPC() + 1);
                    this.compareToXReg(this.protectedRead(this.getPC()), this.protectedRead(this.plusPlusGetPC()));
                    break;
                }
                case 0xD0: {
                    TSOS.deviceDisplayDriver.setCurrentParam(this.getPC());
                    this.branchOnNotEqual(this.protectedRead(this.getPC()));
                    break;
                }
                case 0xEE: {
                    TSOS.deviceDisplayDriver.setCurrentParam(this.getPC());
                    TSOS.deviceDisplayDriver.setCurrentParam(this.getPC() + 1);
                    this.incrementByte(this.protectedRead(this.getPC()), this.protectedRead(this.plusPlusGetPC()));
                    break;
                }
                case 0xFF: {
                    this.sysCall();
                    break;
                }
                default: {
                    this.crash("Invalid Opcode " + instruction.toString(16) + ".");
                }
            }
            this.updatePcb();
            if (this.isExecuting == false) {
                this.currentPCB.state = "COMPLETE";
                this.updatePcb();
                let segment = _MemManager.getSegment(this.currentPCB.memoryOffset);
                if (segment !== null) {
                    _MemManager.clearRegion(segment.firstByte, segment.getSize());
                    segment.isOccupied = false;
                }
                _Scheduler.runningPcb = null;
            }
        }
        loadAcc(input) {
            this.Acc = input;
            this.PC++;
        }
        loadAccFromMem(smallNum, bigNum) {
            console.log("Byte stitch is " + TSOS.Utils.byteStitch(smallNum, bigNum).toString(16));
            this.Acc = this.offsetProtectedRead(TSOS.Utils.byteStitch(smallNum, bigNum));
            this.PC++;
        }
        storeAcc(smallNum, bigNum) {
            let memLoc = TSOS.Utils.byteStitch(smallNum, bigNum);
            this.offsetProtectedWrite(memLoc, TSOS.Utils.byteWrap(this.Acc));
            this.PC++;
        }
        addWithCarry(smallNum, bigNum) {
            this.Acc += this.Acc = this.offsetProtectedRead(TSOS.Utils.byteStitch(smallNum, bigNum));
            this.Acc = TSOS.Utils.byteWrap(this.Acc);
            this.PC++;
        }
        loadXReg(input) {
            this.Xreg = input;
            this.PC++;
        }
        loadXRegFromMem(smallNum, bigNum) {
            this.Xreg = this.offsetProtectedRead(TSOS.Utils.byteStitch(smallNum, bigNum));
            this.PC++;
        }
        loadYReg(input) {
            this.Yreg = input;
            this.PC++;
        }
        loadYRegFromMem(smallNum, bigNum) {
            this.Yreg = this.offsetProtectedRead(TSOS.Utils.byteStitch(smallNum, bigNum));
            this.PC++;
        }
        compareToXReg(smallNum, bigNum) {
            if (this.Xreg == this.offsetProtectedRead(TSOS.Utils.byteStitch(smallNum, bigNum))) {
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
                console.log("BEFORE: " + this.PC);
                this.PC = (this.PC % 0x100);
                console.log("AFTER: " + this.PC);
            }
            this.PC++;
        }
        incrementByte(smallNum, bigNum) {
            let value = this.offsetProtectedRead(TSOS.Utils.byteStitch(smallNum, bigNum)) + 1;
            this.offsetProtectedWrite(TSOS.Utils.byteStitch(smallNum, bigNum), TSOS.Utils.byteWrap(value));
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
                        nextValue = this.offsetProtectedRead(TSOS.Utils.byteWrap(i));
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
        protectedRead(index) {
            let adjAddress = index;
            if (this.isOutOfBounds(adjAddress)) {
                throw "Memory read access violation." + adjAddress.toString(16);
            }
            return _MemManager.readMemory(adjAddress);
        }
        protectedWrite(index, input) {
            let adjAddress = index;
            if (this.isOutOfBounds(adjAddress)) {
                throw "Memory write access violation. " + adjAddress.toString(16);
            }
            _MemManager.writeMemory(adjAddress, input);
            return true;
        }
        offsetProtectedRead(index) {
            index += this.currentPCB.memoryOffset;
            return this.protectedRead(index);
        }
        offsetProtectedWrite(index, input) {
            index += this.currentPCB.memoryOffset;
            this.protectedWrite(index, input);
        }
        isOutOfBounds(index) {
            return (index < this.currentPCB.memoryOffset
                || index >= this.currentPCB.memoryOffset + this.currentPCB.memoryRange);
        }
        crash(msg) {
            let output = "[ERROR] ";
            if (msg) {
                output += msg;
            }
            else {
                output += "CPU runtime error.";
            }
            _StdOut.putText(output);
            _StdOut.advanceLine();
            _StdOut.putText("Terminating.");
            this.isExecuting = false;
            this.currentPCB.state = "TERMINATED";
            this.updatePcb();
        }
        updatePcb() {
            this.currentPCB.PC = this.PC;
            this.currentPCB.Acc = this.Acc;
            this.currentPCB.Xreg = this.Xreg;
            this.currentPCB.Yreg = this.Yreg;
            this.currentPCB.Zflag = this.Zflag;
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map