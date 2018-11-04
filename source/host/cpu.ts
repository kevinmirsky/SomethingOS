///<reference path="../globals.ts" />

/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false,
                    public currentPCB: Pcb) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.currentPCB = null;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            deviceDisplayDriver.resetMemoryHighlights();
            this.fetch();

            //Reset step flag for single step
            if (singleStep) {
                canStep = false;
            }
        }

        public fetch(): void {
            let instruction: number = _MemManager.readMemory(this.PC);
            //Add memory highlighting
            deviceDisplayDriver.setCurrentOp(this.PC);
            this.PC++;

            //Decode
            //While we could store next value ahead of time, if we go out of bounds, we'll error out
            /* TODO Account for memory access offsets!
               Currently we start in the right place, but memory accessors do not know about offset
               Either we handle this internally, or we enforce it in function call.
               Thinking aloud, we should get make the read/write functions bound by the size of the program

               I think we're better off restricting programs to accessing mem locations within their size
               and not within their segment. Allowing the latter would enable someone to write code that
               SOMETIMES works, depending on if the program is allocated extra memory.
               If you need it, you need to declare it.

               Should we assign a segment to PCB?
             */
            switch(instruction) {
                case 0xA9: {
                    deviceDisplayDriver.setCurrentParam(this.PC);
                    this.loadAcc(_MemManager.readMemory(this.PC));
                    break;
                }
                case 0xAD: {
                    deviceDisplayDriver.setCurrentParam(this.PC);
                    deviceDisplayDriver.setCurrentParam(this.PC + 1);
                    this.loadAccFromMem(_MemManager.readMemory(this.PC), _MemManager.readMemory(++this.PC));
                    break;
                }
                case 0x8D: {
                    deviceDisplayDriver.setCurrentParam(this.PC);
                    deviceDisplayDriver.setCurrentParam(this.PC + 1);
                    this.storeAcc(_MemManager.readMemory(this.PC), _MemManager.readMemory(++this.PC));
                    break;
                }
                case 0x6D: {
                    deviceDisplayDriver.setCurrentParam(this.PC);
                    deviceDisplayDriver.setCurrentParam(this.PC + 1);
                    this.addWithCarry(_MemManager.readMemory(this.PC), _MemManager.readMemory(++this.PC));
                    break;
                }
                case 0xA2: {
                    deviceDisplayDriver.setCurrentParam(this.PC);
                    this.loadXReg(_MemManager.readMemory(this.PC));
                    break;
                }
                case 0xAE: {
                    deviceDisplayDriver.setCurrentParam(this.PC);
                    deviceDisplayDriver.setCurrentParam(this.PC + 1);
                    this.loadXRegFromMem(_MemManager.readMemory(this.PC), _MemManager.readMemory(++this.PC));
                    break;
                }
                case 0xA0: {
                    deviceDisplayDriver.setCurrentParam(this.PC);
                    this.loadYReg(_MemManager.readMemory(this.PC));
                    break;
                }
                case 0xAC: {
                    deviceDisplayDriver.setCurrentParam(this.PC);
                    deviceDisplayDriver.setCurrentParam(this.PC + 1);
                    this.loadYRegFromMem(_MemManager.readMemory(this.PC), _MemManager.readMemory(++this.PC));
                    break;
                }
                case 0xEA: {
                    //NO OP. Do nothing!
                    break;
                }
                case 0x00: {
                    //Break. End execution
                    this.isExecuting = false;
                    break;
                }
                case 0xEC: {
                    deviceDisplayDriver.setCurrentParam(this.PC);
                    deviceDisplayDriver.setCurrentParam(this.PC + 1);
                    this.compareToXReg(_MemManager.readMemory(this.PC), _MemManager.readMemory(++this.PC));
                    break;
                }
                case 0xD0: {
                    deviceDisplayDriver.setCurrentParam(this.PC);
                    this.branchOnNotEqual(_MemManager.readMemory(this.PC));
                    break;
                }
                case 0xEE: {
                    deviceDisplayDriver.setCurrentParam(this.PC);
                    deviceDisplayDriver.setCurrentParam(this.PC + 1);
                    this.incrementByte(_MemManager.readMemory(this.PC), _MemManager.readMemory(++this.PC));
                    break;
                }
                case 0xFF: {
                    this.sysCall();
                    break;
                }
                default: {
                    //Invalid OP code! Wanna freak out? Course you do...
                    _StdOut.putText("[ERROR] Invalid Opcode " + instruction.toString(16)
                    + ". Terminating.");
                    this.isExecuting = false;
                }
            }
            if (this.isExecuting == false) {
                //Let's wrap things up here. Pack it into the PCB and set it to done
                let program = Pcb.getRunning();
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


        // A9 - Load the accumulator with a constant
        private loadAcc(input): void {
            this.Acc = input;
            this.PC++;
        }

        // AD - Load the accumulator from memory
        private loadAccFromMem(smallNum: number, bigNum: number): void {
            console.log("Byte stitch is " + Utils.byteStitch(smallNum, bigNum).toString(16));
            this.Acc = _MemManager.readMemory(Utils.byteStitch(smallNum, bigNum));
            this.PC++;
        }

        // 8D - Store accumulator in memory
        private storeAcc(smallNum: number, bigNum: number): void {
            let memLoc = Utils.byteStitch(smallNum, bigNum);
            _MemManager.writeMemory(memLoc, Utils.byteWrap(this.Acc));
            this.PC++;
        }

        // 6D - Add with carry
        private addWithCarry(smallNum: number, bigNum: number): void {
            this.Acc += this.Acc = _MemManager.readMemory(Utils.byteStitch(smallNum, bigNum));
            this.Acc = Utils.byteWrap(this.Acc);
            this.PC++;
        }

        // A2 - Load X register with constant
        private loadXReg(input): void {
            this.Xreg = input;
            this.PC++;
        }

        // AE - Load X register from memory
        private loadXRegFromMem(smallNum: number, bigNum: number): void {
            this.Xreg = _MemManager.readMemory(Utils.byteStitch(smallNum, bigNum));
            this.PC++;
        }

        // A0 - Load Y register with constant
        private loadYReg(input): void {
            this.Yreg = input;
            this.PC++;
        }

        // AC - Load Y register from memory
        private loadYRegFromMem(smallNum: number, bigNum: number): void {
            this.Yreg = _MemManager.readMemory(Utils.byteStitch(smallNum, bigNum));
            this.PC++;
        }

        // EC - Compare a byte in memory to X reg
        private compareToXReg(smallNum: number, bigNum: number): void {
            if (this.Xreg == _MemManager.readMemory(Utils.byteStitch(smallNum, bigNum))) {
                this.Zflag = 1;
            } else {
                this.Zflag = 0;
            }
            this.PC++;
        }

        //D0 - Branch n bytes if z flag is 0 (branch on not equal)
        private branchOnNotEqual(input): void {
            if (this.Zflag == 0) {
                this.PC += input;
                this.PC = Utils.byteWrap(this.PC);
            }
            this.PC++;
        }

        // EE - Increment value of byte
        private incrementByte(smallNum: number, bigNum: number): void {
            let value = _MemManager.readMemory(Utils.byteStitch(smallNum, bigNum)) + 1;
            _MemManager.writeMemory(Utils.byteStitch(smallNum, bigNum), Utils.byteWrap(value));
            this.PC++;
        }

        // FF - System Call
        private  sysCall(): void {
            switch (this.Xreg) {
                case 0x01: { // #$01 in x reg -- Print integer in Y register
                    _StdOut.putText(this.Yreg.toString(16));
                    break;
                }
                case 0x02: { //# $02 in x reg -- Print 00 terminated string stored at address in Y reg
                    let outBuffer = "";
                    let i = this.Yreg;
                    let nextValue;
                    let terminated = false;

                    while(!terminated) {
                        nextValue = _MemManager.readMemory(Utils.byteWrap(i));
                        if (!(nextValue == 0x00)) {
                            //Add to buffer
                            outBuffer += String.fromCharCode(nextValue);
                        } else {
                            _StdOut.putText(outBuffer);
                            terminated = true;
                        }
                        i++;
                    }
                }
            }

        }

        /**
         * Internal function for reads which takes into account
         * memory protection.
         *
         * Should be used for ALL reads within CPU.
         *
         * Returns value on success
         * Returns false on failure. Indicative of an out of bounds read.
         */
        private protectedRead(index: number): any {
            let adjAddress = index + this.currentPCB.memoryOffset;
            if (this.isOutOfBounds(adjAddress)) {
                return false;
            }
            return _MemManager.readMemory(adjAddress);
        }

        /**
         * Internal function for writes which takes into account
         * memory protection.
         *
         * Should be used for ALL writes within CPU.
         *
         * Returns false on failure. Indicative of an out of bounds write.
         */
        private protectedWrite(index: number, input: number): boolean {
            let adjAddress = index + this.currentPCB.memoryOffset;
            if (this.isOutOfBounds(adjAddress)) {
                return false;
            }
            _MemManager.writeMemory(adjAddress, input);
            return true;
        }

        /**
         * Simple function to determine if memory location is out of bounds
         * Checks for upper and lower bounds
         *
         * Returns true if out of bounds, false if not out of bounds
         */
        private isOutOfBounds(index: number): boolean {
            return (index < this.currentPCB.memoryOffset
            || index > this.currentPCB.memoryOffset + this.currentPCB.memoryRange)
        }
    }
}
