# Ext-Port

An extensible framework for working with Serial-Ports that required explicitly defined protocols. Also exposes minimal well-known protocols such as Modbus.

**Note:** This package is recommended to be used with TypeScript however all definitions are defaulted to counter this if need be. However full-functionality will be more accessible through TypeScript (such as dynamic protocol typing).


## Installation

```bash
npm install ext-port
```

## Port Framework

As a wrapper utility, `ext-port` allows defining explicit protocols for a chosen serial-port. This can be done by defining a `protocol` and an optional `parser`. This package exposes varying avenues to do this (such as be regular inheritance or interface agreements). The definitions of these for `ext-port` are as follows:

> Protocol **>** Type of *`incoming`* and *`outgoing`* data. These will be defined as `<IN>:<OUT>`.

> Parser **>** Native stream transform implementation that uses a definable `codec` for encoding and decoding protocol data.

### Default Port

By default, any `ext.Port` will use the underlying protocol of `<Buffer>:<Buffer>` with no parser transformation.

```typescript
/// Importing (all exports also exposed as non-default)
import ext from 'ext-port';

/// Port Construction
const port = new ext.Port({ path: '/dev/ROBOT', baudRate: 38400 });
```

Both the `path` and `baudRate` options are required and the port does not open by default when constructed.

### Protocol Declaration

A protocol can be defined in one of two ways, through the `Duplex` generic, or from extending the `Any` protocol. These typings are initially transient until a coinciding `parser` is also defined.

```typescript
import type { Protocol } from 'ext-port';
import ext from 'ext-port';

/// Generic
type MyProtocol = Protocol.Duplex<string, [string]>;

/// Interface Extension
interface IMyProtocol extends Protocol.Any {
    incoming: string;
    outgoing: [string];
}

/// Usage on `ext.Port`
const port = new ext.Port<MyProtocol>({ /** ... */ });
```

**Note:** The outgoing definition is required to be in an array format. The reason for this is to allow for multiple arguments to the exposed `write` command for port instances.

### Parser Declaration

Since protocols are inherently transient due to be type-casts only, a `parser` (and `codec` if extending from the `ext-port` library) is required to convert incoming and outgoing data.

Some examples for parsers can be seen in the `lib/parser/impl` directory, alongside additional `codec` examples in the `lib/codec/impl` directory.

**Note:** SerialPort.io parsers can be used interchangeable with this library. To do this, the `ext.Parser.Abstract` parent, directly inherits from a `Transform` in the same manner that the other parsers do, however adds improved functionality with Monadic style result handling.

### Port Properties

**`path`** &ndash; The current serial-port path.<br>
**`baudRate`** &ndash; The current serial-port baud-rate.<br>
**`isOpen`** &ndash; Flag to denote the current serial-port state.<br>
**`parser`** &ndash; Exposed access to set the current parser.

### Port Methods

Most methods return a monadic result instead of required a designated callback handler. This allows for a simpler process (removing callback hell) of handling outcomes that may occur when changing state on a port instance.

**`open`** &ndash; Opens a port instance. Returns a promisified monadic result.

```typescript
import ext from 'ext-port';
const port = new ext.Port({ path: '/dev/ROBOT', baudRate: 115200 });
const result = await port.open();

if (result.is('error')) /** Handle Error ... */
else /** Proceed as normal */
```

**`close`** &ndash; Closes a port instance. Returns a promisified monadic result.

```typescript
const result = await port.close();
if (result.is('error')) console.log(result.unwrap());
```

**`write`** &ndash; Writes to a port instance as defined by the protocol definition.

```typescript
const result = await port.write( /** Protocol Arguments... */ );
```

**`flush`** &ndash; Flushes a port instance.

```typescript
await port.flush(); // nothing special
```

**`update`** &ndash; Allows updating various port properties.

```typescript
port.update({ baudRate: /** ... */, parser: /** ... */ });
```

**`on`** &ndash; Typed event handler for exposed port events.<br>
**`once`** &ndash; Typed event registration for once-only events.

```typescript
port.on('open', () => /** Open event handler. */);
port.once('close', (disconnected: boolean) => /** Close event handler. */);

port.on('incoming', (incoming: any) => /** Decoded incoming event handler. */);
port.on('outgoing', (buffer: Buffer) => /** Encoded outgoing event handler. */);

port.on('_error', (error: ext.IPortError) => /** Error event handler. */);
port.on('_warning', (warning: ext.IPortWarning) => /** Warning event handler. */);
```

**Note:** Both items return `bigint` keys that can be used to later remove the associated events.

**`ignore`** &ndash; Ignores all event-listeners unless given specific keys of events to ignore.

```typescript
port.ignore('incoming', /** Optional keys. */);
```

**`sleep`** &ndash; Sleeps for a given duration of time. Also returns input data to allow for throttling or delaying execution asynchronously.

```typescript
// Regular usage
await port.sleep(1000); // wait for 1 second

// Result delay usage
const result = await port.close().then((res) => port.sleep(1000, res));
```


## Utilities

Alongside the expected serial-port functionality, some utilities are also exposed. This includes a fixed-typing `stdint` implementation for TypeScript, all monadic typings and some checksum algorithms.


## Bindings

The primary purpose of this library is to help in defining and implementing complex serial-port protocols with improved usability. To coincide with this, some protocols are implemented for use. These include:

- [Modbus](lib/bindings/modbus/README.md)
- ...


## License

[MIT](https://opensource.org/license/MIT)
