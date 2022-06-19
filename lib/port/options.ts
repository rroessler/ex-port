/// SerialPort Modules
import { SerialPortOpenOptions } from 'serialport';
import { AutoDetectTypes } from '@serialport/bindings-cpp';

/// Portex Modules
import { Protocol } from '../codec';
import { IParser } from '../parser/impl';

/** Additional Port Options. */
export type IPortOptions<P extends Protocol.Any = Protocol.Default> = SerialPortOpenOptions<AutoDetectTypes> & {
    parser?: IParser<P>;
};

/** Available Updatable Options. */
export type IPortUpdateOptions<P extends Protocol.Any = Protocol.Default> = IPortOptions<P> & {
    baudRate?: number;
};

/** Defaulted Port Options. */
export const DefaultPortOptions: Partial<IPortOptions> = {
    autoOpen: false,
};
