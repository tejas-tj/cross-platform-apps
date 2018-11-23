import { Injectable } from '@angular/core';


/*
  Generated class for the AppikoCommonProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AppikoCommonProvider {

    //pnarasim TBD : group all vars related to the same device into an interface?
    
	  APPIKO_SENSE_RE = /S[0-9]+/g;

  	//testing mode vars
  	APPIKO_DUMMY_DEVICE_MAC = 'AA:BB:CC:DD:EE:FF';
  	APPIKO_DUMMY_SENSE_PI = 'Dummy SensePi (Sample to view config options)';

  	// Bluetooth UUIDs
  	UUID_SENSE_PI_SERVICE = '3c73dc50-07f5-480d-b066-837407fbde0a';

    //SENSEPI   	
    // Bluetooth UUIDs
    UUID_SENSE_PI_BOARD_SETTINGS = '3c73dc51-07f5-480d-b066-837407fbde0a';
    UUID_SENSE_PI_USER_SETTINGS = '3c73dc52-07f5-480d-b066-837407fbde0a';
    APPIKO_SENSE_PI_COMPLETE_LOCAL_NAME = 'SensePi';
    // shortened local name is SPaabbyymmddnnnn : aa is board rev, bb is manufacturing location
    APPIKO_SENSE_PI_SHORTENED_NAME = 'SP'; 


    //SENSEBE
    APPIKO_SENSE_BE_COMPLETE_LOCAL_NAME = 'SenseBe';
    APPIKO_SENSE_BE_SHORTENED_NAME = 'SB';

    
    FW_VER = '1.0';


  	constructor() {
    	console.log('Hello AppikoCommonProvider Provider');
  	}

}
