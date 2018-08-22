import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ScanlistPage } from './scanlist';

@NgModule({
  declarations: [
    ScanlistPage,
  ],
  imports: [
    IonicPageModule.forChild(ScanlistPage),
  ],
})
export class ScanlistPageModule {}
