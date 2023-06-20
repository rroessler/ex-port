/// Package Modules
import { Modbus } from '../protocols/modbus';

//  PROPERTIES  //

const master = new Modbus.Master({
    dataBits: 8,
    parity: 'none',
    baudRate: 38400,
    path: '/dev/tty.usbserial-14310',
    parser: new Modbus.RTU.Parser(),
});

//  TASK RUNNER  //

master
    .open()
    .then(() => master.m_invoke(1, Modbus.Code.Function.READ_INPUT_REGISTERS, { start: 5000, quantity: 1 }))
    .then(console.log)
    .finally(() => master.destroy());
