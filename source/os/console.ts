///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public tabCount = 0, // Number of times user hit tab
                    public tabBuffer = "",  // This stores the starting term a user hit tab on
                    public historyStack = [], // Command history
                    public futureStack = [], // Where we put history we've gone past. Our "Forward" button
                    public openHistoryItem = "" ){ // What we use to store the active history element
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
                if (chr === String.fromCharCode(9)) {  //     Tab
                    /*
                    Tab goes first since it needs to know if it was just pressed before
                     */
                    if (this.tabBuffer === "") {
                        this.tabBuffer = this.buffer;
                    }
                    let completedTerm = _OsShell.cmdComplete(this.tabBuffer, this.tabCount);

                    this.removeText(this.buffer);
                    this.buffer = "";
                    this.putText(completedTerm);
                    this.buffer += completedTerm;

                    if ((completedTerm === this.tabBuffer) && this.tabCount > 0) {
                        //We've completed on this, but no more solutions. Reset to loop tab complete results
                        this.tabCount = 0;
                    } else {
                        this.tabCount++;
                    }
                } else {
                    //Reset tab tools, user is no longer hammering tab
                    this.tabCount = 0;
                    this.tabBuffer = "";
                    if (chr === String.fromCharCode(8)) { //      backspace key
                        if (this.buffer !== "") {
                            this.removeText(this.buffer.slice(-1));
                            this.buffer = this.buffer.slice(0, -1);
                        }
                    } else if(chr === "↑" ) {                    //Up arrow key
                        if (this.historyStack.length > 0) {
                            this.futureStack.push(this.openHistoryItem);
                            this.removeText(this.buffer);
                            this.buffer = "";
                            let recalledLine = this.historyStack.pop();
                            this.putText(recalledLine);
                            this.buffer = recalledLine;
                            this.openHistoryItem = recalledLine;
                        }
                    } else if (chr === "↓") {                   //Down arrow key
                        if (this.futureStack.length > 0) {
                            this.historyStack.push(this.openHistoryItem);
                            this.removeText(this.buffer);
                            this.buffer = "";
                            let recalledLine = this.futureStack.pop();
                            this.putText(recalledLine);
                            this.buffer = recalledLine;
                            this.openHistoryItem = recalledLine;
                        }
                    } else if (chr === String.fromCharCode(13)) { //     Enter key
                        // The enter key marks the end of a console command, so ...
                        // ... tell the shell ...
                        _OsShell.handleInput(this.buffer);
                        this.historyStack.push(this.buffer);
                        this.futureStack = [];
                        this.openHistoryItem = "";
                        // ... and reset our buffer.
                        this.buffer = "";
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
        }

        public putText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                for (let i = 0; i < text.length; i++) {
                    this.putChar(text[i]);
                }
                /*
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
                */

            }
         }

         private putChar(char): void {
             _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, char);

             // Move the current X position.
             var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, char);
             this.currentXPosition = this.currentXPosition + offset;

             if (this.currentXPosition > _Canvas.width - 10) {
                 this.advanceLine();
             }
         }

         public removeText(text): void {
             if (this.currentXPosition <= 0) {
                 this.retreatLine();
             }
            let xOffset = this.currentXPosition - _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
            let yOffset = this.currentYPosition - _DefaultFontSize;
             _DrawingContext.clearRect(xOffset, yOffset, this.currentXPosition,
                 this.currentYPosition + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize));

             //move the current X position
             var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
             this.currentXPosition = this.currentXPosition - offset;

         }

        public advanceLine(): void {
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
                let offset = this.currentYPosition - _Canvas.height + _FontHeightMargin;

                this.moveCanvas(offset);
                this.currentYPosition -= offset;
            }
        }

        public retreatLine(): void {
            this.currentYPosition -= _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            this.reCalcX();
            // TODO wipe line we're leaving
        }

        public reCalcX(): void {
            let correctX = 0;
            let lineCount= 0;

            //We must first account for the prompt or face misalignment!
            correctX += _DrawingContext.measureText(this.currentFont, this.currentFontSize, _OsShell.promptStr);

            for (let i = 0; i < this.buffer.length; i++) {
                //figure out where we SHOULD be, working from the front
                correctX += _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer[i]);
                if ((correctX > _Canvas.width - 10) && i != this.buffer.length - 1) {
                    //We need to go down a line
                    correctX = 0;
                    lineCount++;
                }
            }
            this.currentXPosition = correctX;
        }

        public moveCanvas(amount): void {
            let imgData = _Canvas.getContext("2d").getImageData(0, 0,
                _Canvas.width, this.currentYPosition + _FontHeightMargin);
            this.clearScreen();
            _Canvas.getContext("2d").putImageData(imgData,0, -amount);
        }

    }
 }
