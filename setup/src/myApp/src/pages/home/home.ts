import { BLE } from '@ionic-native/ble';
import { Component, NgZone } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { DetailPage } from '../detail/detail'; 

// Appiko Sense Device Names by default
const LED_CONTROL = 'LED_Control';
const LED_CONTROL_COMPLETE_LOCAL_NAME = 'LED_Control';
// shortened local name is SPaabbyymmddnnnn : aa is board rev, bb is manufacturing location
const LED_CONTROL_SHORTENED_LOCAL_NAME = 'LC' 

const LED_CONTROL_RE = /LC[0-9]+/g;

// Bluetooth UUIDs
const UUID_LED_CONTROL_SERVICE = '3c73dc50-07f5-480d-b066-837407fbde0a';

//pnarasim : old UUID
//const LED_CONTROL_SERVICE = '3c73dc5c-07f5-480d-b066-837407fbde0a';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  
  devices: any[] = [];
  statusMessage: string;
  
  constructor(public navCtrl: NavController,
    private platform: Platform, 
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
      this.setStatus('Scanning Devices');
      this.devices = [];  // clear list
      
      this.ble.startScan([UUID_LED_CONTROL_SERVICE]).subscribe(
        device => this.onDeviceDiscovered(device), 
        error => this.scanError(error)
      );
      
      /* setTimeout(this.setStatus.bind(this), 150000, 'Scan complete'); */
    }
    
    // To list the devices as they are discovered
    onDeviceDiscovered(device) {
      console.log('Discovered ' + JSON.stringify(device, null, 2));
      this.ngZone.run(() => {
          console.log('Discovered device');
          this.devices.push(device); 
        }
      );
      
      // To sort and list devices according to RSSI/
      this.devices.sort(function (a, b) {
        return b.rssi - a.rssi;
      });
    }
    
    
    // If location permission is denied, you'll end up here
    scanError(error) {
      this.setStatus('Error ' + error);
      let toast = this.toastCtrl.create({
        message: 'Error scanning devices',
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
      //stop scan when device is selected
      console.log("Stopping scan");
      this.ble.stopScan();
      this.navCtrl.push(DetailPage, {
        device: device
      });
    }
    
  }
  
