///<reference path="../globals.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../utils.ts" />
///<reference path="../globals.ts" />
///<reference path="diskDeviceDriver.ts" />
/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc = null;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;
            // whereami
            sc = new TSOS.ShellCommand(this.shellWhere, "whereami", "- Displays the current location.");
            this.commandList[this.commandList.length] = sc;
            // random
            sc = new TSOS.ShellCommand(this.shellRandom, "random", "- Displays a random number.");
            this.commandList[this.commandList.length] = sc;
            // status <string>
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Sets the status.");
            this.commandList[this.commandList.length] = sc;
            // bsod
            sc = new TSOS.ShellCommand(this.shellBsod, "bsod", "- Make computer die.");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Load user program input.");
            this.commandList[this.commandList.length] = sc;
            // run
            sc = new TSOS.ShellCommand(this.shellRun, "run", "- Run user program.");
            this.commandList[this.commandList.length] = sc;
            // clear memory
            sc = new TSOS.ShellCommand(this.shellClear, "clearmem", "- Clear the memory.");
            this.commandList[this.commandList.length] = sc;
            // Run all programs
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "- Run all programs.");
            this.commandList[this.commandList.length] = sc;
            // Set quantum
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "<int> - Set the quantum of the scheduler.");
            this.commandList[this.commandList.length] = sc;
            // Display active processes
            sc = new TSOS.ShellCommand(this.shellPS, "ps", "- Display active processes.");
            this.commandList[this.commandList.length] = sc;
            // Kill process
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "<int> - Kill process.");
            this.commandList[this.commandList.length] = sc;
            // Format disk drive
            sc = new TSOS.ShellCommand(this.shellFormat, "format", "- Format disk drive.");
            this.commandList[this.commandList.length] = sc;
            // Create new file
            sc = new TSOS.ShellCommand(this.shellCreate, "create", "<string> - Create new file.");
            this.commandList[this.commandList.length] = sc;
            // Write to a file
            sc = new TSOS.ShellCommand(this.shellWrite, "write", "\"<string>\" - Write to a file.");
            this.commandList[this.commandList.length] = sc;
            // Delete a file
            sc = new TSOS.ShellCommand(this.shellDelete, "delete", "<string> - Delete a file.");
            this.commandList[this.commandList.length] = sc;
            // Read a file
            sc = new TSOS.ShellCommand(this.shellRead, "read", "<string> - Read a file.");
            this.commandList[this.commandList.length] = sc;
            // List files
            sc = new TSOS.ShellCommand(this.shellList, "ls", "- List files on the disk.");
            this.commandList[this.commandList.length] = sc;
            // processes - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            // Display the initial prompt.
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = new TSOS.UserCommand();
            userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // JavaScript may not support associative arrays in all browsers so we have to
            // iterate over the command list in attempt to find a match.  TODO: Is there a better way? Probably.
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
                // It's not found, so check for curses and apologies before declaring the command invalid.
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
        // Handle tab completion
        Shell.prototype.tabCompletion = function (text) {
            var matches = [];
            var cmd;
            for (var i = 0; i < this.commandList.length; i++) {
                cmd = this.commandList[i].command;
                if (text.localeCompare(cmd.substring(0, text.length)) == 0) {
                    matches.push(cmd);
                }
            }
            if (matches.length > 1) {
                _StdOut.advanceLine();
                _StdOut.putText(matches.join(" "));
                _StdOut.advanceLine();
                this.putPrompt();
                _StdOut.putText(text);
            }
            else {
                return matches[0].substring(text.length, matches[0].length);
            }
        };
        // args is an option parameter, ergo the ? which allows TypeScript to understand that
        Shell.prototype.execute = function (fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        //
        // Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Duh. Go back to your Speak & Spell.");
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
                _StdOut.putText("Okay. I forgive you. This time.");
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
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
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
                            _StdOut.putText("Trace is already on, dumbass.");
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
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
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
        Shell.prototype.shellDate = function (args) {
            _StdOut.putText(TSOS.Utils.getDate());
        };
        Shell.prototype.shellWhere = function (args) {
            _StdOut.putText("Location determined. Dispatching attack ostriches.");
        };
        Shell.prototype.shellRandom = function (args) {
            // Chosen by fair dice roll.
            // Guaranteed to be random.
            _StdOut.putText("4");
        };
        Shell.prototype.shellStatus = function (args) {
            if (args.length > 0) {
                TSOS.Utils.updateStatus(args);
            }
            else {
                _StdOut.putText("Usage: status <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellBsod = function (args) {
            _Kernel.krnTrapError("You made me dead. :(");
        };
        Shell.prototype.shellLoad = function (args) {
            var program = document.getElementById("taProgramInput").value.toLowerCase().split(" ");
            var hex = "0123456789abcdef";
            for (var i = 0; i < program.length; i++) {
                if (hex.indexOf(program[i][0]) == -1 || hex.indexOf(program[i][1]) == -1) {
                    _Console.putText("Not valid hex.");
                    return;
                }
            }
            if (program.length > 256) {
                _StdOut.putText("C'mon! I can't remember all that!");
                return;
            }
            var pid = _Kernel.loadProgram(program);
            if (pid == -1) {
                _StdOut.putText("You already filled the memory. Pay attention.");
            }
            else {
                _StdOut.putText("PID: " + pid);
            }
        };
        Shell.prototype.shellRun = function (args) {
            _Kernel.runProgram(args);
        };
        Shell.prototype.shellClear = function (args) {
            _Manager.clearMemory();
        };
        Shell.prototype.shellRunAll = function (args) {
            _Kernel.runAll();
        };
        Shell.prototype.shellQuantum = function (args) {
            if (args.length > 0) {
                _Scheduler.setQuantum(args);
            }
            else {
                _StdOut.putText("Usage: quantum <int>  Please supply a number.");
            }
        };
        Shell.prototype.shellPS = function (args) {
            _Kernel.pS();
        };
        Shell.prototype.shellKill = function (args) {
            if (args.length > 0) {
                _Kernel.killProcess(args);
            }
            else {
                _StdOut.putText("Usage: kill <int> - Please supply a process ID.");
            }
        };
        Shell.prototype.shellFormat = function (args) {
            TSOS.DiskDevice.formatDisk();
            _StdOut.putText("Format successful.");
        };
        Shell.prototype.shellCreate = function (args) {
            if (args.length > 0) {
                TSOS.DiskDevice.createFile(args);
            }
            else {
                _StdOut.putText("Usage: create <file> - Please supply a file name.");
            }
        };
        Shell.prototype.shellWrite = function (args) {
            if (args.length >= 2) {
                TSOS.DiskDevice.writeFile(args, false);
            }
            else {
                _StdOut.putText("Usage: write <file> - Please supply a file name.");
            }
        };
        Shell.prototype.shellDelete = function (args) {
            if (args.length > 0) {
                TSOS.DiskDevice.deleteFile(args);
            }
            else {
                _StdOut.putText("Usage: delete <file> - Please supply a file name.");
            }
        };
        Shell.prototype.shellRead = function (args) {
            if (args.length > 0) {
                _StdOut.putText(TSOS.DiskDevice.readFile(args));
            }
            else {
                _StdOut.putText("Usage: read <file> - Please supply a file name.");
            }
        };
        Shell.prototype.shellList = function (args) {
            TSOS.DiskDevice.listFiles();
        };
        return Shell;
    })();
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
