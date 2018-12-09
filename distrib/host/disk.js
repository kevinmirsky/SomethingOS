var TSOS;
(function (TSOS) {
    class Disk {
        constructor(tracks = 4, sectors = 8, blocks = 8, blockSize = 64) {
            this.tracks = tracks;
            this.sectors = sectors;
            this.blocks = blocks;
            this.blockSize = blockSize;
        }
    }
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=disk.js.map