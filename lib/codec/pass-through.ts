/// Packaghe Modules
import { Primitive } from './primitive';

/** Pass-Through Codec Implementation. */
export class PassThrough extends Primitive {
    //  PUBLIC METHODS  //

    /**
     * Pass-through encoder.
     * @param input                     Buffer to pass onwards.
     */
    override encode(input: Buffer): Buffer {
        return input;
    }

    /**
     * Pass-through decoder.
     * @param buffer                    Buffer to pass onwards.
     */
    override decode(buffer: Buffer): Buffer {
        return buffer;
    }
}
