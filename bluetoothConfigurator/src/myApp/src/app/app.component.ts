import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, App } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { DebugPage } from '../pages/debug/debug';
import { AboutPage } from '../pages/about/about';
import { HelpPage } from '../pages/help/help';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  
  rootPage: any = HomePage;
  
  pages: Array<{title: string, component: any}>;
  
  constructor(public platform: Platform, public app: App, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.initializeApp();
    
    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', component: HomePage },
      { title: 'List', component: ListPage },
      { title: 'Debug', component: DebugPage },
      { title: 'About', component: AboutPage },
      { title: 'Help', component: HelpPage }
    ];
    
  }
  
  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      
      //Registration of push in Android and Windows Phone
      /* this.platform.registerBackButtonAction(() => {
        this.app.navPop();
      }); */
      
       this.platform.registerBackButtonAction(() => {
        if (this.nav.canGoBack())
        this.nav.pop().then(() => {}, () => {}); // If called very fast in a row, pop will reject because no pages
      }, 500); 
    });
  }
  
  /* openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  } */
  
   openPage(page) {

    if(page.component == HomePage){
      this.nav.setRoot(HomePage);
    } else {
      this.nav.push(page.component);
    }
  }
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    /* if(page.component == HomePage){
      this.nav.setRoot(HomePage);
    } else if(page.component != HomePage) {
      this.nav.setRoot(page.component)
      this.nav.push(page.component);
    } */ /* else {
      this.nav.push(page.component);
    } */
    
    
    /* this.nav.setRoot(page.component);
    this.nav.push(page.component); */
    /* this.rootPage = page.component; */

  /* openPage(page) {
    this.nav.push(page.component);
    } */
  
}
