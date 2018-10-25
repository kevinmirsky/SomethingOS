var TSOS;
(function (TSOS) {
    class Kernel {
        krnBootstrap() {
            TSOS.Control.hostLog("bootstrap", "host");
            _KernelInterruptQueue = new TSOS.Queue();
            _KernelBuffers = new Array();
            _KernelInputQueue = new TSOS.Queue();
            _Console = new TSOS.Console();
            _Console.init();
            _StdIn = _Console;
            _StdOut = _Console;
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new TSOS.DeviceDriverKeyboard();
            _krnKeyboardDriver.driverEntry();
            this.krnTrace(_krnKeyboardDriver.status);
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new TSOS.Shell();
            _OsShell.init();
            TSOS.deviceDisplayDriver.buildMemoryDisplay();
            TSOS.deviceDisplayDriver.displayPcb();
            TSOS.deviceDisplayDriver.displayCpu();
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }
        krnShutdown() {
            this.krnTrace("begin shutdown OS");
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            this.krnTrace("end shutdown OS");
        }
        krnOnCPUClockPulse() {
            TSOS.deviceDisplayDriver.updateMemory();
            TSOS.deviceDisplayDriver.displayPcb();
            TSOS.deviceDisplayDriver.displayCpu();
            if (_KernelInterruptQueue.getSize() > 0) {
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            }
            else if (singleStep) {
                if (canStep && _CPU.isExecuting) {
                    _CPU.cycle();
                }
            }
            else if (_CPU.isExecuting) {
                _CPU.cycle();
            }
            else {
                this.krnTrace("Idle");
            }
        }
        krnEnableInterrupts() {
            TSOS.Devices.hostEnableKeyboardInterrupt();
        }
        krnDisableInterrupts() {
            TSOS.Devices.hostDisableKeyboardInterrupt();
        }
        krnInterruptHandler(irq, params) {
            this.krnTrace("Handling IRQ~" + irq);
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);
                    _StdIn.handleInput();
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }
        krnTimerISR() {
        }
        krnTrace(msg) {
            if (_Trace) {
                if (msg === "Idle") {
                    if (_OSclock % 10 == 0) {
                        TSOS.Control.hostLog(msg, "OS");
                    }
                }
                else {
                    TSOS.Control.hostLog(msg, "OS");
                }
            }
        }
        krnTrapError(msg) {
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);
            _StdOut.putText("[SYS FAILURE] OS ERROR: " + msg);
            this.krnShutdown();
        }
    }
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=kernel.js.map