var TSOS;
(function (TSOS) {
    var Console = (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, tabCount, tabBuffer, historyStack, futureStack, openHistoryItem) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            if (tabCount === void 0) { tabCount = 0; }
            if (tabBuffer === void 0) { tabBuffer = ""; }
            if (historyStack === void 0) { historyStack = []; }
            if (futureStack === void 0) { futureStack = []; }
            if (openHistoryItem === void 0) { openHistoryItem = ""; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.tabCount = tabCount;
            this.tabBuffer = tabBuffer;
            this.historyStack = historyStack;
            this.futureStack = futureStack;
            this.openHistoryItem = openHistoryItem;
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
                var chr = _KernelInputQueue.dequeue();
                if (chr === String.fromCharCode(9)) {
                    if (this.tabBuffer === "") {
                        this.tabBuffer = this.buffer;
                    }
                    var completedTerm = _OsShell.cmdComplete(this.tabBuffer, this.tabCount);
                    this.removeText(this.buffer);
                    this.buffer = "";
                    this.putText(completedTerm);
                    this.buffer += completedTerm;
                    if ((completedTerm === this.tabBuffer) && this.tabCount > 0) {
                        this.tabCount = 0;
                    }
                    else {
                        this.tabCount++;
                    }
                }
                else {
                    this.tabCount = 0;
                    this.tabBuffer = "";
                    if (chr === String.fromCharCode(8)) {
                        if (this.buffer !== "") {
                            this.removeText(this.buffer.slice(-1));
                            this.buffer = this.buffer.slice(0, -1);
                        }
                    }
                    else if (chr === "↑") {
                        if (this.historyStack.length > 0) {
                            this.futureStack.push(this.openHistoryItem);
                            this.removeText(this.buffer);
                            this.buffer = "";
                            var recalledLine = this.historyStack.pop();
                            this.putText(recalledLine);
                            this.buffer = recalledLine;
                            this.openHistoryItem = recalledLine;
                        }
                    }
                    else if (chr === "↓") {
                        if (this.futureStack.length > 0) {
                            this.historyStack.push(this.openHistoryItem);
                            this.removeText(this.buffer);
                            this.buffer = "";
                            var recalledLine = this.futureStack.pop();
                            this.putText(recalledLine);
                            this.buffer = recalledLine;
                            this.openHistoryItem = recalledLine;
                        }
                    }
                    else if (chr === String.fromCharCode(13)) {
                        _OsShell.handleInput(this.buffer);
                        this.historyStack.push(this.buffer);
                        this.futureStack = [];
                        this.openHistoryItem = "";
                        this.buffer = "";
                    }
                    else {
                        this.putText(chr);
                        this.buffer += chr;
                    }
                }
            }
        };
        Console.prototype.putText = function (text) {
            if (text !== "") {
                for (var i = 0; i < text.length; i++) {
                    this.putChar(text[i]);
                }
            }
        };
        Console.prototype.putChar = function (char) {
            _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, char);
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, char);
            this.currentXPosition = this.currentXPosition + offset;
            if (this.currentXPosition > _Canvas.width - 10) {
                this.advanceLine();
            }
        };
        Console.prototype.removeText = function (text) {
            if (this.currentXPosition <= 0) {
                this.retreatLine();
            }
            var xOffset = this.currentXPosition - _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
            var yOffset = this.currentYPosition - _DefaultFontSize;
            _DrawingContext.clearRect(xOffset, yOffset, this.currentXPosition, this.currentYPosition + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize));
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
            this.currentXPosition = this.currentXPosition - offset;
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            if (this.currentYPosition > _Canvas.height) {
                var offset = this.currentYPosition - _Canvas.height + _FontHeightMargin;
                this.moveCanvas(offset);
                this.currentYPosition -= offset;
            }
        };
        Console.prototype.retreatLine = function () {
            this.currentYPosition -= _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            this.reCalcX();
        };
        Console.prototype.reCalcX = function () {
            var correctX = 0;
            var lineCount = 0;
            correctX += _DrawingContext.measureText(this.currentFont, this.currentFontSize, _OsShell.promptStr);
            for (var i = 0; i < this.buffer.length; i++) {
                correctX += _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer[i]);
                if ((correctX > _Canvas.width - 10) && i != this.buffer.length - 1) {
                    correctX = 0;
                    lineCount++;
                }
            }
            this.currentXPosition = correctX;
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
//# sourceMappingURL=console.js.map