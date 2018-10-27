var TSOS;
(function (TSOS) {
    class Console {
        constructor(currentFont = _DefaultFontFamily, currentFontSize = _DefaultFontSize, currentXPosition = 0, currentYPosition = _DefaultFontSize, buffer = "", tabCount = 0, tabBuffer = "", historyStack = [], futureStack = [], openHistoryItem = "") {
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
        init() {
            this.clearScreen();
            this.resetXY();
        }
        clearScreen() {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }
        resetXY() {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }
        handleInput() {
            while (_KernelInputQueue.getSize() > 0) {
                var chr = _KernelInputQueue.dequeue();
                if (chr === String.fromCharCode(9)) {
                    if (this.tabBuffer === "") {
                        this.tabBuffer = this.buffer;
                    }
                    let completedTerm = _OsShell.cmdComplete(this.tabBuffer, this.tabCount);
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
                            let recalledLine = this.historyStack.pop();
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
                            let recalledLine = this.futureStack.pop();
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
        }
        putText(text) {
            if (text !== "") {
                for (let i = 0; i < text.length; i++) {
                    this.putChar(text[i]);
                }
            }
        }
        putChar(char) {
            _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, char);
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, char);
            this.currentXPosition = this.currentXPosition + offset;
            if (this.currentXPosition > _Canvas.width - 10) {
                this.advanceLine();
            }
        }
        removeText(text) {
            if (this.currentXPosition <= 0) {
                this.retreatLine();
            }
            let xOffset = this.currentXPosition - _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
            let yOffset = this.currentYPosition - _DefaultFontSize;
            _DrawingContext.clearRect(xOffset, yOffset, this.currentXPosition, this.currentYPosition + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize));
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
            this.currentXPosition = this.currentXPosition - offset;
        }
        advanceLine() {
            this.currentXPosition = 0;
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            if (this.currentYPosition > _Canvas.height) {
                let offset = this.currentYPosition - _Canvas.height + _FontHeightMargin;
                this.moveCanvas(offset);
                this.currentYPosition -= offset;
            }
        }
        retreatLine() {
            this.currentYPosition -= _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            this.reCalcX();
        }
        reCalcX() {
            let correctX = 0;
            let lineCount = 0;
            correctX += _DrawingContext.measureText(this.currentFont, this.currentFontSize, _OsShell.promptStr);
            for (let i = 0; i < this.buffer.length; i++) {
                correctX += _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer[i]);
                if ((correctX > _Canvas.width - 10) && i != this.buffer.length - 1) {
                    correctX = 0;
                    lineCount++;
                }
            }
            this.currentXPosition = correctX;
        }
        moveCanvas(amount) {
            let imgData = _Canvas.getContext("2d").getImageData(0, 0, _Canvas.width, this.currentYPosition + _FontHeightMargin);
            this.clearScreen();
            _Canvas.getContext("2d").putImageData(imgData, 0, -amount);
        }
    }
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=console.js.map