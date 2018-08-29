import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { BLE } from '@ionic-native/ble';
import { ToastController } from 'ionic-angular';

import { AppikoCommonProvider } from '../../providers/appiko-common/appiko-common';

// Bluetooth UUIDs
const UUID_SENSE_PI_BOARD_SETTINGS = '3c73dc51-07f5-480d-b066-837407fbde0a';
const UUID_SENSE_PI_USER_SETTINGS = '3c73dc52-07f5-480d-b066-837407fbde0a';

const SENSEPI_SETTINGS_LENGTH = 17;

/**
 * Generated class for the SensepiconfigPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sensepiconfig',
  templateUrl: 'sensepiconfig.html',
})
export class SensepiconfigPage {

	peripheral: any;
	statusMessage: string;

	triggerSettingsForm: FormGroup;

  	constructor(public navCtrl: NavController, 
  		public navParams: NavParams,
  		private ble: BLE,
  		private formBuilder: FormBuilder,
  		private ngZone: NgZone,
  		public appikocommon: AppikoCommonProvider) {

  		this.peripheral = navParams.get('peripheral');
  		this.onConnected(this.peripheral);

  		this.triggerSettingsForm = this.formBuilder.group({
  			triggerMode: [''],	
  		});
  	}

  	// When connection to the peripheral is successful
  	onConnected(peripheral) {      
		this.peripheral = peripheral;
		this.setStatus('Connected to ' + (peripheral.name || peripheral.id));

		console.log(JSON.stringify(peripheral, null, 2));
		//pnarasim : why this?
		/*this.ble.startNotification(this.peripheral.id, UUID_SENSE_PI_SERVICE, UUID_SENSE_PI_USER_SETTINGS).subscribe(
	    	() => this.showAlert('Unexpected Error', 'Failed to subscribe')
		)*/
  	}
  	
  	ionViewDidLoad() {
    	console.log('ionViewDidLoad SensepiconfigPage');
    	let tabs = document.querySelectorAll('.show-tabbar');
    	if (tabs !== null) {
        	Object.keys(tabs).map((key) => {
            	tabs[key].style.display = 'none';
        	});
    	}
  	}
	// Disconnect peripheral when leaving the page
  	ionViewWillLeave() {
		console.log('ionViewWillLeave disconnecting Bluetooth');

		this.ble.disconnect(this.peripheral.id).then(
    		() => console.log('Disconnected ' + JSON.stringify(this.peripheral)),
    		() => console.log('ERROR disconnecting ' + JSON.stringify(this.peripheral))
  		)
  		let tabs = document.querySelectorAll('.show-tabbar');
		if (tabs !== null) {
			Object.keys(tabs).map((key) => {
				tabs[key].style.display = 'flex';
			});
		}
	}

	// To write the value of each characteristic to the device 
    onButtonClickWrite(event) {
       let data = new ArrayBuffer(SENSEPI_SETTINGS_LENGTH);
      //let data = this.constructArrayBufferToWrite();  
      console.log("Size of buffer being written is " + data.byteLength);    
      this.ble.write(this.peripheral.id, this.appikocommon.UUID_SENSE_PI_SERVICE, UUID_SENSE_PI_USER_SETTINGS, data).then(
        () => this.setStatus('Write Success'),
        //console.log('Wrote all settings to the device = ' + data)
      )
      .catch(
        e => console.log('error in writing to device : ' + e),
      );
       
    }
  
  	// Display messages in the footer
	setStatus(message) {
  		console.log(message);
  		this.ngZone.run(() => {
    		this.statusMessage = message;
  		});
	}  
}
