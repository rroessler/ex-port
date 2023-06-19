/// Vendor Modules
import { SerialPortMock } from 'serialport';
import { CreatePortOptions } from '@serialport/binding-mock';

/// Package Modules
import { Options } from './types';
import { Parser } from '../parser';
import { Abstract } from './abstract';

/** Mock Serial-Port Implementation. */
export class Mock<P extends Parser.Any | undefined> extends Abstract<SerialPortMock, P> {
    //  CONSTRUCTORS  //

    /**
     * Constructs a mock serial-port.
     * @param options                   Options to use.
     * @param mock                      Port creation options.
     */
    constructor(options: Options.Mock<P>, mock?: CreatePortOptions) {
        // ensure the port is available for use
        SerialPortMock.binding.createPort(options.path, mock);

        // and instantiate the mock-port
        super(SerialPortMock, options);
    }

    //  PUBLIC METHODS  //

    /**
     * Simulates placing incoming data onto the mock-port.
     * @param data                      Data to emplace.
     */
    simulate(data: Buffer) {
        return this.m_instance.port?.emitData(data);
    }
}
