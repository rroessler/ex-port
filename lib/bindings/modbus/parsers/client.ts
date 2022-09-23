/// Native Modules
import { Codec } from '../../../codec';
import { TransformOptions } from 'stream';

/// Ext-Port Imports
import { Parser } from '../../../parser';

/// Modbus Imports
import { Protocol } from '../protocol';

/**************
 *  TYPEDEFS  *
 **************/

/** Client Parser Interface. */
export interface IClient extends Parser.Abstract<Protocol.Full> {
    readonly protocol: string;

    target(): number;
    target(next: number): number;
}

/*****************
 *  ABSTRACTION  *
 *****************/

/** Default Client Parser. */
export abstract class Client extends Parser.Abstract<Protocol.Full> implements IClient {
    /*****************
     *  CONSTRUCTOR  *
     *****************/

    /**
     * Defines a client parser with the given target, codec and options.
     * @param m_target                          Current target.
     * @param codec                             Client codec.
     * @param options                           Transform options.
     */
    constructor(
        private m_target: number,
        public readonly protocol: string,
        codec: Codec.Abstract<Protocol.Full>,
        options?: TransformOptions
    ) {
        super(codec, options); // inherit from the base implementation
    }

    /********************
     *  PUBLIC METHODS  *
     ********************/

    /** Gets the current client target address. */
    target(): number;

    /**
     * Sets the next client target address.
     * @param next                      Next address.
     */
    target(next: number): number;

    /**
     * Getter / Setter for client target.
     * @param next                      Optional next address.
     */
    target(next?: number) {
        if (next !== undefined) this.m_target = next;
        return this.m_target;
    }
}
