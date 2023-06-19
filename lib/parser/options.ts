/// Node Modules
import stream from 'node:stream';

/** The base transform options to use for a parser. */
export type IOptions = Omit<stream.TransformOptions, 'transform' | 'flush'>;
