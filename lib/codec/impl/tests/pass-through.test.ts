/// Node Modules
import test from 'ava';

/// Ext-Port Modules
import { PassThrough } from '..';

test('Codec::PassThrough | Encode output equals input', (t) => {
    const codec = new PassThrough();
    const input = Buffer.from('Ext-Port');
    t.deepEqual(codec.encode(input).unwrap(), input);
});

test('Codec::PassThrough | Decode output equals input', (t) => {
    const codec = new PassThrough();
    const input = Buffer.from('Ext-Port');
    t.deepEqual(codec.decode(input).unwrap(), input);
});
