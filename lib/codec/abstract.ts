/// Package Modules
import { Bus } from '../bus';

/** Codec Abstraction. */
export abstract class Abstract<B extends Bus.Any> {
    //  PUBLIC METHODS  //

    /**
     * Handles encoding outgoing data as a buffer.
     * @param input                 Input to encode.
     */
    abstract encode(input: B['outgoing']): Buffer;

    /**
     * Handles decoding incoming data as a value.
     * @param buffer                Buffer to decode.
     */
    abstract decode(buffer: Buffer): B['incoming'];

    /**
     * Serializes incoming values as a buffer.
     * @param input                 Input to serialize.
     */
    abstract serialize(input: B['incoming']): Buffer;

    /**
     * Handles deserializing incoming values.
     * @param buffer                Buffer to deserialize.
     */
    abstract deserialize(buffer: Buffer): B['incoming'];
}
