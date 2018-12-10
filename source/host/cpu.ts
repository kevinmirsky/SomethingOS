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
        public currentPCB: Pcb;

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {

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
            try {
                this.fetch();
            } catch(e) {
                this.crash(e);
            }

            //Reset step flag for single step
            if (singleStep) {
                canStep = false;
            }
            _Scheduler.incrementQbit();
        }

        /* The hell? Why do these exist?
        Well, dumb me didn't read the instructions closely enough and saw that the program counter
        should never go over 0xFF. Makes sense, but I assumed going over was simply necessary and okay.

        These 2 functions replace calls of this.PC and ++this.PC, and just add the offset. This way
        the old logic can stay. Retrofitting it, essentially.
         */

        private getPC(): number {
            return this.PC + this.currentPCB.memoryOffset;
        }

        private plusPlusGetPC(): number {
            ++this.PC;
            return this.PC + this.currentPCB.memoryOffset;
        }

        public fetch(): void {
            let instruction: number = this.protectedRead(this.getPC());
            //Add memory highlighting
            deviceDisplayDriver.setCurrentOp(this.getPC());
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
                    deviceDisplayDriver.setCurrentParam(this.getPC());
                    this.loadAcc(this.protectedRead(this.getPC()));
                    break;
                }
                case 0xAD: {
                    deviceDisplayDriver.setCurrentParam(this.getPC());
                    deviceDisplayDriver.setCurrentParam(this.getPC() + 1);
                    this.loadAccFromMem(this.protectedRead(this.getPC()), this.protectedRead(this.plusPlusGetPC()));
                    break;
                }
                case 0x8D: {
                    deviceDisplayDriver.setCurrentParam(this.getPC());
                    deviceDisplayDriver.setCurrentParam(this.getPC() + 1);
                    this.storeAcc(this.protectedRead(this.getPC()), this.protectedRead(this.plusPlusGetPC()));
                    break;
                }
                case 0x6D: {
                    deviceDisplayDriver.setCurrentParam(this.getPC());
                    deviceDisplayDriver.setCurrentParam(this.getPC() + 1);
                    this.addWithCarry(this.protectedRead(this.getPC()), this.protectedRead(this.plusPlusGetPC()));
                    break;
                }
                case 0xA2: {
                    deviceDisplayDriver.setCurrentParam(this.getPC());
                    this.loadXReg(this.protectedRead(this.getPC()));
                    break;
                }
                case 0xAE: {
                    deviceDisplayDriver.setCurrentParam(this.getPC());
                    deviceDisplayDriver.setCurrentParam(this.getPC() + 1);
                    this.loadXRegFromMem(this.protectedRead(this.getPC()), this.protectedRead(this.plusPlusGetPC()));
                    break;
                }
                case 0xA0: {
                    deviceDisplayDriver.setCurrentParam(this.getPC());
                    this.loadYReg(this.protectedRead(this.getPC()));
                    break;
                }
                case 0xAC: {
                    deviceDisplayDriver.setCurrentParam(this.getPC());
                    deviceDisplayDriver.setCurrentParam(this.getPC() + 1);
                    this.loadYRegFromMem(this.protectedRead(this.getPC()), this.protectedRead(this.plusPlusGetPC()));
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
                    deviceDisplayDriver.setCurrentParam(this.getPC());
                    deviceDisplayDriver.setCurrentParam(this.getPC() + 1);
                    this.compareToXReg(this.protectedRead(this.getPC()), this.protectedRead(this.plusPlusGetPC()));
                    break;
                }
                case 0xD0: {
                    deviceDisplayDriver.setCurrentParam(this.getPC());
                    this.branchOnNotEqual(this.protectedRead(this.getPC()));
                    break;
                }
                case 0xEE: {
                    deviceDisplayDriver.setCurrentParam(this.getPC());
                    deviceDisplayDriver.setCurrentParam(this.getPC() + 1);
                    this.incrementByte(this.protectedRead(this.getPC()), this.protectedRead(this.plusPlusGetPC()));
                    break;
                }
                case 0xFF: {
                    this.sysCall();
                    break;
                }
                default: {
                    //Invalid OP code! Wanna freak out? Course you do...
                    this.crash("Invalid Opcode " + instruction.toString(16) + ".");
                }
            }
            this.updatePcb();
            if (this.isExecuting == false) {
                //Let's wrap things up here. Pack it into the PCB and set it to done
                    this.currentPCB.state = "COMPLETE";
                    this.updatePcb();
                    let segment = _MemManager.getSegment(this.currentPCB.memoryOffset);
                    if (segment !== null) {
                        // Clear the segment
                        _MemManager.clearRegion(segment.firstByte, segment.getSize());
                        segment.isOccupied = false;
                        // TODO Do same for terminated programs
                    }
                    _Scheduler.runningPcb = null;
                // TODO Communicate with scheduler to let it know it needs to remove!
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
            this.Acc = this.offsetProtectedRead(Utils.byteStitch(smallNum, bigNum));
            this.PC++;
        }

        // 8D - Store accumulator in memory
        private storeAcc(smallNum: number, bigNum: number): void {
            let memLoc = Utils.byteStitch(smallNum, bigNum);
            this.offsetProtectedWrite(memLoc, Utils.byteWrap(this.Acc));
            this.PC++;
        }

        // 6D - Add with carry
        private addWithCarry(smallNum: number, bigNum: number): void {
            this.Acc += this.Acc = this.offsetProtectedRead(Utils.byteStitch(smallNum, bigNum));
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
            this.Xreg = this.offsetProtectedRead(Utils.byteStitch(smallNum, bigNum));
            this.PC++;
        }

        // A0 - Load Y register with constant
        private loadYReg(input): void {
            this.Yreg = input;
            this.PC++;
        }

        // AC - Load Y register from memory
        private loadYRegFromMem(smallNum: number, bigNum: number): void {
            this.Yreg = this.offsetProtectedRead(Utils.byteStitch(smallNum, bigNum));
            this.PC++;
        }

        // EC - Compare a byte in memory to X reg
        private compareToXReg(smallNum: number, bigNum: number): void {
            if (this.Xreg == this.offsetProtectedRead(Utils.byteStitch(smallNum, bigNum))) {
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
                console.log("BEFORE: " + this.PC);
                // 0x100 is the maximum size of the segment. Programs are written around this constant
                this.PC = (this.PC % 0x100);
                console.log("AFTER: " + this.PC);

                /*
                if (this.PC >= this.currentPCB.memoryOffset + this.currentPCB.memoryRange) {

                }
                */

                //this.PC = Utils.byteWrap(this.PC);
            }
            this.PC++;
        }

        // EE - Increment value of byte
        private incrementByte(smallNum: number, bigNum: number): void {
            let value = this.offsetProtectedRead(Utils.byteStitch(smallNum, bigNum)) + 1;
            this.offsetProtectedWrite(Utils.byteStitch(smallNum, bigNum), Utils.byteWrap(value));
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
                        nextValue = this.offsetProtectedRead(Utils.byteWrap(i));
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
        private protectedRead(index: number): number {
            let adjAddress = index;
            if (this.isOutOfBounds(adjAddress)) {
                throw "Memory read access violation." + adjAddress.toString(16);
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
            let adjAddress = index;
            if (this.isOutOfBounds(adjAddress)) {
                throw "Memory write access violation. " + adjAddress.toString(16);
            }
            _MemManager.writeMemory(adjAddress, input);
            return true;
        }

        private offsetProtectedRead(index: number): number {
            index += this.currentPCB.memoryOffset;
            return this.protectedRead(index);
        }

        private offsetProtectedWrite(index: number, input: number) {
            index += this.currentPCB.memoryOffset;
            this.protectedWrite(index, input);
        }

        /**
         * Simple function to determine if memory location is out of bounds
         * Checks for upper and lower bounds
         *
         * Returns true if out of bounds, false if not out of bounds
         */
        private isOutOfBounds(index: number): boolean {
            return (index < this.currentPCB.memoryOffset
            || index >= this.currentPCB.memoryOffset + this.currentPCB.memoryRange)
            /* >= accounts for length. If it was just >, then we'd allow 1 value greater than we should.
            For example:
            if we start at 0x00 and only load in ONE value at 0x00, range would be 1, allowing 0x01 as valid.
            That shouldn't be valid.

            */
        }

        /**
         * Crashes program.
         *
         * msg is an optional message
         */
        private crash(msg?:string) {
            let output = "[ERROR] ";
            if (msg) {
                output += msg;
            } else {
                output += "CPU runtime error."
            }
            _StdOut.putText(output);
            _StdOut.advanceLine();
            _StdOut.putText("Terminating.");
            this.isExecuting = false;
            this.currentPCB.state = "TERMINATED";
            //We're being nice and letting user see what was happening when everything went wrong
            this.updatePcb();
        }

        private updatePcb() {
            this.currentPCB.PC = this.PC;
            this.currentPCB.Acc = this.Acc;
            this.currentPCB.Xreg = this.Xreg;
            this.currentPCB.Yreg = this.Yreg;
            this.currentPCB.Zflag = this.Zflag;
        }
    }
}
