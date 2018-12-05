module TSOS {
    /*
    This class is meant to control the display of various system
     */
    export class deviceDriverDisk extends DeviceDriver {
        constructor(private disk: Disk) {

            super();
            this.driverEntry = this.krnDiskDriverEntry;
        }

        public krnDiskDriverEntry() {
            this.status = "loaded";
        }

        public format() {
            for (let i = 0; i < this.disk.tracks; i++) {
                for (let j = 0; j < this.disk.sectors; j++) {
                    for (let k = 0; k < this.disk.blocks; k++) {
                        sessionStorage.setItem(deviceDriverDisk.buildLoc(i,j,k), this.emptyBlock());
                    }
                }
            }
        }

        public static buildLoc(track, sector, block): string {
            return track + ":" + sector + ":" + block;

        }

        private emptyBlock() {
            return "0".repeat(this.disk.blockSize);
        }

    }
}