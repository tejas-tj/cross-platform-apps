import { BLE } from '@ionic-native/ble';
import { Component, NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { DetailPage } from '../detail/detail'; 

// Bluetooth UUIDs
const APPIKOSENSE_SERVICE = '3c73dc5c-07f5-480d-b066-837407fbde0a';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  
  devices: any[] = [];
  statusMessage: string;

  constructor(public navCtrl: NavController, 
              private toastCtrl: ToastController,
              private ble: BLE,
              private ngZone: NgZone) { 
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter');
    this.scan();
  }

  scan() {
    this.setStatus('Scanning for BLE Devices');
    this.devices = [];  // clear list

    this.ble.startScan([]).subscribe(
      device => this.onDeviceDiscovered(device), 
      error => this.scanError(error)
    );

    /* setTimeout(this.setStatus.bind(this), 150000, 'Scan complete'); */
  }

  onDeviceDiscovered(device) {
    console.log('Discovered ' + JSON.stringify(device, null, 2));
    this.ngZone.run(() => {
      this.devices.push(device);
    });

    // To sort and list devices according to RSSI
    this.devices.sort(function (a, b) {
      return b.rssi - a.rssi;
    });
  }


  // If location permission is denied, you'll end up here
  scanError(error) {
    this.setStatus('Error ' + error);
    let toast = this.toastCtrl.create({
      message: 'Error scanning for Bluetooth low energy devices',
      position: 'middle',
      /* duration: 15000 */
    });
    toast.present();
  }

  setStatus(message) {
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }

   deviceSelected(device) {
    console.log(JSON.stringify(device) + ' selected');
    this.navCtrl.push(DetailPage, {
      device: device
    });
  }

}
