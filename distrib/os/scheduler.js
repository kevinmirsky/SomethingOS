var TSOS;
(function (TSOS) {
    class Scheduler {
        constructor() {
            this.readyQueue = new TSOS.Queue();
            this.QBIT_LENGTH = 6;
            this.QbitState = 1;
            this.schedule = "RR";
            this.validSchedules = ["RR", "FCFS", "PRIORITY"];
        }
        runProcess(pcb) {
            this.runningPcb = pcb;
            if (pcb) {
                if (pcb.memoryOffset == -1) {
                    let segment = _MemManager.getFreeSegment(pcb.memoryRange);
                    if (!segment) {
                        this.randomEviction();
                        segment = _MemManager.getFreeSegment(pcb.memoryRange);
                    }
                    this.loadFromDisk(pcb, segment);
                }
                pcb.state = "RUNNING";
                _CPU.init();
                _CPU.PC = pcb.PC;
                _CPU.Acc = pcb.Acc;
                _CPU.Xreg = pcb.Xreg;
                _CPU.Yreg = pcb.Yreg;
                _CPU.Zflag = pcb.Zflag;
                _CPU.currentPCB = pcb;
                _CPU.isExecuting = true;
            }
            else {
                _StdOut.putText("[ERROR] Could not find PID");
            }
        }
        randomEviction() {
            let randVal = Math.floor(Math.random() * _MemManager.segments.length);
            let seg = _MemManager.segments[randVal];
            let memStart = seg.firstByte;
            let pcb = TSOS.Pcb.getFromMemLoc(memStart);
            let memData = _MemManager.readMemory(memStart, seg.lastByte);
            let hexData = "";
            for (let i = 0; i < memData.length; i++) {
                hexData += memData[i].toString(16).padStart(2, "0");
            }
            let diskLoc = _DiskDriver.swapToDisk(hexData, pcb.hddTsb);
            pcb.memoryOffset = -1;
            pcb.hddTsb = diskLoc;
            _MemManager.clearRegion(seg.firstByte, seg.getSize());
            seg.isOccupied = false;
        }
        loadFromDisk(pcb, seg) {
            let data = _DiskDriver.readProgram(pcb.hddTsb);
            let hexValues = data.match(/.{1,2}/g);
            hexValues = hexValues.slice(0, 256);
            _MemManager.writeMemory(seg.firstByte, hexValues);
            pcb.memoryOffset = seg.firstByte;
            seg.isOccupied = true;
        }
        setRunning(incomingPcb) {
            this.runningPcb.state = "WAITING";
            this.runningPcb.PC = _CPU.PC;
            this.runningPcb.Acc = _CPU.Acc;
            this.runningPcb.Xreg = _CPU.Xreg;
            this.runningPcb.Yreg = _CPU.Yreg;
            this.runningPcb.Zflag = _CPU.Zflag;
            this.readyQueue.enqueue(this.runningPcb);
            this.QbitState = 1;
            this.runProcess(incomingPcb);
        }
        scheduleTick() {
            if (_CPU.isExecuting) {
                this.QbitState++;
                if (this.QbitState >= this.QBIT_LENGTH) {
                    if (!this.readyQueue.isEmpty()) {
                        this.setRunning(this.readyQueue.dequeue());
                    }
                }
            }
            else {
                if (!this.readyQueue.isEmpty()) {
                    let runningPcb = this.readyQueue.dequeue();
                    this.runProcess(runningPcb);
                }
            }
        }
        incrementQbit() {
            if (_CPU.isExecuting) {
                this.QbitState++;
                if (this.QbitState > this.QBIT_LENGTH && this.schedule == "RR") {
                    if (!this.readyQueue.isEmpty()) {
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(2, "SWAP"));
                    }
                    else {
                        this.QbitState = 1;
                    }
                }
            }
        }
        roundRobin() {
        }
        checkIfWaiting() {
            if ((!this.readyQueue.isEmpty()) && _CPU.isExecuting == false) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(2, "LOAD"));
            }
        }
        runNext() {
            let runningPcb;
            if (this.schedule == "PRIORITY") {
                let highestPriorityPcb = this.readyQueue.q[0];
                console.log(this.readyQueue.q);
                for (let i = 1; i < this.readyQueue.getSize(); i++) {
                    if (this.readyQueue.q[i].priority < highestPriorityPcb.priority) {
                        highestPriorityPcb = this.readyQueue.q[i];
                    }
                }
                runningPcb = highestPriorityPcb;
                this.readyQueue.q.splice(this.readyQueue.q.indexOf(runningPcb), 1);
            }
            else {
                runningPcb = this.readyQueue.dequeue();
            }
            _Kernel.krnTrace("Running PID " + runningPcb.pid);
            this.QbitState = 1;
            this.runProcess(runningPcb);
        }
        requestRun(program) {
            if (program.state == "NEW") {
                _Scheduler.readyQueue.enqueue(program);
            }
            else {
                _StdOut.putText("[ERROR] Program already scheduled or completed.");
            }
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map