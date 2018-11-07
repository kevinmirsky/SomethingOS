///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />


/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellWhereAmI,
                                  "whereami",
                                  "- Obtains current location of system, if possible.");
            this.commandList[this.commandList.length] = sc;

            //date
            sc = new ShellCommand(this.shellDate,
                                  "date",
                                  "- Returns the current system date and time.");
            this.commandList[this.commandList.length] = sc;

            //uptime
            sc = new ShellCommand(this.shellUptime,
                "uptime",
                "- returns how long the system has been up and running.");
            this.commandList[this.commandList.length] = sc;

            //load
            sc = new ShellCommand(this.shellLoad,
                "load",
                "- Verifies user entered code and loads it.");
            this.commandList[this.commandList.length] = sc;

            //status
            sc = new ShellCommand(this.shellStatus,
                "status",
                "<string> - Sets the status message in the taskbar.");
            this.commandList[this.commandList.length] = sc;

            //forceCrash
            sc = new ShellCommand(this.shellCrash,
            "forcecrash",
                " - This forces the kernel to trap an error and " +
                "triggers a shutdown");
            this.commandList[this.commandList.length] = sc;

            //run
            sc = new ShellCommand(this.shellRun,
                "run",
                "<pid> - Run a specified program");
            this.commandList[this.commandList.length] = sc;

            //run
            sc = new ShellCommand(this.shellRunall,
                "runall",
                " - Run all programs waiting to be ran");
            this.commandList[this.commandList.length] = sc;

            sc = new ShellCommand(this.shellPs,
                "ps",
                " - Display all PIDs of available processes");
            this.commandList[this.commandList.length] = sc;

            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public cmdComplete(input, tabCount): string {
            var index: number = 0;
            var timesMatched: number = 0;
            while (index < this.commandList.length) {
                if (this.commandList[index].command.match("^"+ input)) {
                    if (timesMatched >= tabCount) {
                        return this.commandList[index].command;
                    }
                    timesMatched++;
                }
                index++;
            }
            return input;
        }

        public parseInput(buffer): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("[ERROR] Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                for (var i in _OsShell.commandList) {
                    if (topic == _OsShell.commandList[i].command) {
                        _StdOut.putText(_OsShell.commandList[i].description);
                        return;
                    }
                }
                _StdOut.putText("No manual entry for " + args[0] + ".");
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
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
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellWhereAmI(args) {
            _StdOut.putText("[ERROR] GPS enabled cyberware not found. Contact a licensed cyberware " +
                "professional for installation.")
        }

        public shellDate(args) {
            var d = new Date();
            _StdOut.putText(d.getFullYear().toString() + "-"
                + (d.getMonth() + 1).toString() + "-" + d.getDate().toString() +
                " " + d.getHours().toString() + ":" + d.getMinutes().toString())
            //getMonth uses 0 for Jan, so 1 must be added for human understanding
        }

        public shellUptime(args) {
            const DECISEC_IN_SECOND = 10;
            const DECISEC_IN_MINUTE = 600;
            const DECISEC_IN_HOUR = 36000;
            const DECISEC_IN_DAY = 864000;

            let time = _OSclock; // returns in 10ths of a second. 10 is 1 second. Deciseconds!

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

        public shellLoad(args) {
            let regex = new RegExp("^[a-fA-F0-9]+$"); //Pattern for valid hex number.
            let isValid = true;
            let inputArray = [];

            let input = (<HTMLInputElement>document.getElementById("taProgramInput")).value;
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
                    //Passes regex
                    //Convert to hex for later storage
                    element = parseInt(element, 16);
                } else {
                    //fails
                    isValid = false;
                    return;
                }
            });
            if (isValid) {
                _StdOut.putText("User input validated. Loading...");
                /*
                ACTUAL LOADING OCCURS HERE
                */
                let segment = _MemManager.getFreeSegment(inputArray.length);
                if (segment) {
                    //All good, proceed as usual
                    _MemManager.writeMemory(segment.firstByte, inputArray);
                    segment.isOccupied = true;
                    let process = new Pcb(segment.firstByte, inputArray.length);
                    //To accommodate for memory offset, we're just bumping PC to be in line.
                    process.PC = segment.firstByte;
                    _StdOut.advanceLine();
                    _StdOut.putText(" Done. PID: " + process.pid.toString());
                } else {
                    //No segment available. Cannot load
                    _StdOut.advanceLine();
                    _StdOut.putText("[ERROR] No available memory segments. Unable to load.")
                }

            } else {
                _StdOut.advanceLine();
                _StdOut.putText("[ERROR] User code malformed. Unable to load.");
            }
        }

        public  shellStatus(args) {
            document.getElementById("bannerStatus").innerText = args.join(' ');

            //console.log(args);
        }

        public shellCrash(args) {
            _Kernel.krnTrapError("User manually invoked failure.");
        }

        public shellDebugMemtest(args) {
            _MemManager.writeMemory(0xF1, 0x01);
            _StdOut.putText(_MemManager.readMemory(0x01, 0x02).toString());
        }

        public shellRun(args) {
            if (args.length == 0) {
                _StdOut.putText("[ERROR] Could not find PID " + args);
                return false;
            }
            let program = <Pcb>Pcb.getFromPid(<number>args);
            if (program) {
                //Only new programs should be ran. Otherwise it's already in the queue
                _Scheduler.requestRun(program);
            } else {
                _StdOut.putText("[ERROR] Could not find PID " + args);
            }
        }

        public shellRunall(args) {
            for (let i = 0; i < Pcb.instances.length; i++) {
                if (Pcb.instances[i].state == "NEW") {
                    _Scheduler.requestRun(Pcb.instances[i]);
                }
            }
        }

        public shellPs(args) {
            for (let i = 0; i < Pcb.instances.length; i++) {
                let pcb = <Pcb> Pcb.instances[i];
                if (pcb.state != "TERMINATED" && pcb.state != "COMPLETE") {
                    //Check to see if "dead" and exclude
                    //Why do we leave dead Pcbs? I like them sticking around in case you need to debug. *shrug*
                    _StdOut.putText("[PID " + pcb.pid + "] -- " + pcb.state);
                    _StdOut.advanceLine();
                }
            }
        }

        public shellDebugChangePcb(args) {
            //Hardcoded change for testing purposes
            Pcb.instances[0].priority = 1;
        }
    }
}
