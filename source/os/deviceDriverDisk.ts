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

        private  emptyDataRegion() {
            return "0".repeat(this.MAX_DATA_LENGTH);
        }

        private createFile(name:string) {
            console.log("\"" + name + "\"");
            if (!name) {
                name = "untitled";
            }
            /*
            HEADER STRUCTURE
            IND
             0  | USED - <0/1>
            1-3 | NEXT - <TSB>
             4+ | NAME - <ASCII VALUE OF NAME> Terminate in 00?
             */
            if (this.find(name) !== false) {
                throw "File already exists.";
            }

            let key = this.nextFreeBlock();
            if (key !== "000") {
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
                throw "Not enough free blocks on disk."
            }

            // TODO CHECK IF NAME EXISTS ALREADY
            return true;
        }

        swapToDisk(progMem:string, tsb?:string) {
            let start;
            console.log("TSB is " + tsb);
            if (tsb == null  || tsb === "000" ) {
                // No provided spot, we need to find one
                start = this.nextFreeBlock(3, 0, 0);
            } else {
                start = tsb;
            }

            try {
                this.writeBlocks(start, progMem, 3, 0, 0);
            } catch (e) {
                throw "[WARN] HDD at capacity. File partially written."
            }

            return start; // We should check for failure...
        }

        readFile(name:string) {
            let header = this.find(name);
            if (header !== false) {
                // We found it
                let dataStart = this.getNext(header);
                return this.readBlocks(dataStart);
            } else {
                return "[ERROR] Could not find file " + name;
            }
        }

        readProgram(tsb:string) {
            return this.readBlocksRaw(tsb);
        }

        readBlocks(tsb:string) {
            let next = this.getNext(tsb);
            let data = this.getData(tsb);

            if (next != "000") {
                data += this.readBlocks(next);
            }
            return data;
        }

        readBlocksRaw(tsb:string) {
            let next = this.getNext(tsb);
            let data = this.getRawData(tsb);

            if (next != "000") {
                data += this.readBlocksRaw(next);
            }
            return data;
        }

        deleteFile(name:string) {
            if (!name) {
                throw "No filename given to delete";
            }
            let header = this.find(name);
            if (header !== false) {
                // We found it
                this.deleteBlocks(header);
                return true;
            } else {
                throw "Could not find file " + name;
            }
        }

        deleteBlocks(tsb:string) {
            if (tsb != "000") { // Avoid clearing 000 by mistake. Redundant, yes. But I'm working quickly here
                let next = this.getNext(tsb);
                if (next != "000") {
                    this.deleteBlocks(next);
                }
                sessionStorage.setItem(tsb, this.emptyBlock());
            }
        }

        nextFreeBlock(t:number = 0, s:number = 0, b:number = 0) {
            for (let i = t; i < this.disk.tracks; i++) {
                for (let j = s; j < this.disk.sectors; j++) {
                    for (let k = b; k < this.disk.blocks; k++) {
                        let loc = deviceDriverDisk.buildLoc(i,j,k);
                        if (loc == "000") {
                            continue; // Avoid using the Master Block. It's reserved!
                        }
                        let block = sessionStorage.getItem(loc);
                        if (block != "" && this.isEmpty(block)) {
                            return deviceDriverDisk.buildLoc(i,j,k);
                        }
                    }
                }
            }
            //Couldn't find anything. Failure!
            console.log("Failed to find free block!");
            return "EEE"; // ERROR ERROR ERROR
        }

        /*
        * Returns <tsb> if found
        *         false if not
         */
        find(name:string) {
            // Quickest to match against hex values
            // Parsing each file would be more work.
            /*
            for (let i = 0; i < name.length; i++) {
                hexName+= name.charCodeAt(i).toString(16).toUpperCase().padStart(2, "0");
            }
            hexName += "00";
            */
            //limit to region data values stored?
            for (let i = 0; i < 1; i++) {
                for (let j = 0; j < this.disk.sectors; j++) {
                    for (let k = 0; k < this.disk.blocks; k++) {
                        let data = sessionStorage.getItem(deviceDriverDisk.buildLoc(i,j,k));
                        if (data != null) {
                            let openName = Utils.fromHex(data.substr(4));
                            if (openName == name) {
                                return deviceDriverDisk.buildLoc(i,j,k);
                            }
                        } else {
                            throw "Disk access error. Possible issue: Unformatted disk."
                        }
                    }
                }
            }
            // Could not find.
            return false;
        }

        ls(args) {
            let files = [];
            for (let i = 0; i < 1; i++) {
                for (let j = 0; j < this.disk.sectors; j++) {
                    for (let k = 0; k < this.disk.blocks; k++) {
                        let loc = deviceDriverDisk.buildLoc(i,j,k);
                        try {
                            if (this.isUsedAt(loc)) {
                                let data = this.getData(loc);
                                if (data.charAt(0) != '.' || args == "-l") {
                                    files.push(this.getData(loc));
                                }
                            }
                        } catch (e) {
                            // Change the error to something more user understandable.
                            throw "Disk access error. Possible issue: Unformatted disk.";
                        }
                    }
                }
            }
            console.log(files.toString());
            return files;
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

        getUsedFromString(value:string) {
            if (value !== null) {
                return value.substring(0,1);
            } else {
                return "E"; // Error!
            }
        }

        setStringUsed(value: string, isUsed: boolean) {
            if (isUsed) {
               return Utils.replaceAt(value, 0, "1");
            } else {
               return Utils.replaceAt(value, 0, "0");
            }
        }

        /*
        * REQUIRES VALUE IN TSB FORMAT!
         */
        setNext(key, tsb) {
            if (tsb.length != 3) {
                throw "Invalid length of next parameter";
            }
            let value = sessionStorage.getItem(key);
            if (value !== null) {
                sessionStorage.setItem(key, Utils.replaceAt(value, 1, tsb));
            }
        }

        getNext(key) {
            let value = sessionStorage.getItem(key);
            if (value !== null) {
                return value.substring(1,4);
            }
            else return "000"; // The "no next" value
        }

        getNextFromString(value:string) {
            if (value !== null) {
                return value.substring(1,4);
            }
            else return "ERR"; //Since this is for display output, we can pass a warning instead
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
                // Is this really necessary? We know EOF is reached because no next pointers...
                // Note, doesn't account for renaming, currently assumes empty
                value = Utils.replaceAt(value, 4, hexName);
                sessionStorage.setItem(key, value);
            }
        }

        setData(key, data) {
            // TODO CHECK IF NAME TOO LONG
            let value = sessionStorage.getItem(key);
            if (value !== null) {
                let hexData = Utils.toHex(data);
                //hexData += "00"; //Terminator
                // Is this really necessary? We know EOF is reached because no next pointers...

                console.log("Hex = " + hexData);
                this.writeBlocks(key, hexData);
                // Note, doesn't account for renaming, currently assumes empty

                /*
                value = this.clearStringData(value);
                if (hexData.length > this.MAX_DATA_LENGTH) {
                    let nextValue = data.substring(this.MAX_DATA_LENGTH);
                    value = value.substring(0, this.MAX_DATA_LENGTH);

                    //TODO Store and allocate secondary blocks!
                }
                value = Utils.replaceAt(value, 4, hexData);
                */

            }
        }

        getData(key) {
            let value = sessionStorage.getItem(key);
            if (value !== null) {
                value = value.substring(4);
                return Utils.fromHex(value);
            } else {
                return "";
            }
        }

        getRawData(key) {
            let value = sessionStorage.getItem(key);
            if (value !== null) {
                return value.substring(4);
            } else {
                return "";
            }
        }

        getRawDataFromString(value:string) {
            if (value !== null) {
                return value.substring(4);
            } else {
                return "[ERROR] Cannot read. Possible issue: Unformatted disk";
            }
        }

        private writeBlocks(key, hexData, t:number = 1, s:number = 0, b:number = 0) {
            let nextData = hexData.substring(this.MAX_DATA_LENGTH); // Get all text after max
            if (hexData.length > this.MAX_DATA_LENGTH) {
                hexData = hexData.substring(0, this.MAX_DATA_LENGTH);
                //TODO Store and allocate secondary blocks!
            }
            let value = sessionStorage.getItem(key);
            value = this.clearStringData(value);

            value = this.setStringUsed(value, true);
            value = Utils.replaceAt(value, 4, hexData); // Add data

            sessionStorage.setItem(key, value); // Edit disk
            console.log("Writing " + key + " with " + value);

            //Check if we need another block
            if (nextData != "") {
                //This means we have more to write
                let nextKey = this.getNext(key);
                console.log("Current val in next " + nextKey);
                if (nextKey == "000") {
                    // No block already allocated!
                    nextKey = this.nextFreeBlock(t, s, b);
                    console.log("next key set to " + nextKey);
                    if (nextKey === "EEE") {
                        // Failure
                        throw "Could not allocate block for file data.";

                        // Should we instead allow a partially written file?
                    }
                    this.setNext(key, nextKey);
                }
                this.writeBlocks(nextKey, nextData, t, s, b);
                // TODO REMINDER! DO CLEAN UP IF SHORTER
            }

            // Proposal: Check how many blocks needed first, then check if possible?
        }


        writeFile(name, data) {
            let keyHeader = this.find(name);
            if (keyHeader !== false) {
                let keyDataStart = this.getNext(keyHeader);
                if (keyDataStart != "000") { // 000 is reserved, so if it points there, no good
                    this.deleteBlocks(keyDataStart); // Clear previous contents
                    this.setData(keyDataStart, data);
                }
                return true;
            } else {
                throw ("Could not find " + name);
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


        isUsedAt(key) {
            let result = sessionStorage.getItem(key);
            if (result !== null) {
                return (result.charAt(0) == "1");
            } else {
                throw "Attempted to check invalid key for storage!";
                //return false;
            }
        }

        /*
        * Meant to quickly clear out a block's data for overwriting
         */
        clearBlockData(key) {
            let value = sessionStorage.getItem(key);
            value = Utils.replaceAt(value,4,this.emptyDataRegion());
            sessionStorage.setItem(key, value);
        }

        /*
        * When you're editing a block locally, just use this to clear the
        * data without read/writes
         */
        clearStringData(value) {
            return Utils.replaceAt(value,4, this.emptyDataRegion());
        }
    }
}