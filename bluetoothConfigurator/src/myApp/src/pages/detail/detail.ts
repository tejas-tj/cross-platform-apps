import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';

// Bluetooth UUIDs
const UUID_SENSE_PI_SERVICE = '3c73dc50-07f5-480d-b066-837407fbde0a';
const UUID_SENSE_PI_TIME = '3c73dc51-07f5-480d-b066-837407fbde0a';
                               
const UUID_SENSE_PI_INTERFACE_VERSION = '3c73dc51-07f5-480d-b066-837407fbde0a';

/*
const UUID_SENSE_PI_TIME = '3c73dc51-07f5-480d-b066-837407fbde0a';
const UUID_SENSE_PI_MODE = '3c73dc52-07f5-480d-b066-837407fbde0a';
const UUID_SENSE_PI_SENSITIVITY = '3c73dc53-07f5-480d-b066-837407fbde0a';
const UUID_SENSE_PI_TRIGGERS = '3c73dc54-07f5-480d-b066-837407fbde0a';
const UUID_SENSE_PI_ACTIVATE = '3c73dc55-07f5-480d-b066-837407fbde0a';
const UUID_SENSE_PI_CAMERA = '3c73dc56-07f5-480d-b066-837407fbde0a';
*/

enum TIME_SETTING {
  NIGHT_ONLY,
  DAY_ONLY,
  DAYNIGHT_BOTH 
}

@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html',
})
export class DetailPage {
  
  peripheral: any = {};
    
  timeSetting: Uint8Array;

  mode: number;
  sensitivity: number;
  triggers: number;
  isActivated: number;

  
  burstTime: number;
  exposureTime: number;
  videoDuration: number;
  videoExtension: number;
  
  buttonClickedSingle: boolean = false;
  buttonClickedBurst: boolean = false;
  buttonClickedBulb: boolean = false;
  buttonClickedVideo: boolean = false;
  buttonClickedFocus: boolean = false;

  public buttonColor: string = "plain";
    
  companies: any[];
  models: any[];
  selectedModels: any[];
  
  company: any;
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

      this.initializeCompany();
      this.initializeModel();
      
    }
    
    
    // When connection to the peripheral is successful
    onConnected(peripheral) {
      
      this.peripheral = peripheral;
      this.setStatus('Connected to ' + (peripheral.name || peripheral.id));
      console.log(JSON.stringify(peripheral, null, 2));
      //pnarasim : why this?
      /*this.ble.startNotification(this.peripheral.id, UUID_SENSE_PI_SERVICE, UUID_SENSE_PI_TIME).subscribe(
        () => this.showAlert('Unexpected Error', 'Failed to subscribe')
      )*/
    }
  

    public setTimeSetting(event) {
      console.log('timeSetting : time was set to ' + event);
      this.timeSetting = new Uint8Array(4);
      this.timeSetting[0]=0x00;
      this.timeSetting[1]=0x00;
      this.timeSetting[2]=0x00;
      this.timeSetting[3]=event;
    }
    
    /* pnarasim: unused
    public selectMode(event) {
            
    }
    */

    public setSingleTrigger(event) {
      
    }
    
    public unsetSingleTrigger(event) {
      
    }
    
    // To show input box to enter time between bursts
    public onButtonClickBurst() {
      this.buttonClickedBurst = !this.buttonClickedBurst;
    }
    
    // To show input box to enter time for exposure at night
    public onButtonClickBulb() {
      this.buttonClickedBulb = !this.buttonClickedBulb;
    }
    
    // To show input box to enter duration of video & extension time
    public onButtonClickVideo() {
      this.buttonClickedVideo = !this.buttonClickedVideo;
    }

    public onButtonClickFocus() {
      
    }
    
    // To grey out modes which are not selected
    onButtonClickDisable(event) {
      this.buttonColor = "light";
    }
    
    sensitivityThreshold(event) {
      
    }
    
    triggerTime(event) {
      
    }
    
    activate(event) {
      
    }
    
    cameraDetails(event) {
      
    }
    
    // To initialize company names for camera model attached
    initializeCompany() {
      this.companies = [
        { id: 1, name: 'Canon' },
        { id: 2, name: 'Nikon' },
        { id: 3, name: 'Sony' }
      ];
    }
    
    // To initialize model names for camera model attached
    initializeModel() {
      this.models = [
        { id: 1, name: 'Canon EOS 80D', company_id: 1, company_name: 'Canon' },
        { id: 2, name: 'Canon PowerShot ELPH 190 IS', company_id: 1, company_name: 'Canon' },
        { id: 3, name: 'Nikon D5100', company_id: 2, company_name: 'Nikon' },
        { id: 4, name: 'Nikon D5200', company_id: 2, company_name: 'Nikon' },
        { id: 5, name: 'Sony Alpha 580', company_id: 3, company_name: 'Sony' },
        { id: 7, name: 'Sony Alpha 33', company_id: 3, company_name: 'Sony' }
      ];
    }
    
    // To populate model names based on selected company name
    setModelNames(company) {
      this.selectedModels = this.models.filter(model => model.company_id == company.id)
    }
    
    // To write the value of each characteristic to the device 
    onButtonClickWrite(event) {
      
      this.ble.write(this.peripheral.id, UUID_SENSE_PI_SERVICE, UUID_SENSE_PI_TIME, this.timeSetting.buffer).then(
        () => this.setStatus('Successfully Set timeSetting on device to ' + this.timeSetting) 
      )
      .catch(
        e => console.log(e),
      );
      
      
/*
      let modeBuffer = new Uint8Array([this.mode]).buffer;
      this.ble.write(this.peripheral.id, APPIKOSENSE_SERVICE, APPIKOSENSE_MODE, modeBuffer).then(
        () => this.setStatus('Set mode to ' + this.mode)  
      )
      .catch(
        e => console.log(e)
      );
      

      let sensitivityBuffer = new Uint8Array([this.sensitivity]).buffer;
      this.ble.write(this.peripheral.id, APPIKOSENSE_SERVICE, APPIKOSENSE_SENSITIVITY, sensitivityBuffer).then(
        () => this.setStatus('Set sensitivity to ' + this.sensitivity) 
      )
      .catch(
        e => console.log(e)
      );
      

      let triggersBuffer = new Uint8Array([this.triggers]).buffer;
      this.ble.write(this.peripheral.id, APPIKOSENSE_SERVICE, APPIKOSENSE_TRIGGERS, triggersBuffer).then(
        () => this.setStatus('Set time between triggers to ' + this.triggers)  
      )
      .catch(
        e => console.log(e)
      );
      

      let activateBuffer = new Uint8Array([this.isActivated]).buffer;
      this.ble.write(this.peripheral.id, APPIKOSENSE_SERVICE, APPIKOSENSE_ACTIVATE, activateBuffer).then(
        () => this.setStatus('Set signal status to ' + this.isActivated) 
      )
      .catch(
        e => console.log(e)
      );
      

      let cameraBuffer = new Uint8Array([this.model]).buffer;
      this.ble.write(this.peripheral.id, APPIKOSENSE_SERVICE, APPIKOSENSE_CAMERA, cameraBuffer).then(
        () => this.setStatus('Set camera model attached to ' + this.model) 
      )
      .catch(
        e => console.log(e)
      );
    */

    }
  
    
    // Disconnect peripheral when leaving the page
    ionViewWillLeave() {
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
