module TSOS {

    export class Scheduler {
        readyQueue = new Queue();
        runningPcb: Pcb;
        QBIT_LENGTH: number = 6;
        QbitState: number = 1;

        private runProcess(pcb: Pcb) {
            this.runningPcb = pcb;
            if (pcb) {
                if (pcb.memoryOffset == -1) {
                    //Not in memory! On disk!
                    let segment = _MemManager.getFreeSegment(pcb.memoryRange);
                    if (!segment) {
                        // Need to swap one out
                        // Select someone to evict

                        //Future enhancement: Add more eviction methods (LRU?)
                        this.randomEviction(); // Random Eviction!

                        // Now that space exists, we can get some
                        segment = _MemManager.getFreeSegment(pcb.memoryRange);
                    }
                    this.loadFromDisk(pcb, segment);
                }

                pcb.state = "RUNNING";
                _CPU.init(); //Reset any lingering values
                _CPU.PC = pcb.PC;
                _CPU.Acc = pcb.Acc;
                _CPU.Xreg = pcb.Xreg;
                _CPU.Yreg = pcb.Yreg;
                _CPU.Zflag = pcb.Zflag;
                _CPU.currentPCB = pcb;
                _CPU.isExecuting = true;
            } else {
                _StdOut.putText("[ERROR] Could not find PID");
            }
        }

        private randomEviction() {
            let randVal = Math.floor(Math.random() * _MemManager.segments.length);
            let seg = _MemManager.segments[randVal];
            let memStart = seg.firstByte;
            let pcb = Pcb.getFromMemLoc(memStart);


            let memData  = _MemManager.readMemory(memStart, seg.getSize());
            let diskLoc = _DiskDriver.swapToDisk(memData.join(''), pcb.hddTsb);

            pcb.memoryOffset = -1; // Mark as on disk
            pcb.hddTsb = diskLoc;
            //Clean up
            _MemManager.clearRegion(seg.firstByte, seg.getSize());
            seg.isOccupied = false;
        }


        private loadFromDisk(pcb, seg) {
            let data = _DiskDriver.readProgram(pcb.hddTsb);
            let hexValues = data.match(/.{1,2}/g);
            hexValues = hexValues.slice(0, 256); // Cut to size of memory segment
            _MemManager.writeMemory(seg.firstByte, hexValues);
            pcb.memoryOffset = seg.firstByte;
            seg.isOccupied = true;
        }

        public setRunning(incomingPcb: Pcb) {
            //Unload
            this.runningPcb.state = "WAITING";
            this.runningPcb.PC = _CPU.PC;
            this.runningPcb.Acc = _CPU.Acc;
            this.runningPcb.Xreg = _CPU.Xreg;
            this.runningPcb.Yreg = _CPU.Yreg;
            this.runningPcb.Zflag = _CPU.Zflag;
            this.readyQueue.enqueue(this.runningPcb);
            this.QbitState = 1;

            //Load
            this.runProcess(incomingPcb);
        }

        /**
         * This function holds the main logic of the scheduler.
         * This runs before the CPU cycle
         *
         * NOT IN USE
         */
        public scheduleTick() {
            //TODO DO IT WITH INTERRUPTS YOU DUMMY
            if (_CPU.isExecuting) {
                //Something's running, let's do something

                //We just ran, so increment QbitState
                this.QbitState++;

                //Check if it's time to switch
                if (this.QbitState >= this.QBIT_LENGTH) {
                    //It's time to switch!
                    if (!this.readyQueue.isEmpty()) {
                        this.setRunning(this.readyQueue.dequeue());
                    }
                }
            } else {
                //Nothing's running. Should there be?
                if (!this.readyQueue.isEmpty()) {
                    // Something's waiting! Let's get it going!
                    let runningPcb = this.readyQueue.dequeue();
                    this.runProcess(runningPcb);
                }
            }
        }

        /**
         * Meant to be called from CPU
         */
        public incrementQbit() {
            if (_CPU.isExecuting) {
                this.QbitState++;
                //TODO ensure no Off by one error here
                if (this.QbitState > this.QBIT_LENGTH) {
                    //It's time to switch!
                    if(!this.readyQueue.isEmpty()) {
                        _KernelInterruptQueue.enqueue(new Interrupt(2, "SWAP"));
                    } else {
                        this.QbitState = 1;
                    }
                }
            }
        }

        public checkIfWaiting() {
            if ((!this.readyQueue.isEmpty()) && _CPU.isExecuting == false) {
                _KernelInterruptQueue.enqueue(new Interrupt(2, "LOAD"));
            }
        }

        public runNext() {
            let runningPcb = this.readyQueue.dequeue();
            _Kernel.krnTrace("Running PID " + runningPcb.pid);
            this.runProcess(runningPcb);
        }

        public requestRun(program: Pcb) {
            if(program.state == "NEW") {
                _Scheduler.readyQueue.enqueue(program);
            } else {
                _StdOut.putText("[ERROR] Program already scheduled or completed.");
            }
        }

    }
}