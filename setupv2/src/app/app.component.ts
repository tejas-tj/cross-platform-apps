import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, App } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { ScanlistPage } from '../pages/scanlist/scanlist';
import { ConnecthistoryPage } from '../pages/connecthistory/connecthistory';
import { SensepiconfigPage } from '../pages/sensepiconfig/sensepiconfig';
import { SensebeconfigPage } from '../pages/sensebeconfig/sensebeconfig';
import { AboutPage } from '../pages/about/about';
import { AppikoCommonProvider } from '../providers/appiko-common/appiko-common';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage:any = HomePage;
  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, 
    public statusBar: StatusBar, 
    public splashScreen: SplashScreen,
    public app: App,) {
      this.initializeApp();
    
      // used for an example of ngFor and navigation
      this.pages = [
        { title: 'Home', component: HomePage },
        //{ title: 'Debug', component: DebugPage },
        { title: 'About', component: AboutPage },
        { title: 'SensePi Config', component: SensepiconfigPage },
        { title: 'SenseBe Config', component: SensebeconfigPage }
        //{ title: 'Help', component: HelpPage },
        //{ title: 'Test Config', component: TestConfigPage}
      ];
    
      platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      });
  }

  initializeApp() {
      this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide(); 
    });
  }
  
  // Adding functionality to the Android back button 
  openPage(page) {
    if(page.component == HomePage){
      this.nav.setRoot(HomePage);
    } else {
      this.nav.push(page.component);
    }
  }

}
