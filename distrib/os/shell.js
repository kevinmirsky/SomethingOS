var TSOS;
(function (TSOS) {
    class Shell {
        constructor() {
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        init() {
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
            sc = new TSOS.ShellCommand(this.shellRunall, "runall", " - Run all programs waiting to be ran");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellPs, "ps", " - Display all PIDs of available processes");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "<int> - Change quantum bit for Round Robin Scheduling");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "<pid> - Forcefully end a program");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", " - Clears the memory, killing any program in its way");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellFormat, "format", " - Formats the disk.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellCreateFile, "create", "<name> - Creates a file with designated name");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellWriteFile, "write", "<name> \"<data>\" - Changes a file's contents to provided text");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellReadFile, "read", "<name> - Prints the contents of a file to the screen");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellDeleteFile, "delete", "<name> - Deletes a file and its record.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellLs, "ls", "Lists files on disk.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellSetSchedule, "setschedule", "<schedule> - Sets CPU scheduling algorithm");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellGetSchedule, "getschedule", "- gets active CPU scheduling algorithm");
            this.commandList[this.commandList.length] = sc;
            this.putPrompt();
        }
        putPrompt() {
            _StdOut.putText(this.promptStr);
        }
        handleInput(buffer) {
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
        }
        execute(fn, args) {
            _StdOut.advanceLine();
            fn(args);
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            this.putPrompt();
        }
        cmdComplete(input, tabCount) {
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
        }
        parseInput(buffer) {
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
        }
        shellInvalidCommand() {
            _StdOut.putText("[ERROR] Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }
        shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }
        shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        }
        shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }
        shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }
        shellShutdown(args) {
            _StdOut.putText("Shutting down...");
            _Kernel.krnShutdown();
        }
        shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }
        shellMan(args) {
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
        }
        shellTrace(args) {
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
        }
        shellRot13(args) {
            if (args.length > 0) {
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }
        shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }
        shellWhereAmI(args) {
            _StdOut.putText("[ERROR] GPS enabled cyberware not found. Contact a licensed cyberware " +
                "professional for installation.");
        }
        shellDate(args) {
            var d = new Date();
            _StdOut.putText(d.getFullYear().toString() + "-"
                + (d.getMonth() + 1).toString() + "-" + d.getDate().toString() +
                " " + d.getHours().toString() + ":" + d.getMinutes().toString());
        }
        shellUptime(args) {
            const DECISEC_IN_SECOND = 10;
            const DECISEC_IN_MINUTE = 600;
            const DECISEC_IN_HOUR = 36000;
            const DECISEC_IN_DAY = 864000;
            let time = _OSclock;
            let days = Math.floor(time / DECISEC_IN_DAY);
            time = time % DECISEC_IN_DAY;
            let hours = Math.floor(time / DECISEC_IN_HOUR);
            time = time % DECISEC_IN_HOUR;
            let minutes = Math.floor(time / DECISEC_IN_MINUTE);
            time = time % DECISEC_IN_MINUTE;
            let seconds = Math.floor(time / DECISEC_IN_SECOND);
            _StdOut.putText(days + " days, " + hours + " hours, "
                + minutes + " minutes, " + seconds + " seconds");
        }
        shellLoad(args) {
            let regex = new RegExp("^[a-fA-F0-9]+$");
            let isValid = true;
            let inputArray = [];
            let input = document.getElementById("taProgramInput").value;
            input = input.trim();
            input = input.replace(/\s/g, '');
            console.log(input.toString());
            const CHUNK_SIZE = 2;
            for (let i = 0; i < input.length; i += CHUNK_SIZE) {
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
                let segment = _MemManager.getFreeSegment(inputArray.length);
                if (segment) {
                    _MemManager.writeMemory(segment.firstByte, inputArray);
                    segment.isOccupied = true;
                    let process = new TSOS.Pcb(segment.firstByte, segment.getSize());
                    if (args[0] !== null) {
                        let priority = parseInt(args[0], 10);
                        if (!isNaN(priority)) {
                            process.priority = priority;
                        }
                    }
                    _StdOut.advanceLine();
                    _StdOut.putText(" Done. PID: " + process.pid.toString());
                }
                else {
                    let tsb = _DiskDriver.swapToDisk(inputArray.join(''));
                    let process = new TSOS.Pcb(-1, 256);
                    process.hddTsb = tsb;
                    if (args[0] !== null) {
                        let priority = parseInt(args[0], 10);
                        if (!isNaN(priority)) {
                            process.priority = priority;
                        }
                    }
                    _StdOut.advanceLine();
                    _StdOut.putText("No available memory segments. Loaded to disk. PID: "
                        + process.pid.toString());
                }
            }
            else {
                _StdOut.advanceLine();
                _StdOut.putText("[ERROR] User code malformed. Unable to load.");
            }
        }
        shellStatus(args) {
            document.getElementById("bannerStatus").innerText = args.join(' ');
        }
        shellCrash(args) {
            _Kernel.krnTrapError("User manually invoked failure.");
        }
        shellDebugMemtest(args) {
            _MemManager.writeMemory(0xF1, 0x01);
            _StdOut.putText(_MemManager.readMemory(0x01, 0x02).toString());
        }
        shellRun(args) {
            if (args.length == 0) {
                _StdOut.putText("[ERROR] Could not find PID " + args);
                return false;
            }
            let program = TSOS.Pcb.getFromPid(args);
            if (program) {
                _Scheduler.requestRun(program);
            }
            else {
                _StdOut.putText("[ERROR] Could not find PID " + args);
            }
        }
        shellRunall(args) {
            for (let i = 0; i < TSOS.Pcb.instances.length; i++) {
                if (TSOS.Pcb.instances[i].state == "NEW") {
                    _Scheduler.requestRun(TSOS.Pcb.instances[i]);
                }
            }
        }
        shellPs(args) {
            for (let i = 0; i < TSOS.Pcb.instances.length; i++) {
                let pcb = TSOS.Pcb.instances[i];
                if (pcb.state != "TERMINATED" && pcb.state != "COMPLETE") {
                    _StdOut.putText("[PID " + pcb.pid + "] -- " + pcb.state);
                    _StdOut.advanceLine();
                }
            }
        }
        shellQuantum(args) {
            if (args != "") {
                let num = parseInt(args, 10);
                if (!isNaN(num) && num > 0) {
                    _Scheduler.QBIT_LENGTH = num;
                    _StdOut.putText("Quantum set to " + num);
                }
                else {
                    _StdOut.putText("[ERROR] Invalid input. Quantum must be a number >0");
                }
            }
            else {
                _StdOut.putText("[INFO] Quantum is " + _Scheduler.QBIT_LENGTH);
            }
        }
        shellKill(args) {
            let program = TSOS.Pcb.getFromPid(args);
            if (program) {
                if (program.state == "TERMINATED" || program.state == "COMPLETE") {
                    _StdOut.putText("[ERROR] Process is already dead.");
                }
                else if (program.state == "NEW" || program.state == "WAITING") {
                    for (let i = 0; i < _Scheduler.readyQueue.q.length; i++) {
                        if (_Scheduler.readyQueue.q[i].pid == program.pid) {
                            _Scheduler.readyQueue.q.splice(i, 1);
                            program.state = "TERMINATED";
                            return;
                        }
                    }
                    program.state = "TERMINATED";
                }
                else if (program.state == "RUNNING") {
                    program.state = "TERMINATED";
                    _CPU.isExecuting = false;
                }
            }
            else {
                _StdOut.putText("[ERROR] Could not find PID to kill.");
            }
        }
        shellClearMem(args) {
            for (let i = 0; i < _MemManager.segments.length; i++) {
                if (_MemManager.segments[i].isOccupied) {
                    let pcb = TSOS.Pcb.getFromMemLoc(_MemManager.segments[i].firstByte);
                    if (pcb) {
                        let program = TSOS.Pcb.getFromPid(pcb.pid);
                        if (program) {
                            if (program.state == "TERMINATED" || program.state == "COMPLETE") {
                                _StdOut.putText("[ERROR] Process is already dead.");
                            }
                            else if (program.state == "NEW" || program.state == "WAITING") {
                                for (let i = 0; i < _Scheduler.readyQueue.q.length; i++) {
                                    if (_Scheduler.readyQueue.q[i].pid == program.pid) {
                                        _Scheduler.readyQueue.q.splice(i, 1);
                                        program.state = "TERMINATED";
                                        return;
                                    }
                                }
                                program.state = "TERMINATED";
                            }
                            else if (program.state == "RUNNING") {
                                program.state = "TERMINATED";
                                _CPU.isExecuting = false;
                            }
                        }
                        else {
                            _StdOut.putText("[ERROR] Could not find PID to kill.");
                        }
                    }
                    _MemManager.segments[i].isOccupied = false;
                }
                _MemManager.init();
            }
        }
        shellFormat(args) {
            let result = _DiskDriver.format();
            if (result === true) {
                _StdOut.putText("Format successful.");
            }
            else {
                _StdOut.putText("[ERROR]: " + result);
            }
        }
        shellCreateFile(args) {
            try {
                _DiskDriver.createFile(args[0]);
                _StdOut.putText("File \"" + args[0] + "\" created.");
            }
            catch (e) {
                _StdOut.putText("[ERROR] " + e);
            }
        }
        shellWriteFile(args) {
            let filename = args[0];
            args.splice(0, 1);
            let fileData = args.join(' ');
            if (fileData.charAt(0) == '"' && fileData.charAt(fileData.length - 1) == '"') {
                fileData = fileData.substring(fileData.indexOf('"') + 1, fileData.lastIndexOf('"'));
                if (_DiskDriver.writeFile(filename, fileData)) {
                    _StdOut.putText("Write to \"" + filename + "\" successful.");
                }
                else {
                    _StdOut.putText("[ERROR] Could not write file.");
                }
            }
            else {
                _StdOut.putText("[ERROR] File data must be entirely surrounded by double-quotes < \" >.");
            }
        }
        shellReadFile(args) {
            let filename = args[0];
            _StdOut.putText(_DiskDriver.readFile(filename));
        }
        shellDeleteFile(args) {
            let filename = args[0];
            _StdOut.putText(_DiskDriver.deleteFile(filename));
        }
        shellLs(args) {
            _StdOut.putText(_DiskDriver.ls().join(" "));
        }
        shellSetSchedule(args) {
            if (args[0]) {
                console.log(args);
                let input = args[0].toUpperCase();
                if (_Scheduler.validSchedules.includes(input)) {
                    _Scheduler.schedule = input;
                    _StdOut.putText("Schedule set to " + input);
                }
                else {
                    _StdOut.putText("[ERROR] \"" + args[0] + "\" is not a valid schedule."
                        + " Valid schedules are " + _Scheduler.validSchedules.join(", "));
                }
            }
            else {
                _StdOut.putText("[ERROR] No schedule provided."
                    + " Valid schedules are " + _Scheduler.validSchedules.join(", "));
            }
        }
        shellGetSchedule(args) {
            _StdOut.putText("Current schedule: " + _Scheduler.schedule);
        }
        shellDebugChangePcb(args) {
            TSOS.Pcb.instances[0].priority = 1;
        }
    }
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=shell.js.map