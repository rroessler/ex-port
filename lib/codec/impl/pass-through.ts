/// Portex Modules
import { Maybe } from '../../utils/maybe';
import { Abstract } from './abstract';

/** No-Operation Codec. */
export class PassThrough extends Abstract {
    /********************
     *  PUBLIC METHODS  *
     ********************/

    /** No-Operation Encoder. */
    encode(buffer: Buffer): Maybe.IPerhaps<Buffer> {
        return Maybe.Some(buffer);
    }

    /** No-Operation Decoder. */
    decode(buffer: Buffer, encoding?: BufferEncoding): Maybe.IPerhaps<Buffer> {
        return Maybe.Some(buffer);
    }
}
