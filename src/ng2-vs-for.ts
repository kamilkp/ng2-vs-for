import {
    Directive,
    ViewContainerRef,
    TemplateRef,
    ElementRef,
    Renderer,
    ViewRef,
    NgZone,
} from 'angular2/core';

import {ObservableWrapper} from 'angular2/src/facade/async';

const dde:any = document.documentElement,
    matchingFunction = dde.matches ? 'matches' :
                        dde.matchesSelector ? 'matchesSelector' :
                        dde.webkitMatches ? 'webkitMatches' :
                        dde.webkitMatchesSelector ? 'webkitMatchesSelector' :
                        dde.msMatches ? 'msMatches' :
                        dde.msMatchesSelector ? 'msMatchesSelector' :
                        dde.mozMatches ? 'mozMatches' :
                        dde.mozMatchesSelector ? 'mozMatchesSelector' : null;

function closestElement(el: Node, selector: string): HTMLElement {
    while (el !== document.documentElement && el != null && !el[matchingFunction](selector)) {
        el = el.parentNode;
    }

    if (el && el[matchingFunction](selector)) {
        return <HTMLElement>el;
    }
    else {
        return null;
    }
};

function getWindowScroll() {
    if ('pageYOffset' in window) {
        return {
            scrollTop: pageYOffset,
            scrollLeft: pageXOffset
        };
    }
    else {
        var sx, sy, d = document, r = d.documentElement, b = d.body;
        sx = r.scrollLeft || b.scrollLeft || 0;
        sy = r.scrollTop || b.scrollTop || 0;
        return {
            scrollTop: sy,
            scrollLeft: sx
        };
    }
}

function getClientSize(element: Node | Window, sizeProp: string): number {
    if (element === window) {
        return sizeProp === 'clientWidth' ? window.innerWidth : window.innerHeight;
    }
    else {
        return element[sizeProp];
    }
}

function getScrollPos(element: Node | Window, scrollProp: string):number {
    return element === window ? getWindowScroll()[scrollProp] : element[scrollProp];
}

function getScrollOffset(vsElement: HTMLElement, scrollElement: HTMLElement | Window, isHorizontal):number {
    var vsPos = vsElement.getBoundingClientRect()[isHorizontal ? 'left' : 'top'];
    var scrollPos = scrollElement === window ? 0 : (<HTMLElement>scrollElement).getBoundingClientRect()[isHorizontal ? 'left' : 'top'];
    var correction = vsPos - scrollPos +
        (scrollElement === window ? getWindowScroll() : scrollElement)[isHorizontal ? 'scrollLeft' : 'scrollTop'];

    return correction;
}

@Directive({
    selector: '[vsFor]',
    inputs: [
        'originalCollection: vsFor'
    ]
})

