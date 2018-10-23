var TSOS;
(function (TSOS) {
    class Devices {
        constructor() {
            _hardwareClockID = -1;
        }
        static hostClockPulse() {
            _OSclock++;
            _Kernel.krnOnCPUClockPulse();
            let date = new Date();
            document.getElementById("bannerTime").innerText = date.toLocaleDateString()
                + "  |  " + date.toLocaleTimeString();
        }
        static hostEnableKeyboardInterrupt() {
            document.addEventListener("keydown", Devices.hostOnKeypress, false);
        }
        static hostDisableKeyboardInterrupt() {
            document.removeEventListener("keydown", Devices.hostOnKeypress, false);
        }
        static hostOnKeypress(event) {
            if (event.target.id === "display") {
                event.preventDefault();
                var params = new Array(event.which, event.shiftKey);
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(KEYBOARD_IRQ, params));
            }
        }
    }
    TSOS.Devices = Devices;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=devices.js.map