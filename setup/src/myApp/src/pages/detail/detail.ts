import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { NativeStorage } from '@ionic-native/native-storage';

// TBD : these shd be common to home.ts too : figure out how to share common header file
const LED_CONTROL_DUMMY_DEVICE_MAC = 'AA:BB:CC:DD:EE:FF';
const LED_CONTROL_DUMMY_DEVICE_NAME = 'Dummy Device (Sample to view config options)';

// Bluetooth UUIDs
const UUID_LED_CONTROL_SERVICE = '3c73dc50-07f5-480d-b066-837407fbde0a';
const UUID_LED_BOARD_SETTINGS = '3c73dc51-07f5-480d-b066-837407fbde0a';
const UUID_LED_CONTROL_USER_SETTINGS = '3c73dc52-07f5-480d-b066-837407fbde0a';

const FW_VER='1.0';

const LIGHT_CONFIG_LENGTH=10;

const OFFSET_LIGHT_THRESHOLD = 0;
const OFFSET_MOTION_THRESHOLD = 1;
const OFFSET_WHITE_INTENSITY = 2;
const OFFSET_RED_INTENSITY = 3;
const OFFSET_BLUE_INTENSITY = 4;
const OFFSET_GREEN_INTENSITY = 5;
const OFFSET_ON_TIME = 6;

@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html',
})
export class DetailPage {
  realConnection: boolean = true;

  peripheral: any = {};
  
  lightThreshold: number;
  motionThreshold: number;
  whiteIntensity: number;
  redIntensity: number;
  blueIntensity: number;
  greenIntensity: number;
  onTime: number;  
  public buttonColor: string = "plain";
    
  makes: any[];
  
  make: number;
  
  statusMessage: string;
  
  styling: any = {
    'clickBg': false
  };
  
