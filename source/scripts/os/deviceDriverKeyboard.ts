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
            super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.    TODO: Check that they are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
                ((keyCode >= 97) && (keyCode <= 122))) {  // a..z {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } else if (((keyCode >= 48) && (keyCode <= 57)) ||   // digits
                        (keyCode == 32)                     ||   // space
                        (keyCode == 13)) {                       // enter
                if (isShifted) {
                    if (keyCode == 48) {
                        keyCode = 41;
                    } else if (keyCode == 49) {
                        keyCode = 33;
                    } else if (keyCode == 50) {
                        keyCode = 64;
                    } else if (keyCode == 51) {
                        keyCode = 35; 
                    } else if (keyCode == 52) {
                        keyCode = 36;
                    } else if (keyCode == 53) {
                        keyCode = 37;
                    } else if (keyCode == 54) {
                        keyCode = 94;
                    } else if (keyCode == 55) {
                        keyCode = 38;
                    } else if (keyCode == 56) {
                        keyCode = 42;
                    } else if (keyCode == 57) {
                        keyCode = 40;
                    }
                }
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            } else if ((keyCode >= 186 && keyCode <= 192) ||
                    (keyCode >= 219 && keyCode <= 222) ||
                    (keyCode == 8) || (keyCode == 9) ||
                    (keyCode == 38) || (keyCode == 40)) {
                if (keyCode == 186){
                    if (isShifted) {
                        keyCode = 58;
                    } else {
                        keyCode = 59;
                    }
                } else if (keyCode == 187) {
                    if (isShifted) {
                        keyCode = 43;
                    } else {
                        keyCode = 61;
                    }
                } else if (keyCode == 188) {
                    if (isShifted) {
                        keyCode = 60;
                    } else {
                        keyCode == 44;
                    }
                } else if (keyCode == 189) {
                    if (isShifted) {
                        keyCode = 95;
                    } else {
                        keyCode = 45;
                    }
                } else if (keyCode == 190) {
                    if (isShifted) {
                        keyCode = 62;
                    } else {
                        keyCode = 46;
                    }
                } else if (keyCode == 191) {
                    if (isShifted) {
                        keyCode = 63;
                    } else {
                        keyCode = 47;
                    }
                } else if (keyCode == 192) {
                    if (isShifted) {
                        keyCode = 126;
                    } else {
                        keyCode = 96;
                    }
                } else if (keyCode == 219) {
                    if (isShifted) {
                        keyCode = 123;
                    } else {
                        keyCode = 91;
                    }
                } else if (keyCode == 220) {
                    if (isShifted) {
                        keyCode = 124;
                    } else {
                        keyCode = 92;
                    }
                } else if (keyCode == 221) {
                    if (isShifted) {
                        keyCode = 125;
                    } else {
                        keyCode = 93;
                    }
                } else if (keyCode == 222) {
                    if (isShifted) {
                        keyCode = 34;
                    } else {
                        keyCode = 39;
                    }
                }
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
        }
    }
}
