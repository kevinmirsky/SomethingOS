var TSOS;
(function (TSOS) {
    class Utils {
        static trim(str) {
            return str.replace(/^\s+ | \s+$/g, "");
        }
        static rot13(str) {
            var retVal = "";
            for (var i in str) {
                var ch = str[i];
                var code = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) + 13;
                    retVal = retVal + String.fromCharCode(code);
                }
                else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) - 13;
                    retVal = retVal + String.fromCharCode(code);
                }
                else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        }
        static byteWrap(num) {
            return num % 0x100;
        }
        static byteStitch(smallNum, bigNum) {
            bigNum = bigNum * 0x100;
            return (smallNum + bigNum);
        }
        static replaceAt(string, index, replace) {
            return string.substring(0, index) + replace + string.substring(index + replace.length);
        }
        static toHex(text) {
            let hexName = "";
            for (let i = 0; i < text.length; i++) {
                hexName += text.charCodeAt(i).toString(16).toUpperCase().padStart(2, "0");
            }
            return hexName;
        }
        static fromHex(text) {
            let output = "";
            let hexValues = text.match(/.{1,2}/g);
            for (let i = 0; i < hexValues.length; i++) {
                if (hexValues[i] != "00") {
                    output += String.fromCharCode(parseInt(hexValues[i], 16));
                }
            }
            return output;
        }
    }
    TSOS.Utils = Utils;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=utils.js.map