var TSOS;
(function (TSOS) {
    var Pcb = (function () {
        function Pcb(memStart, memRange) {
            this.priority = 99;
            this.state = "NEW";
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.inInstances = false;
            this.memoryOffset = memStart;
            this.memoryRange = memRange;
            this.pid = Pcb.pidCounter++;
            Pcb.instances.push(this);
        }
        Pcb.prototype.dump = function () {
            var output = [];
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
        };
        Pcb.prototype.delete = function () {
            for (var i = 1; i < Pcb.instances.length; i++) {
                if (Pcb.instances[i].pid == this.pid) {
                    Pcb.instances.splice(i, 1);
                    return true;
                }
            }
            return false;
        };
        Pcb.prototype.init = function () {
        };
        Pcb.instances = [];
        Pcb.pidCounter = 0;
        return Pcb;
    }());
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map