export class VsFor {
    _originalCollection = [];
    _slicedCollection = [];
    originalLength: number;
    before: HTMLElement;
    after: HTMLElement;
    view: ViewRef;
    parent: HTMLElement;
    tagName: string;
    __horizontal: boolean;
    __autoSize: boolean;
    __sizesPropertyExists: boolean;
    __options: any;
    __isNgRepeatStart: boolean;
    scrollParent: HTMLElement;
    clientSize: string;
    offsetSize: string;
    scrollPos: string;
    totalSize: number;
    sizesCumulative: number[];
    sizes: number[];
    elementSize: number;
    offsetBefore: number;
    offsetAfter: number;
    excess: number;
    startIndex: number;
    endIndex: number;
    _prevStartIndex: number;
    _prevEndIndex: number;
    _minStartIndex: number;
    _maxEndIndex: number;
    set originalCollection(value: any[]) {
        this._originalCollection = value || [];
        this.refresh();
        // this.slicedCollection = value.slice(1, -1);
        // this.view.setLocal('vsCollection', this.slicedCollection);
    }
    get originalCollection() {
        return this._originalCollection;
    }
    set slicedCollection(value: any[]) {
        this._slicedCollection = value;
        this.view.setLocal('vsCollection', this._slicedCollection);
    }
    get slicedCollection() {
        return this._slicedCollection;
    }
    constructor(
        private _element: ElementRef,
        private _viewContainer: ViewContainerRef,
        private _templateRef: TemplateRef,
        private _renderer: Renderer,
        private _ngZone: NgZone
    ) {
        this.view = this._viewContainer.createEmbeddedView(this._templateRef);
        this.parent = this._element.nativeElement.nextElementSibling;

        let tagName = 'div';
        if (this.parent.attributes['vs-tag']) {
            tagName = this.parent.attributes['vs-tag'].value;
        }
        this.initPlaceholders(tagName);
    }
    initPlaceholders(tagName: string) {
        this.before = document.createElement(tagName);
        this.before.className = 'vsFor-before';
        this.after = document.createElement(tagName);
        this.after.className = 'vsFor-after';
        this.parent.insertBefore(this.before, this.parent.childNodes[0]);
        this.parent.appendChild(this.after);

        if (this.__horizontal) {
            this.before.style.height = '100%';
            this.after.style.height = '100%';
        }
        else {
            this.before.style.width = '100%';
            this.after.style.width = '100%';
        }
    }
    ngOnInit() {
        this.__horizontal = false;
        this.__autoSize = true;
        this.__sizesPropertyExists = false;
        this.__options = {};
        this.clientSize = this.__horizontal ? 'clientWidth' : 'clientHeight',
        this.offsetSize = this.__horizontal ? 'offsetWidth' : 'offsetHeight',
        this.scrollPos = this.__horizontal ? 'scrollLeft' : 'scrollTop';

        if (this.parent.attributes['vs-scroll-parent']) {
            this.scrollParent = closestElement(this.parent, this.parent.attributes['vs-scroll-parent'].value);
        }
        else {
            this.scrollParent = this.parent;
        }

        this.elementSize = getClientSize(this.scrollParent, this.clientSize) || 50;
        this.offsetBefore = 0;
        this.offsetAfter = 0;
        this.excess = 2;

        this.totalSize = 0;

        if (this.__sizesPropertyExists) {
            this.sizesCumulative = [];
        }

        // Object.keys(attributesDictionary).forEach(function(key) {
        //     if ($attrs[key]) {
        //         $attrs.$observe(key, function(value) {
        //             // '+' serves for getting a number from the string as the attributes are always strings
        //             $scope[attributesDictionary[key]] = +value;
        //             reinitialize();
        //         });
        //     }
        // });

        this.startIndex = 0;
        this.endIndex = 0;

        this.scrollParent.addEventListener('scroll', () => {
            this.updateInnerCollection();
        });

        // function onWindowResize() {
        //     if (typeof $attrs.vsAutoresize !== 'undefined') {
        //         autoSize = true;
        //         setAutoSize();
        //         if ($scope.$root && !$scope.$root.$$phase) {
        //             $scope.$apply();
        //         }
        //     }
        //     if (updateInnerCollection()) {
        //         $scope.$apply();
        //     }
        // }

        // angular.element(window).on('resize', onWindowResize);
        // $scope.$on('$destroy', function() {
        //     angular.element(window).off('resize', onWindowResize);
        // });

        // $scope.$on('vsRepeatTrigger', refresh);

        // $scope.$on('vsRepeatResize', function() {
        //     autoSize = true;
        //     setAutoSize();
        // });

        // $scope.$on('vsRenderAll', function() {//e , quantum) {
        //     if ($$options.latch) {
        //         setTimeout(function() {
        //             // var __endIndex = Math.min($scope.endIndex + (quantum || 1), originalLength);
        //             var __endIndex = originalLength;
        //             _maxEndIndex = Math.max(__endIndex, _maxEndIndex);
        //             $scope.endIndex = $$options.latch ? _maxEndIndex : __endIndex;
        //             this.slicedCollection = originalCollection.slice($scope.startIndex, $scope.endIndex);
        //             _prevEndIndex = $scope.endIndex;

        //             $scope.$$postDigest(function() {
        //                 var layoutProp = $$horizontal ? 'width' : 'height';
        //                 $beforeContent.css(layoutProp, 0);
        //                 $afterContent.css(layoutProp, 0);
        //             });

        //             $scope.$apply(function() {
        //                 $scope.$emit('vsRenderAllDone');
        //             });
        //         });
        //     }
        // });

        // var _prevClientSize;
        // function reinitOnClientHeightChange() {
        //     var ch = getClientSize($scrollParent[0], clientSize);
        //     if (ch !== _prevClientSize) {
        //         reinitialize();
        //         if ($scope.$root && !$scope.$root.$$phase) {
        //             $scope.$apply();
        //         }
        //     }
        //     _prevClientSize = ch;
        // }

        // $scope.$watch(function() {
        //     if (typeof window.requestAnimationFrame === 'function') {
        //         window.requestAnimationFrame(reinitOnClientHeightChange);
        //     }
        //     else {
        //         reinitOnClientHeightChange();
        //     }
        // });
    }
    refresh() {
        if (!this.originalCollection || this.originalCollection.length < 1) {
            this.slicedCollection = [];
            this.originalLength = 0;
            this.updateTotalSize(0);
            this.sizesCumulative = [0];
            return;
        }
        else {
            this.originalLength = this.originalCollection.length;
            if (this.__sizesPropertyExists) {
                this.sizes = this.originalCollection.map((item) => {
                    // var s = $scope.$new(false);
                    // angular.extend(s, item);
                    // s[lhs] = item;
                    // var size = ($attrs.vsSize || $attrs.vsSizeProperty) ?
                    //     s.$eval($attrs.vsSize || $attrs.vsSizeProperty) :
                    //     $scope.elementSize;
                    // s.$destroy();
                    let size = 10; // TODO
                    return size;
                });
                let sum = 0;
                this.sizesCumulative = this.sizes.map((size) => {
                    const res = sum;
                    sum += size;
                    return res;
                });
                this.sizesCumulative.push(sum);
            }
            else {
                let unsub:any = ObservableWrapper.subscribe(this._ngZone.onEventDone, () => {
                    this.setAutoSize();
                    unsub();
                });
            }
        }

        this.reinitialize();
    }
    updateTotalSize(size: number) {
        this.totalSize = this.offsetBefore + size + this.offsetAfter;
    }
    reinitialize() {
        this._prevStartIndex = void 0;
        this._prevEndIndex = void 0;
        this._minStartIndex = this.originalLength;
        this._maxEndIndex = 0;
        this.updateInnerCollection();

        this.updateTotalSize(this.__sizesPropertyExists ?
            this.sizesCumulative[this.originalLength] :
            this.elementSize * this.originalLength
        );
    }
    setAutoSize() {
        if (this.__autoSize) {
            if (this.parent.offsetHeight || this.parent.offsetWidth) { // element is visible
                const child = this.parent.children[1];
                let gotSomething = false;

                if (child[this.offsetSize]) {
                    gotSomething = true;
                    this.elementSize = child[this.offsetSize];
                    console.warn('autosized', this.elementSize);
                }

                if (gotSomething) {
                    this.__autoSize = false;
                    this._ngZone.run(() => {
                        this.reinitialize();
                    });
                }
            }
        }
    }
    updateInnerCollection() {
        const $scrollPosition = getScrollPos(this.scrollParent, this.scrollPos);
        const $clientSize = getClientSize(this.scrollParent, this.clientSize);

        const scrollOffset = this.parent === this.scrollParent ? 0 : getScrollOffset(
            this.parent,
            this.scrollParent,
            this.__horizontal
        );

        let __startIndex = this.startIndex;
        let __endIndex = this.endIndex;

        if (this.__sizesPropertyExists) {
            __startIndex = 0;
            while (this.sizesCumulative[__startIndex] < $scrollPosition - this.offsetBefore - scrollOffset) {
                __startIndex++;
            }
            if (__startIndex > 0) { __startIndex--; }

            // Adjust the start index according to the excess
            __startIndex = Math.max(
                Math.floor(__startIndex - this.excess / 2),
                0
            );

            __endIndex = __startIndex;
            while (this.sizesCumulative[__endIndex] < $scrollPosition - this.offsetBefore - scrollOffset + $clientSize) {
                __endIndex++;
            }

            // Adjust the end index according to the excess
            __endIndex = Math.min(
                Math.ceil(__endIndex + this.excess / 2),
                this.originalLength
            );
        }
        else {
            __startIndex = Math.max(
                Math.floor(
                    ($scrollPosition - this.offsetBefore - scrollOffset) / this.elementSize
                ) - this.excess / 2,
                0
            );

            __endIndex = Math.min(
                __startIndex + Math.ceil(
                    $clientSize / this.elementSize
                ) + this.excess,
                this.originalLength
            );
        }

        this._minStartIndex = Math.min(__startIndex, this._minStartIndex);
        this._maxEndIndex = Math.max(__endIndex, this._maxEndIndex);

        this.startIndex = this.__options.latch ? this._minStartIndex : __startIndex;
        this.endIndex = this.__options.latch ? this._maxEndIndex : __endIndex;

        let digestRequired = false;
        if (this._prevStartIndex == null) {
            digestRequired = true;
        }
        else if (this._prevEndIndex == null) {
            digestRequired = true;
        }

        if (!digestRequired) {
            if (this.__options.hunked) {
                if (Math.abs(this.startIndex - this._prevStartIndex) >= this.excess / 2 ||
                    (this.startIndex === 0 && this._prevStartIndex !== 0)) {
                    digestRequired = true;
                }
                else if (Math.abs(this.endIndex - this._prevEndIndex) >= this.excess / 2 ||
                    (this.endIndex === this.originalLength && this._prevEndIndex !== this.originalLength)) {
                    digestRequired = true;
                }
            }
            else {
                digestRequired = this.startIndex !== this._prevStartIndex ||
                                 this.endIndex !== this._prevEndIndex;
            }
        }

        // console.warn(this.startIndex, this.endIndex);

        if (digestRequired) {
            this.slicedCollection = this.originalCollection.slice(this.startIndex, this.endIndex);

            // Emit the event
            // $scope.$emit('vsRepeatInnerCollectionUpdated', this.startIndex, this.endIndex, this._prevStartIndex, this._prevEndIndex);
            this._prevStartIndex = this.startIndex;
            this._prevEndIndex = this.endIndex;

            const o1 = this._getOffset(0);
            const o2 = this._getOffset(this.slicedCollection.length);
            var total = this.totalSize;
            var layoutProp = this.__horizontal ? 'width' : 'height';

            this.before.style[layoutProp] = o1 + 'px';
            this.after.style[layoutProp] = (total - o2) + 'px';
        }

        return digestRequired;
    }
    _getOffset(index: number) {
        if (this.__sizesPropertyExists) {
            return this.sizesCumulative[index + this.startIndex] + this.offsetBefore;
        }

        return (index + this.startIndex) * this.elementSize + this.offsetBefore;
    }
}
