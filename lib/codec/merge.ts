/// Package Modules
import { Bus } from '../bus';
import { Abstract } from './abstract';

/** Codec Merge Utility. */
export class Merge<B extends Bus.Any> implements Abstract<B> {
    //  CONSTRUCTORS  //

    /**
     * Constructs a merged set of codec's.
     * @param m_incoming                        Incoming codec.
     * @param m_outgoing                        Outgoing codec.
     */
    constructor(
        readonly incoming: Abstract<Bus<B['incoming'], any>>,
        readonly outgoing: Abstract<Bus<any, B['outgoing']>>
    ) {}

    //  PUBLIC METHODS  //

    /**
     * Handles encoding outgoing data as a buffer.
     * @param input                 Input to encode.
     */
    encode(input: B['outgoing']): Buffer {
        return this.outgoing.encode(input);
    }

    /**
     * Handles decoding incoming data as a value.
     * @param buffer                Buffer to decode.
     */
    decode(buffer: Buffer): B['incoming'] {
        return this.incoming.decode(buffer);
    }

    /**
     * Serializes incoming values as a buffer.
     * @param input                 Input to serialize.
     */
    serialize(input: B['incoming']): Buffer {
        return this.incoming.serialize(input);
    }

    /**
     * Handles deserializing incoming values.
     * @param buffer                Buffer to deserialize.
     */
    deserialize(buffer: Buffer): B['incoming'] {
        return this.incoming.deserialize(buffer);
    }
}
