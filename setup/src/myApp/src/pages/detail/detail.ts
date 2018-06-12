import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';

// TBD : these shd be common to home.ts too : figure out how to share common header file
const APPIKO_DUMMY_DEVICE_MAC = 'AA:BB:CC:DD:EE:FF';
const APPIKO_DUMMY_DEVICE_NAME = 'Dummy Device (Sample to view config options)';

// Bluetooth UUIDs
const UUID_SENSE_PI_SERVICE = '3c73dc50-07f5-480d-b066-837407fbde0a';
const UUID_SENSE_BOARD_SETTINGS = '3c73dc51-07f5-480d-b066-837407fbde0a';
const UUID_SENSE_PI_USER_SETTINGS = '3c73dc52-07f5-480d-b066-837407fbde0a';

const FW_VER='1.0';

const SENSEPI_SETTINGS_LENGTH=11;
const OFFSET_TIME=0;
const OFFSET_MODE=1;
const OFFSET_BURSTGAP_BULBEXP=2;
const OFFSET_VIDEO=4;
const OFFSET_SENSITIVITY=5;
const OFFSET_TRIGGER_GAP=6;
const OFFSET_FOCUS_ACTIVATED=8;
const OFFSET_MAKE=9;
const OFFSET_MODEL=10;

/* not needed now
enum TIME_SETTING {
  NIGHT_ONLY,
  DAY_ONLY,
  DAYNIGHT_BOTH 
}
*/

