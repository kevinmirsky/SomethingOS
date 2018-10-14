module TSOS {

    export class Pcb {

        public static instances: Pcb[] = [];
        private static pidCounter = 0; // Use to know what PID is next to go. May want to make more robust

        //PCB elements
        public readonly pid: number;
        public priority: number = 99; //No give priority? No get priority!
        public state: string = "NEW";
        private PC = 0;
        private Acc: number = 0;
        private Xreg: number = 0;
        private Yreg: number = 0;
        private Zflag: number = 0;
        private memoryOffset: number;
        private memoryRange: number;

        //internal flags
        private inInstances = false;

        constructor(memStart: number, memRange: number) {
            this.memoryOffset = memStart;
            this.memoryRange = memRange;

            //Assign pid, and increment counter for later
            this.pid = Pcb.pidCounter++;
            Pcb.instances.push(this);
        }

        public dump(): [string,string][] {
            let output:[string,string][] = [];
            output.push(["cellPid" + this.pid, this.pid.toString()]);
            output.push(["cellPriority" + this.pid, this.priority.toString()]);
            output.push(["cellPriority" + this.state, this.state.toString()]);
            output.push(["cellPC" + this.pid, this.PC.toString()]);
            output.push(["cellAcc" + this.pid, this.Acc.toString()]);
            output.push(["cellXreg" + this.pid, this.Xreg.toString()]);
            output.push(["cellYreg" + this.pid, this.Yreg.toString()]);
            output.push(["cellZflag" + this.pid, this.Zflag.toString()]);
            output.push(["cellmemoryOffset" + this.pid, this.memoryOffset.toString()]);
            output.push(["cellmemoryRange" + this.pid, this.memoryRange.toString()]);
            return output;
    }


        //TODO Add getters and setters for values. I don't want these freely accessible


        public init(): void {
        }
    }
}