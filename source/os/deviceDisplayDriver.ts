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

            cellIsExec.innerHTML = _CPU.isExecuting.toString();
            cellPC.innerHTML = _CPU.PC.toString();
            cellAcc.innerHTML = _CPU.Acc.toString();
            cellXreg.innerHTML = _CPU.Xreg.toString();
            cellYreg.innerHTML = _CPU.Yreg.toString();
            cellZflag.innerHTML = _CPU.Zflag.toString();
        }

        public displayMemory(): void {
            //We'll migrate the code here later
        }
    }
}