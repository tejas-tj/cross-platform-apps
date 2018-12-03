import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Slides } from 'ionic-angular';
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

  @ViewChild(Slides) slides: Slides;
  currentSlide: boolean;
  timerSettingsDone: boolean;
  pirSettingsDone: boolean;

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

  sysinfoFwVerMajor: number;
  sysinfoFwVerMinor: number;
  sysinfoFwVerBuild: number;
  sysinfoBattVolt: number;
  sysinfoBattOK: string;

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
        triggerSetting: new FormControl('')
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

      this.currentSlide = true;
      this.timerSettingsDone = false;
      this.pirSettingsDone = false;
  	}

  	// When connection to the peripheral is successful
  	onConnected(bleDevice) {      
		  this.setStatus('Connected to ' + (bleDevice.shortenedname));
      
      //once connected, read the current config on the device.
      this.ble.read(this.bleDevice.devicemac, this.appikoCommon.UUID_SENSE_PI_SERVICE, this.appikoCommon.UUID_SENSE_PI_USER_SETTINGS).then(
        data => {
          console.log("read the config from the sensepi "),
          console.log("====================== SETTINGS READ AND LOADED FROM THE DEVICE =================="),
          this.print_settings_arraybufffer(data),
          this.loadDeviceConfigs(data)
        }
      ).catch(
         (e) => console.log("Error trying to read data from service " + this.appikoCommon.UUID_SENSE_PI_SERVICE + " and char " + this.appikoCommon.UUID_SENSE_PI_USER_SETTINGS + " : " + e)
      );
      this.ble.read(this.bleDevice.devicemac, this.appikoCommon.UUID_SENSE_PI_SERVICE, this.appikoCommon.UUID_SENSE_PI_BOARD_SETTINGS).then(
        data => {
          console.log("read the sysinfo from the sensepi "),
          console.log("====================== SYSINFO READ =================="),
          this.loadSystemInfo(data)
        }
      ).catch(
         (e) => console.log("Error trying to read data from service " + this.appikoCommon.UUID_SENSE_PI_SERVICE + " and char " + this.appikoCommon.UUID_SENSE_PI_USER_SETTINGS + " : " + e)
      );

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

    public print_settings_arraybufffer(writeBuffer:ArrayBuffer) {

      var dataview = new DataView(writeBuffer);

      console.log('triggerSetting (1 byte)= ' + dataview.getUint8(OFFSET_TRIGGER_SETTING));
      // == PIR Settings ====
      console.log('PIR OpertimeSetting DN Threshold = ' + (dataview.getUint8(OFFSET_PIR_OPER)>>1));
      console.log('PIR OpertimeSetting DN mode = ' + (dataview.getUint8(OFFSET_PIR_OPER) & 1));

      console.log('PIR mode (1 byte)= ' + dataview.getUint8(OFFSET_PIR_MODE));
      switch(+dataview.getUint8(OFFSET_PIR_MODE)) {
        case MODE_SETTING.TRIGGER_SINGLE: {
          //no extra data to record.
          console.log("PIR Mode Larger Value (2 bytes) =" + dataview.getUint16(OFFSET_PIR_MODE_DATA_LARGER_VALUE, true));
          console.log("PIR Mode Smaller Value (1 bytes) =" + dataview.getUint8(OFFSET_PIR_MODE_DATA_SMALLER_VALUE));
          break;
        }
        case MODE_SETTING.TRIGGER_BURST: {
          console.log("PIR BurstGap (2 bytes)= " + dataview.getUint16(OFFSET_PIR_MODE_BURST_GAP, true));
          console.log("PIR BurstNumber (1 byte)= " + dataview.getUint8(OFFSET_PIR_MODE_BURST_NUMBER));
          break;
        }
        case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
          console.log("PIR BulbExposureTime = (3 bytes)" + 
            ((dataview.getUint16(OFFSET_PIR_MODE_BULB_EXPOSURE, true)) + (dataview.getUint8(OFFSET_PIR_MODE_BULB_EXPOSURE+2)<<16)));
          break;
        }
        case MODE_SETTING.TRIGGER_VIDEO: {
          console.log("PIR VideoDuration = (2 bytes)" + dataview.getUint16(OFFSET_PIR_MODE_VIDEO_DURATION, true) + " VideoExtension (1 byte)= " + dataview.getUint8(OFFSET_PIR_MODE_VIDEO_EXTENSION)); 
          break;
        }
        default: {
          break;
        }
      
      }
    
      console.log('PIR Threshold (1 byte)= ' + dataview.getUint8(OFFSET_PIR_THRESHOLD));
      console.log('PIR Amplification (1 byte)= ' + dataview.getUint8(OFFSET_PIR_AMPLIFICATION));
      console.log('PIR InterTriggerTime (2 bytes)= ' + dataview.getUint16(OFFSET_PIR_INTERTRIGGERTIME, true));
      
      // === TIMER Settings ===
      console.log('TIMER timerInterval (2 bytes)= ' + dataview.getUint16(OFFSET_TIMER_INTERVAL, true));
      
      if (dataview.getUint8(OFFSET_TIMER_OPER) == 1) {
        console.log("TIMER DN mode = both");
      } else {
        console.log('TIMER OpertimeSetting DN threshold = ' + (dataview.getUint8(OFFSET_TIMER_OPER)>>1));
        console.log('TIMER OpertimeSetting DN mode = ' + (dataview.getUint8(OFFSET_TIMER_OPER)&1));  
      }
      
      console.log('TIMER mode (1 byte)= ' + dataview.getUint8(OFFSET_TIMER_MODE));
      switch(+dataview.getUint8(OFFSET_TIMER_MODE)) {
        case MODE_SETTING.TRIGGER_SINGLE: {
          //no extra data to record.
          console.log("TIMER Mode Larger Value (2 bytes)=" + dataview.getUint16(OFFSET_TIMER_MODE_DATA_LARGER_VALUE, true));
          console.log("TIMER Mode Smaller Value (1 byte)=" + dataview.getUint8(OFFSET_TIMER_MODE_DATA_SMALLER_VALUE));
          break;
        }
        case MODE_SETTING.TRIGGER_BURST: {
          console.log("TIMER BurstGap (2 bytes)= " + dataview.getUint16(OFFSET_TIMER_MODE_BURST_GAP, true));
          console.log("TIMER BurstNumber (1 byte)= " + dataview.getUint8(OFFSET_TIMER_MODE_BURST_NUMBER));
          break;
        }
        case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
          console.log("TIMER BulbExposureTime (3 bytes) = " + 
            ((dataview.getUint16(OFFSET_TIMER_MODE_BULB_EXPOSURE, true))+(dataview.getUint8(OFFSET_TIMER_MODE_BULB_EXPOSURE+2)<<16)));
          break;
        }
        case MODE_SETTING.TRIGGER_VIDEO: {
          console.log("TIMER VideoDuration (2 bytes)= " + dataview.getUint16(OFFSET_TIMER_MODE_VIDEO_DURATION, true) + " VideoExtension (1 byte)= " + dataview.getUint8(OFFSET_TIMER_MODE_VIDEO_EXTENSION)); 
          break;
        }
        default: {
          break;
        }
      
      }
    
      console.log("===========================================")
    }

    
    public constructArrayBufferToWrite():ArrayBuffer {
      /*
        Format of ArrayBuffer that the board expects : make this fw version dependent next        
      */

      let writeBuffer = new ArrayBuffer(SENSEPI_SETTINGS_LENGTH);
      var dataview = new DataView(writeBuffer);

      //start writing the values
      
      dataview.setUint8(OFFSET_TRIGGER_SETTING, this.triggerSetting);

      // ==== PIR SETTINGS ++++
      if (this.pirSettingsBasic.controls.pirOpertimeSetting.value == TIME_SETTING.DAYNIGHT_BOTH) {
        dataview.setUint8(OFFSET_PIR_OPER, 1);
      } else {
        dataview.setUint8(OFFSET_PIR_OPER, ((this.pirSettingsBasic.controls.pirDNThreshold.value<<1) + (this.pirSettingsBasic.controls.pirOpertimeSetting.value&0x01)));
        console.log('PIR DNT = ' + (this.pirSettingsBasic.controls.pirDNThreshold.value<<1) + ' + ' + this.pirSettingsBasic.controls.pirOpertimeSetting.value + ' = ' + 
          (((this.pirSettingsBasic.controls.pirDNThreshold.value<<1) + (this.pirSettingsBasic.controls.pirOpertimeSetting.value&0x01))));
      }
      
      dataview.setUint8(OFFSET_PIR_MODE,this.pirSettingsMode.controls.pirMode.value);
      
      switch (+this.pirSettingsMode.controls.pirMode.value) {
        case MODE_SETTING.TRIGGER_SINGLE: {
          //no extra data to record.
          dataview.setUint16(OFFSET_PIR_MODE_DATA_LARGER_VALUE, 0);
          dataview.setUint8(OFFSET_PIR_MODE_DATA_SMALLER_VALUE, 0);
          break;
        }
        case MODE_SETTING.TRIGGER_BURST: {
          dataview.setUint16(OFFSET_PIR_MODE_BURST_GAP, (this.pirSettingsMode.controls.pirBurstGap.value*10), true);
          dataview.setUint8(OFFSET_PIR_MODE_BURST_NUMBER, this.pirSettingsMode.controls.pirBurstNumber.value);
          break;
        }
        case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
          dataview.setUint16(OFFSET_PIR_MODE_BULB_EXPOSURE, ((this.pirSettingsMode.controls.pirBulbExposureTime.value*10)&0xFFFF), true);
          dataview.setUint8(OFFSET_PIR_MODE_BULB_EXPOSURE+2, ((this.pirSettingsMode.controls.pirBulbExposureTime.value*10) >>16));
          break;
        }
        case MODE_SETTING.TRIGGER_VIDEO: {
          dataview.setUint16(OFFSET_PIR_MODE_VIDEO_DURATION, this.pirSettingsMode.controls.pirVideoDuration.value, true);
          dataview.setUint8(OFFSET_PIR_MODE_VIDEO_EXTENSION, this.pirSettingsMode.controls.pirVideoExtension.value); 
          break;
        }
        default: {
          break;
        }
      } 
      dataview.setUint8(OFFSET_PIR_THRESHOLD, this.pirSettingsBasic.controls.pirThreshold.value);
      dataview.setUint8(OFFSET_PIR_AMPLIFICATION, this.pirSettingsBasic.controls.pirAmplification.value);
      dataview.setUint16(OFFSET_PIR_INTERTRIGGERTIME, (this.pirSettingsBasic.controls.pirInterTriggerTime.value*10), true); 
      
      //dataview.setUint8(OFFSET_MAKE, this.make); 

      // ==== TIMER SETTINGS ++++
      dataview.setUint16(OFFSET_TIMER_INTERVAL, (this.timerSettingsBasic.controls.timerInterval.value*10), true);
      
      if (this.timerSettingsBasic.controls.timerOpertimeSetting.value == TIME_SETTING.DAYNIGHT_BOTH) {
        dataview.setUint8(OFFSET_TIMER_OPER, 1);
      } else {
        dataview.setUint8(OFFSET_TIMER_OPER, ((this.timerSettingsBasic.controls.timerDNThreshold.value<<1) + (this.timerSettingsBasic.controls.timerOpertimeSetting.value&0x01)));
        console.log('TIMER DNT = ' + (this.timerSettingsBasic.controls.timerDNThreshold.value<<1) + ' + ' + this.timerSettingsBasic.controls.timerOpertimeSetting.value + ' = ' + 
          (((this.timerSettingsBasic.controls.timerDNThreshold.value<<1) + (this.timerSettingsBasic.controls.timerOpertimeSetting.value&0x01))));
      }
      
      dataview.setUint8(OFFSET_TIMER_MODE,this.timerSettingsMode.controls.timerMode.value);
      
      switch (+this.timerSettingsMode.controls.timerMode.value) {
        case MODE_SETTING.TRIGGER_SINGLE: {
          //no extra data to record.
          dataview.setUint16(OFFSET_TIMER_MODE_DATA_LARGER_VALUE, 0);
          dataview.setUint8(OFFSET_TIMER_MODE_DATA_SMALLER_VALUE, 0);
          break;
        }
        case MODE_SETTING.TRIGGER_BURST: {
          dataview.setUint16(OFFSET_TIMER_MODE_BURST_GAP, (this.timerSettingsMode.controls.timerBurstGap.value*10), true);
          dataview.setUint8(OFFSET_TIMER_MODE_BURST_NUMBER, this.timerSettingsMode.controls.timerBurstNumber.value);
          break;
        }
        case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
          dataview.setUint16(OFFSET_TIMER_MODE_BULB_EXPOSURE, ((this.timerSettingsMode.controls.timerBulbExposureTime.value*10)&0xFFFF), true);
          dataview.setUint8(OFFSET_TIMER_MODE_BULB_EXPOSURE+2, ((this.timerSettingsMode.controls.timerBulbExposureTime.value*10)>>16));
          break;
        }
        case MODE_SETTING.TRIGGER_VIDEO: {
          dataview.setUint16(OFFSET_TIMER_MODE_VIDEO_DURATION, this.timerSettingsMode.controls.timerVideoDuration.value, true);
          dataview.setUint8(OFFSET_TIMER_MODE_VIDEO_EXTENSION, this.timerSettingsMode.controls.timerVideoExtension.value); 
          break;
        }
        default: {
          break;
        }
      } 

      console.log("===============SETTINGS THAT WILL BE WRITTEN TO THE DEVICE ============================")
      this.print_settings_arraybufffer(writeBuffer);
      
      return writeBuffer;

    }

	  // To write the value of each characteristic to the device 
    onButtonClickWrite(event) {
      let data = this.constructArrayBufferToWrite();  
      console.log("Size of buffer being written is " + data.byteLength);    
      this.ble.write(this.bleDevice.devicemac, this.appikoCommon.UUID_SENSE_PI_SERVICE, this.appikoCommon.UUID_SENSE_PI_USER_SETTINGS, data).then(
        () => this.setStatus('Write Success'),
          //console.log('Wrote all settings to the device = ' + data)
      )
      .catch(
        e => console.log('error in writing to device : ' + e),
      );
    }

  public loadDeviceConfigs(config) {
    /*
      Read the ArrayBuffer just sent by the board : make this fw version dependent next        
    */

    var dataview = new DataView(config);

    this.triggerSetting = dataview.getUint8(OFFSET_TRIGGER_SETTING);
    
    this.pirSettingsBasic.controls.pirDNThreshold.setValue((dataview.getUint8(OFFSET_PIR_OPER))>>1);
    this.pirSettingsBasic.controls.pirOpertimeSetting.setValue(dataview.getUint8(OFFSET_PIR_OPER) & 1);

    this.pirSettingsMode.controls.pirMode.setValue(dataview.getUint8(OFFSET_PIR_MODE));
    
    switch (+this.pirSettingsMode.controls.pirMode.value) {
      case MODE_SETTING.TRIGGER_SINGLE: {
        //no extra data to record.
        break;
      }
      case MODE_SETTING.TRIGGER_BURST: {
        this.pirSettingsMode.controls.pirBurstGap.setValue((dataview.getUint16(OFFSET_PIR_MODE_BURST_GAP, true))/10);
        this.pirSettingsMode.controls.pirBurstNumber.setValue(dataview.getUint8(OFFSET_PIR_MODE_BURST_NUMBER));
        break;
      }
      case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
        this.pirSettingsMode.controls.pirBulbExposureTime.setValue((((dataview.getUint16(OFFSET_PIR_MODE_BULB_EXPOSURE, true)) + (dataview.getUint8(OFFSET_PIR_MODE_BULB_EXPOSURE+2)<<16)))/10);
        break;
      }
      case MODE_SETTING.TRIGGER_VIDEO: {
        this.pirSettingsMode.controls.pirVideoDuration.setValue(dataview.getUint16(OFFSET_PIR_MODE_VIDEO_DURATION, true));
        this.pirSettingsMode.controls.pirVideoExtension.setValue(dataview.getUint8(OFFSET_PIR_MODE_VIDEO_EXTENSION));
        break;
      }
      default: {
        break;
      }
    } 
    this.pirSettingsBasic.controls.pirThreshold.setValue(dataview.getUint8(OFFSET_PIR_THRESHOLD));
    this.pirSettingsBasic.controls.pirAmplification.setValue(dataview.getUint8(OFFSET_PIR_AMPLIFICATION));
    this.pirSettingsBasic.controls.pirInterTriggerTime.setValue((dataview.getUint16(OFFSET_PIR_INTERTRIGGERTIME, true))/10);
    
    //dataview.setUint8(OFFSET_MAKE, this.make); 

    // ==== TIMER SETTINGS ++++
    this.timerSettingsBasic.controls.timerInterval.setValue((dataview.getUint16(OFFSET_TIMER_INTERVAL, true))/10);
    
    this.timerSettingsBasic.controls.timerDNThreshold.setValue((dataview.getUint8(OFFSET_TIMER_OPER))>>1);
    this.timerSettingsBasic.controls.timerOpertimeSetting.setValue(dataview.getUint8(OFFSET_TIMER_OPER) & 1);
    
    this.timerSettingsMode.controls.timerMode.setValue(dataview.getUint8(OFFSET_TIMER_MODE));
    
    switch (+this.timerSettingsMode.controls.timerMode.value) {
      case MODE_SETTING.TRIGGER_SINGLE: {
        //no extra data to record.
        break;
      }
      case MODE_SETTING.TRIGGER_BURST: {
        this.timerSettingsMode.controls.timerBurstGap.setValue((dataview.getUint16(OFFSET_TIMER_MODE_BURST_GAP, true))/10);
        this.timerSettingsMode.controls.timerBurstNumber.setValue(dataview.getUint8(OFFSET_TIMER_MODE_BURST_NUMBER));
        break;
      }
      case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
        this.timerSettingsMode.controls.timerBulbExposureTime.setValue(((dataview.getUint16(OFFSET_TIMER_MODE_BULB_EXPOSURE, true)) + (dataview.getUint8(OFFSET_TIMER_MODE_BULB_EXPOSURE+2)<<16))/10);
        break;
      }
      case MODE_SETTING.TRIGGER_VIDEO: {
        this.timerSettingsMode.controls.timerVideoDuration.setValue(dataview.getUint16(OFFSET_TIMER_MODE_VIDEO_DURATION, true));
        this.timerSettingsMode.controls.timerVideoExtension.setValue(dataview.getUint8(OFFSET_TIMER_MODE_VIDEO_EXTENSION)); 
        break;
      }
      default: {
        break;
      }
    }
  }

  loadSystemInfo(config) {
    /*
      Read the ArrayBuffer just sent by the board : make this fw version dependent next        
    */

    var dataview = new DataView(config);    

    this.sysinfoBattVolt = (dataview.getUint8(16)*3.6/256);
    this.sysinfoBattVolt = parseFloat(this.sysinfoBattVolt.toFixed(2));      
    this.sysinfoFwVerMajor = dataview.getUint8(17);
    this.sysinfoFwVerMinor = dataview.getUint8(18);
    this.sysinfoFwVerBuild = dataview.getUint8(19);

    if(this.sysinfoBattVolt > 2.3)
    {
      this.sysinfoBattOK = '👍';
    } else {
      this.sysinfoBattOK = '👎';
    }

    console.log('sysinfoBattVolt' + this.sysinfoBattVolt + typeof(this.sysinfoBattVolt));
    console.log('sysinfoFwVerMajor' + this.sysinfoFwVerMajor);
    console.log('sysinfoFwVerMinor' + this.sysinfoFwVerMinor);
    console.log('sysinfoFwVerBuild' + this.sysinfoFwVerBuild);
    console.log('sysinfoBattOK' + this.sysinfoBattOK);
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
        this.slides.slideTo(1,500);
        break;
      }
      case TRIGGER_SETTING.TRIGGER_PIR_ONLY : {
        console.log("Trigger mode is MOTION only");
        this.radioClickedTriggerTimer = false;
        this.radioClickedTriggerPir = true;
        this.radioClickedTriggerBoth = false;
        this.slides.slideTo(1,500); // in both cases, based on ngif var triggerSetting, its slide 1.
        break;
      }
      case TRIGGER_SETTING.TRIGGER_BOTH : {
        console.log("Trigger mode is TIMER + MOTION");
        this.radioClickedTriggerTimer = true;
        this.radioClickedTriggerPir = true;
        this.radioClickedTriggerBoth = true;
        this.slides.slideTo(1,500); 
        break;
      }
      default :{
        console.log("default trigger?");
        break;
      }
    }
  }

  slideTimerSettingsBasicFreq(event) {
    console.log("Here in timer freq change");
    if (this.timerSettingsBasic.controls.timerInterval.invalid) {
      //disable next till user enters a valid value here
      console.log("Invalid Timer Frequency : pls enter a valid value  to proceed");
      this.currentSlide = false;
    } else {
      this.currentSlide = true;
      console.log("Valid Timer Frequency : proceeding");
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

  slideTimerSettingsModeBurstGap(event) {
    if (this.timerSettingsMode.controls.timerBurstGap.invalid) {
      //disable next till user enters a valid value here
      console.log("Invalid Timer Mode settings Burst Gap: pls enter a valid value  to proceed");
      this.currentSlide = false;
    } else {
      this.currentSlide = true;
      console.log("Valid Timer Mode settings Burst Gap: proceeding");
    }
  }

  slideTimerSettingsModeBurstNum(event) {
    if (this.timerSettingsMode.controls.timerBurstNumber.invalid) {
      //disable next till user enters a valid value here
      console.log("Invalid Timer Mode settings Burst Num: pls enter a valid value  to proceed");
      this.currentSlide = false;
    } else {
      this.currentSlide = true;
      console.log("Valid Timer Mode settings Burst Num: proceeding");
    }
  }

  slideTimerSettingsModeBulbExp(event) {
    if (this.timerSettingsMode.controls.timerBulbExposure.invalid) {
      //disable next till user enters a valid value here
      console.log("Invalid Timer Mode settings Bulb Exp: pls enter a valid value  to proceed");
      this.currentSlide = false;
    } else {
      this.currentSlide = true;
      console.log("Valid Timer Mode settings Bulb Exp: proceeding");
    }
  }

  slideTimerSettingsModeVidDur(event) {
    if (this.timerSettingsMode.controls.timerVideoDuration.invalid) {
      //disable next till user enters a valid value here
      console.log("Invalid Timer Mode settings Video Duration: pls enter a valid value  to proceed");
      this.currentSlide = false;
    } else {
      this.currentSlide = true;
      console.log("Valid Timer Mode settings Video Duration: proceeding");
    }
  }

  slideTimerSettingsModeVidExt(event) {
    if (this.timerSettingsMode.controls.timerVideoExtension.invalid) {
      //disable next till user enters a valid value here
      console.log("Invalid Timer Mode settings Video Extension: pls enter a valid value  to proceed");
      this.currentSlide = false;
    } else {
      this.currentSlide = true;
      console.log("Valid Timer Mode settings Video Extension: proceeding");
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

  slidePirSettingsBasicThresh(event) {
    if (this.pirSettingsBasic.controls.pirThreshold.invalid) {
      //disable next till user enters a valid value here
      console.log("Invalid PIR Basic Threshold : pls enter a valid value  to proceed");
      this.currentSlide = false;
    } else {
      this.currentSlide = true;
      console.log("Valid PIR Basic Threshold: proceeding");
    }
  }

  slidePirSettingsBasicAmpl(event) {
    if (this.pirSettingsBasic.controls.pirAmplification.invalid) {
      //disable next till user enters a valid value here
      console.log("Invalid PIR Basic Amplitude: pls enter a valid value  to proceed");
      this.currentSlide = false;
    } else {
      this.currentSlide = true;
      console.log("Valid PIR Basic Amplitude: proceeding");
    }
  }

  slidePirSettingsBasicITT(event) {
    if (this.pirSettingsBasic.controls.pirInterTriggerTime.invalid ) {
      //disable next till user enters a valid value here
      console.log("Invalid PIR Basic ITT: pls enter a valid value  to proceed");
      this.currentSlide = false;
    } else {
      this.currentSlide = true;
      console.log("Valid PIR Basic ITT: proceeding");
    }
  }

  slidePirSettingsModeBurstGap(event) {
    if (this.pirSettingsMode.controls.pirBurstGap.invalid) {
      //disable next till user enters a valid value here
      console.log("Invalid PIR Mode settings Burst Gap: pls enter a valid value  to proceed");
      this.currentSlide = false;
    } else {
      this.currentSlide = true;
      console.log("Valid PIR Mode settings Burst Gap: proceeding");
    }
  }

  slidePirSettingsModeBurstNum(event) {
    if (this.pirSettingsMode.controls.pirBurstNumber.invalid) {
      //disable next till user enters a valid value here
      console.log("Invalid PIR Mode settings Burst Num: pls enter a valid value  to proceed");
      this.currentSlide = false;
    } else {
      this.currentSlide = true;
      console.log("Valid PIR Mode settings Burst Num: proceeding");
    }
  }

  slidePirSettingsModeBulbExp(event) {
    if (this.pirSettingsMode.controls.pirBulbExposureTime.invalid) {
      //disable next till user enters a valid value here
      console.log("Invalid PIR Mode settings Bulb Exp: pls enter a valid value  to proceed");
      this.currentSlide = false;
    } else {
      this.currentSlide = true;
      console.log("Valid PIR Mode settings Bulb Exp: proceeding");
    }
  }

  slidePirSettingsModeVidDur(event) {
    if (this.pirSettingsMode.controls.pirVideoDuration.invalid) {
      //disable next till user enters a valid value here
      console.log("Invalid PIR Mode settings Video Duration: pls enter a valid value  to proceed");
      this.currentSlide = false;
    } else {
      this.currentSlide = true;
      console.log("Valid PIR Mode settings Video Duration: proceeding");
    }
  }

  slidePirSettingsModeVidExt(event) {
    if (this.pirSettingsMode.controls.pirVideoExtension.invalid) {
      //disable next till user enters a valid value here
      console.log("Invalid PIR Mode settings Video Extension: pls enter a valid value  to proceed");
      this.currentSlide = false;
    } else {
      this.currentSlide = true;
      console.log("Valid PIR Mode settings Video Extension: proceeding");
    }
  }


  slideChanged() {
    let currentIndex = this.slides.getActiveIndex();
    console.log('Current index is', currentIndex);
  }

  next() {
    switch (+this.triggerSetting) {
      case TRIGGER_SETTING.TRIGGER_TIMER_ONLY: {
        if ((this.slides.getActiveIndex() == 3)) {
          console.log("No more timer settings, write to device or exit");
          this.showAlert("Settings Done", "Settings Done : pls write to device or disconnect");
          this.timerSettingsDone = true;
        } else {
            console.log("Next slide");
            this.slides.slideNext();  
          }  
        break;
      }
      case TRIGGER_SETTING.TRIGGER_PIR_ONLY: {
        if ((this.slides.getActiveIndex() == 3)) {
          console.log("No more pir settings, write to device or exit");
          this.showAlert("Settings Done", "Settings Done: pls write to device or disconnect");
          this.pirSettingsDone = true;
        } else {
            console.log("Next slide");
            this.slides.slideNext();    
          }
        break;
      }
      case TRIGGER_SETTING.TRIGGER_BOTH : {
       if ((this.slides.getActiveIndex() == 6)) {
          console.log("No more timer + pir settings, write to device or exit");
          this.showAlert("Settings Done", "Settings Done: pls write to device or disconnect");
          this.pirSettingsDone = true;
        } else {
            console.log("Next slide");
            this.slides.slideNext();    
          }
        break; 
      }
      default: {
         console.log("DOnt know trigger setting");
         break;
      }
    }

    
  }

  prev() {
    this.slides.slidePrev();
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
