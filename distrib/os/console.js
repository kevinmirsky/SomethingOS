///<reference path="../globals.ts" />
/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = /** @class */ (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, tabCount, tabBuffer) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            if (tabCount === void 0) { tabCount = 0; }
            if (tabBuffer === void 0) { tabBuffer = ""; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.tabCount = tabCount;
            this.tabBuffer = tabBuffer;
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
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(9)) { //     Tab
                    /*
                    Tab goes first since it needs to know if it was just pressed before
                     */
                    if (this.tabBuffer === "") {
                        this.tabBuffer = this.buffer;
                    }
                    var completedTerm = _OsShell.cmdComplete(this.tabBuffer, this.tabCount);
                    this.removeText(this.buffer);
                    this.buffer = "";
                    this.putText(completedTerm);
                    this.buffer += completedTerm;
                    if ((completedTerm === this.tabBuffer) && this.tabCount > 0) {
                        //We've completed on this, but no more solutions. Reset to loop tab complete results
                        this.tabCount = 0;
                    }
                    else {
                        this.tabCount++;
                    }
                }
                else {
                    //Reset tab tools, user is no longer hammering tab
                    this.tabCount = 0;
                    this.tabBuffer = "";
                    if (chr === String.fromCharCode(8)) { //      backspace key
                        if (this.buffer !== "") {
                            this.removeText(this.buffer.slice(-1));
                            this.buffer = this.buffer.slice(0, -1);
                        }
                    }
                    else if (chr === String.fromCharCode(13)) { //     Enter key
                        // The enter key marks the end of a console command, so ...
                        // ... tell the shell ...
                        _OsShell.handleInput(this.buffer);
                        // ... and reset our buffer.
                        this.buffer = "";
                    }
                    else {
                        // This is a "normal" character, so ...
                        // ... draw it on the screen...
                        this.putText(chr);
                        // ... and add it to our buffer.
                        this.buffer += chr;
                    }
                    // TODO: Write a case for Ctrl-C.
                }
            }
        };
        Console.prototype.putText = function (text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        };
        Console.prototype.removeText = function (text) {
            var xOffset = this.currentXPosition - _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
            var yOffset = this.currentYPosition - _DefaultFontSize;
            _DrawingContext.clearRect(xOffset, yOffset, this.currentXPosition, this.currentYPosition + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize));
            //move the current X position
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
            this.currentXPosition = this.currentXPosition - offset;
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            //Check if we need to scroll the view
            if (this.currentYPosition > _Canvas.height) {
                //Amount we've gone offscreen
                var offset = this.currentYPosition - _Canvas.height + _FontHeightMargin;
                this.moveCanvas(offset);
                this.currentYPosition -= offset;
            }
        };
        Console.prototype.moveCanvas = function (amount) {
            var imgData = _Canvas.getContext("2d").getImageData(0, 0, _Canvas.width, this.currentYPosition + _FontHeightMargin);
            this.clearScreen();
            _Canvas.getContext("2d").putImageData(imgData, 0, -amount);
        };
        return Console;
    }());
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
