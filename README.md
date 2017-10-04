# ArduinoOTA-Server

this project acts as a OTA Deployment-Server for Arduino compatible boards like the esp8266 or esp32 which use the OTA process described [here](http://esp8266.github.io/Arduino/versions/2.0.0/doc/ota_updates/ota_updates.html#http-server)

The server will remember chips which requested a firmwareupdate and stores informations like its MAC, first/last request, current version, ... in a MySQL Database.
You can manage firmwares with a description in the database and link it to a device. 
If the device requests its next update the server will provide it and mark the deployment as triggered so that it wont deploy it again.

# Longtime Goals

I plan to provide this a public service where you can upload and deploy your code to IoT Devices inside and outside your own local area network.

# TODOs

- UI (Currently there is no UI so you have to insert your firmwares and deployments manually to the database)
- User based firmware store
- Some authentication mechanism to validate that a device is actually yours
