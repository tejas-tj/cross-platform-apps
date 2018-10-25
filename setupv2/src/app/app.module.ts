import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { BLE } from '@ionic-native/ble';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ScanlistPage } from '../pages/scanlist/scanlist';
import { ConnecthistoryPage } from '../pages/connecthistory/connecthistory';
import { SensepiconfigPage } from '../pages/sensepiconfig/sensepiconfig';
import { SensebeconfigPage } from '../pages/sensebeconfig/sensebeconfig';
import { AboutPage } from '../pages/about/about';
import { AppikoCommonProvider } from '../providers/appiko-common/appiko-common';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ScanlistPage,
    ConnecthistoryPage,
    SensepiconfigPage,
    SensebeconfigPage,
    AboutPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ScanlistPage,
    ConnecthistoryPage,
    SensepiconfigPage,
    SensebeconfigPage,
    AboutPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    BLE,
    AppikoCommonProvider
  ]
})
export class AppModule {}
