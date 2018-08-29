import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, AlertController, LoadingController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { ToastController } from 'ionic-angular';

import { ConnecthistoryPage } from '../connecthistory/connecthistory';
import { SensepiconfigPage } from '../sensepiconfig/sensepiconfig';
import { AppikoCommonProvider } from '../../providers/appiko-common/appiko-common';


/**
* Generated class for the ScanlistPage page.
*
* See https://ionicframework.com/docs/components/#navigation for more info on
* Ionic pages and navigation.
*/

enum platforms {
	IOS=0,
	ANDROID
};

@IonicPage()
@Component({
	selector: 'page-scanlist',
	templateUrl: 'scanlist.html',
})
export class ScanlistPage {

	devices: any[] = [];
	statusMessage: string;
	appPlatform: number;

	devicename: string;
	devicetypestr: string;
  	devicetype: number;
	devicehwrevision: number;
  	devicehwlocation: number;
  	devicehwyear: number;
  	devicehwmonth: number;
  	devicehwdate: number;
  	deviceswrevision: number;

  	extract_device_info(devicename) {
    	this.devicetypestr = devicename.substring(0,2);
    	this.devicehwrevision = parseInt(devicename.substring(2,4));
    	this.devicehwlocation = parseInt(devicename.substring(4,6));
    	this.devicehwyear = parseInt(devicename.substring(6,8));
    	this.devicehwmonth = parseInt(devicename.substring(8,10));
    	this.devicehwdate = parseInt(devicename.substring(10,12));
	   	this.deviceswrevision = parseInt(devicename.substring(12,16));
	   	console.log("Device type = " + this.devicetypestr + " hwrev = " + this.devicehwrevision + " hwloc = " + this.devicehwlocation);
	   	console.log("Device date = " + this.devicehwyear + " " + this.devicehwmonth + " " + this.devicehwdate);
	   	console.log("Device sw rev = " + this.deviceswrevision);
    }

	constructor(public navCtrl: NavController, 
		public navParams: NavParams,
		private platform: Platform, 
		private toastCtrl: ToastController,
		private loadingCtrl: LoadingController,
		private alertCtrl: AlertController,
		private ble: BLE,
		private ngZone: NgZone,
		private appikoCommon: AppikoCommonProvider) {

		if (this.platform.is('ios'))
			this.appPlatform = platforms.IOS;
		else if (this.platform.is('android'))
			this.appPlatform = platforms.ANDROID;
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad ScanlistPage');
	}

	// To enable bluetoooth if not enabled
	ionViewDidEnter() {
		console.log('ionViewDidEnter HomePage');
		this.ble.isEnabled()
		.then(() => this.scan())
		.catch(() => {
			this.ble.enable()
			.then(() => this.scan())
			.catch(()=>this.ble.showBluetoothSettings());
	 	})
	}

	// To continuously scan for BLE Devices (stopScan is never called)
	scan() {
		this.setStatus('Scanning for Appiko BLE Devices');
	  	this.devices = [];  // clear list
	  
	  	this.ble.startScan([]).subscribe(
	    	device => { 
	    		this.onDeviceDiscovered(device);
	    	},
	    	error => this.scanError(error)
	  	);
	  	/* setTimeout(this.setStatus.bind(this), 150000, 'Scan complete'); */
	}

	// To list the devices as they are discovered
	onDeviceDiscovered(device) {
		console.log('Discovered ' + JSON.stringify(device, null, 2));
	  	this.ngZone.run(() => {
	    	var device_name_str = new String(device.name);
	    	if ((device.name == this.appikoCommon.APPIKO_SENSE_PI_COMPLETE_LOCAL_NAME) || (device_name_str.search(this.appikoCommon.APPIKO_SENSE_RE)>=0) ) {
	      		console.log('Discovered device is an Appiko Sense');
	      		this.devices.push(device);
	    	} else
	        	console.log('Discovered device is NOT an Appiko Sense');
	    	}
	  	);
	  	// To sort and list devices according to RSSI/
	  	this.devices.sort(function (a, b) {
	    	return b.rssi - a.rssi;
	  	});
	}


	// If location permission is denied, you'll end up here
	scanError(error) {
  		this.setStatus('Error ' + error);
  		let toast = this.toastCtrl.create({
    		message: 'Error scanning for Appiko BLE devices',
    		position: 'middle',
    		/* duration: 15000 */
  		});
  		toast.present();
	}

	// Display messages in the footer
	setStatus(message) {
  		console.log(message);
  		this.ngZone.run(() => {
    		this.statusMessage = message;
  		});
	}

	// To alert messages on the screen
  	showAlert(title, message) {
    	let alert = this.alertCtrl.create({
			title: title,
			subTitle: message,
			buttons: ['OK']
		});
		alert.present();
  	}
    
	// Takes you to device details page on click 
	deviceSelected(device) {
  		console.log(JSON.stringify(device) + ' selected');
  		//stop scan when device is selected
  		console.log("Stopping scan");
  		this.ble.stopScan();
  		if (this.appPlatform == platforms.IOS) 
	    	this.devicename = device.advertising.kCBAdvDataLocalName;
	    else if (this.appPlatform == platforms.ANDROID) 
	    	this.devicename = device.name;
	    console.log("Device name is " + this.devicename);
	   	this.extract_device_info(this.devicename);
	   	this.setStatus('Connecting to ' + this.devicename); 	
	    console.log('Present loading control : ')
    	let loading = this.loadingCtrl.create({
    		content: 'Connecting to device :' + this.devicename
    	});

    	loading.present();
    	this.ble.connect(device.id).subscribe(
      		peripheral => {
        		//pnarasim tbd: disable back during this time. else the connecting loading ctrler shows on home page too
        		//this.onConnected(peripheral);
        		loading.dismiss();
        		switch (this.devicetypestr) {
        			case 'SP': {
        				console.log('Found a SensePi /SP : loading config page');
        				this.navCtrl.push(SensepiconfigPage, {
        					peripheral: peripheral
        				});
        				break;
        			}
        			default: {
        				console.log("Unknown device type string .. ble disconnect and go back");
        				this.showAlert('Disconnected', 'Unknown device type string .. ble disconnect and go back');
        				this.ble.disconnect(device.id);
        				this.navCtrl.pop();
        				break;
        			}
        		}
      		},
      		peripheral => {
        		this.showAlert('Disconnected', 'The peripheral unexpectedly disconnected. Pls scan and try again');
        		loading.dismiss();
        		this.navCtrl.pop();  
      		}
      	);
	}
}
