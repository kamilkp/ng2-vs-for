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
var core_1 = require('@angular/core');
var dde = document.documentElement, matchingFunction = dde.matches ? 'matches' :
    dde.matchesSelector ? 'matchesSelector' :
        dde.webkitMatches ? 'webkitMatches' :
            dde.webkitMatchesSelector ? 'webkitMatchesSelector' :
                dde.msMatches ? 'msMatches' :
                    dde.msMatchesSelector ? 'msMatchesSelector' :
                        dde.mozMatches ? 'mozMatches' :
                            dde.mozMatchesSelector ? 'mozMatchesSelector' : null;
function closestElement(el, selector) {
    while (el !== document.documentElement && el != null && !el[matchingFunction](selector)) {
        el = el.parentNode;
    }
    if (el && el[matchingFunction](selector)) {
        return el;
    }
    else {
        return null;
    }
}
;
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
function getClientSize(element, sizeProp) {
    if (element === window) {
        return sizeProp === 'clientWidth' ? window.innerWidth : window.innerHeight;
    }
    else {
        return element[sizeProp];
    }
}
function getScrollPos(element, scrollProp) {
    return element === window ? getWindowScroll()[scrollProp] : element[scrollProp];
}
function getScrollOffset(vsElement, scrollElement, isHorizontal) {
    var vsPos = vsElement.getBoundingClientRect()[isHorizontal ? 'left' : 'top'];
    var scrollPos = scrollElement === window ? 0 : scrollElement.getBoundingClientRect()[isHorizontal ? 'left' : 'top'];
    var correction = vsPos - scrollPos +
        (scrollElement === window ? getWindowScroll() : scrollElement)[isHorizontal ? 'scrollLeft' : 'scrollTop'];
    return correction;
}
function nextElementSibling(el) {
    if (el.nextElementSibling) {
        return el.nextElementSibling;
    }
    do {
        el = el.nextSibling;
    } while (el && el.nodeType !== 1);
    return el;
}
var VsFor = (function () {
    function VsFor(_element, _viewContainer, _templateRef, _renderer, _ngZone) {
        var _this = this;
        this._element = _element;
        this._viewContainer = _viewContainer;
        this._templateRef = _templateRef;
        this._renderer = _renderer;
        this._ngZone = _ngZone;
        this._originalCollection = [];
        this._slicedCollection = [];
        this.tagName = 'div';
        this.__horizontal = false;
        this.vsOffsetBefore = 0;
        this.vsOffsetAfter = 0;
        this.vsExcess = 2;
        var _prevClientSize;
        var reinitOnClientHeightChange = function () {
            if (!_this.scrollParent) {
                return;
            }
            var ch = getClientSize(_this.scrollParent, _this.clientSize);
            if (ch !== _prevClientSize) {
                _prevClientSize = ch;
                _this._ngZone.run(function () {
                    _this.refresh();
                });
            }
            else {
                _prevClientSize = ch;
            }
        };
        this.onZone = this._ngZone.onStable.subscribe(reinitOnClientHeightChange);
    }
    Object.defineProperty(VsFor.prototype, "originalCollection", {
        get: function () {
            return this._originalCollection;
        },
        set: function (value) {
            this._originalCollection = value || [];
            if (this.scrollParent) {
                this.refresh();
            }
            else {
                this.postDigest(this.refresh.bind(this));
            }
            // this.slicedCollection = value.slice(1, -1);
            // this.view.setLocal('vsCollection', this.slicedCollection);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VsFor.prototype, "slicedCollection", {
        get: function () {
            return this._slicedCollection;
        },
        set: function (value) {
            this._slicedCollection = value;
            this.view.context.vsCollection = this._slicedCollection;
            // this.view.setLocal('vsCollection', this._slicedCollection);
        },
        enumerable: true,
        configurable: true
    });
    VsFor.prototype.ngOnChanges = function () {
        if (this.scrollParent) {
            this.refresh();
        }
        else {
            this.postDigest(this.refresh.bind(this));
        }
    };
    VsFor.prototype.postDigest = function (fn) {
        var subscription = this._ngZone.onStable.subscribe(function () {
            fn();
            subscription.unsubscribe();
        });
    };
    VsFor.prototype.initPlaceholders = function () {
        this.before = document.createElement(this.tagName);
        this.before.className = 'vsFor-before';
        this.after = document.createElement(this.tagName);
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
    };
    VsFor.prototype.ngOnInit = function () {
        var _this = this;
        // console.log(this.vsSize, this.vsOffsetBefore, this.vsOffsetAfter, this.vsExcess, this.vsScrollParent, this.vsAutoresize, this.tagName, this.__horizontal);
        this.view = this._viewContainer.createEmbeddedView(this._templateRef);
        this.parent = nextElementSibling(this._element.nativeElement);
        this.initPlaceholders();
        this.__horizontal = false;
        this.__autoSize = true;
        this.__options = {};
        this.clientSize = this.__horizontal ? 'clientWidth' : 'clientHeight';
        this.offsetSize = this.__horizontal ? 'offsetWidth' : 'offsetHeight';
        this.scrollPos = this.__horizontal ? 'scrollLeft' : 'scrollTop';
        if (this.vsScrollParent) {
            this.scrollParent = closestElement(this.parent, this.vsScrollParent);
        }
        else {
            this.scrollParent = this.parent;
        }
        this.elementSize = getClientSize(this.scrollParent, this.clientSize) || 50;
        this.totalSize = 0;
        if (typeof this.vsSize !== 'undefined') {
            this.sizesCumulative = [];
        }
        this.startIndex = 0;
        this.endIndex = 0;
        this.scrollParent.addEventListener('scroll', function () {
            _this.updateInnerCollection();
        });
        this.onWindowResize = function () {
            if (_this.vsAutoresize) {
                _this.__autoSize = true;
                _this._ngZone.run(function () {
                    _this.setAutoSize();
                });
            }
            else {
                _this._ngZone.run(function () {
                    _this.updateInnerCollection();
                });
            }
        };
        window.addEventListener('resize', this.onWindowResize);
        // TODO: figure out how to trigger some events here...
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
    };
    VsFor.prototype.ngOnDestroy = function () {
        if (this.onWindowResize) {
            window.removeEventListener('resize', this.onWindowResize);
        }
        if (this.onZone) {
            this.onZone.unsubscribe();
        }
    };
    VsFor.prototype.refresh = function () {
        var _this = this;
        if (!this.originalCollection || this.originalCollection.length < 1) {
            this.slicedCollection = [];
            this.originalLength = 0;
            this.updateTotalSize(0);
            this.sizesCumulative = [0];
        }
        else {
            this.originalLength = this.originalCollection.length;
            if (typeof this.vsSize !== 'undefined') {
                this.sizes = this.originalCollection.map(function (item, index) {
                    if (typeof _this.vsSize === 'function') {
                        return _this.vsSize(item, index);
                    }
                    else {
                        return +_this.vsSize; // number or string
                    }
                });
                var sum_1 = 0;
                this.sizesCumulative = this.sizes.map(function (size) {
                    var res = sum_1;
                    sum_1 += size;
                    return res;
                });
                this.sizesCumulative.push(sum_1);
            }
            else {
                this.__autoSize = true;
                this.postDigest(this.setAutoSize.bind(this));
            }
        }
        this.reinitialize();
    };
    VsFor.prototype.updateTotalSize = function (size) {
        this.totalSize = this.vsOffsetBefore + size + this.vsOffsetAfter;
    };
    VsFor.prototype.reinitialize = function () {
        this._prevStartIndex = void 0;
        this._prevEndIndex = void 0;
        this._minStartIndex = this.originalLength;
        this._maxEndIndex = 0;
        this.updateTotalSize(typeof this.vsSize !== 'undefined' ?
            this.sizesCumulative[this.originalLength] :
            this.elementSize * this.originalLength);
        this.updateInnerCollection();
    };
    VsFor.prototype.setAutoSize = function () {
        var _this = this;
        if (typeof this.vsSize !== 'undefined') {
            this._ngZone.run(function () {
                _this.refresh();
            });
        }
        else if (this.__autoSize) {
            var gotSomething = false;
            if (this.parent.offsetHeight || this.parent.offsetWidth) {
                var child = this.parent.children[1];
                if (child[this.offsetSize]) {
                    gotSomething = true;
                    this.elementSize = child[this.offsetSize];
                }
            }
            if (gotSomething) {
                this.__autoSize = false;
                this._ngZone.run(function () {
                    _this.reinitialize();
                });
            }
        }
    };
    VsFor.prototype.updateInnerCollection = function () {
        var $scrollPosition = getScrollPos(this.scrollParent, this.scrollPos);
        var $clientSize = getClientSize(this.scrollParent, this.clientSize);
        var scrollOffset = this.parent === this.scrollParent ? 0 : getScrollOffset(this.parent, this.scrollParent, this.__horizontal);
        var __startIndex = this.startIndex;
        var __endIndex = this.endIndex;
        if (typeof this.vsSize !== 'undefined') {
            __startIndex = 0;
            while (this.sizesCumulative[__startIndex] < $scrollPosition - this.vsOffsetBefore - scrollOffset) {
                __startIndex++;
            }
            if (__startIndex > 0) {
                __startIndex--;
            }
            // Adjust the start index according to the excess
            __startIndex = Math.max(Math.floor(__startIndex - this.vsExcess / 2), 0);
            __endIndex = __startIndex;
            while (this.sizesCumulative[__endIndex] < $scrollPosition - this.vsOffsetBefore - scrollOffset + $clientSize) {
                __endIndex++;
            }
            // Adjust the end index according to the excess
            __endIndex = Math.min(Math.ceil(__endIndex + this.vsExcess / 2), this.originalLength);
        }
        else {
            __startIndex = Math.max(Math.floor(($scrollPosition - this.vsOffsetBefore - scrollOffset) / this.elementSize) - this.vsExcess / 2, 0);
            __endIndex = Math.min(__startIndex + Math.ceil($clientSize / this.elementSize) + this.vsExcess, this.originalLength);
        }
        this._minStartIndex = Math.min(__startIndex, this._minStartIndex);
        this._maxEndIndex = Math.max(__endIndex, this._maxEndIndex);
        this.startIndex = this.__options.latch ? this._minStartIndex : __startIndex;
        this.endIndex = this.__options.latch ? this._maxEndIndex : __endIndex;
        var digestRequired = false;
        if (this._prevStartIndex == null) {
            digestRequired = true;
        }
        else if (this._prevEndIndex == null) {
            digestRequired = true;
        }
        if (!digestRequired) {
            if (this.__options.hunked) {
                if (Math.abs(this.startIndex - this._prevStartIndex) >= this.vsExcess / 2 ||
                    (this.startIndex === 0 && this._prevStartIndex !== 0)) {
                    digestRequired = true;
                }
                else if (Math.abs(this.endIndex - this._prevEndIndex) >= this.vsExcess / 2 ||
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
            // this.view.setLocal('vsStartIndex', this.startIndex);
            this.view.context.vsStartIndex = this.startIndex;
            // TODO figure out these events
            // Emit the event
            // $scope.$emit('vsRepeatInnerCollectionUpdated', this.startIndex, this.endIndex, this._prevStartIndex, this._prevEndIndex);
            this._prevStartIndex = this.startIndex;
            this._prevEndIndex = this.endIndex;
            var o1 = this._getOffset(0);
            var o2 = this._getOffset(this.slicedCollection.length);
            var total = this.totalSize;
            var layoutProp = this.__horizontal ? 'width' : 'height';
            this.before.style[layoutProp] = o1 + 'px';
            this.after.style[layoutProp] = (total - o2) + 'px';
        }
        return digestRequired;
    };
    VsFor.prototype._getOffset = function (index) {
        if (typeof this.vsSize !== 'undefined') {
            return this.sizesCumulative[index + this.startIndex] + this.vsOffsetBefore;
        }
        return (index + this.startIndex) * this.elementSize + this.vsOffsetBefore;
    };
    VsFor = __decorate([
        core_1.Directive({
            selector: '[vsFor]',
            inputs: [
                'originalCollection: vsFor',
                'vsSize: vsForSize',
                'vsOffsetAfter: vsForOffsetAfter',
                'vsOffsetBefore: vsForOffsetBefore',
                'vsExcess: vsForExcess',
                'tagName: vsForTagName',
                'vsScrollParent: vsForScrollParent',
                '__horizontal: vsForHorizontal',
                'vsAutoresize: vsForAutoresize'
            ]
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef, core_1.ViewContainerRef, core_1.TemplateRef, core_1.Renderer, core_1.NgZone])
    ], VsFor);
    return VsFor;
}());
exports.VsFor = VsFor;
//# sourceMappingURL=ng2-vs-for.js.map