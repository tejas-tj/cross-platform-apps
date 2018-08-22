import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { AppikoCommonProvider } from '../../providers/appiko-common/appiko-common';
import { AppikoSensePiProvider } from '../../providers/appiko-sense-pi/appiko-sense-pi';

/**
 * Generated class for the DetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-detail',
  	templateUrl: 'detail.html',
})

export class DetailPage {
	statusMessage: string;
  
  	styling: any = {
    	'clickBg': false
  	};
  
  	realConnection: boolean = true;

  	peripheral: any = {};
  
  	constructor(public navCtrl: NavController, 
  		public navParams: NavParams,
  		private ble: BLE,
    	private alertCtrl: AlertController,
    	public loadingCtrl: LoadingController,
    	private ngZone: NgZone,
    	private appikoCommon: AppikoCommonProvider,
    	private appikoSensePi: AppikoSensePiProvider) {
	
	  	let device = navParams.get('device');
	  	//TBD : pnarasim : show different configs for different senses - pi, be, ac etc
  		if (device.name == this.appikoCommon.APPIKO_DUMMY_SENSE_PI) {
        	this.realConnection = false;
      	} else {
        	this.realConnection = true;
      	}

      	if (!this.realConnection) {
        	// go stratight to options and disable the write
        	this.onConnected(device);
      	} else {
	        this.setStatus('Connecting to ' + device.name || device.id); 	
   	    	console.log('Present loading control : ')
        	let loading = this.loadingCtrl.create({
        		content: 'Connecting to device :' + device.name || device.id
        	});

        	loading.present();
        	this.ble.connect(device.id).subscribe(
          		peripheral => {
            	//pnarasim tbd: disable back during this time. else the connecting loading ctrler shows on home page too
            	this.onConnected(peripheral);
            	loading.dismiss();
          	},
          	peripheral => {
            	this.showAlert('Disconnected', 'The peripheral unexpectedly disconnected. Pls scan and try again');
            	loading.dismiss();
            	this.navCtrl.pop();  
          	}
        	);
      	}
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
    	console.log('ionViewDidLoad DetailPage');
  	}

  	// Disconnect peripheral when leaving the page
    ionViewWillLeave() {
    	if (!this.realConnection) {
        	console.log("Leaving, no ble to disconnect");
        	return;
      	}
      	console.log('ionViewWillLeave disconnecting Bluetooth');

    	this.ble.disconnect(this.peripheral.id).then(
        	() => console.log('Disconnected ' + JSON.stringify(this.peripheral)),
        	() => console.log('ERROR disconnecting ' + JSON.stringify(this.peripheral))
      	)
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
    
  	// Display messages in the footer
  	setStatus(message) {
    	console.log(message);
    	this.ngZone.run(() => {
    		this.statusMessage = message;
    	});
  	}
    
}
