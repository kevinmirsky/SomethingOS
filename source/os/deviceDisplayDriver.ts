module TSOS {
    /*
    This class is meant to control the display of various system
     */
    export class deviceDisplayDriver extends DeviceDriver {

        public static displayPcb(): void {
            let pcbTable = <HTMLTableElement>document.getElementById("tablePcb");

            Pcb.instances.forEach(function (value) {
                let pcbRow = <HTMLTableRowElement>document.getElementById("pcbRow" + value.pid);

                //Check if the row exists. If so, just update
                if (pcbRow) {
                    //TODO Update content
                    let pcbData = value.dump();
                    for (let i = 0; i < pcbData.length; i++) {
                        let cell = document.getElementById(pcbData[i][0]);
                        cell.innerHTML = pcbData[i][1];
                    }

                } else {
                    //We have to make one
                    pcbRow = pcbTable.insertRow(1);
                    pcbRow.id = "pcbRow" + value.pid;

                    let pcbData = value.dump();
                    for (let i = 0; i < pcbData.length; i++) {
                        let cell = pcbRow.insertCell(i);
                        cell.id = pcbData[i][0];
                        cell.innerHTML = pcbData[i][1];
                    }

                    //let cell = pcbRow.insertCell(0);

                    //cell.innerHTML = value.pid.toString();
                }

                //TODO Remove finished processes?
            })

            /*
            Pcb.instances.forEach(function (value) {
                let pcbTable = <HTMLTableElement>document.getElementById("tablePcb");
                let row = pcbTable.insertRow(1);
                let cell = row.insertCell(0);
                cell.innerText = value.pid.toString();


            })
            */

        }

        public static displayCpu(): void {
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

        public static buildMemoryDisplay(): void {
            /*
            This function should only be called once!

            This builds the memory table's initial structure so we can update
            it more smoothly per cycle.
             */
            let ROW_LENGTH = 8;

            let mem = _MemManager.memDump();
            let table = <HTMLTableElement>document.getElementById("tableMemory");
            let row;
            for (let i = 0; i < mem.length; i++) {
                if (i % ROW_LENGTH === 0) {
                    //New row. Set it up and let's go.
                    row = table.insertRow(-1); //Add bottom most row
                    let cell = row.insertCell(0);
                    cell.innerHTML = "0x" + i.toString(16).toUpperCase().padStart(3, "0");
                }
                let cell = row.insertCell(-1);
                cell.id = "cellMem" + i.toString(16).toUpperCase();
                cell.innerHTML = mem[i];
            }
        }

        public static updateMemory(): void {
            let  mem = _MemManager.memDump();
            for (let i = 0; i < mem.length; i++) {
                let cell = document.getElementById("cellMem"
                    + i.toString(16).toUpperCase());
                cell.innerHTML = mem[i];
            }
        }
    }
}