var TSOS;
(function (TSOS) {
    var Pcb = /** @class */ (function () {
        function Pcb(memStart, memRange) {
            this.priority = 99; //No give priority? No get priority!
            this.state = "NEW";
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            //internal flags
            this.inInstances = false;
            this.memoryStart = memStart;
            this.memoryRange = memRange;
            //Assign pid, and increment counter for later
            this.pid = Pcb.pidCounter++;
            Pcb.instances.push(this);
        }
        //TODO Add getters and setters for values. I don't want these freely accessible
        Pcb.prototype.init = function () {
        };
        Pcb.instances = [];
        Pcb.pidCounter = 0; // Use to know what PID is next to go. May want to make more robust
        return Pcb;
    }());
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
