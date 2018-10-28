import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  items = [];
  constructor() {
    this.refresh();

  }
  ngOnInit() { }

  refresh() {
    this.items = [];
    for (let index = 0; index < 1000; index++) {
      const row = { index, field1: 10 * index, field2: Math.random() };
      this.items.push(row);
    }
  }
  clear() {
    this.items = [];
  }

}
