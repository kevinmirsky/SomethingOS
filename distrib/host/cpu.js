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
var TSOS;
(function (TSOS) {
    var Cpu = /** @class */ (function () {
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
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.fetch();
        };
        Cpu.prototype.fetch = function () {
            var instruction = _MemManager.readMemory(this.PC);
            this.PC++;
            //Decode
            //While we could store next value ahead of time, if we go out of bounds, we'll error out
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
                default: {
                    //DEBUG, remove this
                    this.isExecuting = false;
                }
            }
        };
        // A9 - Load the accumulator with a constant
        Cpu.prototype.loadAcc = function (input) {
            this.Acc = input;
            this.PC++;
        };
        // AD - Load the accumulator from memory
        Cpu.prototype.loadAccFromMem = function (input) {
            this.Acc = _MemManager.readMemory(input);
            this.PC++;
        };
        // 8D - Store accumulator in memory
        Cpu.prototype.storeAcc = function (input) {
            _MemManager.writeMemory(input, this.Acc);
            this.PC++;
        };
        // 6D - Add with carry
        Cpu.prototype.addWithCarry = function (input) {
            this.Acc += _MemManager.readMemory(input);
            this.PC++;
            //So, what exactly do we do when it goes over 2 digits?
            //Memory is constrained to two hex digits. Tien's accepts it, then terminates when it sees it
        };
        // A2 - Load X register with constant
        Cpu.prototype.loadXReg = function (input) {
            this.Xreg = input;
            this.PC++;
        };
        // AE - Load X register from memory
        Cpu.prototype.loadXRegFromMem = function (input) {
            this.Xreg = _MemManager.readMemory(input);
            this.PC++;
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
