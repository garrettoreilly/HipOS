///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="../host/control.ts" />
///<reference path="../host/devices.ts" />
///<reference path="processControlBlock.ts" />
///<reference path="memoryManager.ts" />
///<reference path="queue.ts" />
///<reference path="shell.ts" />
///<reference path="deviceDriverKeyboard.ts" />
///<reference path="cpuScheduler.ts" />
///<reference path="diskDeviceDriver.ts" />

/* ------------
     Kernel.ts

     Requires globals.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Kernel {

        public residentList = []
        public readyQueue = [];
        public running;
        private pid = 0;

        public loadProgram(program): number {
            var base = _Manager.loadProgram(program);
            if (base == -1) {
                if (DiskDevice.createFile(["swap"])) {
                    DiskDevice.writeFile(["swap", program.join("")], true);
                    console.log(program);
                } else {
                    return -1;
                }
            }
            var pcb = new Pcb(this.pid, base);
            this.residentList.push(pcb);
            this.pid++;
            return this.pid - 1;
        }

        public runProgram(programPid) {
            var isReady = false;
            for (var i = 0; i < this.readyQueue.length; i++) {
                if (programPid == this.readyQueue[i].pid) {
                    isReady = true;
                }
                break;
            }
            if (!isReady) {
                while (i < this.residentList.length) {
                    if (programPid == this.residentList[i].pid) {
                        this.readyQueue.push(this.residentList[i]);
                        this.residentList.splice(i, 1);
                    }
                    i++;
                }
            }
        }

        public runAll() {
            while (this.residentList.length > 0) {
                this.readyQueue.push(this.residentList.shift());
            }
        }
        
        public pS() {
            _StdOut.putText("Active processes: ");
            for (var i = 0; i < this.residentList.length; i++) {
                _StdOut.putText(this.residentList[i].pid + ", ");
            }
            for (var i = 0; i < this.readyQueue.length; i++) {
                _StdOut.putText(this.readyQueue[i].pid + ", ");
            }
            _StdOut.putText("" + this.running.pid);
        }

        public killProcess(programPid) {
            var temp;
            var baseAddress: number;
            for (var i = 0; i < this.readyQueue.length; i++) {
                if (this.readyQueue[i].pid == programPid) {
                    baseAddress = this.readyQueue.splice(i, 1)[0].baseAddress;
                    break;
                }
            }
            if (baseAddress == undefined) {
                for (var i = 0; i < this.residentList.length; i++) {
                    if (this.residentList[i].pid == programPid) {
                        baseAddress = this.residentList.splice(i, 1)[0].baseAddress;
                        console.log(baseAddress);
                        break;
                    }
                }
            }
            if (baseAddress == undefined && this.running != undefined) {
                if (this.running.pid == programPid) {
                    baseAddress = this.running.baseAddress;
                    this.running = undefined;
                    _CPU.isExecuting = false;
                }
            }
            if (baseAddress != undefined) {
                _Manager.clearSegment(baseAddress);
            }
        }

    
        //
        // OS Startup and Shutdown Routines
        //
        public krnBootstrap() {      // Page 8. {
            DiskDevice.formatDisk();
            _Manager = new Manager();
            _Scheduler = new Scheduler();
            Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array();         // Buffers... for the kernel.
            _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.
            _Console = new Console();          // The command line interface / console I/O device.

            // Initialize the console.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn  = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

            //
            // ... more?
            //

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new Shell();
            _OsShell.init();

            // Finally, initiate testing.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }

        public krnShutdown() {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  Alert if there are some, alert and stop.  Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        }


        public krnOnCPUClockPulse() {
            /* This gets called from the host hardware sim every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware (or host) that tells the kernel
               that it has to look for interrupts and process them if it finds any.                           */
            if (this.running == undefined && this.readyQueue.length > 0) {
                this.running = this.readyQueue.shift();
                this.running.setCpuState();
                _Scheduler.ticks = 0;
            }
            (<HTMLInputElement>document.getElementById("cpu")).value = "PC: " + _CPU.PC + " IR: " + _CPU.instruction.toString(16).toUpperCase() + " Acc: " + _CPU.Acc + " Xreg: " + _CPU.Xreg + " Yreg: " + _CPU.Yreg + " Z Flag: " + _CPU.Zflag;

            // Check for an interrupt, are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } else if (_CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is anything being processed. {
                _CPU.cycle();
                _Scheduler.incTicks();
            } else {                      // If there are no interrupts and there is nothing being executed then just be idle. {
                this.krnTrace("Idle");
            }

            document.getElementById("taskClock").innerHTML = Utils.getDate();

        }


        //
        // Interrupt Handling
        //
        public krnEnableInterrupts() {
            // Keyboard
            Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }

        public krnDisableInterrupts() {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  Pages 8 and 560. {
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on.  Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();              // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);   // Kernel mode device driver
                    _StdIn.handleInput();
                    break;

                case BREAK_IRQ:
                    this.running.copyCpuState(_CPU.PC, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag, _CPU.isExecuting, _CPU.instruction, _CPU.baseAddress, _CPU.limitAddress, _CPU.pid);
                    (<HTMLInputElement>document.getElementById("pcb")).value = "PC: " + this.running.PC + " IR: " + this.running.instruction.toString(16).toUpperCase() + " Acc: " + this.running.Acc + " Xreg: " + this.running.Xreg + " Yreg: " + this.running.Yreg + " Z Flag: " + this.running.Zflag;
                    _CPU.isExecuting = false;
                    this.running = undefined;
                    break;

                case SOFTWARE_IRQ:
                    if (params[0] == 1) {
                        _StdOut.putText(params[1].toString());
                    } else if (params[0] == 2) {
                        var str = [];
                        while (_Manager.getAddress(params[1]) != 0) {
                            str.push(String.fromCharCode(_Manager.getAddress(params[1])));
                            params[1]++;
                        }
                        _StdOut.putText(str);
                    }
                    break;

                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }

        public krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        }

        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile


        //
        // OS Utility Routines
        //
        public krnTrace(msg: string) {
             // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
             if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        Control.hostLog(msg, "OS");
                    }
                } else {
                    Control.hostLog(msg, "OS");
                }
             }
        }

        public krnTrapError(msg) {
            Control.hostLog("OS ERROR - TRAP: " + msg);
            _Console.bsod();
            this.krnShutdown();
        }
    }
}
