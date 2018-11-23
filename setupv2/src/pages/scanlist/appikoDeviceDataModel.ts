
//type values for the data to be retrieved from the advertising payload on android.
const SHORTENED_LOCAL_NAME = "0x08";
const COMPLETE_LOCAL_NAME = "0x09";
const TX_POWER_LEVEL = "0x0A";

enum platforms {
	IOS=0,
	ANDROID
};


export class appikoDeviceDataModel {

	devicemac: any;
	completename: string;
	shortenedname: string;
	name: string;
	typestr: string;
  	type: number;
	hwrevision: number;
  	hwlocation: number;
  	hwyear: number;
  	hwmonth: number;
  	hwdate: number;
  	swrevision: number;
  	rssi: number;
  	txpower: number;

	constructor(public device:any, public appPlatform: number) {
		this.devicemac = device.id;
		this.extractDeviceData(device, appPlatform);
	}

  	extract_device_info(devicename) {
    	this.typestr = devicename.substring(0,2);
    	this.hwrevision = parseInt(devicename.substring(2,4));
    	this.hwlocation = parseInt(devicename.substring(4,6));
    	this.hwyear = parseInt(devicename.substring(6,8));
    	this.hwmonth = parseInt(devicename.substring(8,10));
    	this.hwdate = parseInt(devicename.substring(10,12));
	   	this.swrevision = parseInt(devicename.substring(12,16));
    }

    printBLEDeviceData() {
    	console.log("Device MAC = " + this.devicemac + " Short Name = " + this.shortenedname + " Complete Name = " + this.completename);
    	console.log("Device type = " + this.typestr + " hwrev = " + this.hwrevision + " hwloc = " + this.hwlocation);
	   	console.log("Device date = " + this.hwyear + " " + this.hwmonth + " " + this.hwdate);
	   	console.log("Device sw rev = " + this.swrevision);
	   	console.log("Txpower = " + this.txpower + " RSSI = " +this.rssi);

    }
    extractDeviceData(device, appPlatform) {
		var serviceData;
		if (appPlatform == platforms.IOS) {
			console.log("IOS");
            //on ios the shortened local name is in device.advertising.kCBAdvDataLocalName
            this.shortenedname = device.advertising.kCBAdvDataLocalName;
            this.extract_device_info(this.shortenedname);
            this.completename = device.name;
            this.txpower = device.advertising.kCBAdvDataTxPowerLevel;
            this.rssi = device.rssi;
        } else { // android
        	console.log("Android");
            var advertisingData = this.parseAdvertisingData(device.advertising);
            serviceData = advertisingData[SHORTENED_LOCAL_NAME];
            this.shortenedname =  String.fromCharCode.apply(null, new Uint8Array(serviceData));
            this.extract_device_info(this.shortenedname);
            serviceData = advertisingData[COMPLETE_LOCAL_NAME];
            this.completename =  String.fromCharCode.apply(null, new Uint8Array(serviceData));
			serviceData = advertisingData[TX_POWER_LEVEL];
            this.txpower = String.fromCharCode.apply(null, new Uint8Array(serviceData));
            console.log(" --- " + serviceData + "   " + this.txpower);
            this.rssi = device.rssi;
        }
        this.printBLEDeviceData();
	}


	// functions to parse the advertising data on android platforms
	//ios returns an disctionary of data and must be accessed as such.
	// i must be < 256
	asHexString(i) {
    	var hex;
    	hex = i.toString(16);
    	// zero padding
    	if (hex.length === 1) {
        	hex = "0" + hex;
    	}
    	return "0x" + hex;
	}

	parseAdvertisingData(buffer) {
    	var length, type, data, i = 0, advertisementData = {};
    	var bytes = new Uint8Array(buffer);

    	while (length !== 0) {

        	length = bytes[i] & 0xFF;
        	i++;
        	console.log("Length = " + length);
        	// decode type constants from https://www.bluetooth.org/en-us/specification/assigned-numbers/generic-access-profile
        	type = bytes[i] & 0xFF;
        	i++;
        	console.log("Type = " + type);

        	data = bytes.slice(i, i + length - 1).buffer; // length includes type byte, but not length byte
        	i += length - 2;  // move to end of data
        	i++;

        	advertisementData[this.asHexString(type)] = data;
    	}

    	return advertisementData;
	}

}