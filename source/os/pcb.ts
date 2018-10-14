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


        //TODO Add getters and setters for values. I don't want these freely accessible


        public init(): void {
        }
    }
}