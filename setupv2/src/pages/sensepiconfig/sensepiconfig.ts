import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { BLE } from '@ionic-native/ble';
import { ToastController } from 'ionic-angular';

import { AppikoCommonProvider } from '../../providers/appiko-common/appiko-common';
import { appikoDeviceDataModel } from '../scanlist/appikoDeviceDataModel';

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

	bleDevice: appikoDeviceDataModel;
	statusMessage: string;

	triggerSettingsForm: FormGroup;

  	constructor(public navCtrl: NavController, 
  		public navParams: NavParams,
  		private ble: BLE,
  		private formBuilder: FormBuilder,
  		private ngZone: NgZone,
      public alertCtrl: AlertController,
  		public appikoCommon: AppikoCommonProvider) {

  		this.bleDevice = navParams.get('peripheral');
  		this.onConnected(this.bleDevice);

  		this.triggerSettingsForm = this.formBuilder.group({
  			triggerMode: [''],
        timerInerval: [''],
        timerOperMode: [''],
  		});
  	}

  	// When connection to the peripheral is successful
  	onConnected(bleDevice) {      
		  this.setStatus('Connected to ' + (bleDevice.shortenedname));

		  //console.log(JSON.stringify(peripheral, null, 2));
  		//pnarasim : why this?
		  /*this.ble.startNotification(bleDevice.devicemac, this.appikoCommon.UUID_SENSE_PI_SERVICE, this.appikoCommon.UUID_SENSE_PI_USER_SETTINGS).subscribe(
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

		  this.ble.disconnect(this.bleDevice.devicemac).then(
    	  	() => console.log('Disconnected ' + JSON.stringify(this.bleDevice.shortenedname)),
    		  () => console.log('ERROR disconnecting ' + JSON.stringify(this.bleDevice.shortenedname))
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
      this.ble.write(this.bleDevice.devicemac, this.appikoCommon.UUID_SENSE_PI_SERVICE, this.appikoCommon.UUID_SENSE_PI_USER_SETTINGS, data).then(
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

  // To alert messages on the screen
  showAlert(title, message) {
      let alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }
    
}
