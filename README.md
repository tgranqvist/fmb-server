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

 If longitude is in west or latitude in south, multiply result by –1. To determine if the coordinate is negative, convert it to binary format and check the very first bit. If it is 0, coordinate is positive, if it is 1, coordinate is negative (two's complement).

## Prior art and inspiration

* [uro's teltonika-fm-parser][teltonika-fm-parser]
* [RuLeZzz1987's FMXXXX-parser][FMXXXX-parser]

[codec]: https://wiki.teltonika-gps.com/view/Codec
[avl_id]: https://wiki.teltonika-gps.com/view/FMB_AVL_ID
[teltonika-fm-parser]: https://github.com/uro/teltonika-fm-parser
[FMXXXX-parser]: https://github.com/RuLeZzz1987/FMXXXX-parser