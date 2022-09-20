/// Node Modules
import test from 'ava';
import sinon from 'sinon';

/// Ext-Port Modules
import { Frames, Frame, IFrames } from '../frames';
import { RTU } from '../parsers/RTU';

/**************
 *  TYPEDEFS  *
 **************/

type IFrame<
    D extends Frame.Direction,
    K extends Exclude<keyof IFrames<D>, 'exception'> = Exclude<keyof IFrames<D>, 'exception'>
> = {
    name: K;
    args: IFrames<D>[K]['args'];
};

/** Codec Transformation Interface. */
type ITransformation<D extends Frame.Direction> = {
    address: number;
    frame: IFrame<D>;
    buffer: Buffer;
};

/****************
 *  PROPERTIES  *
 ****************/

/** Available Codec Request Transformations. */
const REQUESTS: ITransformation<'request'>[] = [
    {
        address: 1,
        buffer: Buffer.from([0x01, 0x03, 0x13, 0x88, 0x00, 0x01, 0x00, 0xa4]),
        frame: { name: 'read-holding-registers', args: { start: 5000, quantity: 1 } },
    },
];

/** Available Codec Response Transformations. */
const RESPONSES: ITransformation<'response'>[] = [
    {
        address: 1,
        buffer: Buffer.from([0x01, 0x03, 0x02, 0x00, 0x03, 0xf8, 0x45]),
        frame: { name: 'read-holding-registers', args: { values: [3] as any } },
    },
];

/******************
 *  TEST RUNNERS  *
 ******************/

test('Bindings::Modbus::RTU::Codec | Encodes valid Modbus requests', (t) => {
    for (const { address, frame, buffer } of REQUESTS) {
        const { name, args } = frame; // destructure the frame details
        const result = RTU.Codec.encode(address, new Frames[name]('request', args as any));

        // ensure we have a valid result
        t.assert(result.is('some'));
        t.assert(result.unwrap().equals(buffer));
    }
});

test('Bindings::Modbus::RTU | Transform incoming Modbus data', (t) => {
    const spy = sinon.spy();
    const parser = new RTU({ target: 1 });

    parser.on('data', spy);

    RESPONSES.forEach(({ buffer, address, frame }, ii) => {
        parser.write(buffer); // write the incoming buffer
        t.assert(spy.callCount === ii + 1); // ensure valid call count
        const rbuf = spy.getCall(ii).args[0]; // get the response buffer
        const { target, response } = RTU.Codec.btoi(rbuf); // and decode
        console.log({ response });
        t.deepEqual(target, address, 'Decoded invalid target address');
        t.deepEqual(response.name, frame.name, 'Non-equal Modbus frame type');
    });
});
