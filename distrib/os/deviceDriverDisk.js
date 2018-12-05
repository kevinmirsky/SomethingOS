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
            for (let i = 0; i < this.disk.tracks; i++) {
                for (let j = 0; j < this.disk.sectors; j++) {
                    for (let k = 0; k < this.disk.blocks; k++) {
                        sessionStorage.setItem(deviceDriverDisk.buildLoc(i, j, k), this.emptyBlock());
                    }
                }
            }
        }
        static buildLoc(track, sector, block) {
            return track + ":" + sector + ":" + block;
        }
        emptyBlock() {
            return "0".repeat(this.disk.blockSize);
        }
    }
    TSOS.deviceDriverDisk = deviceDriverDisk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverDisk.js.map