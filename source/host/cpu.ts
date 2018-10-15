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
                    //NO OP. Do nothing!
                    break;
                }
                default: {
                    //DEBUG, remove this
                    this.isExecuting = false;
                }
            }

        }


        // A9 - Load the accumulator with a constant
        public loadAcc(input): void {
            this.Acc = input;
            this.PC++;
        }

        // AD - Load the accumulator from memory
        public loadAccFromMem(input): void {
            this.Acc = _MemManager.readMemory(input);
            this.PC++;
        }

        // 8D - Store accumulator in memory
        public storeAcc(input): void {
            _MemManager.writeMemory(input, this.Acc);
            this.PC++;
        }

        // 6D - Add with carry
        public addWithCarry(input): void {
            this.Acc += _MemManager.readMemory(input);
            this.PC++;
            //So, what exactly do we do when it goes over 2 digits?
            //Memory is constrained to two hex digits. Tien's accepts it, then terminates when it sees it
        }

        // A2 - Load X register with constant
        public loadXReg(input): void {
            this.Xreg = input;
            this.PC++;
        }

        // AE - Load X register from memory
        public loadXRegFromMem(input): void {
            this.Xreg = _MemManager.readMemory(input);
            this.PC++;
        }

        // A0 - Load Y register with constant
        public loadYReg(input): void {
            this.Yreg = input;
            this.PC++;
        }

        // AC - Load Y register from memory
        public loadYRegFromMem(input): void {
            this.Yreg = _MemManager.readMemory(input);
            this.PC++;
        }

    }
}
