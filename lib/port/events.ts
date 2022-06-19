/// Portex Modules
import { Protocol } from '../codec';
import { Monad } from '../utils/monad';
import { IPortWarning, IPortError } from './error';

/** Portex Default Port Events. */
export interface IPortEvents<P extends Protocol.Any> {
    open: []; // null-open
    close: [disconected: boolean]; // null-close

    _warning: [IPortWarning]; // aliased warning
    _error: [IPortError]; // aliased error (to stop EventEmitter default)

    incoming: [P['incoming']]; // current incoming data
    outgoing: [buffer: Buffer]; // raw outgoing buffer
}
