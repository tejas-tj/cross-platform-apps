import { BLE } from '@ionic-native/ble';
import { Component, NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { DetailPage } from '../detail/detail'; 

// Appiko Sense Device Names by default
const APPIKO_SENSE_PI = 'SensePi';

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

    // To enable bluetoooth if not enabled
    ionViewDidEnter() {
      console.log('ionViewDidEnter HomePage');
      this.ble.isEnabled()
      .then(() => this.scan())
      .catch(() => {
        this.ble.enable()
        .then(() => this.scan())
        .catch(()=>this.ble.showBluetoothSettings());
      })
    }
    
    // To continuously scan for BLE Devices (stopScan is never called)
    scan() {
      this.setStatus('Scanning for Appiko BLE Devices');
      this.devices = [];  // clear list
      
      this.ble.startScan([]).subscribe(
        device => this.onDeviceDiscovered(device), 
        error => this.scanError(error)
      );
      
      /* setTimeout(this.setStatus.bind(this), 150000, 'Scan complete'); */
    }
    
    // To list the devices as they are discovered
    onDeviceDiscovered(device) {
      console.log('Discovered ' + JSON.stringify(device, null, 2));

      this.ngZone.run(() => {
        if (device.name == APPIKO_SENSE_PI) {
          console.log('Discovered device is an Appiko SensePi \(determined from advertised name\)');
          this.devices.push(device);
        } else
            console.log('Discovered device is NOT an Appiko SensePi \(as determined from advertised name\)');
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
        message: 'Error scanning for Appiko BLE devices',
        position: 'middle',
        /* duration: 15000 */
      });
      toast.present();
    }
    
    // Display messages in the footer
    setStatus(message) {
      console.log(message);
      this.ngZone.run(() => {
        this.statusMessage = message;
      });
    }
    
    // Takes you to device details page on click 
    deviceSelected(device) {
      console.log(JSON.stringify(device) + ' selected');
      this.navCtrl.push(DetailPage, {
        device: device
      });
    }
    
  }
  