# Ext-Port

An extensible framework for working with Serial-Ports that required explicitly defined protocols. Also exposes minimal well-known protocols such as Modbus.

**Note:** This package is recommended to be used with TypeScript however all definitions are defaulted to counter this if need be. However full-functionality will be more accessible through TypeScript (such as dynamic protocol typing).

## Installation

```bash
npm install ext-port
```

## Port Framework

As a wrapper-utility, `ext-port` allows defining typed parsers for a chosen serial-port. This can be done by creating an `Ext.Parser` implementation and setting the `parser` option with this value. This package also allows for better strategies for extending/inheriting serial-port interfaces.

### Port Stream

By default, the `Ext.Port.Stream` will act similarly to the (`serialport::SerialPort`)[https://github.com/serialport/node-serialport] implementation. When instantiated as below, the port defaults to an `Ext.Bus<Buffer, Buffer>` protocol that expects stream data to be incoming and outgoing as buffers.

```typescript
import { Ext } from 'ext-port';

// simple instantiation as before
const port = new Ext.Port.Stream({ path: '/dev/ROBOT', baudRate: 38400 });

port.on('incoming', (chunk: Buffer) => /** ... */); // port event-data
port.on('outgoing', (chunk: Buffer) => /** ... */); // written buffer
```

### Properties and Methods

Since all extensible ports inherit from the base `serialport::SerialPort` class, the functionality is almost identical. To improve functionality however, the callback-based methods have been replaced with `Promise` based alternatives.

### Defining a Parser

Parsers can be created by extending the `Ext.Parser.Abstract` class. Using `TypeScript` this enforces the inheritance of defining the `m_transform` and `m_flush` methods necessary for parsing incoming data.

```typescript
import { Ext } from 'ext-port';

/// Protocol Definition.
type MyProtocol = Ext.Bus<string, string>;

/// Parser Implementation
class MyParser extends Ext.Parser.Abstract<MyProtocol> {
    /**
     * Converts the incoming buffer into pushable values.
     * @param chunk                         Chunk to transform.
     * @param encoding                      Encoding to use.
     */
    protected m_transform(chunk: Buffer, encoding: BufferEncoding): string[] {
        return [chunk.toString()];
    }

    /** For completeness, defining an empty flush value. */
    protected m_flush(): string[] {
        return [];
    }
}

// simple construction now with type-inference
const port = new Ext.Port.Stream({ path: '/dev/ROBOT', baudRate: 9600, parser: new MyParser() });

port.on('incoming', (chunk: string) => /** ... */); // port event-data
port.on('outgoing', (chunk: string) => /** ... */); // written buffer
```

This allows us to construct complex transform-streams with ease. Alongside this, an `Ext.Codec` can be attached to an `Ext.Parser.Abstract` to define `encode`, `decode`, `serialize` and `deserialize` properties for parsing. This is useful when transforming to/from (complex data-types)[#defining-a-codec].

**Note:** All the base parsers from `serialport` can be placed as the `parser` option as well. This library was designed around this functionality and extending transform streams to simplify using this library as a wrapper over the `serialport` functionality.

### Defining a Codec

Codecs can be created by extending any of the `Ext.Codec` abstractions. These include:

-   `Ext.Codec.Abstract` &ndash; The base codec abstraction.
-   `Ext.Codec.Merge` &ndash; Allows combining a pair of codecs.
-   `Ext.Codec.Primitive` &ndash; Codec for primitive types (eg: `Buffer`).
-   `Ext.Codec.PassThrough` &ndash; Ensures primitive values are 'passed-through' (eg: no-change).
-   `Ext.Codec.Complex` &ndash; Adds simple JSON serialization for complex items (necessary for emitting out of transform streams).

## Pre-defined Protocols

The primary purpose of this library is to help defining common protocols (with data-transformations). This could be useful for parsing GPS or Modbus as examples. The following have been implemented for users.

-   [Modbus](lib/protocols/README.md)

## License

[MIT](https://opensource.org/license/MIT)
