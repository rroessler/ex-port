/// Vendor Modules
import { SerialPort } from 'serialport';

/// Package Modules
import { Options } from './types';
import { Parser } from '../parser';
import { Abstract } from './abstract';

/** Mock Serial-Port Implementation. */
export class Stream<P extends Parser.Any | undefined = undefined> extends Abstract<SerialPort, P> {
    //  CONSTRUCTORS  //

    /**
     * Constructs a mock serial-port.
     * @param options                   Options to use.
     */
    constructor(options: Options.Binding<P>) {
        super(SerialPort, options);
    }
}
