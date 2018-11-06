module TSOS {

    export class Scheduler {
        readyQueue = new Queue();
        runningPcb: Pcb;
        QBIT_LENGTH: number = 6;
        QbitState: number = 0;

        public runProcess(pcb: Pcb) {
            this.runningPcb = pcb;
            if (pcb) {
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

        public swap(incomingPcb: Pcb) {
            //Unload
            this.runningPcb.state = "WAITING";
            this.runningPcb.PC = _CPU.PC;
            this.runningPcb.Acc = _CPU.Acc;
            this.runningPcb.Xreg = _CPU.Xreg;
            this.runningPcb.Yreg = _CPU.Yreg;
            this.runningPcb.Zflag = _CPU.Zflag;
            this.readyQueue.enqueue(this.runningPcb);
            this.QbitState = 0;

            //Load
            this.runProcess(incomingPcb);
        }

        /**
         * This function holds the main logic of the scheduler.
         * This runs before the CPU cycle
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
                        this.swap(this.readyQueue.dequeue());
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
                        this.QbitState = 0;
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
            this.runProcess(runningPcb);
        }

    }
}