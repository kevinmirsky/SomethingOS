/* --------
   Utils.ts

   Utility functions.
   -------- */

module TSOS {

    export class Utils {

        public static trim(str): string {
            // Use a regular expression to remove leading and trailing spaces.
            return str.replace(/^\s+ | \s+$/g, "");
            /*
            Huh? WTF? Okay... take a breath. Here we go:
            - The "|" separates this into two expressions, as in A or B.
            - "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
            - "\s+$" is the same thing, but at the end of the string.
            - "g" makes is global, so we get all the whitespace.
            - "" is nothing, which is what we replace the whitespace with.
            */
        }

        public static rot13(str: string): string {
            /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal: string = "";
            for (var i in <any>str) {    // We need to cast the string to any for use in the for...in construct.
                var ch: string = str[i];
                var code: number = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) + 13;  // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                } else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) - 13;  // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                } else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        }

        public static byteWrap(num: number): number {
            /*
            This function simply keeps a value within the bounds of 1 byte
            This prevents any nasty weirdness from values greater than 0xFF
             */
            return num % 0x100;
        }

        public static byteStitch(smallNum: number, bigNum: number): number {
            /*
            This function takes two hex values and stitches them together in little endian format
             */
            bigNum = bigNum * 0x100;
            return (smallNum + bigNum);
        }

        public static replaceAt(string, index, replace) {
            return string.substring(0, index) + replace + string.substring(index + replace.length);
        }

        public static toHex(text: string) {
            let hexName = "";
            for (let i = 0; i < text.length; i++) {
                hexName+= text.charCodeAt(i).toString(16).toUpperCase().padStart(2, "0");
            }
            return hexName;
        }

        public static fromHex(text: string) {
            let output: string = "";
            let hexValues = text.match(/.{1,2}/g);
            for (let i = 0; i < hexValues.length; i++) {
                if (hexValues[i] != "00") {
                    output += String.fromCharCode(parseInt(hexValues[i], 16));
                }
            }
            return output;
        }
    }
}
