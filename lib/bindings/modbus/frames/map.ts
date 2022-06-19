/// Modbus Imports
import { Direction } from './abstract';

/// Modbus Frames
import { FC1, FC2, FC3, FC4, FC5, FC6, FC15, FC16, Exception } from './_all';

/**************
 *  TYPEDEFS  *
 **************/

/** Available Frames Mapping. */
export interface IFrames<K extends Direction> {
    exception: Exception.Frame<K>;
    coils: FC1.Frame<K>;
    'discrete-inputs': FC2.Frame<K>;
    'holding-registers': FC3.Frame<K>;
    'input-registers': FC4.Frame<K>;
    'single-coil': FC5.Frame<K>;
    'single-register': FC6.Frame<K>;
    'multiple-coils': FC15.Frame<K>;
    'multiple-registers': FC16.Frame<K>;
}
