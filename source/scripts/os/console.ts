///<reference path="../globals.ts" />
///<reference path="shell.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "") {

        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                } else if (chr === String.fromCharCode(8)) {
                    this.backSpace(this.buffer[this.buffer.length - 1]);
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                } else if (chr === String.fromCharCode(9)) {
                    this.complete(this.buffer);
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        }

        public putText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);

                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
         }

        public backSpace(text): void {
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
            _DrawingContext.clearRect(this.currentXPosition - offset, this.currentYPosition - _DefaultFontSize - _FontHeightMargin, offset, 5 + _DefaultFontSize + _FontHeightMargin);
            this.currentXPosition = this.currentXPosition - offset;
        }

        public advanceLine(): void {
            if (this.currentYPosition >= _Canvas.height - (_DefaultFontSize + _FontHeightMargin)) {
                var pixels = _DrawingContext.getImageData(0, _DefaultFontSize + _FontHeightMargin, _Canvas.width, _Canvas.height);
                this.clearScreen();
                _DrawingContext.putImageData(pixels, 0, 0);
                this.currentXPosition = 0;
            } else {
                this.currentXPosition = 0;
                this.currentYPosition += _DefaultFontSize + _FontHeightMargin;
            }
        }

        public complete(text): void {
            for (var i in _OsShell.commandList) {
                if (text.localeCompare(i.command.slice(0, text.length - 1)) == 0) {
                    for (var j in i.command.slice(4, -1)) {
                        this.putText(j);
                        this.buffer += j;
                    }
                    break;
                }
            }
        }
    }
 }
