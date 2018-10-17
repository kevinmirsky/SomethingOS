var TSOS;
(function (TSOS) {
    var Kernel = (function () {
        function Kernel() {
        }
        Kernel.prototype.krnBootstrap = function () {
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
            _MemManager.refreshMemoryViewer();
            TSOS.deviceDisplayDriver.displayPcb();
            TSOS.deviceDisplayDriver.displayCpu();
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        };
        Kernel.prototype.krnShutdown = function () {
            this.krnTrace("begin shutdown OS");
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            this.krnTrace("end shutdown OS");
        };
        Kernel.prototype.krnOnCPUClockPulse = function () {
            _MemManager.refreshMemoryViewer();
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
        };
        Kernel.prototype.krnEnableInterrupts = function () {
            TSOS.Devices.hostEnableKeyboardInterrupt();
        };
        Kernel.prototype.krnDisableInterrupts = function () {
            TSOS.Devices.hostDisableKeyboardInterrupt();
        };
        Kernel.prototype.krnInterruptHandler = function (irq, params) {
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
        };
        Kernel.prototype.krnTimerISR = function () {
        };
        Kernel.prototype.krnTrace = function (msg) {
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
        };
        Kernel.prototype.krnTrapError = function (msg) {
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);
            _StdOut.putText("[SYS FAILURE] OS ERROR: " + msg);
            this.krnShutdown();
        };
        return Kernel;
    }());
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=kernel.js.map