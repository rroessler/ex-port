/// Portex Modules
import { buffer_t } from '../../stdint';

/** LRC Manipulation. */
export namespace LRC {
    /**
     * Encodes a longitudinal redundancy check from a given buffer.
     * @param buffer                        Buffer to generate LRC from.
     */
    export const encode = (buffer: buffer_t) => {
        let lrc = 0;
        for (let ii = 0; ii < buffer.length; ii++) lrc += buffer[ii] & 0xff;
        return ((lrc ^ 0xff) + 1) & 0xff;
    };
}
