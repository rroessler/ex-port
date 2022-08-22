/// Ext-Port Modules
import { Protocol } from '../codec';
import { IPortWarning, IPortError } from './error';

/** Ext-Port Default Port Events. */
export interface IPortEvents<P extends Protocol.Any> {
    open: []; // null-open
    close: [disconected: boolean]; // null-close

    _warning: [IPortWarning]; // aliased warning
    _error: [IPortError]; // aliased error (to stop EventEmitter default)

    incoming: [P['incoming']]; // current incoming data
    outgoing: [buffer: Buffer]; // raw outgoing buffer
}
