import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, AlertController, LoadingController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { ToastController } from 'ionic-angular';

import { ConnecthistoryPage } from '../connecthistory/connecthistory';
import { SensepiconfigPage } from '../sensepiconfig/sensepiconfig';
import { AppikoCommonProvider } from '../../providers/appiko-common/appiko-common';
import { appikoDeviceDataModel } from './appikoDeviceDataModel';


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
	  
	  	//only look for devices with our UUID
	  	this.ble.startScan([this.appikoCommon.UUID_SENSE_PI_SERVICE]).subscribe(
	    	device => { 
	    		this.onDeviceDiscovered(device);
	    	},
	    	error => this.scanError(error)
	  	);
	  	/* setTimeout(this.setStatus.bind(this), 150000, 'Scan complete'); */
	}

	// To list the devices as they are discovered
	onDeviceDiscovered(device) {
		this.ngZone.run(() => {
    		console.log('Discovered ' + JSON.stringify(device, null, 2));
    		let bledevice = new appikoDeviceDataModel(device, this.appPlatform);
			this.devices.push(bledevice);
	  		// To sort and list devices according to RSSI/
	  		this.devices.sort(function (a, b) {
	    		return b.rssi - a.rssi;
	  		});
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
  		console.log(JSON.stringify(device.shortenedname) + ' selected');
  		//stop scan when device is selected
  		console.log("Stopping scan");
  		this.ble.stopScan();
  		
		this.setStatus('Connecting to ' + device.shortenedname); 	
		let loading = this.loadingCtrl.create({
    		content: 'Connecting to device :' + device.shortenedname
    	});
    	loading.present();
    	this.ble.connect(device.devicemac).subscribe(
      		peripheral => {
        		//pnarasim tbd: disable back during this time. else the connecting loading ctrler shows on home page too
        		//this.onConnected(peripheral);
        		loading.dismiss();
        		switch (device.typestr) {
        			case this.appikoCommon.APPIKO_SENSE_PI_SHORTENED_NAME: {
        				console.log('Found a SensePi /SP : loading config page');
        				this.navCtrl.push(SensepiconfigPage, {
        					peripheral: device
        				});
        				break;
        			}
        			default: {
        				console.log("Unknown device type string .. ble disconnect and go back");
        				this.showAlert('Disconnected', 'Unknown device type string .. ble disconnect and go back');
        				this.ble.disconnect(device.devicemac);
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

