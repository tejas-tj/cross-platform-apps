import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { NativeStorage } from '@ionic-native/native-storage';

// TBD : these shd be common to home.ts too : figure out how to share common header file
const APPIKO_DUMMY_DEVICE_MAC = 'AA:BB:CC:DD:EE:FF';
const APPIKO_DUMMY_DEVICE_NAME = 'Dummy Device (Sample to view config options)';

// Bluetooth UUIDs
const UUID_SENSE_PI_SERVICE = '3c73dc50-07f5-480d-b066-837407fbde0a';
const UUID_SENSE_BOARD_SETTINGS = '3c73dc51-07f5-480d-b066-837407fbde0a';
const UUID_SENSE_PI_USER_SETTINGS = '3c73dc52-07f5-480d-b066-837407fbde0a';

const FW_VER='1.0';

const CAMERA_MAKE_NIKON=1;
const CAMERA_MAKE_CANON=2;
const CAMERA_MAKE_SONY=3;

const SENSEPI_SETTINGS_LENGTH=17;

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

@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html',
})
export class DetailPage {
  
  realConnection: boolean = true;

  peripheral: any = {};
    
  //settings : SensePiSettings;
  triggerSetting: number;

  radioClickedTriggerTimer: boolean = false;
  radioClickedTriggerPir: boolean = false;
  radioClickedTriggerBoth: boolean = false;

  timerInterval: number;
  timerOpertimeSetting: number;
  timerDNThreshold: number;
  timerMode: number;

  timerBurstGap: number;
  timerBurstNumber: number;
  timerBulbExposureTime: number;
  timerVideoDuration: number;
  timerVideoExtension: number;
  radioTimerClickedSingle: boolean = false;
  radioTimerClickedBurst: boolean = false;
  radioTimerClickedBulb: boolean = false;
  radioTimerClickedVideo: boolean = false;
  radioTimerClickedFocus: boolean = false;
  
  pirOpertimeSetting: number;
  pirDNThreshold: number;
  pirMode: number;
  pirBurstGap: number;
  pirBurstNumber: number;
  pirBulbExposureTime: number;
  pirVideoDuration: number;
  pirVideoExtension: number;
  radioPirClickedSingle: boolean = false;
  radioPirClickedBurst: boolean = false;
  radioPirClickedBulb: boolean = false;
  radioPirClickedVideo: boolean = false;
  radioPirClickedFocus: boolean = false;


  pirThreshold: number;
  pirAmplification: number;
  pirInterTriggerTime: number;
  
  public buttonColor: string = "plain";
    
  makes: any[];
  
  make: number;
  
  statusMessage: string;
  
