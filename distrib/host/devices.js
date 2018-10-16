var TSOS;
(function (TSOS) {
    var Devices = (function () {
        function Devices() {
            _hardwareClockID = -1;
        }
        Devices.hostClockPulse = function () {
            _OSclock++;
            _Kernel.krnOnCPUClockPulse();
            var date = new Date();
            document.getElementById("bannerTime").innerText = date.toLocaleDateString()
                + "  |  " + date.toLocaleTimeString();
        };
        Devices.hostEnableKeyboardInterrupt = function () {
            document.addEventListener("keydown", Devices.hostOnKeypress, false);
        };
        Devices.hostDisableKeyboardInterrupt = function () {
            document.removeEventListener("keydown", Devices.hostOnKeypress, false);
        };
        Devices.hostOnKeypress = function (event) {
            if (event.target.id === "display") {
                event.preventDefault();
                var params = new Array(event.which, event.shiftKey);
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(KEYBOARD_IRQ, params));
            }
        };
        return Devices;
    }());
    TSOS.Devices = Devices;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=devices.js.map