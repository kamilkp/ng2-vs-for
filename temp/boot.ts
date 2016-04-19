 ///<reference path="../node_modules/angular2/typings/browser.d.ts"/>

import {bootstrap} from 'angular2/platform/browser';
import {Component} from 'angular2/core';
import {VsFor} from '../src/ng2-vs-for.js';

@Component({
  selector: 'ng2-vs-for-test',
  directives: [VsFor],
  styles: [`
    .container {
      height: 300px;
      overflow-y: auto;
      background: wheat;
    }

    .container.tall {
      height: 500px;
      background: lightgreen;
    }

    @media (max-width: 500px) {
      /*.repeat-item {
        height: 50px !important;
      }*/
    }
  `],
  template: `
    <div class="container" [ngClass]="{tall: isTall}" *ngIf="shown">
      <div *vsFor="items; getSize:getItemSize; #_items = vsCollection; #_startIndex = vsStartIndex" vsScrollParent=".container">
        <div *ngFor="#item of _items" title="{{item.index}}" style="height: {{item.index % 2 ? '25px' : '50px'}}" class="repeat-item">
          {{ item.value }} {{ _startIndex }}
        </div>
      </div>
    </div>
    <button (click)="refresh()">
      refresh
    </button>
    <button (click)="clear()">
      clear
    </button>
    <button (click)="isTall = !isTall">
      toggle tall
    </button>
    <button (click)="shown = !shown">
      toggle shown
    </button>
  `
      // <table>
      //   <tbody *vsFor="items; #_items = vsCollection" vsScrollParent=".container" vsTag="tr">
      //     <tr *ngFor="#item of _items" title="{{item.index}}">
      //       <td>{{ item.value }}</td>
      //     </tr>
      //   </tbody>
      // </table>
})

class Boot {
  items = [];
  refresh() {
    this.items = [];
    let len = ~~(Math.random() * 100) + 5;
    let i = 0;
    while(len--) {
      this.items.push({value: Math.random(), index: i++});
    }
    const tic = Date.now();
    setTimeout(() => {
      console.info(Date.now() - tic);
    });
  }
  getItemSize(item) {
    return item.index % 2 ? 25 : 50;
  }
  clear() {
    this.items = [];
  }
  constructor() {
    // this.refresh();
  }
}

bootstrap(Boot, []);