  styling: any = {
    'clickBg': false
  };
  
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private ble: BLE,
    private alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private nstorage: NativeStorage,
    private ngZone: NgZone) {
      
      let device = navParams.get('device');
  
      if (device.name == APPIKO_DUMMY_DEVICE_NAME) {
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

      this.initializeMakes();
      
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

    public setTimerOpertimeSetting(event) {
      console.log('TIMER : timerOpertimeSetting : time was set to ' + event);
      this.timerOpertimeSetting = event;
    }
   public setTimerDNThreshold(event) {
      console.log('Timer: DayNight Threshold set to ' + this.timerDNThreshold);
    }
    
    public resetTimerModes() {
      this.radioTimerClickedSingle = false;
      this.radioTimerClickedBurst = false;
      this.radioTimerClickedBulb = false;
      this.radioTimerClickedVideo = false;
      this.radioTimerClickedFocus = false;
    }

    public setTimerBurstGap(event) {
      //pnarasim : sending data in units of 0.1 - so if user enters 2.5, send 25
      console.log("TIMER: Burst Gap is set to " + this.timerBurstGap);
    }
    
    public setTimerBurstNumber(event) {
      console.log("TIMER: Burst Number of shots is set to " + this.timerBurstNumber);
    }

    public setTimerBulbExposureTime(event) {
      console.log("TIMER: Bulb Exposure Time is set to " + this.timerBulbExposureTime);
    }

    public setTimerVideoDuration(event) {
       console.log("TIMER: Video Duration is set to " + this.timerVideoDuration);
    }

    public setTimerVideoExtension(event) {
       console.log("TIMER: Video Extension is set to " + this.timerVideoExtension);
    }

    public setTimerMode(event) {
      console.log('TIMER : mode : mode selected was ' + event);
      //everytime user selects a different mode, reset all to zero.
      this.resetTimerModes();
      this.timerMode = event;
      switch (+event) {
        case MODE_SETTING.TRIGGER_SINGLE: {
          console.log('TIMER: Radio button SINGLE TRIGGER selected');
          this.radioTimerClickedSingle = true;
          break;
        } 
        case MODE_SETTING.TRIGGER_BURST:{
          console.log('TIMER: Radio button BURST TRIGGER selected');
          this.radioTimerClickedBurst = true;
          console.log('Burst Gap selected as ' + this.timerBurstGap  + ' and burst number of shots is ' + this.timerBurstNumber);
          break;
        }
        case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
          console.log('TIMER: Radio button BULB EXPPOSURE TRIGGER selected');
          this.radioTimerClickedBulb = true;
          console.log('TIMER: bulbExposureTime set to ' + this.timerBulbExposureTime);
          break;
        }
        case MODE_SETTING.TRIGGER_VIDEO: {
          console.log('TIMER: Radio button VIDEO TRIGGER selected');
          this.radioTimerClickedVideo = true;
          console.log('TIMER: videoDuration = ' + this.timerVideoDuration + ' videoExtension = ' + this.timerVideoExtension);
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
  
    public setTriggerTimerInterval(event) {
      console.log('Timer: Interval set to ' + this.timerInterval);
    }

    // PIR settings

    public setPirOpertimeSetting(event) {
      console.log('Pir : PirOpertimeSetting : time was set to ' + event);
      //this.pirOpertimeSetting = event;
    }
    public setPirDNThreshold(event) {
      console.log('Pir: DayNight Threshold set to ' + this.pirDNThreshold);
    }
   
    public resetPirModes() {
      this.radioPirClickedSingle = false;
      this.radioPirClickedBurst = false;
      this.radioPirClickedBulb = false;
      this.radioPirClickedVideo = false;
      this.radioPirClickedFocus = false;
    }

    public setPirBurstGap(event) {
      console.log("Pir: Burst Gap is set to " + this.pirBurstGap);
    }

    public setPirBurstNumber(event) {
      console.log("Pir: Burst Number of shots is set to " + this.pirBurstNumber);
    }

    public setPirBulbExposureTime(event) {
      console.log("Pir: Bulb Exposure Time is set to " + this.pirBulbExposureTime);
    }

    public setPirVideoDuration(event) {
       console.log("Pir: Video Duration is set to " + this.pirVideoDuration);
    }

    public setPirVideoExtension(event) {
       console.log("Pir: Video Extension is set to " + this.pirVideoExtension);
    }

    public setPirMode(event) {
      console.log('Pir : mode : mode selected was ' + event);
      //everytime user selects a different mode, reset all to zero.
      this.resetPirModes();
      this.pirMode = event;
      switch (+event) {
        case MODE_SETTING.TRIGGER_SINGLE: {
          console.log('Pir: Radio button SINGLE TRIGGER selected');
          this.radioPirClickedSingle = true;
          break;
        } 
        case MODE_SETTING.TRIGGER_BURST:{
          console.log('Pir: Radio button BURST TRIGGER selected');
          this.radioPirClickedBurst = true;
          console.log('Burst Gap selected as ' + this.pirBurstGap + ' and burst number of shots is ' + this.pirBurstNumber);
          break;
        }
        case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
          console.log('Pir: Radio button BULB EXPPOSURE TRIGGER selected');
          this.radioPirClickedBulb = true;
          console.log('Pir: bulbExposureTime set to ' + this.pirBulbExposureTime);
          break;
        }
        case MODE_SETTING.TRIGGER_VIDEO: {
          console.log('Pir: Radio button VIDEO TRIGGER selected');
          this.radioPirClickedVideo = true;
          console.log('Pir: videoDuration = ' + this.pirVideoDuration + ' videoExtension = ' + this.pirVideoExtension);
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

    public setPirThreshold(event) {
      console.log('Pir: Threshold set to ' + this.pirThreshold);
    }
 
    public setPirAmplification(event) {
      console.log('Pir: Amplification set to ' + this.pirAmplification);
    }

    public setPirInterTriggerTime(event) {
      console.log('Pir: Inter Trigger Time set to ' + this.pirInterTriggerTime); 
    }
    
    // To initialize make names for camera attached
    initializeMakes() {
      this.makes = [
        { id: CAMERA_MAKE_CANON, name: 'Canon' },
        { id: CAMERA_MAKE_NIKON, name: 'Nikon' },
        { id: CAMERA_MAKE_SONY, name: 'Sony' }
      ];
    }
    
    public setMake(event) {
      this.make = event.id;
      console.log('Make = ' + event.id + " Make name = " + event.name);
    }

    public print_settings_arraybufffer(writeBuffer:ArrayBuffer) {

      var dataview = new DataView(writeBuffer);
      console.log("===============SETTINGS WRITTEN TO BOARD ============================")

      console.log('triggerSetting (1 byte)= ' + dataview.getUint8(OFFSET_TRIGGER_SETTING));
      // == PIR Settings ====
      console.log('PIR OpertimeSetting DN Threshold = ' + (dataview.getUint8(OFFSET_PIR_OPER)>>1));
      console.log('PIR OpertimeSetting DN mode = ' + (dataview.getUint8(OFFSET_PIR_OPER) & 1));

      console.log('PIR mode (1 byte)= ' + dataview.getUint8(OFFSET_PIR_MODE));
      switch(+dataview.getUint8(OFFSET_PIR_MODE)) {
        case MODE_SETTING.TRIGGER_SINGLE: {
          //no extra data to record.
          console.log("PIR Mode Larger Value (2 bytes) =" + dataview.getUint16(OFFSET_PIR_MODE_DATA_LARGER_VALUE));
          console.log("PIR Mode Smaller Value (1 bytes) =" + dataview.getUint8(OFFSET_PIR_MODE_DATA_SMALLER_VALUE));
          break;
        }
        case MODE_SETTING.TRIGGER_BURST: {
          console.log("PIR BurstGap (2 bytes)= " + dataview.getUint16(OFFSET_PIR_MODE_BURST_GAP));
          console.log("PIR BurstNumber (1 byte)= " + dataview.getUint8(OFFSET_PIR_MODE_BURST_NUMBER));
          break;
        }
        case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
          console.log("PIR BulbExposureTime = (3 bytes)" + 
            ((dataview.getUint16(OFFSET_PIR_MODE_BULB_EXPOSURE)) + (dataview.getUint8(OFFSET_PIR_MODE_BULB_EXPOSURE+2)<<16)));
          break;
        }
        case MODE_SETTING.TRIGGER_VIDEO: {
          console.log("PIR VideoDuration = (2 bytes)" + dataview.getUint16(OFFSET_PIR_MODE_VIDEO_DURATION) + " VideoExtension (1 byte)= " + dataview.getUint8(OFFSET_PIR_MODE_VIDEO_EXTENSION)); 
          break;
        }
        default: {
          break;
        }
      
      }
    
      console.log('PIR Threshold (1 byte)= ' + dataview.getUint8(OFFSET_PIR_THRESHOLD));
      console.log('PIR Amplification (1 byte)= ' + dataview.getUint8(OFFSET_PIR_AMPLIFICATION));
      console.log('PIR InterTriggerTime (2 bytes)= ' + dataview.getUint16(OFFSET_PIR_INTERTRIGGERTIME));
      
      // === TIMER Settings ===
      console.log('TIMER timerInterval (2 bytes)= ' + dataview.getUint16(OFFSET_TIMER_INTERVAL));
      
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
          console.log("TIMER Mode Larger Value (2 bytes)=" + dataview.getUint16(OFFSET_TIMER_MODE_DATA_LARGER_VALUE));
          console.log("TIMER Mode Smaller Value (1 byte)=" + dataview.getUint8(OFFSET_TIMER_MODE_DATA_SMALLER_VALUE));
          break;
        }
        case MODE_SETTING.TRIGGER_BURST: {
          console.log("TIMER BurstGap (2 bytes)= " + dataview.getUint16(OFFSET_TIMER_MODE_BURST_GAP));
          console.log("TIMER BurstNumber (1 byte)= " + dataview.getUint8(OFFSET_TIMER_MODE_BURST_NUMBER));
          break;
        }
        case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
          console.log("TIMER BulbExposureTime (3 bytes) = " + 
            ((dataview.getUint16(OFFSET_TIMER_MODE_BULB_EXPOSURE))+(dataview.getUint8(OFFSET_TIMER_MODE_BULB_EXPOSURE+2)<<16)));
          break;
        }
        case MODE_SETTING.TRIGGER_VIDEO: {
          console.log("TIMER VideoDuration (2 bytes)= " + dataview.getUint16(OFFSET_TIMER_MODE_VIDEO_DURATION) + " VideoExtension (1 byte)= " + dataview.getUint8(OFFSET_TIMER_MODE_VIDEO_EXTENSION)); 
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
      if (this.pirOpertimeSetting == TIME_SETTING.DAYNIGHT_BOTH) {
        dataview.setUint8(OFFSET_PIR_OPER, 1);
      } else {
        dataview.setUint8(OFFSET_PIR_OPER, ((this.pirDNThreshold<<1) + (this.pirOpertimeSetting&0x01)));
        console.log('PIR DNT = ' + (this.pirDNThreshold<<1) + ' + ' + this.pirOpertimeSetting + ' = ' + 
          (((this.pirDNThreshold<<1) + (this.pirOpertimeSetting&0x01))));
      }
      
      dataview.setUint8(OFFSET_PIR_MODE,this.pirMode);
      
      switch (+this.pirMode) {
        case MODE_SETTING.TRIGGER_SINGLE: {
          //no extra data to record.
          dataview.setUint16(OFFSET_PIR_MODE_DATA_LARGER_VALUE, 0);
          dataview.setUint8(OFFSET_PIR_MODE_DATA_SMALLER_VALUE, 0);
          break;
        }
        case MODE_SETTING.TRIGGER_BURST: {
          dataview.setUint16(OFFSET_PIR_MODE_BURST_GAP, (this.pirBurstGap*10), true);
          dataview.setUint8(OFFSET_PIR_MODE_BURST_NUMBER, this.pirBurstNumber);
          break;
        }
        case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
          dataview.setUint16(OFFSET_PIR_MODE_BULB_EXPOSURE, ((this.pirBulbExposureTime*10)&0xFFFF), true);
          dataview.setUint8(OFFSET_PIR_MODE_BULB_EXPOSURE+2, ((this.pirBulbExposureTime*10) >>16));
          break;
        }
        case MODE_SETTING.TRIGGER_VIDEO: {
          dataview.setUint16(OFFSET_PIR_MODE_VIDEO_DURATION, this.pirVideoDuration, true);
          dataview.setUint8(OFFSET_PIR_MODE_VIDEO_EXTENSION, this.pirVideoExtension); 
          break;
        }
        default: {
          break;
        }
      } 
      dataview.setUint8(OFFSET_PIR_THRESHOLD, this.pirThreshold);
      dataview.setUint8(OFFSET_PIR_AMPLIFICATION, this.pirAmplification);
      dataview.setUint16(OFFSET_PIR_INTERTRIGGERTIME, (this.pirInterTriggerTime*10), true); 
      
      //dataview.setUint8(OFFSET_MAKE, this.make); 

      // ==== TIMER SETTINGS ++++
      dataview.setUint16(OFFSET_TIMER_INTERVAL, (this.timerInterval*10), true);
      
      if (this.timerOpertimeSetting == TIME_SETTING.DAYNIGHT_BOTH) {
        dataview.setUint8(OFFSET_TIMER_OPER, 1);
      } else {
        dataview.setUint8(OFFSET_TIMER_OPER, ((this.timerDNThreshold<<1) + (this.timerOpertimeSetting&0x01)));
        console.log('TIMER DNT = ' + (this.timerDNThreshold<<1) + ' + ' + this.timerOpertimeSetting + ' = ' + 
          (((this.timerDNThreshold<<1) + (this.timerOpertimeSetting&0x01))));
      }
      
      dataview.setUint8(OFFSET_TIMER_MODE,this.timerMode);
      
      switch (+this.timerMode) {
        case MODE_SETTING.TRIGGER_SINGLE: {
          //no extra data to record.
          dataview.setUint16(OFFSET_TIMER_MODE_DATA_LARGER_VALUE, 0);
          dataview.setUint8(OFFSET_TIMER_MODE_DATA_SMALLER_VALUE, 0);
          break;
        }
        case MODE_SETTING.TRIGGER_BURST: {
          dataview.setUint16(OFFSET_TIMER_MODE_BURST_GAP, (this.timerBurstGap*10), true);
          dataview.setUint8(OFFSET_TIMER_MODE_BURST_NUMBER, this.timerBurstNumber);
          break;
        }
        case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
          dataview.setUint16(OFFSET_TIMER_MODE_BULB_EXPOSURE, ((this.timerBulbExposureTime*10)&0xFFFF), true);
          dataview.setUint8(OFFSET_TIMER_MODE_BULB_EXPOSURE+2, ((this.timerBulbExposureTime*10)>>16));
          break;
        }
        case MODE_SETTING.TRIGGER_VIDEO: {
          dataview.setUint16(OFFSET_TIMER_MODE_VIDEO_DURATION, this.timerVideoDuration, true);
          dataview.setUint8(OFFSET_TIMER_MODE_VIDEO_EXTENSION, this.timerVideoExtension); 
          break;
        }
        default: {
          break;
        }
      } 
      
      this.print_settings_arraybufffer(writeBuffer);
      
      return writeBuffer;

    }

    onButtonClickSaveSettings(event) {
      // save all the current settings
      console.log("Saving all current values to default profile"); 
      this.nstorage.setItem('TRIGGER_SETTING', this.triggerSetting);
      this.nstorage.setItem('TIMER_INTERVAL', this.timerInterval);
      this.nstorage.setItem('TIMER_OPERSETTING', this.timerOpertimeSetting);
      this.nstorage.setItem('TIMER_DNTHRESHOLD', this.timerDNThreshold);
      this.nstorage.setItem('TIMER_MODE', this.timerMode);
      this.nstorage.setItem('TIMER_BURSTGAP', this.timerBurstGap);
      this.nstorage.setItem('TIMER_BURSTNUMBER', this.timerBurstNumber);
      this.nstorage.setItem('TIMER_BULBEXPOSURE', this.timerBulbExposureTime);
      this.nstorage.setItem('TIMER_VIDEODURATION', this.timerVideoDuration);
      this.nstorage.setItem('TIMER_VIDEO_EXTENSION', this.timerVideoExtension);
      this.nstorage.setItem('PIR_OPERSETTING', this.pirOpertimeSetting);
      this.nstorage.setItem('PIR_DNTHRESHOLD', this.pirDNThreshold);
      this.nstorage.setItem('PIR_MODE', this.pirMode);
      this.nstorage.setItem('PIR_BURSTGAP', this.pirBurstGap);
      this.nstorage.setItem('PIR_BURSTNUMBER', this.pirBurstNumber);
      this.nstorage.setItem('PIR_BULBEXPOSURE', this.pirBulbExposureTime);
      this.nstorage.setItem('PIR_VIDEODURATION', this.pirVideoDuration);
      this.nstorage.setItem('PIR_VIDEOEXTENSION', this.pirVideoExtension);
      this.nstorage.setItem('PIR_THRESHOLD', this.pirThreshold);
      this.nstorage.setItem('PIR_AMPLIFICATION', this.pirAmplification);
      this.nstorage.setItem('PIR_INTERTRIGGERTIME', this.pirInterTriggerTime);
    }


    async onButtonClickPopSettings(event) {
      console.log("Popping all settings from saved/default profile");
      this.triggerSetting = await this.nstorage.getItem('TRIGGER_SETTING');

      this.timerInterval = await this.nstorage.getItem('TIMER_INTERVAL');
      this.timerOpertimeSetting = await this.nstorage.getItem('TIMER_OPERSETTING');
      this.timerDNThreshold = await this.nstorage.getItem('TIMER_DNTHRESHOLD');
      this.timerMode = await this.nstorage.getItem('TIMER_MODE');
      this.timerBurstGap = await this.nstorage.getItem('TIMER_BURSTGAP');
      this.timerBurstNumber = await this.nstorage.getItem('TIMER_BURSTNUMBER');
      this.timerBulbExposureTime = await this.nstorage.getItem('TIMER_BULBEXPOSURE');
      this.timerVideoDuration = await this.nstorage.getItem('TIMER_VIDEODURATION');
      this.timerVideoExtension = await this.nstorage.getItem('TIMER_VIDEO_EXTENSION');
      this.pirOpertimeSetting = await this.nstorage.getItem('PIR_OPERSETTING');
      this.pirDNThreshold = await this.nstorage.getItem('PIR_DNTHRESHOLD');
      this.pirMode = await this.nstorage.getItem('PIR_MODE');
      this.pirBurstGap = await this.nstorage.getItem('PIR_BURSTGAP');
      this.pirBurstNumber = await this.nstorage.getItem('PIR_BURSTNUMBER');
      this.pirBulbExposureTime = await this.nstorage.getItem('PIR_BULBEXPOSURE');
      this.pirVideoDuration = await this.nstorage.getItem('PIR_VIDEODURATION');
      this.pirVideoExtension = await this.nstorage.getItem('PIR_VIDEOEXTENSION');
      this.pirThreshold = await this.nstorage.getItem('PIR_THRESHOLD');
      this.pirAmplification = await this.nstorage.getItem('PIR_AMPLIFICATION');
      this.pirInterTriggerTime = await this.nstorage.getItem('PIR_INTERTRIGGERTIME');
      
    }
    
    // To write the value of each characteristic to the device 
    onButtonClickWrite(event) {

      let data = this.constructArrayBufferToWrite();  
      console.log("Size of buffer being written is " + data.byteLength);    
      this.ble.write(this.peripheral.id, UUID_SENSE_PI_SERVICE, UUID_SENSE_PI_USER_SETTINGS, data).then(
        () => this.setStatus('Write Success'),
        //console.log('Wrote all settings to the device = ' + data)
      )
      .catch(
        e => console.log('error in writing to device : ' + e),
      );
       
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
