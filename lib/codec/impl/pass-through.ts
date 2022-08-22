/// Vendor Modules
import * as Monads from 'ts-monadable';

/// Ext-Port Modules
import { Abstract } from './abstract';

/** No-Operation Codec. */
export class PassThrough extends Abstract {
    /********************
     *  PUBLIC METHODS  *
     ********************/

    /** No-Operation Encoder. */
    encode(buffer: Buffer): Monads.Maybe<Buffer> {
        return Monads.Some(buffer);
    }

    /** No-Operation Decoder. */
    decode(buffer: Buffer, encoding?: BufferEncoding): Monads.Maybe<Buffer> {
        return Monads.Some(buffer);
    }
}
