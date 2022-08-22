/// Vendor Modules
import * as Monads from 'ts-monadable';

/// Modbus Utils
import { BufferUtils } from '../utils/buffer';

/// Modbus Imports
import { FC } from '../codes/function';
import { Generic } from './abstract';
import { Exception, FC1, FC2, FC3, FC4, FC5, FC6, FC15, FC16 } from './_all';

/** Response Factory. */
export namespace Response {
    /**
     * Attempts reading out a response from a given buffer.
     * @param buffer                    Buffer to generate response from.
     */
    export const from = (buffer: Buffer): Monads.Maybe<Generic<FC.Name, 'response'>> => {
        return BufferUtils.safeAccess(Monads.None(), () => {
            // retrieve the base code given
            const code = buffer.readUint8(0);

            // attempt reading initially as an exception frame
            if (code > 0x80) return new Exception.Response().decode(buffer);

            // attempt parsing all the other valid frames
            if (code === 1) return new FC1.Response().decode(buffer);
            if (code === 2) return new FC2.Response().decode(buffer);
            if (code === 3) return new FC3.Response().decode(buffer);
            if (code === 4) return new FC4.Response().decode(buffer);
            if (code === 5) return new FC5.Response().decode(buffer);
            if (code === 6) return new FC6.Response().decode(buffer);
            if (code === 15) return new FC15.Response().decode(buffer);
            if (code === 16) return new FC16.Response().decode(buffer);

            // otherwise declare an error
            return Monads.None();
        });
    };
}
