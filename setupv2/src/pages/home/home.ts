import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ScanlistPage } from '../scanlist/scanlist';
import { ConnecthistoryPage } from '../connecthistory/connecthistory';
import { DetailPage } from '../detail/detail';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

	tab1Root: any;
  	tab2Root: any;

  	constructor(public navCtrl: NavController) { 
		this.tab1Root = ScanlistPage;
  		this.tab2Root = ConnecthistoryPage;
	}
    
}
