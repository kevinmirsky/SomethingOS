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
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.fetch();

            //Reset step flag for single step
            if (singleStep) {
                canStep = false;
            }
        }

        public fetch(): void {
            let instruction: number = _MemManager.readMemory(this.PC);
            this.PC++;

            //Decode
            //While we could store next value ahead of time, if we go out of bounds, we'll error out
            switch(instruction) {
                case 0xA9: {
                    this.loadAcc(_MemManager.readMemory(this.PC));
                    break;
                }
                case 0xAD: {
                    this.loadAccFromMem(_MemManager.readMemory(this.PC), _MemManager.readMemory(++this.PC));
                    break;
                }
                case 0x8D: {
                    this.storeAcc(_MemManager.readMemory(this.PC), _MemManager.readMemory(++this.PC));
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
                    //NO OP. Do nothing!
                    break;
                }
                case 0x00: {
                    //Break. End execution
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
                case 0xFF: {
                    this.sysCall();
                    break;
                }
                default: {
                    //DEBUG, remove this
                    this.isExecuting = false;
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
        private addWithCarry(input): void {
            this.Acc += _MemManager.readMemory(input);
            this.Acc = Utils.byteWrap(this.Acc);
            this.PC++;
        }

        // A2 - Load X register with constant
        private loadXReg(input): void {
            this.Xreg = input;
            this.PC++;
        }

        // AE - Load X register from memory
        private loadXRegFromMem(input): void {
            this.Xreg = _MemManager.readMemory(input);
            this.PC++;
        }

        // A0 - Load Y register with constant
        private loadYReg(input): void {
            this.Yreg = input;
            this.PC++;
        }

        // AC - Load Y register from memory
        private loadYRegFromMem(input): void {
            this.Yreg = _MemManager.readMemory(input);
            this.PC++;
        }

        // EC - Compare a byte in memory to X reg
        private compareToXReg(input): void {
            if (this.Xreg == _MemManager.readMemory(input)) {
                this.Zflag = 1;
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
        private incrementByte(input): void {
            let value = _MemManager.readMemory(input) + 1;
            _MemManager.writeMemory(input, Utils.byteWrap(value));
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
    }
}
