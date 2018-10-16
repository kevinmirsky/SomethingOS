var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TSOS;
(function (TSOS) {
    var deviceDisplayDriver = (function (_super) {
        __extends(deviceDisplayDriver, _super);
        function deviceDisplayDriver() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        deviceDisplayDriver.displayPcb = function () {
            var pcbTable = document.getElementById("tablePcb");
            TSOS.Pcb.instances.forEach(function (value) {
                var pcbRow = document.getElementById("pcbRow" + value.pid);
                if (pcbRow) {
                    var pcbData = value.dump();
                    for (var i = 0; i < pcbData.length; i++) {
                        var cell = document.getElementById(pcbData[i][0]);
                        cell.innerHTML = pcbData[i][1];
                    }
                }
                else {
                    pcbRow = pcbTable.insertRow(1);
                    pcbRow.id = "pcbRow" + value.pid;
                    var pcbData = value.dump();
                    for (var i = 0; i < pcbData.length; i++) {
                        var cell = pcbRow.insertCell(i);
                        cell.id = pcbData[i][0];
                        cell.innerHTML = pcbData[i][1];
                    }
                }
            });
        };
        deviceDisplayDriver.displayCpu = function () {
            var cellIsExec = document.getElementById("cellIsExec");
            var cellPC = document.getElementById("cellPC");
            var cellAcc = document.getElementById("cellAcc");
            var cellXreg = document.getElementById("cellXreg");
            var cellYreg = document.getElementById("cellYreg");
            var cellZflag = document.getElementById("cellZflag");
            cellIsExec.innerHTML = _CPU.isExecuting.toString().toUpperCase();
            cellPC.innerHTML = _CPU.PC.toString(16).toUpperCase();
            cellAcc.innerHTML = _CPU.Acc.toString(16).toUpperCase();
            cellXreg.innerHTML = _CPU.Xreg.toString(16).toUpperCase();
            cellYreg.innerHTML = _CPU.Yreg.toString(16).toUpperCase();
            cellZflag.innerHTML = _CPU.Zflag.toString(16).toUpperCase();
        };
        deviceDisplayDriver.prototype.displayMemory = function () {
        };
        return deviceDisplayDriver;
    }(TSOS.DeviceDriver));
    TSOS.deviceDisplayDriver = deviceDisplayDriver;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDisplayDriver.js.map