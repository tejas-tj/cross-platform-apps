import { Injectable } from '@angular/core';

import { AppikoCommonProvider } from '../appiko-common/appiko-common';

/*
  Generated class for the AppikoSensePiProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AppikoSensePiProvider {
	// Appiko Sense Device Names by default
  	APPIKO_SENSE_PI = 'SensePi';
  	APPIKO_SENSE_PI_COMPLETE_LOCAL_NAME = 'SensePi';
  	// shortened local name is SPaabbyymmddnnnn : aa is board rev, bb is manufacturing location
  	APPIKO_SENSE_PI_SHORTENED_LOCAL_NAME = 'SP' 
  
  	FW_VER = '1.0';

  	// Bluetooth UUIDs
  	UUID_SENSE_PI_BOARD_SETTINGS = '3c73dc51-07f5-480d-b066-837407fbde0a';
  	UUID_SENSE_PI_USER_SETTINGS = '3c73dc52-07f5-480d-b066-837407fbde0a';

  	constructor() {
    	console.log('Hello AppikoSensePiProvider Provider');
  	}

}
