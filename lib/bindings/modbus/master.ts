/// Portex Utils
import { Monad } from '../../utils/monad';
import { Delay } from '../../utils/delay';

/// Portex Imports
import { IBarePort, IPortOptions, Port } from '../../port';

/// Modbus Imports
import { Protocol } from './protocol';
import { FC } from './codes/function';
import { IClient } from './parsers/client';
import { Exception, Frames, IFrames } from './frames';

/**************
 *  TYPEDEFS  *
 **************/

/** Available Modbus Master Options. */
export interface IMasterOptions {
    timeout?: number;
    throttle?: number;
}

/********************
 *  IMPLEMENTATION  *
 ********************/

/** Modbus Master Implementation. */
export class Master implements IBarePort, Pick<IClient, 'protocol' | 'target'> {
    /****************
     *  PROPERTIES  *
     ****************/

    /** Internal Master Options. */
    private m_options: IMasterOptions = { timeout: 1000, throttle: 0 };

    /** Underlying Port Instance. */
    readonly port: Port<Protocol.Full>;

    /** Outgoing Requests. */
    private m_outgoing: Promise<any>[] = [];

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

    /** Gets the target manipulator. */
    get target() {
        return this.m_client.target;
    }

    /** Gets the Modbus protocol being used. */
    get protocol(): string {
        return this.m_client.protocol;
    }

    /*****************
     *  CONSTRUCTOR  *
     *****************/

    /**
     * Constructs a Modbus Master instance with the given options and parser.
     * @param m_client                      Protocol parser.
     * @param options                       Given options.
     */
    constructor(private m_client: IClient, options: IMasterOptions & IPortOptions<Protocol.Full>) {
        const { timeout, throttle, ...rest } = options; // destructure the required options
        this.port = new Port({ ...rest, parser: m_client }); // also assign the client as the parser
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

    /**
     * Coordinates invoking the given Modbus function.
     * @param name                          Name of function to invoke.
     * @param args                          Arguments to use.
     */
    async invoke<N extends Exclude<FC.Name, 'exception'>>(
        name: N,
        args: IFrames<'request'>[N]['args']
    ): Promise<Monad.IResult<IFrames<'response'>[N], IFrames<'response'>['exception']>> {
        // generate the required frame to invoke
        const request = new Frames[name]('request', args as any);
        const current = this.target(); // set the current target

        // before continuing, throttle the request
        await this.sleep(this.m_options.throttle);

        // now pre-flush the client before writing
        await this.port.flush();

        // prepare the response promise
        const promise = new Promise<Monad.IResult<IFrames<'response'>[N], IFrames<'response'>['exception']>>(
            (resolve) => {
                // setup a timer to handler what occurs when the request times-out
                const timer = setTimeout(() => {
                    this.m_client.removeAllListeners('data'); // remove all previous listeners
                    this.m_outgoing.shift(); // and the current promise
                    resolve(Monad.Error(new Exception.Frame('response', -1)));
                }, this.m_options.timeout);

                // finally prepare the resolution condition
                this.m_client.once('data', ({ target, response }: Protocol.Full['incoming']) => {
                    if (current !== target) return;
                    this.m_outgoing.shift();

                    // determine if we have a valid or bad response and resolve accordingly
                    if (response.name !== 'exception') resolve(Monad.Okay(response as any));
                    else resolve(Monad.Error(response as Exception.Frame<'response'>));
                });
            }
        );

        // append the request to be resolved
        await this.port.write(current, request);

        // and return the promise to wait for
        return promise;
    }
}
