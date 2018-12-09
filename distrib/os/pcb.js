var TSOS;
(function (TSOS) {
    class Pcb {
        constructor(memStart, memRange) {
            this.priority = 99;
            this.state = "NEW";
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.hddTsb = "000";
            this.inInstances = false;
            this.memoryOffset = memStart;
            this.memoryRange = memRange;
            this.pid = Pcb.pidCounter++;
            Pcb.instances.push(this);
        }
        dump() {
            let output = [];
            output.push(["cellPid" + this.pid, this.pid.toString()]);
            output.push(["cellPriority" + this.pid, this.priority.toString()]);
            output.push(["cellState" + this.pid, this.state.toString()]);
            output.push(["cellPC" + this.pid, this.PC.toString(16)]);
            output.push(["cellAcc" + this.pid, this.Acc.toString(16)]);
            output.push(["cellXreg" + this.pid, this.Xreg.toString(16)]);
            output.push(["cellYreg" + this.pid, this.Yreg.toString(16)]);
            output.push(["cellZflag" + this.pid, this.Zflag.toString(16)]);
            if (this.memoryOffset == -1) {
                output.push(["cellmemoryOffset" + this.pid, "Disk"]);
            }
            else {
                output.push(["cellmemoryOffset" + this.pid, this.memoryOffset.toString(16)]);
            }
            output.push(["cellmemoryRange" + this.pid, this.memoryRange.toString(16)]);
            return output;
        }
        delete() {
            for (let i = 1; i < Pcb.instances.length; i++) {
                if (Pcb.instances[i].pid == this.pid) {
                    Pcb.instances.splice(i, 1);
                    return true;
                }
            }
            return false;
        }
        static getFromPid(pid) {
            for (let i = 0; i < Pcb.instances.length; i++) {
                if (Pcb.instances[i].pid == pid) {
                    return Pcb.instances[i];
                }
            }
            return false;
        }
        static getFromMemLoc(memLoc) {
            for (let i = 0; i < Pcb.instances.length; i++) {
                if (Pcb.instances[i].memoryOffset == memLoc) {
                    return Pcb.instances[i];
                }
            }
            return false;
        }
        static getRunning() {
            for (let i = 0; i < Pcb.instances.length; i++) {
                if (Pcb.instances[i].state == "RUNNING") {
                    return Pcb.instances[i];
                }
            }
            return false;
        }
        init() {
        }
    }
    Pcb.instances = [];
    Pcb.pidCounter = 0;
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map