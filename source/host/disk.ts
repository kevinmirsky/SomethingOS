module TSOS {

    export class Disk {

        constructor(public tracks: number = 4,
                    public sectors: number = 8,
                    public blocks: number = 8,
                    public blockSize: number = 64) {
        }
    }

}