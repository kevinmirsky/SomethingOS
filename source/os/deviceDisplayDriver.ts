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
            //Build table
            for (let i = 0; i < mem.length; i++) {
                if (i % ROW_LENGTH === 0) {
                    //New row. Set it up and let's go.
                    row = table.insertRow(-1); //Add bottom most row
                    let cell = row.insertCell(0);
                    cell.innerHTML = "0x" + i.toString(16).toUpperCase().padStart(3, "0");
                    cell.className = "cell-memLabel";
                }
                let cell = row.insertCell(-1);
                cell.id = "cellMem" + i.toString(16).toUpperCase();
                cell.className = "cell-mem";
                cell.innerHTML = mem[i].toString();
            }

            //Build buttons
            let buttonDiv = <HTMLDivElement> document.getElementById("divMemButtons");
            for (let i = 0; i < _MemManager.segments.length; i++) {
                let btn = <HTMLButtonElement> document.createElement("button");
                btn.innerText = "SEG " + i;
                btn.className = "mem_button";
                btn.value = _MemManager.segments[i].firstByte.toString(16).toUpperCase();
                btn.addEventListener("click", (e:Event) => this.scrollTo(btn.value));
                buttonDiv.appendChild(btn);
            }
        }

        public static buildDiskDisplay(): void {
            let row;
            let table = <HTMLTableElement>document.getElementById("tableDisk");
            for (let i = 0; i < _DiskDriver.disk.tracks; i++) {
                for (let j = 0; j < _DiskDriver.disk.sectors; j++) {
                    for (let k = 0; k < _DiskDriver.disk.blocks; k++) {
                        let block:string = deviceDriverDisk.buildLoc(i,j,k);
                        row = table.insertRow(-1);

                        let cell = row.insertCell(-1);
                        cell.id="tsb" + block;
                        cell.innerHTML = block.split('').join(':');

                        cell = row.insertCell(-1);
                        cell.id = "isUsed" + block;

                        cell = row.insertCell(-1);
                        cell.id = "next" + block;

                        cell = row.insertCell(-1);
                        cell.id = "data" + block;
                    }
                }
            }
        }

        public static updateDiskDisplay(): void {
            for (let i = 0; i < _DiskDriver.disk.tracks; i++) {
                for (let j = 0; j < _DiskDriver.disk.sectors; j++) {
                    for (let k = 0; k < _DiskDriver.disk.blocks; k++) {
                        let block:string = deviceDriverDisk.buildLoc(i,j,k);
                        let cell = document.getElementById("isUsed" + block);
                        let data = sessionStorage.getItem(block);
                        cell.innerHTML = _DiskDriver.getUsedFromString(data);

                        cell = document.getElementById("next" + block);
                        cell.innerHTML = _DiskDriver.getNextFromString(data).split('').join(':');

                        cell = document.getElementById("data" + block);
                        cell.innerHTML = _DiskDriver.getRawDataFromString(data);
                    }
                }
            }
        }

        public static scrollTo(cell) {
            let memLoc = document.getElementById("cellMem" + cell);
            memLoc.scrollIntoView();
        }

        public static updateMemory(): void {
            let  mem = _MemManager.memDump();
            for (let i = 0; i < mem.length; i++) {
                let cell = document.getElementById("cellMem"
                    + i.toString(16).toUpperCase());
                cell.innerHTML = mem[i];
            }
        }

        public static setCurrentOp(memLoc: number): void {
            let id = "cellMem" + memLoc.toString(16).toUpperCase();
            let cell = <HTMLTableCellElement> document.getElementById(id);
            cell.className = "cell-mem curOp";
        }

        public static setCurrentParam(memLoc: number): void {
            let id = "cellMem" + memLoc.toString(16).toUpperCase();
            let cell = <HTMLTableCellElement> document.getElementById(id);
            cell.className = "cell-mem curParam";
        }

        public static setCurrentReadWrite(memLoc: number): void {
            let id = "cellMem" + memLoc.toString(16).toUpperCase();
            let cell = <HTMLTableCellElement> document.getElementById(id);
            cell.className = "cell-mem curRW";
        }

        public static resetMemoryHighlights(): void {
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
}