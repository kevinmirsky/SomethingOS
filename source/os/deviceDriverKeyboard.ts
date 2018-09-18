///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
                ((keyCode >= 97) && (keyCode <= 123))) {  // a..z {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } else if ((keyCode >= 188) && (keyCode <= 191)) { // handles: , . / -
                chr = String.fromCharCode((keyCode - 144));
                if (isShifted) {
                    chr = String.fromCharCode(keyCode - 128);
                    if (keyCode == 189) {
                        //Why do you have to be THAT guy, key 189?
                        chr = "_";
                    }
                }
                _KernelInputQueue.enqueue(chr);
            } else if ((keyCode >=219) && (keyCode <= 221)) { // handles:  [ ] \
                chr = String.fromCharCode((keyCode - 128));
                if (isShifted) {
                    chr = String.fromCharCode(keyCode - 96);
                }
                _KernelInputQueue.enqueue(chr);
            } else if (keyCode == 186) {                     // handles: ;
                //For consistency's sake, we're still going to use
                //subtraction to get the char code
                chr = String.fromCharCode((keyCode - 127));
                if (isShifted) {
                    chr = ":";
                }
                _KernelInputQueue.enqueue(chr);
            } else if (keyCode == 187) {                     // handles: ;
                //For consistency's sake, we're still going to use
                //subtraction to get the char code
                chr = String.fromCharCode((keyCode - 126));
                if (isShifted) {
                    chr = "+";
                }
                _KernelInputQueue.enqueue(chr);
            } else if (keyCode == 192) {                     // handles: `
                //For consistency's sake, we're still going to use
                //subtraction to get the char code
                chr = String.fromCharCode((keyCode - 96));
                if (isShifted) {
                    chr = "~"
                }
                _KernelInputQueue.enqueue(chr);
            } else if (keyCode == 222) {                     // handles: '
                //For consistency's sake, we're still going to use
                //subtraction to get the char code
                chr = String.fromCharCode((keyCode - 183));
                if (isShifted) {
                    chr = "\"";
                }
                _KernelInputQueue.enqueue(chr);

            } else if (((keyCode >= 48) && (keyCode <= 57)) ||   // digits
                        (keyCode == 32)                     ||   // space
                        (keyCode == 13)                     ||   // enter
                        (keyCode ==  8)                     ||   // backspace
                        (keyCode ==  9) ) {                      // tab
                chr = String.fromCharCode(keyCode);
                //check for shift key
                if (isShifted) {
                    /* There's no real pattern for these... 1 or two may be sequential,
                       but it's not worth being clever for those since it'll just be
                       harder to read.
                     */
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
                        case  55:
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
        }
    }
}
