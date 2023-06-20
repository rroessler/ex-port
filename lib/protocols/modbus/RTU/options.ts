/// Node Modules
import stream from 'node:stream';

/** RTU Parser Options. */
export interface IOptions extends stream.TransformOptions {
    flushRate?: number;
}
