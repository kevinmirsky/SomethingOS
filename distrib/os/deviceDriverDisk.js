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
        createFile(name) {
            if (this.find(name) !== false) {
                return false;
            }
            let key = this.nextFreeBlock();
            if (key !== false) {
                this.setUsed(key, true);
                let next = this.nextFreeBlock(1, 0, 0);
                if (next) {
                    this.setNext(key, next);
                    this.setName(key, name);
                    this.setUsed(next, true);
                }
            }
            else {
                return false;
            }
            return true;
        }
        nextFreeBlock(t = 0, s = 0, b = 0) {
            for (let i = t; i < this.disk.tracks; i++) {
                for (let j = s; j < this.disk.sectors; j++) {
                    for (let k = b; k < this.disk.blocks; k++) {
                        let block = sessionStorage.getItem(deviceDriverDisk.buildLoc(i, j, k));
                        if (block && this.isEmpty(block)) {
                            return deviceDriverDisk.buildLoc(i, j, k);
                        }
                    }
                }
            }
            console.log("Failed to find free block!");
            return false;
        }
        find(name) {
            let hexName = "";
            for (let i = 0; i < name.length; i++) {
                hexName += name.charCodeAt(i).toString(16).toUpperCase().padStart(2, "0");
            }
            hexName += "00";
            for (let i = 0; i < 1; i++) {
                for (let j = 0; j < this.disk.sectors; j++) {
                    for (let k = 0; k < this.disk.blocks; k++) {
                        let data = sessionStorage.getItem(deviceDriverDisk.buildLoc(i, j, k)).substr(4);
                        if (data.includes(hexName)) {
                            return deviceDriverDisk.buildLoc(i, j, k);
                        }
                    }
                }
            }
            return false;
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
        setNext(key, tsm) {
            if (tsm.length != 3) {
                throw "Invalid length of next parameter";
            }
            let value = sessionStorage.getItem(key);
            if (value !== null) {
                sessionStorage.setItem(key, TSOS.Utils.replaceAt(value, 1, tsm));
            }
        }
        getNext(key) {
            let value = sessionStorage.getItem(key);
            if (value !== null) {
                value.substring(1, 4);
            }
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
        isEmpty(value) {
            return (value.charAt(0) == "0");
        }
        static buildLoc(track, sector, block) {
            return `${track}` + `${sector}` + `${block}`;
        }
        isEmptyAt(key) {
            let result = sessionStorage.getItem(key);
            if (result !== null) {
                return (result.charAt(0) == "0");
            }
            else {
                throw "Attempted to check invalid key for storage!";
            }
        }
    }
    TSOS.deviceDriverDisk = deviceDriverDisk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverDisk.js.map