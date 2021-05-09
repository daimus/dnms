# DNMS

Network monitoring app build build with NodeJS. Compatible with device with RouterOS and AirOS.

**Feature**
1. Monitoring latency, signal strength, traffic, etc.
2. Informative display with map, diagram, table
3. Grouping device
4. Notification
5. Multi server
6. Additional tools for diagnostic like ping, log, ARP, etc.

**Requirements**
1.  SNMP enabled
2.  MikroTik API enabled
3. NodeJS ^14
4. MySQL ^5.6

## Instalation
- Clone this repo
```sh
$ git clone https://github.com/daimus/dnms.git
```
- Import `dnms.sql` to your database
- CD to app directory and install required package
```sh
$ npm install
```
- Run app
```sh
$ node app.js
```
> #### Default Authentication
> - **Username:** admin
> - **Password:** 11111111

## Screenshoots

I can't provide live preview of this app. But here some screenshoots to give you an insight about this app.

![Screenshot](https://raw.githubusercontent.com/daimus/dnms/main/screenshoots/Screen%20Shot%202021-05-09%20at%2011.22.40%20(2).png?token=AD5WSOI24LJ2DYXJBVJNOZ3AS5SSA)
![Screenshot](https://raw.githubusercontent.com/daimus/dnms/main/screenshoots/Screen%20Shot%202021-05-09%20at%2011.23.52%20(2).png?token=AD5WSOJ6OBYXGXEZSQ3EMLLAS5SVU)
![Screenshot](https://raw.githubusercontent.com/daimus/dnms/main/screenshoots/Screen%20Shot%202021-05-09%20at%2011.24.53%20(2).png?token=AD5WSOIICO7DSVLKWKUL3QDAS5SPE)
![Screenshot](https://raw.githubusercontent.com/daimus/dnms/main/screenshoots/Screen%20Shot%202021-05-09%20at%2011.25.10%20(2).png?token=AD5WSOPBJW3KNBRSAPTRKDTAS5SW2)

