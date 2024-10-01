/// Package Modules
import { Code } from './code';
import { Bus } from '../../bus';
import { Frame } from './frame';

/** Underlying Bus Typing. */
export type Packet = Bus<Packet.Incoming, Packet.Outgoing>;
export namespace Packet {
    //  TYPEDEFS  //

    /** Incoming Packet Interface. */
    export interface Incoming {
        readonly target: number;
        readonly response: Frame.Response<Code.Function>;
    }

    /** Outgoing Packet Interface. */
    export interface Outgoing<E extends boolean = false> {
        readonly target: number;
        readonly request: Frame.Request<
            E extends true ? Code.Function : Exclude<Code.Function, Code.Function.EXCEPTION>
        >;
    }

    //  PUBLIC METHODS  //

    /**
     * Denotes if a packet is invalid (eg: decode error or elsewise).
     * @param packet                        Packet to validate.
     */
    export const invalid = <P extends Incoming | Outgoing>(packet: P) => {
        if ('request' in packet && <any>packet.request.code === Code.Function.EXCEPTION) return true;
        if ('response' in packet && packet.response.code === Code.Function.EXCEPTION) return true;
        return packet.target === -1; // declared as currently invalid now
    };
}
