var TSOS;
(function (TSOS) {
    class deviceDriverDisk extends TSOS.DeviceDriver {
        constructor(disk) {
            super();
            this.disk = disk;
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
            let key = this.nextFreeBlock();
            if (key !== false) {
                this.setUsed(key, true);
                let next = this.nextFreeBlock();
                if (next) {
                    this.setNext(key, next);
                    this.setName(key, name);
                }
            }
            else {
                return false;
            }
            return true;
        }
        nextFreeBlock(t = 0, s = 0, m = 0) {
            for (let i = t; i < this.disk.tracks; i++) {
                for (let j = s; j < this.disk.sectors; j++) {
                    for (let k = m; k < this.disk.blocks; k++) {
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
        setName(key, name) {
            let value = sessionStorage.getItem(key);
            if (value !== null) {
                let hexName = "";
                for (let i = 0; i < name.length; i++) {
                    hexName += name.charCodeAt(i).toString(16).toUpperCase().padStart(2, "0");
                }
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