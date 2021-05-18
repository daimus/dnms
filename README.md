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

![Screenshot](https://1.bp.blogspot.com/-toUGHq34tzA/YJzrpZaVIuI/AAAAAAAADU4/FpkeurL9ThctwDZF33sPpA5hbQ-b2PDmQCLcBGAsYHQ/s16000/dashboard.jpg)
![Screenshot](https://1.bp.blogspot.com/-qB-lCxOI7OQ/YJzrpYkyPGI/AAAAAAAADU0/6JguPbVKr8I_DJZr1qvWPCV_EpvDTMSZgCLcBGAsYHQ/s16000/diagram.jpg)
![Screenshot](https://1.bp.blogspot.com/-nXIOWjXUUqM/YJzrpZR9hvI/AAAAAAAADU8/3ci70mFzE8gZrL12uLjBtuRrjLbaW8e9gCLcBGAsYHQ/s16000/manage.jpg)
![Screenshot](https://1.bp.blogspot.com/-SAgy4ySaUUo/YJzrp0qQfxI/AAAAAAAADVA/fTWRJFgTECQAtB11Ccs1LimBKTD6OVNiACLcBGAsYHQ/s16000/map.jpg)
![Screenshot](https://1.bp.blogspot.com/-TEUBewBloe4/YJzrqG95EjI/AAAAAAAADVE/V9MNjq4DwQcIM5e3RDbaXXPBL1u7M6q3gCLcBGAsYHQ/s16000/monitor.jpg)

