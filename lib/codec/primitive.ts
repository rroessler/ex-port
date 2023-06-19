/// Package Modules
import { Bus } from '../bus';
import { Abstract } from './abstract';

/** Primitive Abstraction Implementation. */
export abstract class Primitive extends Abstract<Bus<Buffer, Buffer>> {
    //  PUBLIC METHODS  //

    /**
     * Pass-through serialization.
     * @param input                     Buffer to pass onwards.
     */
    override serialize(input: Buffer): Buffer {
        return input;
    }

    /**
     * Pass-through deserialization.
     * @param buffer                    Buffer to pass onwards.
     */
    override deserialize(buffer: Buffer): Buffer {
        return buffer;
    }
}