  initializeVars() {
    this.lightThreshold=0;
    this.motionThreshold=100;
    this.whiteIntensity=127;
    this.redIntensity=127;
    this.blueIntensity=127;
    this.greenIntensity=127;
    this.onTime=2;

  }

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private ble: BLE,
    private alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private nstorage: NativeStorage,
    private ngZone: NgZone) {
      
      this.initializeVars();
      let device = navParams.get('device');
  
      if (device.name == LED_CONTROL_DUMMY_DEVICE_NAME) {
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

      //once connected, read the current config on the device.
      this.ble.read(this.peripheral.id, UUID_LED_CONTROL_SERVICE, UUID_LED_CONTROL_USER_SETTINGS).then(
        data => {
          console.log("read the config from the sensepi "),
          console.log("====================== SETTINGS READ AND LOADED FROM THE DEVICE =================="),
          this.print_settings_arraybufffer(data),
          this.loadDeviceConfigs(data)
        }
      ).catch(
         (e) => console.log("Error trying to read data from service " + UUID_LED_CONTROL_SERVICE + " and char " + UUID_LED_CONTROL_USER_SETTINGS + " : " + e)
      );

      //once connected, read the current config on the device.
      this.ble.read(this.peripheral.id, UUID_LED_CONTROL_SERVICE, UUID_LED_BOARD_SETTINGS).then(
        data => {
        }
      ).catch(
         (e) => console.log("Error trying to read data from service " + UUID_LED_CONTROL_SERVICE + " and char " + UUID_LED_CONTROL_USER_SETTINGS + " : " + e)
      );

      //pnarasim : why this?
      /*this.ble.startNotification(this.peripheral.id, UUID_LED_CONTROL_SERVICE, UUID_LED_CONTROL_USER_SETTINGS).subscribe(
        () => this.showAlert('Unexpected Error', 'Failed to subscribe')
      )*/
      
    }
  
   public setLightThreshold(event) {
      console.log('Light Threshold set to ' + this.lightThreshold);
    }
   public setMotionThreshold(event) {
      console.log('Motion Threshold set to ' + this.motionThreshold);
    }
   public setWhiteIntensity(event) {
      console.log('White Intensity set to ' + this.whiteIntensity);
    }
   public setRedIntensity(event) {
      console.log('Red Intensity set to ' + this.redIntensity);
    }
   public setTBlueIntensity(event) {
      console.log('Blue Intensity set to ' + this.blueIntensity);
    }
   public setGreenIntensity(event) {
      console.log('Green Intensity set to ' + this.greenIntensity);
    }
    
   public setOnTime(event) {
      console.log('On Time set to ' + this.onTime);
    }

    public loadDeviceConfigs(config) {
      /*
        Read the ArrayBuffer just sent by the board : make this fw version dependent next        
      */

      var dataview = new DataView(config);


      // ==== SETTINGS ++++
      this.lightThreshold = dataview.getUint8(OFFSET_LIGHT_THRESHOLD);
      this.motionThreshold = dataview.getUint8(OFFSET_MOTION_THRESHOLD);
      this.whiteIntensity = dataview.getUint8(OFFSET_WHITE_INTENSITY);
      this.redIntensity = dataview.getUint8(OFFSET_RED_INTENSITY);
      this.blueIntensity = dataview.getUint8(OFFSET_BLUE_INTENSITY);
      this.greenIntensity = dataview.getUint8(OFFSET_GREEN_INTENSITY);
      this.onTime = dataview.getUint32(OFFSET_ON_TIME);

    }

    public print_settings_arraybufffer(writeBuffer:ArrayBuffer) {

      var dataview = new DataView(writeBuffer);

      // === TIMER Settings ===
        console.log('Light Threshold = ' + (dataview.getUint8(OFFSET_LIGHT_THRESHOLD)));
        console.log('Motion Threshold = ' + (dataview.getUint8(OFFSET_MOTION_THRESHOLD)));
        console.log('White Intensity = ' + (dataview.getUint8(OFFSET_WHITE_INTENSITY)));
        console.log('Red Intensity = ' + (dataview.getUint8(OFFSET_RED_INTENSITY)));
        console.log('Blue Intensity = ' + (dataview.getUint8(OFFSET_BLUE_INTENSITY)));
        console.log('Green Intensity = ' + (dataview.getUint8(OFFSET_GREEN_INTENSITY)));
        console.log('On Time  = ' + (dataview.getUint32(OFFSET_ON_TIME)));
    
      console.log("===========================================")
    }

    
    public constructArrayBufferToWrite():ArrayBuffer {
      /*
        Format of ArrayBuffer that the board expects : make this fw version dependent next        
      */

      let writeBuffer = new ArrayBuffer(LIGHT_CONFIG_LENGTH);
      var dataview = new DataView(writeBuffer);

      //start writing the values
      
      dataview.setUint8(OFFSET_LIGHT_THRESHOLD, this.lightThreshold);
      dataview.setUint8(OFFSET_MOTION_THRESHOLD, this.motionThreshold);
      dataview.setUint8(OFFSET_WHITE_INTENSITY, this.whiteIntensity);
      dataview.setUint8(OFFSET_RED_INTENSITY, this.redIntensity);
      dataview.setUint8(OFFSET_BLUE_INTENSITY, this.blueIntensity);
      dataview.setUint8(OFFSET_GREEN_INTENSITY, this.greenIntensity);
      dataview.setUint32(OFFSET_ON_TIME, this.onTime);

      console.log("===============SETTINGS THAT WILL BE WRITTEN TO THE DEVICE ============================")
      this.print_settings_arraybufffer(writeBuffer);
      
      return writeBuffer;

    }

    // To write the value of each characteristic to the device 
    onButtonClickWrite(event) {

      let data = this.constructArrayBufferToWrite();  
      console.log("Size of buffer being written is " + data.byteLength);    
      this.ble.write(this.peripheral.id, UUID_LED_CONTROL_SERVICE, UUID_LED_CONTROL_USER_SETTINGS, data).then(
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
