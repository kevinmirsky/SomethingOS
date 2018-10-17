var TSOS;
(function (TSOS) {
    var Shell = (function () {
        function Shell() {
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc;
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", "- Obtains current location of system, if possible.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Returns the current system date and time.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellUptime, "uptime", "- returns how long the system has been up and running.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Verifies user entered code and loads it.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Sets the status message in the taskbar.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellCrash, "forcecrash", " - This forces the kernel to trap an error and " +
                "triggers a shutdown");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<pid> - Run a specified program");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellDebugMemtest, "memtest", "- [DEBUG] This tests the basic storage of memory.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellDebugChangePcb, "changepcbtest", "- [DEBUG] This deletes a pcb for a process. Testing purposes only.");
            this.commandList[this.commandList.length] = sc;
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            var userCommand = this.parseInput(buffer);
            var cmd = userCommand.command;
            var args = userCommand.args;
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) {
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellApology);
                }
                else {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        Shell.prototype.execute = function (fn, args) {
            _StdOut.advanceLine();
            fn(args);
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            this.putPrompt();
        };
        Shell.prototype.cmdComplete = function (input, tabCount) {
            var index = 0;
            var timesMatched = 0;
            while (index < this.commandList.length) {
                if (this.commandList[index].command.match("^" + input)) {
                    if (timesMatched >= tabCount) {
                        return this.commandList[index].command;
                    }
                    timesMatched++;
                }
                index++;
            }
            return input;
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            buffer = TSOS.Utils.trim(buffer);
            buffer = buffer.toLowerCase();
            var tempList = buffer.split(" ");
            var cmd = tempList.shift();
            cmd = TSOS.Utils.trim(cmd);
            retVal.command = cmd;
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("[ERROR] Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            _Kernel.krnShutdown();
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                var topic = args[0];
                for (var i in _OsShell.commandList) {
                    if (topic == _OsShell.commandList[i].command) {
                        _StdOut.putText(_OsShell.commandList[i].description);
                        return;
                    }
                }
                _StdOut.putText("No manual entry for " + args[0] + ".");
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid argument.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellWhereAmI = function (args) {
            _StdOut.putText("[ERROR] GPS enabled cyberware not found. Contact a licensed cyberware " +
                "professional for installation.");
        };
        Shell.prototype.shellDate = function (args) {
            var d = new Date();
            _StdOut.putText(d.getFullYear().toString() + "-"
                + (d.getMonth() + 1).toString() + "-" + d.getDate().toString() +
                " " + d.getHours().toString() + ":" + d.getMinutes().toString());
        };
        Shell.prototype.shellUptime = function (args) {
            var DECISEC_IN_SECOND = 10;
            var DECISEC_IN_MINUTE = 600;
            var DECISEC_IN_HOUR = 36000;
            var DECISEC_IN_DAY = 864000;
            var time = _OSclock;
            var days = Math.floor(time / DECISEC_IN_DAY);
            time = time % DECISEC_IN_DAY;
            var hours = Math.floor(time / DECISEC_IN_HOUR);
            time = time % DECISEC_IN_HOUR;
            var minutes = Math.floor(time / DECISEC_IN_MINUTE);
            time = time % DECISEC_IN_MINUTE;
            var seconds = Math.floor(time / DECISEC_IN_SECOND);
            _StdOut.putText(days + " days, " + hours + " hours, "
                + minutes + " minutes, " + seconds + " seconds");
        };
        Shell.prototype.shellLoad = function (args) {
            var regex = new RegExp("^[a-fA-F0-9]+$");
            var isValid = true;
            var inputArray = [];
            var input = document.getElementById("taProgramInput").value;
            input = input.trim();
            input = input.replace(/\s/g, '');
            console.log(input.toString());
            var CHUNK_SIZE = 2;
            for (var i = 0; i < input.length; i += CHUNK_SIZE) {
                inputArray.push(input.substring(i, i + CHUNK_SIZE));
            }
            if (inputArray.length == 0) {
                isValid = false;
            }
            console.log(inputArray.toString());
            inputArray.forEach(function (element) {
                if (regex.test(element)) {
                    element = parseInt(element, 16);
                }
                else {
                    isValid = false;
                    return;
                }
            });
            if (isValid) {
                _StdOut.putText("User input validated. Loading...");
                _MemManager.writeMemory(0x00, inputArray);
                var process = new TSOS.Pcb(0x00, inputArray.length);
                _StdOut.putText(" Done. PID: " + process.pid.toString());
            }
            else {
                _StdOut.putText("[ERROR] User code malformed. Unable to load.");
            }
        };
        Shell.prototype.shellStatus = function (args) {
            document.getElementById("bannerStatus").innerText = args.join(' ');
        };
        Shell.prototype.shellCrash = function (args) {
            _Kernel.krnTrapError("User manually invoked failure.");
        };
        Shell.prototype.shellDebugMemtest = function (args) {
            _MemManager.writeMemory(0xF1, 0x01);
            _StdOut.putText(_MemManager.readMemory(0x01, 0x02).toString());
        };
        Shell.prototype.shellRun = function (args) {
            if (args.length == 0) {
                _StdOut.putText("[ERROR] Could not find PID " + args);
                return false;
            }
            var program = TSOS.Pcb.getFromPid(args);
            if (program) {
                program.state = "RUNNING";
                _CPU.PC = program.PC;
                _CPU.isExecuting = true;
            }
            else {
                _StdOut.putText("[ERROR] Could not find PID " + args);
            }
        };
        Shell.prototype.shellDebugChangePcb = function (args) {
            TSOS.Pcb.instances[0].priority = 1;
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=shell.js.map