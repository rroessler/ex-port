/// Node Modules
import test from 'ava';
import sinon from 'sinon';

/// Ext-Port Modules
import { Delimiter } from '..';

test('Parser::Delimiter | Transform data by a pre-defined delimiter', (t) => {
    const spy = sinon.spy();
    const parser = new Delimiter({ delim: Buffer.from('\n') });

    parser.on('data', spy);
    parser.write(Buffer.from('Test input\nHello, '));
    parser.write(Buffer.from('World!'));
    parser.write(Buffer.from('\n'));
    parser.write(Buffer.from('Should not be seen'));

    t.deepEqual(spy.getCall(0).args[0], Buffer.from('Test input'));
    t.deepEqual(spy.getCall(1).args[0], Buffer.from('Hello, World!'));
    t.assert(spy.calledTwice);
});

test('Parser::Delimiter | Includes the delimiter when "include" property is true', (t) => {
    const spy = sinon.spy();
    const parser = new Delimiter({ delim: Buffer.from('\n'), include: true });

    parser.on('data', spy);
    parser.write(Buffer.from('Test input\nHello, '));
    parser.write(Buffer.from('World!'));
    parser.write(Buffer.from('\n'));
    parser.write(Buffer.from('Should not be seen'));

    t.deepEqual(spy.getCall(0).args[0], Buffer.from('Test input\n'));
    t.deepEqual(spy.getCall(1).args[0], Buffer.from('Hello, World!\n'));
    t.assert(spy.calledTwice);
});

test('Parser::Delimiter | Flushes remaining data when the stream ends', (t) => {
    const spy = sinon.spy();
    const parser = new Delimiter({ delim: Buffer.from([0]) });

    parser.on('data', spy);
    parser.write(Buffer.from([1]));
    t.deepEqual(spy.callCount, 0);
    parser.end();
    t.deepEqual(spy.callCount, 1);
    t.deepEqual(spy.getCall(0).args[0], Buffer.from([1]));
});

test('Parser::Delimiter | Throws when not provided a delimiter', (t) => {
    t.throws(() => new Delimiter({} as any));
    t.throws(() => new (Delimiter as any)());
});

test('Parser::Delimiter | Throws when delimiter length is zero', (t) => {
    t.throws(() => new Delimiter({ delim: Buffer.alloc(0) }));
    t.throws(() => new Delimiter({ delim: '' }));
    t.throws(() => new Delimiter({ delim: [] }));
});
