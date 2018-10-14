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
    /*
    This class is meant to control the display of various system
     */
    var deviceDisplayDriver = /** @class */ (function (_super) {
        __extends(deviceDisplayDriver, _super);
        function deviceDisplayDriver() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        deviceDisplayDriver.displayPcb = function () {
            var pcbTable = document.getElementById("tablePcb");
            TSOS.Pcb.instances.forEach(function (value) {
                var pcbRow = document.getElementById("pcbRow" + value.pid);
                //Check if the row exists. If so, just update
                if (pcbRow) {
                    //TODO Update content
                    var pcbData = value.dump();
                    for (var i = 0; i < pcbData.length; i++) {
                        var cell = document.getElementById(pcbData[i][0]);
                        cell.innerHTML = pcbData[i][1];
                    }
                }
                else {
                    //We have to make one
                    pcbRow = pcbTable.insertRow(1);
                    pcbRow.id = "pcbRow" + value.pid;
                    var pcbData = value.dump();
                    for (var i = 0; i < pcbData.length; i++) {
                        var cell = pcbRow.insertCell(i);
                        cell.id = pcbData[i][0];
                        cell.innerHTML = pcbData[i][1];
                    }
                    //let cell = pcbRow.insertCell(0);
                    //cell.innerHTML = value.pid.toString();
                }
                //TODO Remove finished processes?
            });
            /*
            Pcb.instances.forEach(function (value) {
                let pcbTable = <HTMLTableElement>document.getElementById("tablePcb");
                let row = pcbTable.insertRow(1);
                let cell = row.insertCell(0);
                cell.innerText = value.pid.toString();


            })
            */
        };
        deviceDisplayDriver.prototype.displayMemory = function () {
            //We'll migrate the code here later
        };
        return deviceDisplayDriver;
    }(TSOS.DeviceDriver));
    TSOS.deviceDisplayDriver = deviceDisplayDriver;
})(TSOS || (TSOS = {}));
