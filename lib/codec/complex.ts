/// Package Modules
import { Bus } from '../bus';
import { Abstract } from './abstract';

/** Complex Data-Abstraction Implementation. */
export abstract class Complex<B extends Bus.Any> extends Abstract<B> {
    //  PUBLIC METHODS  //

    /**
     * Pass-through serialization.
     * @param input                     Buffer to pass onwards.
     */
    override serialize(input: B['incoming']): Buffer {
        if (Buffer.isBuffer(input)) return input;
        return Buffer.from(JSON.stringify(input));
    }

    /**
     * Pass-through deserialization.
     * @param buffer                    Buffer to pass onwards.
     */
    override deserialize(buffer: Buffer): B['incoming'] {
        return JSON.parse(buffer.toString());
    }
}