//pnarasim : want to use this type throughout, but not able to pass to the html
//this is a placeholder till i figure that out
/*
type SensePiSettings  = {
  timeSetting: number;
  mode: number;
  burstGap: number;
  bulbExposureTime: number;
  videoDuration: number;
  videoExtension: number;
  sensitivity: number;
  triggerGap: number;
  focusActivated: boolean;
}
*/

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
  timeSetting: number;
  mode: number;
  sensitivity: number;
  triggerGap: number;
  focusActivated: boolean = false;

  radioClickedTriggerTimer: boolean = false;
  radioClickedTriggerPIR: boolean = false;
  radioClickedTriggerBoth: boolean = false;

  burstGap: number;
  bulbExposureTime: number;
  videoDuration: number;
  videoExtension: number;
  triggerTimerInterval: number;

  radioClickedSingle: boolean = false;
  radioClickedBurst: boolean = false;
  radioClickedBulb: boolean = false;
  radioClickedVideo: boolean = false;
  radioClickedFocus: boolean = false;

  public buttonColor: string = "plain";
    
  makes: any[];
  models: any[];
  selectedModels: any[];
  
  make: any;
  model: any;
  
  statusMessage: string;
  
  styling: any = {
    'clickBg': false
  };
  
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private ble: BLE,
    private alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
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
      this.initializeModels();
      
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
  

    public setTriggerSetting(event) {
      console.log('triggerSetting : trigger was set to ' + event);
      this.triggerSetting = event;
      switch (+event)  {
        case TRIGGER_SETTING.TRIGGER_TIMER_ONLY : {
          console.log("Trigger mode is TIMER only");
          this.radioClickedTriggerTimer = true;
          this.radioClickedTriggerPIR = false;
          this.radioClickedTriggerBoth = false;
          break;
        }
        case TRIGGER_SETTING.TRIGGER_PIR_ONLY : {
          console.log("Trigger mode is MOTION only");
          this.radioClickedTriggerTimer = false;
          this.radioClickedTriggerPIR = true;
          this.radioClickedTriggerBoth = false;
          break;
        }
        case TRIGGER_SETTING.TRIGGER_BOTH : {
          console.log("Trigger mode is TIMER + MOTION");
          this.radioClickedTriggerTimer = false;
          this.radioClickedTriggerPIR = false;
          this.radioClickedTriggerBoth = true;
          break;
        }
        default :{
          console.log("default trigger?");
          break;
        }
      }
    }

    public setTimeSetting(event) {
      console.log('timeSetting : time was set to ' + event);
      this.timeSetting = event;
    }
    
    public resetModes() {
      this.radioClickedSingle = false;
      this.radioClickedBurst = false;
      this.radioClickedBulb = false;
      this.radioClickedVideo = false;
      this.radioClickedFocus = false;
    }

    public setBurstGap(event) {
      console.log("Burst Gap is set to " + this.burstGap);
    }

    public setBulbExposureTime(event) {
      console.log("Bulb Exposure Time is set to " + this.bulbExposureTime);
    }

    public setVideoDuration(event) {
       console.log("Video Duration is set to " + this.videoDuration);
    }

    public setVideoExtension(event) {
       console.log("Video Extension is set to " + this.videoExtension);
    }

    public setMode(event) {
      console.log('mode : mode selected was ' + event);
      //everytime user selects a different mode, reset all to zero.
      this.resetModes();
      this.mode = event;
      switch (+event) {
        case MODE_SETTING.TRIGGER_SINGLE: {
          console.log('Radio button SINGLE TRIGGER selected');
          this.radioClickedSingle = true;
          break;
        } 
        case MODE_SETTING.TRIGGER_BURST:{
          console.log('Radio button BURST TRIGGER selected');
          this.radioClickedBurst = true;
          console.log('Burst Gap selected as ' + this.burstGap);
          break;
        }
        case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
          console.log('Radio button BULB EXPPOSURE TRIGGER selected');
          this.radioClickedBulb = true;
          console.log('bulbExposureTime set to ' + this.bulbExposureTime);
          break;
        }
        case MODE_SETTING.TRIGGER_VIDEO: {
          console.log('Radio button VIDEO TRIGGER selected');
          this.radioClickedVideo = true;
          console.log('videoDuration = ' + this.videoDuration + ' videoExtension = ' + this.videoExtension);
         break;
        }
        case MODE_SETTING.TRIGGER_FOCUS: {
          console.log('Radio button FOCUS TRIGGER selected');
          this.radioClickedFocus = true;
          break;
        }
        default: { 
          break; 
        } 
      }
    }
  
    public setTriggerTimerInterval(event) {
      console.log('Interval for Timer based Triggers set to ' + this.triggerTimerInterval);
    }

    public setSensitivityThreshold(event) {
      console.log('Sensitivity Threshold set to ' + this.sensitivity);
    }

    public setTimeBetweenTriggers(event) {
     console.log('Time between triggers set to ' + this.triggerGap); 
    }
    
    public activateFocus(event) {
      //pnarasim : make sure html and the value of this var are sync-ed! tbd
      if (!this.focusActivated) {
        console.log('Focus activated');
      } else {
        console.log('Focus de-activated');
      }
    }

    // To initialize make names for camera model attached
    initializeMakes() {
      this.makes = [
        { id: 1, name: 'Canon' },
        { id: 2, name: 'Nikon' },
        { id: 3, name: 'Sony' }
      ];
    }
    
    // To initialize model names for camera model attached
    initializeModels() {
      this.models = [
        { id: 1, name: 'Canon EOS 80D', make_id: 1, make_name: 'Canon' },
        { id: 2, name: 'Canon PowerShot ELPH 190 IS', make_id: 1, make_name: 'Canon' },
        { id: 3, name: 'Nikon D5100', make_id: 2, make_name: 'Nikon' },
        { id: 4, name: 'Nikon D5200', make_id: 2, make_name: 'Nikon' },
        { id: 5, name: 'Sony Alpha 580', make_id: 3, make_name: 'Sony' },
        { id: 7, name: 'Sony Alpha 33', make_id: 3, make_name: 'Sony' }
      ];
    }
    
    // To populate model names based on selected make name
    setModelNames(make) {
      this.selectedModels = this.models.filter(model => model.make_id == make.id)
    }

    public print_settings_arraybufffer(writeBuffer:ArrayBuffer) {

      var dataview = new DataView(writeBuffer);

      console.log('timeSetting = ' + dataview.getUint8(OFFSET_TIME));
      console.log('mode = ' + dataview.getUint8(OFFSET_MODE));
      console.log('burstGap | bulbExposureTime = ' + dataview.getUint16(OFFSET_BURSTGAP_BULBEXP));
      console.log('videoDuration:videoExtension = ' + dataview.getUint8(OFFSET_VIDEO));
      console.log('sensitivity = ' + dataview.getUint8(OFFSET_SENSITIVITY));
      console.log('triggerGap = ' + dataview.getUint16(OFFSET_TRIGGER_GAP));
      console.log('focusActivated = ' + dataview.getUint8(OFFSET_FOCUS_ACTIVATED));
      console.log('make = ' + dataview.getUint8(OFFSET_MAKE));
      console.log('model = ' + dataview.getUint8(OFFSET_MODEL));
    }

    
    public constructArrayBufferToWrite():ArrayBuffer {
      /*
        Format of ArrayBuffer that the board expects : make this fw version dependent next
        uint8 timeSetting
        unint32 mode[
          uint8 single|burst|bulbexp|video|focus
          uint16 burstGap|bulbExposureTime
          uint8 videoDuration:4, videoExtension:4
        ] 
        uint8 sensitivity
        uint16 triggerGaps
        uint8 focusActivated
        uint8 make
        uint8 model
      */

      let writeBuffer = new ArrayBuffer(SENSEPI_SETTINGS_LENGTH);
      var dataview = new DataView(writeBuffer);
      //start writing the values
      dataview.setUint8(OFFSET_TIME,this.timeSetting);
      dataview.setUint8(OFFSET_MODE,this.mode);
      
      switch (+this.mode) {
        case MODE_SETTING.TRIGGER_SINGLE: {
          //no extra data to record.
          dataview.setUint16(OFFSET_BURSTGAP_BULBEXP, 0);
          dataview.setUint8(OFFSET_VIDEO, 0);
          break;
        }
        case MODE_SETTING.TRIGGER_BURST: {
          dataview.setUint16(OFFSET_BURSTGAP_BULBEXP, this.burstGap);
          dataview.setUint8(OFFSET_VIDEO, 0);
          break;
        }
        case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
          dataview.setUint16(OFFSET_BURSTGAP_BULBEXP, this.bulbExposureTime);
          dataview.setUint8(OFFSET_VIDEO, 0);
          break;
        }
        case MODE_SETTING.TRIGGER_VIDEO: {
          var viddata  = this.videoDuration << 4;
          viddata |= this.videoExtension;
          console.log("Combining " + this.videoDuration + " and " + this.videoExtension + " gives " + viddata);
          dataview.setUint16(OFFSET_BURSTGAP_BULBEXP, 0);
          dataview.setUint8(OFFSET_VIDEO, viddata); 
          break;
        }
        default: {
          break;
        }
      } 
      dataview.setUint8(OFFSET_SENSITIVITY, this.sensitivity);
      dataview.setUint16(OFFSET_TRIGGER_GAP, this.triggerGap); 
      dataview.setUint8(OFFSET_FOCUS_ACTIVATED, +this.focusActivated);
      dataview.setUint8(OFFSET_MAKE, this.make); 
      dataview.setUint8(OFFSET_MODEL, this.model);
 
      this.print_settings_arraybufffer(writeBuffer);

      return writeBuffer;
    }

    
    // To write the value of each characteristic to the device 
    onButtonClickWrite(event) {

      let data = this.constructArrayBufferToWrite();      
      this.ble.write(this.peripheral.id, UUID_SENSE_PI_SERVICE, UUID_SENSE_PI_USER_SETTINGS, data).then(
        () => this.setStatus('Write Success'),
        //console.log('Wrote all settings to the device = ' + data)
      )
      .catch(
        e => console.log('eror in writing to device : ' + e),
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
