import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { BLE } from '@ionic-native/ble';
import { ToastController } from 'ionic-angular';

import { AppikoCommonProvider } from '../../providers/appiko-common/appiko-common';
import { appikoDeviceDataModel } from '../scanlist/appikoDeviceDataModel';

/**
 * Generated class for the SensepiconfigPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

const SENSEPI_SETTINGS_LENGTH = 17;
const OFFSET_TRIGGER_SETTING=0;
const OFFSET_PIR_OPER=1;
const OFFSET_PIR_MODE=2;
const OFFSET_PIR_MODE_DATA=3;
const OFFSET_PIR_MODE_DATA_LARGER_VALUE=3;
const OFFSET_PIR_MODE_DATA_SMALLER_VALUE=5;
const OFFSET_PIR_MODE_BURST_GAP=3;
const OFFSET_PIR_MODE_BURST_NUMBER=5;
const OFFSET_PIR_MODE_BULB_EXPOSURE=3;
const OFFSET_PIR_MODE_VIDEO_DURATION=3;
const OFFSET_PIR_MODE_VIDEO_EXTENSION=5;
const OFFSET_PIR_THRESHOLD=6;
const OFFSET_PIR_AMPLIFICATION=7;
const OFFSET_PIR_INTERTRIGGERTIME=8;

const OFFSET_TIMER_INTERVAL=10;
const OFFSET_TIMER_OPER=12;
const OFFSET_TIMER_MODE=13;
const OFFSET_TIMER_MODE_DATA=14;
const OFFSET_TIMER_MODE_DATA_LARGER_VALUE=14;
const OFFSET_TIMER_MODE_DATA_SMALLER_VALUE=16;
const OFFSET_TIMER_MODE_BURST_GAP=14;
const OFFSET_TIMER_MODE_BURST_NUMBER=16;
const OFFSET_TIMER_MODE_BULB_EXPOSURE=14;
const OFFSET_TIMER_MODE_VIDEO_DURATION=14;
const OFFSET_TIMER_MODE_VIDEO_EXTENSION=16;

enum TIME_SETTING {
  NIGHT_ONLY,
  DAY_ONLY,
  DAYNIGHT_BOTH 
}

enum MODE_SETTING {
  TRIGGER_SINGLE,
  TRIGGER_BURST,
  TRIGGER_BULB_EXPOSURE,
  TRIGGER_VIDEO,
  TRIGGER_FOCUS  
}

enum TRIGGER_SETTING {
  TRIGGER_TIMER_ONLY,
  TRIGGER_PIR_ONLY,
  TRIGGER_BOTH  
}

@IonicPage()
@Component({
  selector: 'page-sensepiconfig',
  templateUrl: 'sensepiconfig.html',
})
export class SensepiconfigPage {

	bleDevice: appikoDeviceDataModel;
	statusMessage: string;

  //settings : SensePiSettings;
  triggerSetting: number;

  radioClickedTriggerTimer: boolean = false;
  radioClickedTriggerPir: boolean = false;
  radioClickedTriggerBoth: boolean = false;


  triggerType: FormGroup;
  timerSettingsBasic: FormGroup;
  timerSettingsMode: FormGroup;

  radioTimerClickedSingle: boolean = false;
  radioTimerClickedBurst: boolean = false;
  radioTimerClickedBulb: boolean = false;
  radioTimerClickedVideo: boolean = false;
  radioTimerClickedFocus: boolean = false;

  pirSettingsBasic: FormGroup;
  pirSettingsMode: FormGroup;

  radioPirClickedSingle: boolean = false;
  radioPirClickedBurst: boolean = false;
  radioPirClickedBulb: boolean = false;
  radioPirClickedVideo: boolean = false;
  radioPirClickedFocus: boolean = false;

  	constructor(public navCtrl: NavController, 
  		public navParams: NavParams,
  		private ble: BLE,
  		private formBuilder: FormBuilder,
  		private ngZone: NgZone,
      public alertCtrl: AlertController,
  		public appikoCommon: AppikoCommonProvider) {

  		this.bleDevice = navParams.get('peripheral');
  		this.onConnected(this.bleDevice);

      this.triggerType = this.formBuilder.group({
        triggerSetting: new FormControl('', Validators.required)
      });

      this.timerSettingsBasic = this.formBuilder.group({
        timerInterval: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^\\d+\\.\\d{1}$')])),
        timerOpertimeSetting: new FormControl('', Validators.required),
        timerDNThreshold: new FormControl('', Validators.compose([Validators.required, Validators.min(0), Validators.max(127)])),
      });
  
      this.timerSettingsMode = this.formBuilder.group({
        timerMode: new FormControl('', Validators.required),
        timerBurstGap: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^\\d+\\.\\d{1}$')])),
        timerBurstNumber: new FormControl('', Validators.compose([Validators.required, Validators.pattern('\\d+'), Validators.min(2), Validators.max(50)])),
        timerBulbExposureTime: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^\\d+\\.\\d{1}$')])),
        timerVideoDuration: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^\\d+\\.\\d{1}$')])),
        timerVideoExtension: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^\\d+\\.\\d{1}$')]))
      });

      this.pirSettingsBasic = this.formBuilder.group({
        pirInterTriggerTime: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^\\d+\\.\\d{1}$')])),
        pirAmplification: new FormControl('', Validators.compose([Validators.required, Validators.pattern('\\d+'), Validators.min(0), Validators.max(63)])),
        pirThreshold: new FormControl('', Validators.compose([Validators.required, Validators.pattern('\\d+'), Validators.min(16), Validators.max(255)])),
        pirOpertimeSetting: new FormControl('', Validators.required),
        pirDNThreshold: new FormControl('', Validators.compose([Validators.required, Validators.pattern('\\d+'), Validators.min(0), Validators.max(127)]))
      });

      this.pirSettingsMode = this.formBuilder.group({
        pirMode: new FormControl('', Validators.required),
        pirBurstGap: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^\\d+\\.\\d{1}$')])),
        pirBurstNumber: new FormControl('', Validators.compose([Validators.required, Validators.pattern('\\d+'), Validators.min(2), Validators.max(50)])),
        pirBulbExposureTime: new FormControl('',  Validators.compose([Validators.required, Validators.pattern('^\\d+\\.\\d{1}$')])),
        pirVideoDuration: new FormControl('',  Validators.compose([Validators.required, Validators.pattern('^\\d+\\.\\d{1}$')])),
        pirVideoExtension: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^\\d+\\.\\d{1}$')]))
      });

  	}

  	// When connection to the peripheral is successful
  	onConnected(bleDevice) {      
		  this.setStatus('Connected to ' + (bleDevice.shortenedname));

		  //console.log(JSON.stringify(peripheral, null, 2));
  		//pnarasim : need notification when settings on device change? nope.
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
      if (this.triggerType.get('triggerSetting').valid) {
        console.log("Trigger type is " + this.triggerType.get('triggerSetting').value);
        // Save your values, using this.form.get('myField').value;
      }
      console.log("Timer interval chosen is " + this.timerSettingsBasic.get('timerInterval').value);
      if (this.timerSettingsBasic.get('timerInterval').valid) {
        //console.log("Timer interval chosen is " + this.timerSettingsBasic.get('timerInterval'));
      } else {
        console.log("Timer value is invalid.");
      }

      let data = new ArrayBuffer(SENSEPI_SETTINGS_LENGTH);
      //let data = this.constructArrayBufferToWrite();  
      console.log("Size of buffer being written is " + data.byteLength);    
      /*this.ble.write(this.bleDevice.devicemac, this.appikoCommon.UUID_SENSE_PI_SERVICE, this.appikoCommon.UUID_SENSE_PI_USER_SETTINGS, data).then(
        () => this.setStatus('Write Success'),
        //console.log('Wrote all settings to the device = ' + data)
      )
      .catch(
        e => console.log('error in writing to device : ' + e),
      );
       */
    }
  
     // TIMER Settings
    public setTriggerSetting(event) {
      console.log('triggerSetting : trigger was set to ' + event);
      this.triggerSetting = event;
      switch (+event)  {
        case TRIGGER_SETTING.TRIGGER_TIMER_ONLY : {
          console.log("Trigger mode is TIMER only");
          this.radioClickedTriggerTimer = true;
          this.radioClickedTriggerPir = false;
          this.radioClickedTriggerBoth = false;
          break;
        }
        case TRIGGER_SETTING.TRIGGER_PIR_ONLY : {
          console.log("Trigger mode is MOTION only");
          this.radioClickedTriggerTimer = false;
          this.radioClickedTriggerPir = true;
          this.radioClickedTriggerBoth = false;
          break;
        }
        case TRIGGER_SETTING.TRIGGER_BOTH : {
          console.log("Trigger mode is TIMER + MOTION");
          this.radioClickedTriggerTimer = true;
          this.radioClickedTriggerPir = true;
          this.radioClickedTriggerBoth = true;
          break;
        }
        default :{
          console.log("default trigger?");
          break;
        }
      }
    }

  public resetTimerModes() {
      this.radioTimerClickedSingle = false;
      this.radioTimerClickedBurst = false;
      this.radioTimerClickedBulb = false;
      this.radioTimerClickedVideo = false;
      this.radioTimerClickedFocus = false;
  }

  public setTimerMode(event) {
    console.log('TIMER : mode : mode selected was ' + event);
    //everytime user selects a different mode, reset all to zero.
    this.resetTimerModes();
    //this.timerMode = event;
    switch (+event) {
      case MODE_SETTING.TRIGGER_SINGLE: {
        console.log('TIMER: Radio button SINGLE TRIGGER selected');
        this.radioTimerClickedSingle = true;
        break;
      } 
      case MODE_SETTING.TRIGGER_BURST:{
        console.log('TIMER: Radio button BURST TRIGGER selected');
        this.radioTimerClickedBurst = true;
        //console.log('Burst Gap selected as ' + this.timerBurstGap  + ' and burst number of shots is ' + this.timerBurstNumber);
        break;
      }
      case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
        console.log('TIMER: Radio button BULB EXPPOSURE TRIGGER selected');
        this.radioTimerClickedBulb = true;
        //console.log('TIMER: bulbExposureTime set to ' + this.timerBulbExposureTime);
        break;
      }
      case MODE_SETTING.TRIGGER_VIDEO: {
        console.log('TIMER: Radio button VIDEO TRIGGER selected');
        this.radioTimerClickedVideo = true;
        //console.log('TIMER: videoDuration = ' + this.timerVideoDuration + ' videoExtension = ' + this.timerVideoExtension);
       break;
      }
      case MODE_SETTING.TRIGGER_FOCUS: {
        console.log('TIMER: Radio button FOCUS TRIGGER selected');
        this.radioTimerClickedFocus = true;
        break;
      }
      default: { 
        break; 
      } 
    }
  }

  public resetPirModes() {
    this.radioPirClickedSingle = false;
    this.radioPirClickedBurst = false;
    this.radioPirClickedBulb = false;
    this.radioPirClickedVideo = false;
    this.radioPirClickedFocus = false;
  }


  public setPirMode(event) {
    console.log('Pir : mode : mode selected was ' + event);
    //everytime user selects a different mode, reset all to zero.
    this.resetPirModes();
    switch (+event) {
      case MODE_SETTING.TRIGGER_SINGLE: {
        console.log('Pir: Radio button SINGLE TRIGGER selected');
        this.radioPirClickedSingle = true;
        break;
      } 
      case MODE_SETTING.TRIGGER_BURST:{
        console.log('Pir: Radio button BURST TRIGGER selected');
        this.radioPirClickedBurst = true;
        //console.log('Burst Gap selected as ' + this.pirBurstGap + ' and burst number of shots is ' + this.pirBurstNumber);
        break;
      }
      case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
        console.log('Pir: Radio button BULB EXPPOSURE TRIGGER selected');
        this.radioPirClickedBulb = true;
        //console.log('Pir: bulbExposureTime set to ' + this.pirBulbExposureTime);
        break;
      }
      case MODE_SETTING.TRIGGER_VIDEO: {
        console.log('Pir: Radio button VIDEO TRIGGER selected');
        this.radioPirClickedVideo = true;
        //console.log('Pir: videoDuration = ' + this.pirVideoDuration + ' videoExtension = ' + this.pirVideoExtension);
       break;
      }
      case MODE_SETTING.TRIGGER_FOCUS: {
        console.log('Pir: Radio button FOCUS TRIGGER selected');
        this.radioPirClickedFocus = true;
        break;
      }
      default: { 
        break; 
      } 
    }
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
