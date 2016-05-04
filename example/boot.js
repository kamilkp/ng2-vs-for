"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var platform_browser_dynamic_1 = require('@angular/platform-browser-dynamic');
var core_1 = require('@angular/core');
var ng2_vs_for_js_1 = require('../src/ng2-vs-for.js');
var Boot = (function () {
    function Boot() {
        this.items = [];
        // this.refresh();
    }
    Boot.prototype.refresh = function () {
        this.items = [];
        var len = ~~(Math.random() * 100) + 5;
        var i = 0;
        while (len--) {
            this.items.push({ value: Math.random(), index: i++ });
        }
        var tic = Date.now();
        setTimeout(function () {
            console.info(Date.now() - tic);
        });
    };
    Boot.prototype.getItemSize = function (item) {
        return item.index % 2 ? 25 : 50;
    };
    Boot.prototype.clear = function () {
        this.items = [];
    };
    Boot = __decorate([
        core_1.Component({
            selector: 'ng2-vs-for-test',
            directives: [ng2_vs_for_js_1.VsFor],
            styles: ["\n    .container {\n      height: 300px;\n      overflow-y: auto;\n      background: wheat;\n    }\n\n    .container.tall {\n      height: 500px;\n      background: lightgreen;\n    }\n\n    @media (max-width: 500px) {\n      /*.repeat-item {\n        height: 50px !important;\n      }*/\n    }\n  "],
            template: "\n    <div class=\"container\" [ngClass]=\"{tall: isTall}\" *ngIf=\"shown\">\n      <div *vsFor=\"items; size:getItemSize; offsetBefore:100; offsetAfter: 100; excess: 3; scrollParent:'.container'; let _items = vsCollection; let _startIndex = vsStartIndex\">\n        <div *ngFor=\"let item of _items\" title=\"{{item.index}}\" [ngStyle]=\"{height: item.index % 2 ? '25px' : '50px'}\" class=\"repeat-item\">\n          {{ item.value }} {{ _startIndex }}\n        </div>\n      </div>\n    </div>\n    <button (click)=\"refresh()\">\n      refresh\n    </button>\n    <button (click)=\"clear()\">\n      clear\n    </button>\n    <button (click)=\"isTall = !isTall\">\n      toggle tall\n    </button>\n    <button (click)=\"shown = !shown\">\n      toggle shown\n    </button>\n  "
        }), 
        __metadata('design:paramtypes', [])
    ], Boot);
    return Boot;
}());
platform_browser_dynamic_1.bootstrap(Boot, []);
//# sourceMappingURL=boot.js.map