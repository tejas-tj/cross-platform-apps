import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular'; 
import { BLE } from '@ionic-native/ble';

// Bluetooth UUIDs
const LEDBUTTON_SERVICE = '00001523-1212-efde-1523-785feabcd123';
const BUTTON_CHARACTERISTIC = '00001524-1212-efde-1523-785feabcd123';
const LED_CHARACTERISTIC = '00001525-1212-efde-1523-785feabcd123'; 

const APPIKOSENSE_SERVICE = '00001523-1212-efde-1523-785feabcd123';
const APPIKOSENSE_TIME = '00001523-1212-efde-1523-785feabcd123';
const APPIKOSENSE_MODE = '00001523-1212-efde-1523-785feabcd123';
const APPIKOSENSE_SENSITIVITY = '00001523-1212-efde-1523-785feabcd123';
const APPIKOSENSE_TRIGGERS = '00001523-1212-efde-1523-785feabcd123';
const APPIKOSENSE_ACTIVATE = '00001523-1212-efde-1523-785feabcd123';
const APPIKOSENSE_CAMERA = '00001523-1212-efde-1523-785feabcd123';


@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html',
})
export class DetailPage {
  
  peripheral: any = {};
  /* led: number;
  brightness: number;
  buttonState: number;
  ledStatus: number; */
  time: number;
  sensitivity: number;
  triggers: number;  
  statusMessage: string;
  
  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    private ble: BLE,
    private alertCtrl: AlertController,
    /* private toastCtrl: ToastController, */
    private ngZone: NgZone) {
      
      let device = navParams.get('device');
      
      this.setStatus('Connecting to ' + device.name || device.id);
      
      this.ble.connect(device.id).subscribe(
        peripheral => this.onConnected(peripheral),
        peripheral => this.showAlert('Disconnected', 'The peripheral unexpectedly disconnected')
      );
      
    }
    
    // the connection to the peripheral was successful
    onConnected(peripheral) {
      
      this.peripheral = peripheral;
      this.setStatus('Connected to ' + (peripheral.name || peripheral.id));
      
      this.ble.startNotification(this.peripheral.id, APPIKOSENSE_SERVICE, LED_CHARACTERISTIC).subscribe(
        
        () => this.showAlert('Unexpected Error', 'Failed to subscribe for button state changes')
      )

      this.ble.startNotification(this.peripheral.id, APPIKOSENSE_SERVICE, BUTTON_CHARACTERISTIC).subscribe(
        data => this.onButtonStateChange(data),
        () => this.showAlert('Unexpected Error', 'Failed to subscribe for button state changes')
      )
      
    }

      onButtonStateChange(buffer:ArrayBuffer) {
      var data = new Uint8Array(buffer);
      console.log(data[0]);
      this.brightness = Number(data);
  
      this.ngZone.run(() => {
        this.buttonState = data[0];
        this.ledRange(event);
      });
  
    }

    timeOfDay(event) {
      let buffer = new Uint8Array([this.led]).buffer;
      this.ble.write(this.peripheral.id, APPIKOSENSE_SERVICE, APPIKOSENSE_TIME, buffer).then(
        () => this.setStatus('Set led status to ' + this.led),
        e => this.showAlert('Unexpected Error', 'Error updating LED characteristic ' + e)
      );
    }

      selectMode(event) {
      let sliderBuffer = new Uint8Array([this.brightness]).buffer;
      this.ble.write(this.peripheral.id, APPIKOSENSE_SERVICE, APPIKOSENSE_MODE, sliderBuffer).then(
        () => this.setStatus('Set led status to ' + this.brightness),
        e => this.showAlert('Unexpected Error', 'Error updating LED characteristic ' + e)
      );
    }

    sensitivityThreshold(event) {
      let dropdownBuffer = new Uint8Array([this.ledStatus]).buffer;
      this.ble.write(this.peripheral.id, APPIKOSENSE_SERVICE, APPIKOSENSE_SENSITIVITY, dropdownBuffer).then(
        () => this.setStatus('Set led status to ' + this.ledStatus),
        e => this.showAlert('Unexpected Error', 'Error updating LED characteristic ' + e)
      );
    }

    triggerTime(event) {
      let dropdownBuffer = new Uint8Array([this.ledStatus]).buffer;
      this.ble.write(this.peripheral.id, APPIKOSENSE_SERVICE, APPIKOSENSE_TRIGGERS, dropdownBuffer).then(
        () => this.setStatus('Set led status to ' + this.ledStatus),
        e => this.showAlert('Unexpected Error', 'Error updating LED characteristic ' + e)
      );
    }

    activate(event) {
      let dropdownBuffer = new Uint8Array([this.ledStatus]).buffer;
      this.ble.write(this.peripheral.id, APPIKOSENSE_SERVICE, APPIKOSENSE_ACTIVATE, dropdownBuffer).then(
        () => this.setStatus('Set led status to ' + this.ledStatus),
        e => this.showAlert('Unexpected Error', 'Error updating LED characteristic ' + e)
      );
    }

    cameraDetails(event) {
      let dropdownBuffer = new Uint8Array([this.ledStatus]).buffer;
      this.ble.write(this.peripheral.id, APPIKOSENSE_SERVICE, APPIKOSENSE_CAMERA, dropdownBuffer).then(
        () => this.setStatus('Set led status to ' + this.ledStatus),
        e => this.showAlert('Unexpected Error', 'Error updating LED characteristic ' + e)
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

    showAlert(title, message) {
      let alert = this.alertCtrl.create({
        title: title,
        subTitle: message,
        buttons: ['OK']
      });
      alert.present();
    }
    
    setStatus(message) {
      console.log(message);
      this.ngZone.run(() => {
        this.statusMessage = message;
      });
    }
    
  }