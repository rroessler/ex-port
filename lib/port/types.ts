/// Vendor Modules
import { AutoDetectTypes } from '@serialport/bindings-cpp';
import { SerialPort, SerialPortMock, SerialPortOpenOptions, SerialPortMockOpenOptions } from 'serialport';

/// Package Modules
import { Parser } from '../parser';

//  TYPEDEFS  //

/** Explicit `SerialPort` Targets. */
export type Target = SerialPort | SerialPortMock;

//  NAMESPACES  //

/** Option Typings. */
export namespace Options {
    //  TYPEDEFS  //

    /** Common Options Interface. */
    export type Common<P extends Parser.Any | undefined> = P extends undefined ? { parser?: undefined } : { parser: P };

    /** Serial-Port Mock Options */
    export type Mock<P extends Parser.Any | undefined> = Common<P> & SerialPortMockOpenOptions;

    /** Serial-Port Binding Options. */
    export type Binding<P extends Parser.Any | undefined> = Common<P> & SerialPortOpenOptions<AutoDetectTypes>;

    /** Determines suitable options typing for a given target. */
    export type Infer<T extends Target, P extends Parser.Any | undefined> = T extends SerialPort ? Binding<P> : Mock<P>;
}
