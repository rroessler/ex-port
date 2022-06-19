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
    'read-coils': FC1.Frame<K>;
    'read-discrete-inputs': FC2.Frame<K>;
    'read-holding-registers': FC3.Frame<K>;
    'read-input-registers': FC4.Frame<K>;
    'write-single-coil': FC5.Frame<K>;
    'write-single-register': FC6.Frame<K>;
    'write-multiple-coils': FC15.Frame<K>;
    'write-multiple-registers': FC16.Frame<K>;
}

/****************
 *  PROPERTIES  *
 ****************/

/** Frames Available by Name. */
export const Frames = {
    exception: Exception.Frame,
    'read-coils': FC1.Frame,
    'read-discrete-inputs': FC2.Frame,
    'read-holding-registers': FC3.Frame,
    'read-input-registers': FC4.Frame,
    'write-single-coil': FC5.Frame,
    'write-single-register': FC6.Frame,
    'write-multiple-coils': FC15.Frame,
    'write-multiple-registers': FC16.Frame,
};
