import { WorkflowBase, WorkflowBuilder, WorkflowErrorHandling } from "workflow-es";
import { GoodbyeWorld } from "./GateX/goodbye";
import { HelloWorld } from "./GateX/hello";
import { InitializeSeleca, ReInitializeSeleca } from "./GateX/connect";
import ModbusRTU from "modbus-serial";
import { ReadOverflowRegister } from "./GateX/readOverflow";
import { ReadPulseCounter } from "./GateX/countPulse";
import { IncrementOverflowRegister } from "./GateX/incrementOverflow";
import { DispenserOptions } from "../interface/IDispenser";
import { LogMessage } from "./common/logMessage";

export class Seneca {
    public client: ModbusRTU;
    public timeout: number;
    public address: string = "COM9";
    public baudRate: number;
    public deviceId: number;
    public overflowCount: number = 0;
    public overflowOffset: number = 0;
    public pulseCount: number = 0;
    public previousPulseCount: number = 0;
    public workId: string | undefined;

    public overflowRegister: number = 8; // 16-bit register that increments every time the pulse counter overflows
    public pulseRegister: number = 10; // 16-bit register that increments every time the pulse counter overflows

    constructor(options: DispenserOptions) {
      const modbusOptions = options.modbus;
      this.baudRate = options.baudRate || 9600;
      this.client = new ModbusRTU();
      this.timeout = modbusOptions?.timeout || 1000;
      this.deviceId = modbusOptions?.deviceId || 1;
      this.overflowRegister = modbusOptions?.overflowRegister || 8;
      this.pulseRegister = modbusOptions?.pulseRegister || 10;
    }

    readPulse() {
      return this.overflowOffset + this.pulseCount;
    }
}

export class Z10DIN_Workflow implements WorkflowBase<Seneca> {
    public id: string = "z10d1n-world";
    public version: number = 1;

    public build(builder: WorkflowBuilder<Seneca>) {
        builder
        .startWith(HelloWorld)
        .saga((sequence) => sequence
        .startWith(InitializeSeleca)
            .input((step, data) => step.deviceId = data.deviceId)
            .input((step, data) => step.timeout = data.timeout)
            .input((step, data) => step.address = data.address)
            .input((step) => step.client = new ModbusRTU())
            .output((step, data) => data.client = step.client)
        .then(ReadOverflowRegister)
            .input((step, data) => step.client = data.client)
            .input((step, data) => step.overflowRegister = data.overflowRegister)
            .output((step, data) => data.overflowOffset = step.overflowOffset)
            .output((step, data) => data.overflowCount = step.overflowCount))
        .onError(WorkflowErrorHandling.Retry, 1000)
        .then(LogMessage)
            .input((step, data) => step.message = `Overflow count initalized with: ${data.overflowCount}`)
        // Overflow register is a 32-bit register that increments every time the pulse counter overflows
        .while((data) => data.overflowCount < 65536).do((sequence) => sequence
        .startWith(LogMessage)
            .input((step) => step.message = "Reading Pulse Loop")
            .saga((sequence) => sequence
                .startWith(LogMessage)
                    .input((step) => step.message = "Reading Pulse Counter")
                .then(ReadPulseCounter)
                    .input((step, data) => step.client = data.client)
                    .input((step, data) => step.pulseCount = data.pulseCount)
                    .output((step, data) => data.pulseCount = step.pulseCount)
                    .output((step, data) => data.previousPulseCount = step.previousPulseCount)
                .compensateWithSequence(comp => comp
                    .startWith(LogMessage)
                        .input((step) => step.message = "Reinitializing Pulse Counter")    
                    .then(ReInitializeSeleca)
                        .input((step, data) => step.deviceId = data.deviceId)
                        .input((step, data) => step.timeout = data.timeout)
                        .input((step, data) => step.address = data.address)
                        .input((step, data) => step.client = data.client)
                        .output((step, data) => data.client = step.client))
                .then(LogMessage)
                    .input((step, data) => step.message = `Pulse Count: ${data.previousPulseCount} : ${data.pulseCount}`)
                .if((data) => data.pulseCount < data.previousPulseCount).do((then) => then
                    .startWith(LogMessage)
                        .input((step, data) => step.message = `Running Overflow Sequence with Overflow Count: ${data.overflowCount}`)
                    .then(IncrementOverflowRegister)
                    .input((step, data) => step.client = data.client)
                    .input((step, data) => step.overflowRegister = data.overflowRegister)
                    .input((step, data) => step.overflowOffset = data.overflowOffset)
                    .input((step, data) => step.overflowCount = data.overflowCount)
                    .output((step, data) => data.overflowOffset = step.overflowOffset)
                    .output((step, data) => data.overflowCount = step.overflowCount))
                .then(LogMessage)
                    .input((step, data) => step.message = `Overflow Count: ${data.overflowCount}`)))
        .then(GoodbyeWorld);
    }
}