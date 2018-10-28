import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

import { VsFor } from 'ng-vs-for';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    VsFor
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
