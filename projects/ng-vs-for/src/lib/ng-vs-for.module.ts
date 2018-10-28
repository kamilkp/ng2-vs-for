import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { VsForDirective } from './ng-vs-for.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    declarations: [
      VsForDirective
    ],
    exports: [
      VsForDirective
    ],
    providers: [

    ]
})
export class VsFor { }
