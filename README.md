ng2-vs-for 1.0.10 [![npm version](https://badge.fury.io/js/ng2-vs-for.svg)](https://badge.fury.io/js/ng2-vs-for)
===

**This is a port of https://github.com/kamilkp/angular-vs-repeat for Angular2**

---

The name stands for **Virtual Scroll For**. It manipulates the collection you want to `ngFor` over in a way that only elements that are actually visible for the user are rendered in the DOM. So if you repeat over a thousand items only a few of them are rendered in the DOM, because the user can't see the rest anyway. And it takes time for the browser to render so many elements, which also might have some event listeners/bindings etc. So you should see a considerable boost in performance.

Installation
===

`npm install ng2-vs-for`

Examples
===

Basic usage:
all items shall have the same height

```html
<div *vsFor="items; #_items = vsCollection">
    <div *ngFor="#item of _items">
        <!-- item html here -->
    </div>
</div>
```

Items have varoius sizes but they are known up front (calculatable based on their properties)

```javascript
import {VsFor} from 'ng2-vs-for';
import {Component} from 'angular2/core';

@Component({
    selector: 'some-component',
    directives: [VsFor],
    template: `
        <div *vsFor="items; size:getSize; #_items = vsCollection">
            <div *ngFor="#item of _items">
                <!-- item html here -->
            </div>
        </div>

    `,
    inputs: ['items']
})

export class SomeComponent {
    items: any;
    getSize(item, index) {
        let size;
        // ... do some calculations here
        return size;
    }
}
```

The `getSize` could either be a number (or string castable to number) or a function on your component. If it's a function it will be called for each item in the original collection with two arguments: `item` (the item in the collection), and `index` (the index in the original collection). This function shall return a number - the height in pixels of the item.

Local variables
===

The `vsFor` directive is a structural directive and it exposes two local variables:

- `vsCollection` - the sliced collection that should be assigned to a local variable and be used in `ngFor`
- `vsStartIndex` - the index of the first element that is actually rendered (see last example at the bottom of the readme)

Parameters
===

Other parameters that you can pass to the `vsFor` directive:

 - `offsetBefore` (defaults to 0)
 - `offsetAfter` (defaults to 0)
 - `excess` (defaults to 2)
 - `autoresize` (set to true recalculates on window resize)
 - `horizontal` (hooks to scrolling horizontally and the optional `size` parameter calculates widths instead of heights)
 - `tagName` (defaults to `div`) - should be the same type as the tag name of the element you put the `ngFor` directive on
 - `scrollParent` (defaults to direct parent element) - a selector of the closest element that is the scrollable container for the repeated items. You can set `window` as a scroll parent in case the main window scrollbar should be used.
 
Example with some more parameters:

```html
<table>
    <tbody *vsFor="items; size:getSize; tagName:'tr'; autoresize:true; scrollParent:'window'; excess:3; #_items = vsCollection; #_startIndex = vsStartIndex">
        <tr *ngFor="#item of _items; #i = index">
            {{ i + _startIndex }} <!-- the actual index in the original collection  -->
        </tr>
    </tbody>
</table>
```
