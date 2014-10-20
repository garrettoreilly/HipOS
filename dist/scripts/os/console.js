///<reference path="../globals.ts" />
///<reference path="shell.ts" />
/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, commandHistory, present) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            if (commandHistory === void 0) { commandHistory = []; }
            if (present === void 0) { present = 0; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.commandHistory = commandHistory;
            this.present = present;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.bsod = function () {
            _DrawingContext.fillStyle = "rgb(0, 0, 255)";
            _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) {
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    this.addHistory(this.buffer);
                    this.present = this.commandHistory.length;
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                else if (chr === String.fromCharCode(8)) {
                    this.backSpace(this.buffer[this.buffer.length - 1]);
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                }
                else if (chr === String.fromCharCode(9)) {
                    var theRest = _OsShell.tabCompletion(this.buffer);
                    this.putText(theRest);
                    this.buffer += theRest;
                }
                else if (chr === String.fromCharCode(38)) {
                    this.handleHistory("up");
                }
                else if (chr === String.fromCharCode(40)) {
                    this.handleHistory("down");
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
            }
        };
        Console.prototype.addHistory = function (text) {
            this.commandHistory.push(text);
        };
        Console.prototype.handleHistory = function (arrow) {
            if (arrow.localeCompare("up") == 0) {
                if (this.present - 1 >= 0) {
                    this.present--;
                    this.backSpace(this.buffer);
                    this.buffer = "";
                    this.putText(this.commandHistory[this.present]);
                    this.buffer = this.commandHistory[this.present];
                }
            }
            else if (arrow.localeCompare("down") == 0) {
                if (this.present + 1 <= this.commandHistory.length) {
                    this.present++;
                    this.backSpace(this.buffer);
                    this.buffer = "";
                    if (this.present != this.commandHistory.length) {
                        this.putText(this.commandHistory[this.present]);
                        this.buffer = this.commandHistory[this.present];
                    }
                }
            }
        };
        Console.prototype.putText = function (text) {
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
                if (this.currentXPosition >= _Canvas.width - 8) {
                    this.advanceLine();
                }
            }
        };
        Console.prototype.backSpace = function (text) {
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
            _DrawingContext.clearRect(this.currentXPosition - offset, this.currentYPosition - _DefaultFontSize - _FontHeightMargin, offset, 5 + _DefaultFontSize + _FontHeightMargin);
            this.currentXPosition = this.currentXPosition - offset;
        };
        Console.prototype.advanceLine = function () {
            if (this.currentYPosition >= _Canvas.height - (_DefaultFontSize + _FontHeightMargin)) {
                var pixels = _DrawingContext.getImageData(0, _DefaultFontSize + _FontHeightMargin, _Canvas.width, _Canvas.height);
                this.clearScreen();
                _DrawingContext.putImageData(pixels, 0, 0);
                this.currentXPosition = 0;
            }
            else {
                this.currentXPosition = 0;
                this.currentYPosition += _DefaultFontSize + _FontHeightMargin;
            }
        };
        return Console;
    })();
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
