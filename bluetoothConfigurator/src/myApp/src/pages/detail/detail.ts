import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';

// Bluetooth UUIDs
const APPIKOSENSE_SERVICE = '3c73dc5c-07f5-480d-b066-837407fbde0a';
const APPIKOSENSE_TIME = '3c73dc5c-07f6-480d-b066-837407fbde0a';
const APPIKOSENSE_MODE = '3c73dc5c-07f7-480d-b066-837407fbde0a';
const APPIKOSENSE_SENSITIVITY = '3c73dc58-07f8-480d-b066-837407fbde0a';
const APPIKOSENSE_TRIGGERS = '3c73dc5c-07f9-480d-b066-837407fbde0a';
const APPIKOSENSE_ACTIVATE = '3c73dc5c-07fa-480d-b066-837407fbde0a';
const APPIKOSENSE_CAMERA = '3c73dc5c-07fb-480d-b066-837407fbde0a';


@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html',
})
export class DetailPage {
  
  peripheral: any = {};
    
  time: number;
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
    private ngZone: NgZone) {
      
      let device = navParams.get('device');
      
      this.setStatus('Connecting to ' + device.name || device.id);
      
      this.ble.connect(device.id).subscribe(
        peripheral => this.onConnected(peripheral),
        peripheral => this.showAlert('Disconnected', 'The peripheral unexpectedly disconnected')
      );
      
      this.initializeCompany();
      this.initializeModel();
      
    }
    
    
    
    // When connection to the peripheral is successful
    onConnected(peripheral) {
      
      this.peripheral = peripheral;
      this.setStatus('Connected to ' + (peripheral.name || peripheral.id));
      
      this.ble.startNotification(this.peripheral.id, APPIKOSENSE_SERVICE, APPIKOSENSE_TIME).subscribe(
        
        () => this.showAlert('Unexpected Error', 'Failed to subscribe')
      )
      
    }
  

    public timeOfDay(event) {
      
    }
    
    public selectMode(event) {
      
      
    }

    public onButtonClickSingle() {
      
    }
    
    public onButtonClickBurst() {
  
      this.buttonClickedBurst = !this.buttonClickedBurst;
      
    }
    
    public onButtonClickBulb() {
 
      this.buttonClickedBulb = !this.buttonClickedBulb;

    }
    
    public onButtonClickVideo() {
      
      this.buttonClickedVideo = !this.buttonClickedVideo;

    }

    public onButtonClickFocus() {
      
    }
    
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
      
      let timeBuffer = new Uint8Array([this.time]).buffer;
      this.ble.write(this.peripheral.id, APPIKOSENSE_SERVICE, APPIKOSENSE_TIME, timeBuffer).then(
        () => this.setStatus('Set led status to ' + this.time) 
      )
      .catch(
        e => console.log(e)
      );
      

      let modeBuffer = new Uint8Array([this.mode]).buffer;
      this.ble.write(this.peripheral.id, APPIKOSENSE_SERVICE, APPIKOSENSE_MODE, modeBuffer).then(
        () => this.setStatus('Set led status to ' + this.mode)  
      )
      .catch(
        e => console.log(e)
      );
      

      let sensitivityBuffer = new Uint8Array([this.sensitivity]).buffer;
      this.ble.write(this.peripheral.id, APPIKOSENSE_SERVICE, APPIKOSENSE_SENSITIVITY, sensitivityBuffer).then(
        () => this.setStatus('Set led status to ' + this.sensitivity) 
      )
      .catch(
        e => console.log(e)
      );
      

      let triggersBuffer = new Uint8Array([this.triggers]).buffer;
      this.ble.write(this.peripheral.id, APPIKOSENSE_SERVICE, APPIKOSENSE_TRIGGERS, triggersBuffer).then(
        () => this.setStatus('Set led status to ' + this.triggers)  
      )
      .catch(
        e => console.log(e)
      );
      

      let activateBuffer = new Uint8Array([this.isActivated]).buffer;
      this.ble.write(this.peripheral.id, APPIKOSENSE_SERVICE, APPIKOSENSE_ACTIVATE, activateBuffer).then(
        () => this.setStatus('Set led status to ' + this.isActivated) 
      )
      .catch(
        e => console.log(e)
      );
      
      
      let cameraBuffer = new Uint8Array([this.model]).buffer;
      this.ble.write(this.peripheral.id, APPIKOSENSE_SERVICE, APPIKOSENSE_CAMERA, cameraBuffer).then(
        () => this.setStatus('Set led status to ' + this.model) 
      )
      .catch(
        e => console.log(e)
      );
      
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