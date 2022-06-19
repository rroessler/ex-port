/// Portex Imports
import { Protocol as _Protocol_t } from '../../codec/protocol';

/// Modbus Imports
import { FC } from './codes/function';
import { IFrames } from './frames/map';
import * as Frame from './frames/abstract';

/** Modbus Protocol Types. */
export namespace Protocol {
    /** Data Mapping. */
    export type Data<K extends Frame.Direction> = IFrames<K>[FC.Name];

    /** Modbus Partial Protocol. */
    export type Simplex<K extends Frame.Direction> = _Protocol_t.Duplex<Data<K>, [Data<K>]>;

    /** Incoming Modbus Data. */
    export interface Incoming {
        response: Data<'response'>;
        target: number;
    }

    /** Modbus Round-Trip Protocol. */
    export type Full = _Protocol_t.Duplex<Incoming, [target: number, request: Data<'request'>]>;
}
