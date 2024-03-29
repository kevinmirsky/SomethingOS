var TSOS;
(function (TSOS) {
    class deviceDriverDisk extends TSOS.DeviceDriver {
        constructor(disk) {
            super();
            this.disk = disk;
            this.MAX_DATA_LENGTH = this.disk.blockSize - 4;
            this.driverEntry = this.krnDiskDriverEntry;
        }
        krnDiskDriverEntry() {
            this.status = "loaded";
        }
        format() {
            try {
                for (let i = 0; i < this.disk.tracks; i++) {
                    for (let j = 0; j < this.disk.sectors; j++) {
                        for (let k = 0; k < this.disk.blocks; k++) {
                            sessionStorage.setItem(deviceDriverDisk.buildLoc(i, j, k), this.emptyBlock());
                        }
                    }
                }
                return true;
            }
            catch (e) {
                return e;
            }
        }
        emptyBlock() {
            return "0".repeat(this.disk.blockSize);
        }
        emptyDataRegion() {
            return "0".repeat(this.MAX_DATA_LENGTH);
        }
        createFile(name) {
            console.log("\"" + name + "\"");
            if (!name) {
                name = "untitled";
            }
            if (this.find(name) !== false) {
                throw "File already exists.";
            }
            let key = this.nextFreeBlock();
            if (key !== "000") {
                this.setUsed(key, true);
                let next = this.nextFreeBlock(1, 0, 0);
                if (next) {
                    this.setNext(key, next);
                    this.setName(key, name);
                    this.setUsed(next, true);
                }
            }
            else {
                throw "Not enough free blocks on disk.";
            }
            return true;
        }
        swapToDisk(progMem, tsb) {
            let start;
            console.log("TSB is " + tsb);
            if (tsb == null || tsb === "000") {
                start = this.nextFreeBlock(3, 0, 0);
            }
            else {
                start = tsb;
            }
            try {
                this.writeBlocks(start, progMem, 3, 0, 0);
            }
            catch (e) {
                throw "[WARN] HDD at capacity. File partially written.";
            }
            return start;
        }
        readFile(name) {
            let header = this.find(name);
            if (header !== false) {
                let dataStart = this.getNext(header);
                return this.readBlocks(dataStart);
            }
            else {
                return "[ERROR] Could not find file " + name;
            }
        }
        readProgram(tsb) {
            return this.readBlocksRaw(tsb);
        }
        readBlocks(tsb) {
            let next = this.getNext(tsb);
            let data = this.getData(tsb);
            if (next != "000") {
                data += this.readBlocks(next);
            }
            return data;
        }
        readBlocksRaw(tsb) {
            let next = this.getNext(tsb);
            let data = this.getRawData(tsb);
            if (next != "000") {
                data += this.readBlocksRaw(next);
            }
            return data;
        }
        deleteFile(name) {
            if (!name) {
                throw "No filename given to delete";
            }
            let header = this.find(name);
            if (header !== false) {
                this.deleteBlocks(header);
                return true;
            }
            else {
                throw "Could not find file " + name;
            }
        }
        deleteBlocks(tsb) {
            if (tsb != "000") {
                let next = this.getNext(tsb);
                if (next != "000") {
                    this.deleteBlocks(next);
                }
                sessionStorage.setItem(tsb, this.emptyBlock());
            }
        }
        nextFreeBlock(t = 0, s = 0, b = 0) {
            for (let i = t; i < this.disk.tracks; i++) {
                for (let j = s; j < this.disk.sectors; j++) {
                    for (let k = b; k < this.disk.blocks; k++) {
                        let loc = deviceDriverDisk.buildLoc(i, j, k);
                        if (loc == "000") {
                            continue;
                        }
                        let block = sessionStorage.getItem(loc);
                        if (block != "" && this.isEmpty(block)) {
                            return deviceDriverDisk.buildLoc(i, j, k);
                        }
                    }
                }
            }
            console.log("Failed to find free block!");
            return "EEE";
        }
        find(name) {
            for (let i = 0; i < 1; i++) {
                for (let j = 0; j < this.disk.sectors; j++) {
                    for (let k = 0; k < this.disk.blocks; k++) {
                        let data = sessionStorage.getItem(deviceDriverDisk.buildLoc(i, j, k));
                        if (data != null) {
                            let openName = TSOS.Utils.fromHex(data.substr(4));
                            if (openName == name) {
                                return deviceDriverDisk.buildLoc(i, j, k);
                            }
                        }
                        else {
                            throw "Disk access error. Possible issue: Unformatted disk.";
                        }
                    }
                }
            }
            return false;
        }
        ls(args) {
            let files = [];
            for (let i = 0; i < 1; i++) {
                for (let j = 0; j < this.disk.sectors; j++) {
                    for (let k = 0; k < this.disk.blocks; k++) {
                        let loc = deviceDriverDisk.buildLoc(i, j, k);
                        try {
                            if (this.isUsedAt(loc)) {
                                let data = this.getData(loc);
                                if (data.charAt(0) != '.' || args == "-l") {
                                    files.push(this.getData(loc));
                                }
                            }
                        }
                        catch (e) {
                            throw "Disk access error. Possible issue: Unformatted disk.";
                        }
                    }
                }
            }
            console.log(files.toString());
            return files;
        }
        setUsed(key, isUsed) {
            let value = sessionStorage.getItem(key);
            if (value !== null) {
                if (isUsed) {
                    sessionStorage.setItem(key, TSOS.Utils.replaceAt(value, 0, "1"));
                }
                else {
                    sessionStorage.setItem(key, TSOS.Utils.replaceAt(value, 0, "0"));
                }
            }
        }
        getUsedFromString(value) {
            if (value !== null) {
                return value.substring(0, 1);
            }
            else {
                return "E";
            }
        }
        setStringUsed(value, isUsed) {
            if (isUsed) {
                return TSOS.Utils.replaceAt(value, 0, "1");
            }
            else {
                return TSOS.Utils.replaceAt(value, 0, "0");
            }
        }
        setNext(key, tsb) {
            if (tsb.length != 3) {
                throw "Invalid length of next parameter";
            }
            let value = sessionStorage.getItem(key);
            if (value !== null) {
                sessionStorage.setItem(key, TSOS.Utils.replaceAt(value, 1, tsb));
            }
        }
        getNext(key) {
            let value = sessionStorage.getItem(key);
            if (value !== null) {
                return value.substring(1, 4);
            }
            else
                return "000";
        }
        getNextFromString(value) {
            if (value !== null) {
                return value.substring(1, 4);
            }
            else
                return "ERR";
        }
        setName(key, name) {
            let value = sessionStorage.getItem(key);
            if (value !== null) {
                let hexName = "";
                for (let i = 0; i < name.length; i++) {
                    hexName += name.charCodeAt(i).toString(16).toUpperCase().padStart(2, "0");
                }
                hexName += "00";
                value = TSOS.Utils.replaceAt(value, 4, hexName);
                sessionStorage.setItem(key, value);
            }
        }
        setData(key, data) {
            let value = sessionStorage.getItem(key);
            if (value !== null) {
                let hexData = TSOS.Utils.toHex(data);
                console.log("Hex = " + hexData);
                this.writeBlocks(key, hexData);
            }
        }
        getData(key) {
            let value = sessionStorage.getItem(key);
            if (value !== null) {
                value = value.substring(4);
                return TSOS.Utils.fromHex(value);
            }
            else {
                return "";
            }
        }
        getRawData(key) {
            let value = sessionStorage.getItem(key);
            if (value !== null) {
                return value.substring(4);
            }
            else {
                return "";
            }
        }
        getRawDataFromString(value) {
            if (value !== null) {
                return value.substring(4);
            }
            else {
                return "[ERROR] Cannot read. Possible issue: Unformatted disk";
            }
        }
        writeBlocks(key, hexData, t = 1, s = 0, b = 0) {
            let nextData = hexData.substring(this.MAX_DATA_LENGTH);
            if (hexData.length > this.MAX_DATA_LENGTH) {
                hexData = hexData.substring(0, this.MAX_DATA_LENGTH);
            }
            let value = sessionStorage.getItem(key);
            value = this.clearStringData(value);
            value = this.setStringUsed(value, true);
            value = TSOS.Utils.replaceAt(value, 4, hexData);
            sessionStorage.setItem(key, value);
            console.log("Writing " + key + " with " + value);
            if (nextData != "") {
                let nextKey = this.getNext(key);
                console.log("Current val in next " + nextKey);
                if (nextKey == "000") {
                    nextKey = this.nextFreeBlock(t, s, b);
                    console.log("next key set to " + nextKey);
                    if (nextKey === "EEE") {
                        throw "Could not allocate block for file data.";
                    }
                    this.setNext(key, nextKey);
                }
                this.writeBlocks(nextKey, nextData, t, s, b);
            }
        }
        writeFile(name, data) {
            let keyHeader = this.find(name);
            if (keyHeader !== false) {
                let keyDataStart = this.getNext(keyHeader);
                if (keyDataStart != "000") {
                    this.deleteBlocks(keyDataStart);
                    this.setData(keyDataStart, data);
                }
                return true;
            }
            else {
                throw ("Could not find " + name);
            }
        }
        isEmpty(value) {
            return (value.charAt(0) == "0");
        }
        static buildLoc(track, sector, block) {
            return `${track}` + `${sector}` + `${block}`;
        }
        isUsedAt(key) {
            let result = sessionStorage.getItem(key);
            if (result !== null) {
                return (result.charAt(0) == "1");
            }
            else {
                throw "Attempted to check invalid key for storage!";
            }
        }
        clearBlockData(key) {
            let value = sessionStorage.getItem(key);
            value = TSOS.Utils.replaceAt(value, 4, this.emptyDataRegion());
            sessionStorage.setItem(key, value);
        }
        clearStringData(value) {
            return TSOS.Utils.replaceAt(value, 4, this.emptyDataRegion());
        }
    }
    TSOS.deviceDriverDisk = deviceDriverDisk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverDisk.js.map