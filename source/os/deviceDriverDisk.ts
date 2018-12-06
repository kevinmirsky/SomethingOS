module TSOS {
    /*
    This class is meant to control the display of various system
     */
    export class deviceDriverDisk extends DeviceDriver {
        constructor(private disk: Disk) {

            super();
            this.driverEntry = this.krnDiskDriverEntry;
        }

        MAX_DATA_LENGTH = this.disk.blockSize - 4;
        // 4 accounts for used bit and tsm bits;
        // Should account for terminator byte (00) for names!

        public krnDiskDriverEntry() {
            this.status = "loaded";
        }

        public format() {
            try {
                for (let i = 0; i < this.disk.tracks; i++) {
                    for (let j = 0; j < this.disk.sectors; j++) {
                        for (let k = 0; k < this.disk.blocks; k++) {
                            sessionStorage.setItem(deviceDriverDisk.buildLoc(i, j, k), this.emptyBlock());
                        }
                    }
                }
                return true;
            } catch (e) {
                return e;
            }
        }

        private emptyBlock() {
            return "0".repeat(this.disk.blockSize);
        }

        private createFile(name:string) {
            /*
            HEADER STRUCTURE
            IND
             0  | USED - <0/1>
            1-3 | NEXT - <TSB>
             4+ | NAME - <ASCII VALUE OF NAME> Terminate in 00?
             */
            if (this.find(name) !== false) {
                return false;
            }

            let key = this.nextFreeBlock();
            if (key !== false) {
                //Move set used until we know we can allocate space for internals?
                this.setUsed(key, true);
                let next = this.nextFreeBlock(1,0,0);
                if (next) {
                    this.setNext(key, next);
                    this.setName(key, name);

                    this.setUsed(next,true);
                    //TODO UPDATE NEXT FILE
                }
            } else {
                return false;
                // TODO HANDLE FAILURE
            }

            // TODO CHECK IF NAME EXISTS ALREADY
            return true;
        }

        nextFreeBlock(t:number = 0, s:number = 0, b:number = 0) {
            for (let i = t; i < this.disk.tracks; i++) {
                for (let j = s; j < this.disk.sectors; j++) {
                    for (let k = b; k < this.disk.blocks; k++) {
                        let block = sessionStorage.getItem(deviceDriverDisk.buildLoc(i,j,k));
                        if (block && this.isEmpty(block)) {
                            return deviceDriverDisk.buildLoc(i,j,k);
                        }
                    }
                }
            }
            //Couldn't find anything. Failure!
            console.log("Failed to find free block!");
            return false;
        }

        find(name:string) {
            // Quickest to match against hex values
            // Parsing each file would be more work.
            let hexName = "";
            for (let i = 0; i < name.length; i++) {
                hexName+= name.charCodeAt(i).toString(16).toUpperCase().padStart(2, "0");
            }
            hexName += "00";

            //limit to region data values stored?
            for (let i = 0; i < 1; i++) {
                for (let j = 0; j < this.disk.sectors; j++) {
                    for (let k = 0; k < this.disk.blocks; k++) {
                        let data = sessionStorage.getItem(deviceDriverDisk.buildLoc(i,j,k)).substr(4);
                        if (data.includes(hexName)) {
                            return deviceDriverDisk.buildLoc(i,j,k);
                        }
                    }
                }
            }
            // Could not find.
            return false;
        }


        /*
        * File metadata Util functions
        *
        * Used to easily update info about files
        *
        * Note: Yes, I realize these would cause a LOT of I/O hits if this was a real disk,
        * but it's not, and we're working with JS which has immutable
        * strings, so we inherently need to read, then write.
        *
         */
        setUsed(key, isUsed:boolean) {
            let value = sessionStorage.getItem(key);
            if (value !== null) {
                if (isUsed) {
                    sessionStorage.setItem(key, Utils.replaceAt(value, 0, "1"));
                } else {
                    sessionStorage.setItem(key, Utils.replaceAt(value, 0, "0"));
                }
            }
        }

        /*
        * REQUIRES VALUE IN TSB FORMAT!
         */
        setNext(key, tsm) {
            if (tsm.length != 3) {
                throw "Invalid length of next parameter";
            }
            let value = sessionStorage.getItem(key);
            if (value !== null) {
                sessionStorage.setItem(key, Utils.replaceAt(value, 1, tsm));
            }
        }



        setName(key, name) {
            // TODO CHECK IF NAME TOO LONG
            let value = sessionStorage.getItem(key);
            if (value !== null) {
                let hexName = "";
                for (let i = 0; i < name.length; i++) {
                    hexName+= name.charCodeAt(i).toString(16).toUpperCase().padStart(2, "0");
                }
                hexName += "00"; //Terminator
                value = Utils.replaceAt(value, 4, hexName);
                sessionStorage.setItem(key, value);
            }
        }

        isEmpty(value) {
            return (value.charAt(0) == "0")
        }

        /*
        * Builds structure of key for session storage
        *
        * May seem a little pointless, but originally the values
        * were separated, so this sticks around. Helpful still as
        * it makes it easier to avoid doing integer operations by mistake.
         */
        public static buildLoc(track, sector, block): string {
            return  `${track}` + `${sector}` + `${block}`;
        }


        isEmptyAt(key) {
            let result = sessionStorage.getItem(key);
            if (result !== null) {
                return (result.charAt(0) == "0")
            } else {
                throw "Attempted to check invalid key for storage!";
                //return false;
            }
        }
    }
}