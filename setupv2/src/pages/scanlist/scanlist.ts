import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { ToastController } from 'ionic-angular';

import { ConnecthistoryPage } from '../connecthistory/connecthistory';
import { DetailPage } from '../detail/detail';
import { AppikoCommonProvider } from '../../providers/appiko-common/appiko-common';
import { AppikoSensePiProvider } from '../../providers/appiko-sense-pi/appiko-sense-pi';


/**
* Generated class for the ScanlistPage page.
*
* See https://ionicframework.com/docs/components/#navigation for more info on
* Ionic pages and navigation.
*/

@IonicPage()
@Component({
	selector: 'page-scanlist',
	templateUrl: 'scanlist.html',
})
export class ScanlistPage {

	devices: any[] = [];
	statusMessage: string;

	constructor(public navCtrl: NavController, 
		public navParams: NavParams,
		private platform: Platform, 
		private toastCtrl: ToastController,
		private ble: BLE,
		private ngZone: NgZone,
		private appikoCommon: AppikoCommonProvider,
		private appikoSensePi: AppikoSensePiProvider) {
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
	    	device => this.onDeviceDiscovered(device), 
	    	error => this.scanError(error)
	  	);
	  	/* setTimeout(this.setStatus.bind(this), 150000, 'Scan complete'); */
	}

	// To list the devices as they are discovered
	onDeviceDiscovered(device) {
		console.log('Discovered ' + JSON.stringify(device, null, 2));
	  	this.ngZone.run(() => {
	    	var device_name_str = new String(device.name);
	    	if ((device.name == this.appikoSensePi.APPIKO_SENSE_PI_COMPLETE_LOCAL_NAME) || (device_name_str.search(this.appikoCommon.APPIKO_SENSE_RE)>=0) ) {
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

	// Takes you to device details page on click 
	deviceSelected(device) {
  		console.log(JSON.stringify(device) + ' selected');
  		//stop scan when device is selected
  		console.log("Stopping scan");
  		this.ble.stopScan();
  		this.navCtrl.push(DetailPage, {
    		device: device
  		});
	}

}
