var TSOS;
(function (TSOS) {
    class Control {
        static hostInit() {
            _Canvas = document.getElementById('display');
            _DrawingContext = _Canvas.getContext("2d");
            TSOS.CanvasTextFunctions.enable(_DrawingContext);
            document.getElementById("taHostLog").value = "";
            document.getElementById("btnStartOS").focus();
            if (typeof Glados === "function") {
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }
        static hostLog(msg, source = "?") {
            var clock = _OSclock;
            var now = new Date().getTime();
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
        }
        static hostBtnStartOS_click(btn) {
            btn.disabled = true;
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            document.getElementById("btnSingleStep").disabled = false;
            document.getElementById("display").focus();
            _CPU = new TSOS.Cpu();
            _CPU.init();
            _MemManager = new TSOS.MemManager(256);
            document.getElementById("bannerBranding").innerText = APP_NAME + " " + APP_VERSION;
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap();
        }
        static hostBtnHaltOS_click(btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            _Kernel.krnShutdown();
            clearInterval(_hardwareClockID);
        }
        static hostBtnReset_click(btn) {
            location.reload(true);
        }
        static hostBtnSingleStep_click(btn) {
            if (singleStep) {
                singleStep = false;
                document.getElementById("btnTakeStep").disabled = true;
                document.getElementById("btnSingleStep").value = " SINGLE STEP ";
            }
            else {
                singleStep = true;
                document.getElementById("btnSingleStep").value = "\<SINGLE STEP\>";
                document.getElementById("btnTakeStep").disabled = false;
            }
            canStep = false;
        }
        static hostBtnTakeStep_click(btn) {
            canStep = true;
        }
    }
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=control.js.map