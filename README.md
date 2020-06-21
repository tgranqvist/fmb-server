# Teltonika GPS tracker server

## Authorization

Each transaction with the FMB device is authorized: the devices sends its IMEI to the server. If
The server wants to engage with the device, it sends back 0x01, if not, it sends 0x00.

## Codec8

Data format description [here][codec]. AVL IDs [here][avl_id].

## Coordinate format

coord integer = (d + m/60 + s/3600 + ms/3600000) * p

Where:
 d = degrees,
 m = minutes,
 s = seconds,
 ms = milliseconds, and
 p = precision 10000000

 If longitude is in west or latitude in south, multiply result by –1. To determine if the coordinate is
 negative, convert it to binary format and check the very first bit. If it is 0, coordinate is positive,
 if it is 1, coordinate is negative (two's complement).

## Testing

This implementation successfully parses the example data from the Teltonika [wiki][codec]. These can be
sent with the excellent [Packet Sender][packetsender].

### Example 1

```hex
00 00 00 00 00 00 00 36 08 01 00 00 01 6B 40 D8 EA 30 01 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 01 05 02 15 03 01 01 01 42 5E 0F 01 F1 00 00 60 1A 01 4E 00 00 00 00 00 00 00 00 01 00 00 C7 CF
```

### Example 2

```hex
00 00 00 00 00 00 00 28 08 01 00 00 01 6B 40 D9 AD 80 01 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 01 03 02 15 03 01 01 01 42 5E 10 00 00 01 00 00 F2 2A
```

### Example 3

```hex
00 00 00 00 00 00 00 43 08 02 00 00 01 6B 40 D5 7B 48 01 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 01 01 01 01 00 00 00 00 00 00 01 6B 40 D5 C1 98 01 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 01 01 01 01 01 00 00 00 02 00 00 25 2C
```

## Prior art and inspiration

* [uro's teltonika-fm-parser][teltonika-fm-parser]
* [RuLeZzz1987's FMXXXX-parser][FMXXXX-parser]

[codec]: https://wiki.teltonika-gps.com/view/Codec
[avl_id]: https://wiki.teltonika-gps.com/view/FMB_AVL_ID
[teltonika-fm-parser]: https://github.com/uro/teltonika-fm-parser
[FMXXXX-parser]: https://github.com/RuLeZzz1987/FMXXXX-parser
[packetsender]: https://packetsender.com/
