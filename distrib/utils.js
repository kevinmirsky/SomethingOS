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
    }
    TSOS.Utils = Utils;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=utils.js.map