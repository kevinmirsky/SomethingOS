module TSOS {

    export class Pcb {

        public static instances: Pcb[] = [];
        private static pidCounter = 0; // Use to know what PID is next to go. May want to make more robust

        //PCB elements
        public readonly pid: number;
        public priority: number = 99; //No give priority? No get priority!
        public state: string = "NEW";
        public PC = 0;
        private Acc: number = 0;
        private Xreg: number = 0;
        private Yreg: number = 0;
        private Zflag: number = 0;
        public memoryOffset: number;
        public memoryRange: number;

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
            output.push(["cellState" + this.pid, this.state.toString()]);
            output.push(["cellPC" + this.pid, this.PC.toString(16)]);
            output.push(["cellAcc" + this.pid, this.Acc.toString(16)]);
            output.push(["cellXreg" + this.pid, this.Xreg.toString(16)]);
            output.push(["cellYreg" + this.pid, this.Yreg.toString(16)]);
            output.push(["cellZflag" + this.pid, this.Zflag.toString(16)]);
            output.push(["cellmemoryOffset" + this.pid, this.memoryOffset.toString(16)]);
            output.push(["cellmemoryRange" + this.pid, this.memoryRange.toString()]);
            return output;
    }

    public delete(): boolean {
            for (let i = 1; i < Pcb.instances.length; i++) {
                if (Pcb.instances[i].pid == this.pid) {
                    Pcb.instances.splice(i, 1);
                    return true;
                }
            }
            return false;
    }

    public static getFromPid(pid: number): any {
        for (let i = 0; i < Pcb.instances.length; i++) {
            if (Pcb.instances[i].pid == pid) {
                return Pcb.instances[i];
            }
        }
        return false;
    }

        public static getRunning(): any {
            for (let i = 0; i < Pcb.instances.length; i++) {
                if (Pcb.instances[i].state == "RUNNING") {
                    return Pcb.instances[i];
                }
            }
            return false;
        }


        //TODO Add getters and setters for values. I don't want these freely accessible


        public init(): void {
        }
    }
}