var TSOS;
(function (TSOS) {
    class deviceDisplayDriver extends TSOS.DeviceDriver {
        static displayPcb() {
            let pcbTable = document.getElementById("tablePcb");
            TSOS.Pcb.instances.forEach(function (value) {
                let pcbRow = document.getElementById("pcbRow" + value.pid);
                if (pcbRow) {
                    let pcbData = value.dump();
                    for (let i = 0; i < pcbData.length; i++) {
                        let cell = document.getElementById(pcbData[i][0]);
                        cell.innerHTML = pcbData[i][1];
                    }
                }
                else {
                    pcbRow = pcbTable.insertRow(1);
                    pcbRow.id = "pcbRow" + value.pid;
                    let pcbData = value.dump();
                    for (let i = 0; i < pcbData.length; i++) {
                        let cell = pcbRow.insertCell(i);
                        cell.id = pcbData[i][0];
                        cell.innerHTML = pcbData[i][1];
                    }
                }
            });
        }
        static displayCpu() {
            let cellIsExec = document.getElementById("cellIsExec");
            let cellPC = document.getElementById("cellPC");
            let cellAcc = document.getElementById("cellAcc");
            let cellXreg = document.getElementById("cellXreg");
            let cellYreg = document.getElementById("cellYreg");
            let cellZflag = document.getElementById("cellZflag");
            cellIsExec.innerHTML = _CPU.isExecuting.toString().toUpperCase();
            cellPC.innerHTML = _CPU.PC.toString(16).toUpperCase();
            cellAcc.innerHTML = _CPU.Acc.toString(16).toUpperCase();
            cellXreg.innerHTML = _CPU.Xreg.toString(16).toUpperCase();
            cellYreg.innerHTML = _CPU.Yreg.toString(16).toUpperCase();
            cellZflag.innerHTML = _CPU.Zflag.toString(16).toUpperCase();
        }
        static buildMemoryDisplay() {
            let ROW_LENGTH = 8;
            let mem = _MemManager.memDump();
            let table = document.getElementById("tableMemory");
            let row;
            for (let i = 0; i < mem.length; i++) {
                if (i % ROW_LENGTH === 0) {
                    row = table.insertRow(-1);
                    let cell = row.insertCell(0);
                    cell.innerHTML = "0x" + i.toString(16).toUpperCase().padStart(3, "0");
                    cell.className = "cell-memLabel";
                }
                let cell = row.insertCell(-1);
                cell.id = "cellMem" + i.toString(16).toUpperCase();
                cell.className = "cell-mem";
                cell.innerHTML = mem[i].toString();
            }
            let buttonDiv = document.getElementById("divMemButtons");
            for (let i = 0; i < _MemManager.segments.length; i++) {
                let btn = document.createElement("button");
                btn.innerText = "SEG " + i;
                btn.className = "mem_button";
                btn.value = _MemManager.segments[i].firstByte.toString(16).toUpperCase();
                btn.addEventListener("click", (e) => this.scrollTo(btn.value));
                buttonDiv.appendChild(btn);
            }
        }
        static scrollTo(cell) {
            let memLoc = document.getElementById("cellMem" + cell);
            memLoc.scrollIntoView();
        }
        static updateMemory() {
            let mem = _MemManager.memDump();
            for (let i = 0; i < mem.length; i++) {
                let cell = document.getElementById("cellMem"
                    + i.toString(16).toUpperCase());
                cell.innerHTML = mem[i];
            }
        }
        static setCurrentOp(memLoc) {
            let id = "cellMem" + memLoc.toString(16).toUpperCase();
            let cell = document.getElementById(id);
            cell.className = "cell-mem curOp";
        }
        static setCurrentParam(memLoc) {
            let id = "cellMem" + memLoc.toString(16).toUpperCase();
            let cell = document.getElementById(id);
            cell.className = "cell-mem curParam";
        }
        static setCurrentReadWrite(memLoc) {
            let id = "cellMem" + memLoc.toString(16).toUpperCase();
            let cell = document.getElementById(id);
            cell.className = "cell-mem curRW";
        }
        static resetMemoryHighlights() {
            let params = document.getElementsByClassName("cell-mem curParam");
            while (params.length) {
                params[0].className = "cell-mem";
            }
            let ops = document.getElementsByClassName("cell-mem curOp");
            while (ops.length) {
                ops[0].className = "cell-mem";
            }
        }
    }
    TSOS.deviceDisplayDriver = deviceDisplayDriver;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDisplayDriver.js.map