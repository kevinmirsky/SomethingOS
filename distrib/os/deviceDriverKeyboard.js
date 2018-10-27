var TSOS;
(function (TSOS) {
    class DeviceDriverKeyboard extends TSOS.DeviceDriver {
        constructor() {
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }
        krnKbdDriverEntry() {
            this.status = "loaded";
        }
        krnKbdDispatchKeyPress(params) {
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            if (((keyCode >= 65) && (keyCode <= 90)) ||
                ((keyCode >= 97) && (keyCode <= 123))) {
                chr = String.fromCharCode(keyCode + 32);
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode >= 188) && (keyCode <= 191)) {
                chr = String.fromCharCode((keyCode - 144));
                if (isShifted) {
                    chr = String.fromCharCode(keyCode - 128);
                    if (keyCode == 189) {
                        chr = "_";
                    }
                }
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode >= 219) && (keyCode <= 221)) {
                chr = String.fromCharCode((keyCode - 128));
                if (isShifted) {
                    chr = String.fromCharCode(keyCode - 96);
                }
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 186) {
                chr = String.fromCharCode((keyCode - 127));
                if (isShifted) {
                    chr = ":";
                }
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 187) {
                chr = String.fromCharCode((keyCode - 126));
                if (isShifted) {
                    chr = "+";
                }
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 192) {
                chr = String.fromCharCode((keyCode - 96));
                if (isShifted) {
                    chr = "~";
                }
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 222) {
                chr = String.fromCharCode((keyCode - 183));
                if (isShifted) {
                    chr = "\"";
                }
                _KernelInputQueue.enqueue(chr);
            }
            else if (((keyCode >= 48) && (keyCode <= 57)) ||
                (keyCode == 32) ||
                (keyCode == 13) ||
                (keyCode == 8) ||
                (keyCode == 9)) {
                chr = String.fromCharCode(keyCode);
                if (isShifted) {
                    switch (keyCode) {
                        case 48:
                            chr = ")";
                            break;
                        case 49:
                            chr = "!";
                            break;
                        case 50:
                            chr = "@";
                            break;
                        case 51:
                            chr = "#";
                            break;
                        case 52:
                            chr = "$";
                            break;
                        case 53:
                            chr = "%";
                            break;
                        case 54:
                            chr = "^";
                            break;
                        case 55:
                            chr = "&";
                            break;
                        case 56:
                            chr = "*";
                            break;
                        case 57:
                            chr = "(";
                            break;
                    }
                }
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode >= 37 && keyCode <= 40) {
                switch (keyCode) {
                    case 37:
                        chr = "←";
                        break;
                    case 38:
                        chr = "↑";
                        break;
                    case 39:
                        chr = "→";
                        break;
                    case 40:
                        chr = "↓";
                        break;
                }
                _KernelInputQueue.enqueue(chr);
            }
        }
    }
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverKeyboard.js.map