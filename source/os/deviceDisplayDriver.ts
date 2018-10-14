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

                } else {
                    //We have to make one
                    pcbRow = pcbTable.insertRow(1);
                    pcbRow.id = "pcbRow" + value.pid;

                    let pcbData = value.dump();
                    for (let i = 0; i < pcbData.length; i++) {
                        let cell = pcbRow.insertCell(i);
                        console.log(pcbData.toString());
                        cell.id = pcbData[i][0];
                        cell.innerHTML = pcbData[i][1];
                    }

                    //let cell = pcbRow.insertCell(0);

                    //cell.innerHTML = value.pid.toString();
                }
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

        public displayMemory(): void {
            //We'll migrate the code here later
        }
    }
}