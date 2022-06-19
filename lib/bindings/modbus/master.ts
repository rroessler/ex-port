/// Portex Utils
import { Delay } from '../../utils/delay';

/// Portex Imports
import { IBarePort, IPortOptions, Port } from '../../port';

/// Modbus Imports
import { Protocol } from './protocol';
import { IClient } from './parsers/client';

/**************
 *  TYPEDEFS  *
 **************/

/** Available Modbus Master Options. */
export interface IMasterOptions {
    timeout: number;
    throttle: number;
}

/********************
 *  IMPLEMENTATION  *
 ********************/

/** Modbus Master Implementation. */
export class Master implements IBarePort {
    /****************
     *  PROPERTIES  *
     ****************/

    /** Internal Master Options. */
    private m_options: IMasterOptions = { timeout: 1000, throttle: 0 };

    /** Underlying Port Instance. */
    readonly port: Port<Protocol.Full>;

    /** Outgoing Requests. */
    private m_outgoing: string[] = [];

    /***********************
     *  GETTERS / SETTERS  *
     ***********************/

    /** Gets the Masters Port Path. */
    get path() {
        return this.port.path;
    }

    /** Gets the Masters Baud-Rate. */
    get baudRate() {
        return this.port.baudRate;
    }

    /** Flags to denote the underlying port is open. */
    get isOpen() {
        return this.port.isOpen;
    }

    /** Gets the Modbus protocol being used. */
    get protocol(): string {
        return (<any>this.port.parser).protocol;
    }

    /*****************
     *  CONSTRUCTOR  *
     *****************/

    /**
     * Constructs a Modbus Master instance with the given options and parser.
     * @param parser                        Protocol parser.
     * @param options                       Given options.
     */
    constructor(parser: IClient, options: IMasterOptions & IPortOptions<Protocol.Full>) {
        const { timeout, throttle, ...rest } = options; // destructure the required options
        this.port = new Port({ ...rest, parser }); // also assign the client as the parser
    }

    /********************
     *  PUBLIC METHODS  *
     ********************/

    /** Coordinates opening the Modbus port. */
    open = () => this.port.open();

    /** Coordinates closing the Modbus port. */
    close = () => this.port.close();

    /**
     * Coordinates sleeping for the given duration.
     * @param duration                      Time to sleep for.
     * @param next                          Optional pass-through value.
     */
    sleep<T>(duration: number, next?: T) {
        return Delay.sleep(duration, next);
    }
}
