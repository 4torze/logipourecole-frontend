import { isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, EventEmitter, Optional, PLATFORM_ID, Renderer2, TemplateRef, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { Subject, asapScheduler } from 'rxjs';
import { delay, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { NzConfigService } from 'ng-zorro-antd/core/config';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { DEFAULT_TOOLTIP_POSITIONS, POSITION_MAP, getPlacementName } from 'ng-zorro-antd/core/overlay';
import { isNotNil, toBoolean } from 'ng-zorro-antd/core/util';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
import * as i2 from "ng-zorro-antd/core/no-animation";
export class NzTooltipBaseDirective {
    /**
     * This true title that would be used in other parts on this component.
     */
    get _title() {
        return this.title || this.directiveTitle || null;
    }
    get _content() {
        return this.content || this.directiveContent || null;
    }
    get _trigger() {
        return typeof this.trigger !== 'undefined' ? this.trigger : 'hover';
    }
    get _placement() {
        const p = this.placement;
        return Array.isArray(p) && p.length > 0 ? p : typeof p === 'string' && p ? [p] : ['top'];
    }
    get _visible() {
        return (typeof this.visible !== 'undefined' ? this.visible : this.internalVisible) || false;
    }
    get _mouseEnterDelay() {
        return this.mouseEnterDelay || 0.15;
    }
    get _mouseLeaveDelay() {
        return this.mouseLeaveDelay || 0.1;
    }
    get _overlayClassName() {
        return this.overlayClassName || null;
    }
    get _overlayStyle() {
        return this.overlayStyle || null;
    }
    getProxyPropertyMap() {
        return {
            noAnimation: ['noAnimation', () => !!this.noAnimation]
        };
    }
    constructor(componentType) {
        this.componentType = componentType;
        this.visibleChange = new EventEmitter();
        this.internalVisible = false;
        this.destroy$ = new Subject();
        this.triggerDisposables = [];
        this.elementRef = inject(ElementRef);
        this.hostView = inject(ViewContainerRef);
        this.renderer = inject(Renderer2);
        this.noAnimation = inject(NzNoAnimationDirective, { host: true, optional: true });
        this.nzConfigService = inject(NzConfigService);
        this.platformId = inject(PLATFORM_ID);
    }
    ngAfterViewInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.createComponent();
            this.registerTriggers();
        }
    }
    ngOnChanges(changes) {
        const { trigger } = changes;
        if (trigger && !trigger.isFirstChange()) {
            this.registerTriggers();
        }
        if (this.component) {
            this.updatePropertiesByChanges(changes);
        }
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        // Clear toggling timer. Issue #3875 #4317 #4386
        this.clearTogglingTimer();
        this.removeTriggerListeners();
    }
    show() {
        this.component?.show();
    }
    hide() {
        this.component?.hide();
    }
    /**
     * Force the component to update its position.
     */
    updatePosition() {
        if (this.component) {
            this.component.updatePosition();
        }
    }
    /**
     * Create a dynamic tooltip component. This method can be override.
     */
    createComponent() {
        const componentRef = this.hostView.createComponent(this.componentType);
        this.component = componentRef.instance;
        // Remove the component's DOM because it should be in the overlay container.
        this.renderer.removeChild(this.renderer.parentNode(this.elementRef.nativeElement), componentRef.location.nativeElement);
        this.component.setOverlayOrigin(this.origin || this.elementRef);
        this.initProperties();
        const ngVisibleChange$ = this.component.nzVisibleChange.pipe(distinctUntilChanged());
        ngVisibleChange$.pipe(takeUntil(this.destroy$)).subscribe((visible) => {
            this.internalVisible = visible;
            this.visibleChange.emit(visible);
        });
        // In some cases, the rendering takes into account the height at which the `arrow` is in wrong place,
        // so `cdk` sets the container position incorrectly.
        // To avoid this, after placing the `arrow` in the correct position, we should `re-calculate` the position of the `overlay`.
        ngVisibleChange$
            .pipe(filter((visible) => visible), delay(0, asapScheduler), filter(() => Boolean(this.component?.overlay?.overlayRef)), takeUntil(this.destroy$))
            .subscribe(() => {
            this.component?.updatePosition();
        });
    }
    registerTriggers() {
        // When the method gets invoked, all properties has been synced to the dynamic component.
        // After removing the old API, we can just check the directive's own `nzTrigger`.
        const el = this.elementRef.nativeElement;
        const trigger = this.trigger;
        this.removeTriggerListeners();
        if (trigger === 'hover') {
            let overlayElement;
            this.triggerDisposables.push(this.renderer.listen(el, 'mouseenter', () => {
                this.delayEnterLeave(true, true, this._mouseEnterDelay);
            }));
            this.triggerDisposables.push(this.renderer.listen(el, 'mouseleave', () => {
                this.delayEnterLeave(true, false, this._mouseLeaveDelay);
                if (this.component?.overlay.overlayRef && !overlayElement) {
                    overlayElement = this.component.overlay.overlayRef.overlayElement;
                    this.triggerDisposables.push(this.renderer.listen(overlayElement, 'mouseenter', () => {
                        this.delayEnterLeave(false, true, this._mouseEnterDelay);
                    }));
                    this.triggerDisposables.push(this.renderer.listen(overlayElement, 'mouseleave', () => {
                        this.delayEnterLeave(false, false, this._mouseLeaveDelay);
                    }));
                }
            }));
        }
        else if (trigger === 'focus') {
            this.triggerDisposables.push(this.renderer.listen(el, 'focusin', () => this.show()));
            this.triggerDisposables.push(this.renderer.listen(el, 'focusout', () => this.hide()));
        }
        else if (trigger === 'click') {
            this.triggerDisposables.push(this.renderer.listen(el, 'click', (e) => {
                e.preventDefault();
                this.show();
            }));
        }
        // Else do nothing because user wants to control the visibility programmatically.
    }
    updatePropertiesByChanges(changes) {
        this.updatePropertiesByKeys(Object.keys(changes));
    }
    updatePropertiesByKeys(keys) {
        const mappingProperties = {
            // common mappings
            title: ['nzTitle', () => this._title],
            directiveTitle: ['nzTitle', () => this._title],
            content: ['nzContent', () => this._content],
            directiveContent: ['nzContent', () => this._content],
            trigger: ['nzTrigger', () => this._trigger],
            placement: ['nzPlacement', () => this._placement],
            visible: ['nzVisible', () => this._visible],
            mouseEnterDelay: ['nzMouseEnterDelay', () => this._mouseEnterDelay],
            mouseLeaveDelay: ['nzMouseLeaveDelay', () => this._mouseLeaveDelay],
            overlayClassName: ['nzOverlayClassName', () => this._overlayClassName],
            overlayStyle: ['nzOverlayStyle', () => this._overlayStyle],
            arrowPointAtCenter: ['nzArrowPointAtCenter', () => this.arrowPointAtCenter],
            cdkConnectedOverlayPush: ['cdkConnectedOverlayPush', () => this.cdkConnectedOverlayPush],
            ...this.getProxyPropertyMap()
        };
        (keys || Object.keys(mappingProperties).filter(key => !key.startsWith('directive'))).forEach((property) => {
            if (mappingProperties[property]) {
                const [name, valueFn] = mappingProperties[property];
                this.updateComponentValue(name, valueFn());
            }
        });
        this.component?.updateByDirective();
    }
    initProperties() {
        this.updatePropertiesByKeys();
    }
    updateComponentValue(key, value) {
        if (typeof value !== 'undefined') {
            // @ts-ignore
            this.component[key] = value;
        }
    }
    delayEnterLeave(isOrigin, isEnter, delay = -1) {
        if (this.delayTimer) {
            this.clearTogglingTimer();
        }
        else if (delay > 0) {
            this.delayTimer = setTimeout(() => {
                this.delayTimer = undefined;
                isEnter ? this.show() : this.hide();
            }, delay * 1000);
        }
        else {
            // `isOrigin` is used due to the tooltip will not hide immediately
            // (may caused by the fade-out animation).
            isEnter && isOrigin ? this.show() : this.hide();
        }
    }
    removeTriggerListeners() {
        this.triggerDisposables.forEach(dispose => dispose());
        this.triggerDisposables.length = 0;
    }
    clearTogglingTimer() {
        if (this.delayTimer) {
            clearTimeout(this.delayTimer);
            this.delayTimer = undefined;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: NzTooltipBaseDirective, deps: [{ token: i0.Type }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.3.8", type: NzTooltipBaseDirective, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: NzTooltipBaseDirective, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.Type }] });
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class NzTooltipBaseComponent {
    set nzVisible(value) {
        const visible = toBoolean(value);
        if (this._visible !== visible) {
            this._visible = visible;
            this.nzVisibleChange.next(visible);
        }
    }
    get nzVisible() {
        return this._visible;
    }
    set nzTrigger(value) {
        this._trigger = value;
    }
    get nzTrigger() {
        return this._trigger;
    }
    set nzPlacement(value) {
        const preferredPosition = value.map(placement => POSITION_MAP[placement]);
        this._positions = [...preferredPosition, ...DEFAULT_TOOLTIP_POSITIONS];
    }
    constructor(cdr, directionality, noAnimation) {
        this.cdr = cdr;
        this.directionality = directionality;
        this.noAnimation = noAnimation;
        this.nzTitle = null;
        this.nzContent = null;
        this.nzArrowPointAtCenter = false;
        this.nzOverlayStyle = {};
        this.nzBackdrop = false;
        this.cdkConnectedOverlayPush = true;
        this.nzVisibleChange = new Subject();
        this._visible = false;
        this._trigger = 'hover';
        this.preferredPlacement = 'top';
        this.dir = 'ltr';
        this._classMap = {};
        this._prefix = 'ant-tooltip';
        this._positions = [...DEFAULT_TOOLTIP_POSITIONS];
        this.destroy$ = new Subject();
    }
    ngOnInit() {
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
            this.cdr.detectChanges();
        });
        this.dir = this.directionality.value;
    }
    ngOnDestroy() {
        this.nzVisibleChange.complete();
        this.destroy$.next();
        this.destroy$.complete();
    }
    show() {
        if (this.nzVisible) {
            return;
        }
        if (!this.isEmpty()) {
            this.nzVisible = true;
            this.nzVisibleChange.next(true);
            this.cdr.detectChanges();
        }
        // for ltr for overlay to display tooltip in correct placement in rtl direction.
        if (this.origin && this.overlay && this.overlay.overlayRef && this.overlay.overlayRef.getDirection() === 'rtl') {
            this.overlay.overlayRef.setDirection('ltr');
        }
    }
    hide() {
        if (!this.nzVisible) {
            return;
        }
        this.nzVisible = false;
        this.nzVisibleChange.next(false);
        this.cdr.detectChanges();
    }
    updateByDirective() {
        this.updateStyles();
        this.cdr.detectChanges();
        Promise.resolve().then(() => {
            this.updatePosition();
            this.updateVisibilityByTitle();
        });
    }
    /**
     * Force the component to update its position.
     */
    updatePosition() {
        if (this.origin && this.overlay && this.overlay.overlayRef) {
            this.overlay.overlayRef.updatePosition();
        }
    }
    onPositionChange(position) {
        this.preferredPlacement = getPlacementName(position);
        this.updateStyles();
        // We have to trigger immediate change detection or the element would blink.
        this.cdr.detectChanges();
    }
    setOverlayOrigin(origin) {
        this.origin = origin;
        this.cdr.markForCheck();
    }
    onClickOutside(event) {
        if (!this.origin.nativeElement.contains(event.target) && this.nzTrigger !== null) {
            this.hide();
        }
    }
    /**
     * Hide the component while the content is empty.
     */
    updateVisibilityByTitle() {
        if (this.isEmpty()) {
            this.hide();
        }
    }
    updateStyles() {
        this._classMap = {
            [this.nzOverlayClassName]: true,
            [`${this._prefix}-placement-${this.preferredPlacement}`]: true
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: NzTooltipBaseComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i1.Directionality, optional: true }, { token: i2.NzNoAnimationDirective }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.3.8", type: NzTooltipBaseComponent, viewQueries: [{ propertyName: "overlay", first: true, predicate: ["overlay"], descendants: true }], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: NzTooltipBaseComponent, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i2.NzNoAnimationDirective }], propDecorators: { overlay: [{
                type: ViewChild,
                args: ['overlay', { static: false }]
            }] } });
export function isTooltipEmpty(value) {
    return value instanceof TemplateRef ? false : value === '' || !isNotNil(value);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2NvbXBvbmVudHMvdG9vbHRpcC9iYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3BELE9BQU8sRUFHTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFJWixRQUFRLEVBQ1IsV0FBVyxFQUNYLFNBQVMsRUFFVCxXQUFXLEVBRVgsU0FBUyxFQUNULGdCQUFnQixFQUNoQixNQUFNLEVBQ1AsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUMsT0FBTyxFQUFFLEtBQUssRUFBRSxvQkFBb0IsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFaEYsT0FBTyxFQUFFLGVBQWUsRUFBbUMsTUFBTSwyQkFBMkIsQ0FBQztBQUM3RixPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUN6RSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsWUFBWSxFQUFpQixnQkFBZ0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRXRILE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0seUJBQXlCLENBQUM7Ozs7QUFTOUQsTUFBTSxPQUFnQixzQkFBc0I7SUFrQjFDOztPQUVHO0lBQ0gsSUFBYyxNQUFNO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQztJQUNuRCxDQUFDO0lBRUQsSUFBYyxRQUFRO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDO0lBQ3ZELENBQUM7SUFFRCxJQUFjLFFBQVE7UUFDcEIsT0FBTyxPQUFPLElBQUksQ0FBQyxPQUFPLEtBQUss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QUFDLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUNqRixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDZCxDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0ssdUJBQXVCO1FBQzdCLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2QsQ0FBQztJQUNILENBQUM7SUFFUyxZQUFZO1FBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUc7WUFDZixDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLElBQUk7WUFDL0IsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLGNBQWMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsRUFBRSxJQUFJO1NBQy9ELENBQUM7SUFDSixDQUFDOzhHQWpLbUIsc0JBQXNCO2tHQUF0QixzQkFBc0I7OzJGQUF0QixzQkFBc0I7a0JBRjNDLFNBQVM7OzBCQWlFTCxRQUFROzhFQTNEOEIsT0FBTztzQkFBL0MsU0FBUzt1QkFBQyxTQUFTLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFOztBQXFLekMsTUFBTSxVQUFVLGNBQWMsQ0FBQyxLQUF3QztJQUNyRSxPQUFPLEtBQUssWUFBWSxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNqRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2dpdGh1Yi5jb20vTkctWk9SUk8vbmctem9ycm8tYW50ZC9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKi9cblxuaW1wb3J0IHsgRGlyZWN0aW9uLCBEaXJlY3Rpb25hbGl0eSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7IENka0Nvbm5lY3RlZE92ZXJsYXksIENvbm5lY3RlZE92ZXJsYXlQb3NpdGlvbkNoYW5nZSwgQ29ubmVjdGlvblBvc2l0aW9uUGFpciB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7IGlzUGxhdGZvcm1Ccm93c2VyIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7XG4gIEFmdGVyVmlld0luaXQsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3B0aW9uYWwsXG4gIFBMQVRGT1JNX0lELFxuICBSZW5kZXJlcjIsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIFRlbXBsYXRlUmVmLFxuICBUeXBlLFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdDb250YWluZXJSZWYsXG4gIGluamVjdFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFN1YmplY3QsIGFzYXBTY2hlZHVsZXIgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGRlbGF5LCBkaXN0aW5jdFVudGlsQ2hhbmdlZCwgZmlsdGVyLCB0YWtlVW50aWwgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7IE56Q29uZmlnU2VydmljZSwgUG9wQ29uZmlybUNvbmZpZywgUG9wb3ZlckNvbmZpZyB9IGZyb20gJ25nLXpvcnJvLWFudGQvY29yZS9jb25maWcnO1xuaW1wb3J0IHsgTnpOb0FuaW1hdGlvbkRpcmVjdGl2ZSB9IGZyb20gJ25nLXpvcnJvLWFudGQvY29yZS9uby1hbmltYXRpb24nO1xuaW1wb3J0IHsgREVGQVVMVF9UT09MVElQX1BPU0lUSU9OUywgUE9TSVRJT05fTUFQLCBQT1NJVElPTl9UWVBFLCBnZXRQbGFjZW1lbnROYW1lIH0gZnJvbSAnbmctem9ycm8tYW50ZC9jb3JlL292ZXJsYXknO1xuaW1wb3J0IHsgQm9vbGVhbklucHV0LCBOZ0NsYXNzSW50ZXJmYWNlLCBOZ1N0eWxlSW50ZXJmYWNlLCBOelNhZmVBbnksIE56VFNUeXBlIH0gZnJvbSAnbmctem9ycm8tYW50ZC9jb3JlL3R5cGVzJztcbmltcG9ydCB7IGlzTm90TmlsLCB0b0Jvb2xlYW4gfSBmcm9tICduZy16b3Jyby1hbnRkL2NvcmUvdXRpbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvcGVydHlNYXBwaW5nIHtcbiAgW2tleTogc3RyaW5nXTogW3N0cmluZywgKCkgPT4gdW5rbm93bl07XG59XG5cbmV4cG9ydCB0eXBlIE56VG9vbHRpcFRyaWdnZXIgPSAnY2xpY2snIHwgJ2ZvY3VzJyB8ICdob3ZlcicgfCBudWxsO1xuXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBOelRvb2x0aXBCYXNlRGlyZWN0aXZlIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICBhcnJvd1BvaW50QXRDZW50ZXI/OiBib29sZWFuO1xuICBjb25maWc/OiBSZXF1aXJlZDxQb3BvdmVyQ29uZmlnIHwgUG9wQ29uZmlybUNvbmZpZz47XG4gIGRpcmVjdGl2ZVRpdGxlPzogTnpUU1R5cGUgfCBudWxsO1xuICBkaXJlY3RpdmVDb250ZW50PzogTnpUU1R5cGUgfCBudWxsO1xuICB0aXRsZT86IE56VFNUeXBlIHwgbnVsbDtcbiAgY29udGVudD86IE56VFNUeXBlIHwgbnVsbDtcbiAgdHJpZ2dlcj86IE56VG9vbHRpcFRyaWdnZXI7XG4gIHBsYWNlbWVudD86IHN0cmluZyB8IHN0cmluZ1tdO1xuICBvcmlnaW4/OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PjtcbiAgdmlzaWJsZT86IGJvb2xlYW47XG4gIG1vdXNlRW50ZXJEZWxheT86IG51bWJlcjtcbiAgbW91c2VMZWF2ZURlbGF5PzogbnVtYmVyO1xuICBvdmVybGF5Q2xhc3NOYW1lPzogc3RyaW5nO1xuICBvdmVybGF5U3R5bGU/OiBOZ1N0eWxlSW50ZXJmYWNlO1xuICBjZGtDb25uZWN0ZWRPdmVybGF5UHVzaD86IGJvb2xlYW47XG4gIHZpc2libGVDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPGJvb2xlYW4+KCk7XG5cbiAgLyoqXG4gICAqIFRoaXMgdHJ1ZSB0aXRsZSB0aGF0IHdvdWxkIGJlIHVzZWQgaW4gb3RoZXIgcGFydHMgb24gdGhpcyBjb21wb25lbnQuXG4gICAqL1xuICBwcm90ZWN0ZWQgZ2V0IF90aXRsZSgpOiBOelRTVHlwZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLnRpdGxlIHx8IHRoaXMuZGlyZWN0aXZlVGl0bGUgfHwgbnVsbDtcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXQgX2NvbnRlbnQoKTogTnpUU1R5cGUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5jb250ZW50IHx8IHRoaXMuZGlyZWN0aXZlQ29udGVudCB8fCBudWxsO1xuICB9XG5cbiAgcHJvdGVjdGVkIGdldCBfdHJpZ2dlcigpOiBOelRvb2x0aXBUcmlnZ2VyIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaXMudHJpZ2dlciAhPT0gJ3VuZGVmaW5lZCcgPyB0aGlzLnRyaWdnZXIgOiAnaG92ZXInO1xuICB9XG5cbiAgcHJvdGVjdGVkIGdldCBfcGxhY2VtZW50KCk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCBwID0gdGhpcy5wbGFjZW1lbnQ7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkocCkgJiYgcC5sZW5ndGggPiAwID8gcCA6IHR5cGVvZiBwID09PSAnc3RyaW5nJyAmJiBwID8gW3BdIDogWyd0b3AnXTtcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXQgX3Zpc2libGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICh0eXBlb2YgdGhpcy52aXNpYmxlICE9PSAndW5kZWZpbmVkJyA/IHRoaXMudmlzaWJsZSA6IHRoaXMuaW50ZXJuYWxWaXNpYmxlKSB8fCBmYWxzZTtcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXQgX21vdXNlRW50ZXJEZWxheSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm1vdXNlRW50ZXJEZWxheSB8fCAwLjE1O1xuICB9XG5cbiAgcHJvdGVjdGVkIGdldCBfbW91c2VMZWF2ZURlbGF5KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubW91c2VMZWF2ZURlbGF5IHx8IDAuMTtcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXQgX292ZXJsYXlDbGFzc05hbWUoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMub3ZlcmxheUNsYXNzTmFtZSB8fCBudWxsO1xuICB9XG5cbiAgcHJvdGVjdGVkIGdldCBfb3ZlcmxheVN0eWxlKCk6IE5nU3R5bGVJbnRlcmZhY2UgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5vdmVybGF5U3R5bGUgfHwgbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgaW50ZXJuYWxWaXNpYmxlID0gZmFsc2U7XG5cbiAgcHJvdGVjdGVkIGdldFByb3h5UHJvcGVydHlNYXAoKTogUHJvcGVydHlNYXBwaW5nIHtcbiAgICByZXR1cm4ge1xuICAgICAgbm9BbmltYXRpb246IFsnbm9BbmltYXRpb24nLCAoKSA9PiAhIXRoaXMubm9BbmltYXRpb25dXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudD86IE56VG9vbHRpcEJhc2VDb21wb25lbnQ7XG5cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlc3Ryb3kkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHRyaWdnZXJEaXNwb3NhYmxlczogQXJyYXk8KCkgPT4gdm9pZD4gPSBbXTtcblxuICBwcml2YXRlIGRlbGF5VGltZXI/OiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PjtcblxuICBlbGVtZW50UmVmID0gaW5qZWN0KEVsZW1lbnRSZWYpO1xuICBwcm90ZWN0ZWQgaG9zdFZpZXcgPSBpbmplY3QoVmlld0NvbnRhaW5lclJlZik7XG4gIHByb3RlY3RlZCByZW5kZXJlciA9IGluamVjdChSZW5kZXJlcjIpO1xuICBwcm90ZWN0ZWQgbm9BbmltYXRpb24gPSBpbmplY3QoTnpOb0FuaW1hdGlvbkRpcmVjdGl2ZSwgeyBob3N0OiB0cnVlLCBvcHRpb25hbDogdHJ1ZSB9KTtcbiAgcHJvdGVjdGVkIG56Q29uZmlnU2VydmljZSA9IGluamVjdChOekNvbmZpZ1NlcnZpY2UpO1xuICBwcm90ZWN0ZWQgcGxhdGZvcm1JZCA9IGluamVjdChQTEFURk9STV9JRCk7XG5cbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIGNvbXBvbmVudFR5cGU6IFR5cGU8TnpUb29sdGlwQmFzZUNvbXBvbmVudD4pIHt9XG5cbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgIGlmIChpc1BsYXRmb3JtQnJvd3Nlcih0aGlzLnBsYXRmb3JtSWQpKSB7XG4gICAgICB0aGlzLmNyZWF0ZUNvbXBvbmVudCgpO1xuICAgICAgdGhpcy5yZWdpc3RlclRyaWdnZXJzKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xuICAgIGNvbnN0IHsgdHJpZ2dlciB9ID0gY2hhbmdlcztcblxuICAgIGlmICh0cmlnZ2VyICYmICF0cmlnZ2VyLmlzRmlyc3RDaGFuZ2UoKSkge1xuICAgICAgdGhpcy5yZWdpc3RlclRyaWdnZXJzKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY29tcG9uZW50KSB7XG4gICAgICB0aGlzLnVwZGF0ZVByb3BlcnRpZXNCeUNoYW5nZXMoY2hhbmdlcyk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5kZXN0cm95JC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95JC5jb21wbGV0ZSgpO1xuXG4gICAgLy8gQ2xlYXIgdG9nZ2xpbmcgdGltZXIuIElzc3VlICMzODc1ICM0MzE3ICM0Mzg2XG4gICAgdGhpcy5jbGVhclRvZ2dsaW5nVGltZXIoKTtcbiAgICB0aGlzLnJlbW92ZVRyaWdnZXJMaXN0ZW5lcnMoKTtcbiAgfVxuXG4gIHNob3coKTogdm9pZCB7XG4gICAgdGhpcy5jb21wb25lbnQ/LnNob3coKTtcbiAgfVxuXG4gIGhpZGUoKTogdm9pZCB7XG4gICAgdGhpcy5jb21wb25lbnQ/LmhpZGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JjZSB0aGUgY29tcG9uZW50IHRvIHVwZGF0ZSBpdHMgcG9zaXRpb24uXG4gICAqL1xuICB1cGRhdGVQb3NpdGlvbigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jb21wb25lbnQpIHtcbiAgICAgIHRoaXMuY29tcG9uZW50LnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGR5bmFtaWMgdG9vbHRpcCBjb21wb25lbnQuIFRoaXMgbWV0aG9kIGNhbiBiZSBvdmVycmlkZS5cbiAgICovXG4gIHByb3RlY3RlZCBjcmVhdGVDb21wb25lbnQoKTogdm9pZCB7XG4gICAgY29uc3QgY29tcG9uZW50UmVmID0gdGhpcy5ob3N0Vmlldy5jcmVhdGVDb21wb25lbnQodGhpcy5jb21wb25lbnRUeXBlKTtcblxuICAgIHRoaXMuY29tcG9uZW50ID0gY29tcG9uZW50UmVmLmluc3RhbmNlIGFzIE56VG9vbHRpcEJhc2VDb21wb25lbnQ7XG5cbiAgICAvLyBSZW1vdmUgdGhlIGNvbXBvbmVudCdzIERPTSBiZWNhdXNlIGl0IHNob3VsZCBiZSBpbiB0aGUgb3ZlcmxheSBjb250YWluZXIuXG4gICAgdGhpcy5yZW5kZXJlci5yZW1vdmVDaGlsZChcbiAgICAgIHRoaXMucmVuZGVyZXIucGFyZW50Tm9kZSh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCksXG4gICAgICBjb21wb25lbnRSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudFxuICAgICk7XG4gICAgdGhpcy5jb21wb25lbnQuc2V0T3ZlcmxheU9yaWdpbih0aGlzLm9yaWdpbiB8fCB0aGlzLmVsZW1lbnRSZWYpO1xuXG4gICAgdGhpcy5pbml0UHJvcGVydGllcygpO1xuXG4gICAgY29uc3QgbmdWaXNpYmxlQ2hhbmdlJCA9IHRoaXMuY29tcG9uZW50Lm56VmlzaWJsZUNoYW5nZS5waXBlKGRpc3RpbmN0VW50aWxDaGFuZ2VkKCkpO1xuXG4gICAgbmdWaXNpYmxlQ2hhbmdlJC5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKSkuc3Vic2NyaWJlKCh2aXNpYmxlOiBib29sZWFuKSA9PiB7XG4gICAgICB0aGlzLmludGVybmFsVmlzaWJsZSA9IHZpc2libGU7XG4gICAgICB0aGlzLnZpc2libGVDaGFuZ2UuZW1pdCh2aXNpYmxlKTtcbiAgICB9KTtcblxuICAgIC8vIEluIHNvbWUgY2FzZXMsIHRoZSByZW5kZXJpbmcgdGFrZXMgaW50byBhY2NvdW50IHRoZSBoZWlnaHQgYXQgd2hpY2ggdGhlIGBhcnJvd2AgaXMgaW4gd3JvbmcgcGxhY2UsXG4gICAgLy8gc28gYGNka2Agc2V0cyB0aGUgY29udGFpbmVyIHBvc2l0aW9uIGluY29ycmVjdGx5LlxuICAgIC8vIFRvIGF2b2lkIHRoaXMsIGFmdGVyIHBsYWNpbmcgdGhlIGBhcnJvd2AgaW4gdGhlIGNvcnJlY3QgcG9zaXRpb24sIHdlIHNob3VsZCBgcmUtY2FsY3VsYXRlYCB0aGUgcG9zaXRpb24gb2YgdGhlIGBvdmVybGF5YC5cbiAgICBuZ1Zpc2libGVDaGFuZ2UkXG4gICAgICAucGlwZShcbiAgICAgICAgZmlsdGVyKCh2aXNpYmxlOiBib29sZWFuKSA9PiB2aXNpYmxlKSxcbiAgICAgICAgZGVsYXkoMCwgYXNhcFNjaGVkdWxlciksXG4gICAgICAgIGZpbHRlcigoKSA9PiBCb29sZWFuKHRoaXMuY29tcG9uZW50Py5vdmVybGF5Py5vdmVybGF5UmVmKSksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKVxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuY29tcG9uZW50Py51cGRhdGVQb3NpdGlvbigpO1xuICAgICAgfSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgcmVnaXN0ZXJUcmlnZ2VycygpOiB2b2lkIHtcbiAgICAvLyBXaGVuIHRoZSBtZXRob2QgZ2V0cyBpbnZva2VkLCBhbGwgcHJvcGVydGllcyBoYXMgYmVlbiBzeW5jZWQgdG8gdGhlIGR5bmFtaWMgY29tcG9uZW50LlxuICAgIC8vIEFmdGVyIHJlbW92aW5nIHRoZSBvbGQgQVBJLCB3ZSBjYW4ganVzdCBjaGVjayB0aGUgZGlyZWN0aXZlJ3Mgb3duIGBuelRyaWdnZXJgLlxuICAgIGNvbnN0IGVsID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgY29uc3QgdHJpZ2dlciA9IHRoaXMudHJpZ2dlcjtcblxuICAgIHRoaXMucmVtb3ZlVHJpZ2dlckxpc3RlbmVycygpO1xuXG4gICAgaWYgKHRyaWdnZXIgPT09ICdob3ZlcicpIHtcbiAgICAgIGxldCBvdmVybGF5RWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gICAgICB0aGlzLnRyaWdnZXJEaXNwb3NhYmxlcy5wdXNoKFxuICAgICAgICB0aGlzLnJlbmRlcmVyLmxpc3RlbihlbCwgJ21vdXNlZW50ZXInLCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5kZWxheUVudGVyTGVhdmUodHJ1ZSwgdHJ1ZSwgdGhpcy5fbW91c2VFbnRlckRlbGF5KTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgICB0aGlzLnRyaWdnZXJEaXNwb3NhYmxlcy5wdXNoKFxuICAgICAgICB0aGlzLnJlbmRlcmVyLmxpc3RlbihlbCwgJ21vdXNlbGVhdmUnLCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5kZWxheUVudGVyTGVhdmUodHJ1ZSwgZmFsc2UsIHRoaXMuX21vdXNlTGVhdmVEZWxheSk7XG4gICAgICAgICAgaWYgKHRoaXMuY29tcG9uZW50Py5vdmVybGF5Lm92ZXJsYXlSZWYgJiYgIW92ZXJsYXlFbGVtZW50KSB7XG4gICAgICAgICAgICBvdmVybGF5RWxlbWVudCA9IHRoaXMuY29tcG9uZW50Lm92ZXJsYXkub3ZlcmxheVJlZi5vdmVybGF5RWxlbWVudDtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlckRpc3Bvc2FibGVzLnB1c2goXG4gICAgICAgICAgICAgIHRoaXMucmVuZGVyZXIubGlzdGVuKG92ZXJsYXlFbGVtZW50LCAnbW91c2VlbnRlcicsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGF5RW50ZXJMZWF2ZShmYWxzZSwgdHJ1ZSwgdGhpcy5fbW91c2VFbnRlckRlbGF5KTtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJEaXNwb3NhYmxlcy5wdXNoKFxuICAgICAgICAgICAgICB0aGlzLnJlbmRlcmVyLmxpc3RlbihvdmVybGF5RWxlbWVudCwgJ21vdXNlbGVhdmUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWxheUVudGVyTGVhdmUoZmFsc2UsIGZhbHNlLCB0aGlzLl9tb3VzZUxlYXZlRGVsYXkpO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAodHJpZ2dlciA9PT0gJ2ZvY3VzJykge1xuICAgICAgdGhpcy50cmlnZ2VyRGlzcG9zYWJsZXMucHVzaCh0aGlzLnJlbmRlcmVyLmxpc3RlbihlbCwgJ2ZvY3VzaW4nLCAoKSA9PiB0aGlzLnNob3coKSkpO1xuICAgICAgdGhpcy50cmlnZ2VyRGlzcG9zYWJsZXMucHVzaCh0aGlzLnJlbmRlcmVyLmxpc3RlbihlbCwgJ2ZvY3Vzb3V0JywgKCkgPT4gdGhpcy5oaWRlKCkpKTtcbiAgICB9IGVsc2UgaWYgKHRyaWdnZXIgPT09ICdjbGljaycpIHtcbiAgICAgIHRoaXMudHJpZ2dlckRpc3Bvc2FibGVzLnB1c2goXG4gICAgICAgIHRoaXMucmVuZGVyZXIubGlzdGVuKGVsLCAnY2xpY2snLCAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB0aGlzLnNob3coKTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICAgIC8vIEVsc2UgZG8gbm90aGluZyBiZWNhdXNlIHVzZXIgd2FudHMgdG8gY29udHJvbCB0aGUgdmlzaWJpbGl0eSBwcm9ncmFtbWF0aWNhbGx5LlxuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVQcm9wZXJ0aWVzQnlDaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICB0aGlzLnVwZGF0ZVByb3BlcnRpZXNCeUtleXMoT2JqZWN0LmtleXMoY2hhbmdlcykpO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVQcm9wZXJ0aWVzQnlLZXlzKGtleXM/OiBzdHJpbmdbXSk6IHZvaWQge1xuICAgIGNvbnN0IG1hcHBpbmdQcm9wZXJ0aWVzOiBQcm9wZXJ0eU1hcHBpbmcgPSB7XG4gICAgICAvLyBjb21tb24gbWFwcGluZ3NcbiAgICAgIHRpdGxlOiBbJ256VGl0bGUnLCAoKSA9PiB0aGlzLl90aXRsZV0sXG4gICAgICBkaXJlY3RpdmVUaXRsZTogWyduelRpdGxlJywgKCkgPT4gdGhpcy5fdGl0bGVdLFxuICAgICAgY29udGVudDogWyduekNvbnRlbnQnLCAoKSA9PiB0aGlzLl9jb250ZW50XSxcbiAgICAgIGRpcmVjdGl2ZUNvbnRlbnQ6IFsnbnpDb250ZW50JywgKCkgPT4gdGhpcy5fY29udGVudF0sXG4gICAgICB0cmlnZ2VyOiBbJ256VHJpZ2dlcicsICgpID0+IHRoaXMuX3RyaWdnZXJdLFxuICAgICAgcGxhY2VtZW50OiBbJ256UGxhY2VtZW50JywgKCkgPT4gdGhpcy5fcGxhY2VtZW50XSxcbiAgICAgIHZpc2libGU6IFsnbnpWaXNpYmxlJywgKCkgPT4gdGhpcy5fdmlzaWJsZV0sXG4gICAgICBtb3VzZUVudGVyRGVsYXk6IFsnbnpNb3VzZUVudGVyRGVsYXknLCAoKSA9PiB0aGlzLl9tb3VzZUVudGVyRGVsYXldLFxuICAgICAgbW91c2VMZWF2ZURlbGF5OiBbJ256TW91c2VMZWF2ZURlbGF5JywgKCkgPT4gdGhpcy5fbW91c2VMZWF2ZURlbGF5XSxcbiAgICAgIG92ZXJsYXlDbGFzc05hbWU6IFsnbnpPdmVybGF5Q2xhc3NOYW1lJywgKCkgPT4gdGhpcy5fb3ZlcmxheUNsYXNzTmFtZV0sXG4gICAgICBvdmVybGF5U3R5bGU6IFsnbnpPdmVybGF5U3R5bGUnLCAoKSA9PiB0aGlzLl9vdmVybGF5U3R5bGVdLFxuICAgICAgYXJyb3dQb2ludEF0Q2VudGVyOiBbJ256QXJyb3dQb2ludEF0Q2VudGVyJywgKCkgPT4gdGhpcy5hcnJvd1BvaW50QXRDZW50ZXJdLFxuICAgICAgY2RrQ29ubmVjdGVkT3ZlcmxheVB1c2g6IFsnY2RrQ29ubmVjdGVkT3ZlcmxheVB1c2gnLCAoKSA9PiB0aGlzLmNka0Nvbm5lY3RlZE92ZXJsYXlQdXNoXSxcbiAgICAgIC4uLnRoaXMuZ2V0UHJveHlQcm9wZXJ0eU1hcCgpXG4gICAgfTtcblxuICAgIChrZXlzIHx8IE9iamVjdC5rZXlzKG1hcHBpbmdQcm9wZXJ0aWVzKS5maWx0ZXIoa2V5ID0+ICFrZXkuc3RhcnRzV2l0aCgnZGlyZWN0aXZlJykpKS5mb3JFYWNoKFxuICAgICAgKHByb3BlcnR5OiBOelNhZmVBbnkpID0+IHtcbiAgICAgICAgaWYgKG1hcHBpbmdQcm9wZXJ0aWVzW3Byb3BlcnR5XSkge1xuICAgICAgICAgIGNvbnN0IFtuYW1lLCB2YWx1ZUZuXSA9IG1hcHBpbmdQcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICAgICAgICB0aGlzLnVwZGF0ZUNvbXBvbmVudFZhbHVlKG5hbWUsIHZhbHVlRm4oKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5jb21wb25lbnQ/LnVwZGF0ZUJ5RGlyZWN0aXZlKCk7XG4gIH1cblxuICBwcml2YXRlIGluaXRQcm9wZXJ0aWVzKCk6IHZvaWQge1xuICAgIHRoaXMudXBkYXRlUHJvcGVydGllc0J5S2V5cygpO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVDb21wb25lbnRWYWx1ZShrZXk6IHN0cmluZywgdmFsdWU6IE56U2FmZUFueSk6IHZvaWQge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICB0aGlzLmNvbXBvbmVudFtrZXldID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBkZWxheUVudGVyTGVhdmUoaXNPcmlnaW46IGJvb2xlYW4sIGlzRW50ZXI6IGJvb2xlYW4sIGRlbGF5OiBudW1iZXIgPSAtMSk6IHZvaWQge1xuICAgIGlmICh0aGlzLmRlbGF5VGltZXIpIHtcbiAgICAgIHRoaXMuY2xlYXJUb2dnbGluZ1RpbWVyKCk7XG4gICAgfSBlbHNlIGlmIChkZWxheSA+IDApIHtcbiAgICAgIHRoaXMuZGVsYXlUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmRlbGF5VGltZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlzRW50ZXIgPyB0aGlzLnNob3coKSA6IHRoaXMuaGlkZSgpO1xuICAgICAgfSwgZGVsYXkgKiAxMDAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gYGlzT3JpZ2luYCBpcyB1c2VkIGR1ZSB0byB0aGUgdG9vbHRpcCB3aWxsIG5vdCBoaWRlIGltbWVkaWF0ZWx5XG4gICAgICAvLyAobWF5IGNhdXNlZCBieSB0aGUgZmFkZS1vdXQgYW5pbWF0aW9uKS5cbiAgICAgIGlzRW50ZXIgJiYgaXNPcmlnaW4gPyB0aGlzLnNob3coKSA6IHRoaXMuaGlkZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVtb3ZlVHJpZ2dlckxpc3RlbmVycygpOiB2b2lkIHtcbiAgICB0aGlzLnRyaWdnZXJEaXNwb3NhYmxlcy5mb3JFYWNoKGRpc3Bvc2UgPT4gZGlzcG9zZSgpKTtcbiAgICB0aGlzLnRyaWdnZXJEaXNwb3NhYmxlcy5sZW5ndGggPSAwO1xuICB9XG5cbiAgcHJpdmF0ZSBjbGVhclRvZ2dsaW5nVGltZXIoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuZGVsYXlUaW1lcikge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuZGVsYXlUaW1lcik7XG4gICAgICB0aGlzLmRlbGF5VGltZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG59XG5cbkBEaXJlY3RpdmUoKVxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEBhbmd1bGFyLWVzbGludC9kaXJlY3RpdmUtY2xhc3Mtc3VmZml4XG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTnpUb29sdGlwQmFzZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uRGVzdHJveSwgT25Jbml0IHtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX256VmlzaWJsZTogQm9vbGVhbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbnpBcnJvd1BvaW50QXRDZW50ZXI6IEJvb2xlYW5JbnB1dDtcblxuICBAVmlld0NoaWxkKCdvdmVybGF5JywgeyBzdGF0aWM6IGZhbHNlIH0pIG92ZXJsYXkhOiBDZGtDb25uZWN0ZWRPdmVybGF5O1xuXG4gIG56VGl0bGU6IE56VFNUeXBlIHwgbnVsbCA9IG51bGw7XG4gIG56Q29udGVudDogTnpUU1R5cGUgfCBudWxsID0gbnVsbDtcbiAgbnpBcnJvd1BvaW50QXRDZW50ZXI6IGJvb2xlYW4gPSBmYWxzZTtcbiAgbnpPdmVybGF5Q2xhc3NOYW1lITogc3RyaW5nO1xuICBuek92ZXJsYXlTdHlsZTogTmdTdHlsZUludGVyZmFjZSA9IHt9O1xuICBuekJhY2tkcm9wID0gZmFsc2U7XG4gIG56TW91c2VFbnRlckRlbGF5PzogbnVtYmVyO1xuICBuek1vdXNlTGVhdmVEZWxheT86IG51bWJlcjtcbiAgY2RrQ29ubmVjdGVkT3ZlcmxheVB1c2g/OiBib29sZWFuID0gdHJ1ZTtcblxuICBuelZpc2libGVDaGFuZ2UgPSBuZXcgU3ViamVjdDxib29sZWFuPigpO1xuXG4gIHNldCBuelZpc2libGUodmFsdWU6IGJvb2xlYW4pIHtcbiAgICBjb25zdCB2aXNpYmxlID0gdG9Cb29sZWFuKHZhbHVlKTtcbiAgICBpZiAodGhpcy5fdmlzaWJsZSAhPT0gdmlzaWJsZSkge1xuICAgICAgdGhpcy5fdmlzaWJsZSA9IHZpc2libGU7XG4gICAgICB0aGlzLm56VmlzaWJsZUNoYW5nZS5uZXh0KHZpc2libGUpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBuelZpc2libGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3Zpc2libGU7XG4gIH1cblxuICBfdmlzaWJsZSA9IGZhbHNlO1xuXG4gIHNldCBuelRyaWdnZXIodmFsdWU6IE56VG9vbHRpcFRyaWdnZXIpIHtcbiAgICB0aGlzLl90cmlnZ2VyID0gdmFsdWU7XG4gIH1cblxuICBnZXQgbnpUcmlnZ2VyKCk6IE56VG9vbHRpcFRyaWdnZXIge1xuICAgIHJldHVybiB0aGlzLl90cmlnZ2VyO1xuICB9XG5cbiAgcHJvdGVjdGVkIF90cmlnZ2VyOiBOelRvb2x0aXBUcmlnZ2VyID0gJ2hvdmVyJztcblxuICBzZXQgbnpQbGFjZW1lbnQodmFsdWU6IFBPU0lUSU9OX1RZUEVbXSkge1xuICAgIGNvbnN0IHByZWZlcnJlZFBvc2l0aW9uID0gdmFsdWUubWFwKHBsYWNlbWVudCA9PiBQT1NJVElPTl9NQVBbcGxhY2VtZW50XSk7XG4gICAgdGhpcy5fcG9zaXRpb25zID0gWy4uLnByZWZlcnJlZFBvc2l0aW9uLCAuLi5ERUZBVUxUX1RPT0xUSVBfUE9TSVRJT05TXTtcbiAgfVxuXG4gIHByZWZlcnJlZFBsYWNlbWVudDogc3RyaW5nID0gJ3RvcCc7XG5cbiAgb3JpZ2luITogRWxlbWVudFJlZjxOelNhZmVBbnk+O1xuXG4gIHB1YmxpYyBkaXI6IERpcmVjdGlvbiA9ICdsdHInO1xuXG4gIF9jbGFzc01hcDogTmdDbGFzc0ludGVyZmFjZSA9IHt9O1xuXG4gIF9wcmVmaXggPSAnYW50LXRvb2x0aXAnO1xuXG4gIF9wb3NpdGlvbnM6IENvbm5lY3Rpb25Qb3NpdGlvblBhaXJbXSA9IFsuLi5ERUZBVUxUX1RPT0xUSVBfUE9TSVRJT05TXTtcblxuICBwcm90ZWN0ZWQgZGVzdHJveSQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBjZHI6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgZGlyZWN0aW9uYWxpdHk6IERpcmVjdGlvbmFsaXR5LFxuICAgIHB1YmxpYyBub0FuaW1hdGlvbj86IE56Tm9BbmltYXRpb25EaXJlY3RpdmVcbiAgKSB7fVxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIHRoaXMuZGlyZWN0aW9uYWxpdHkuY2hhbmdlPy5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKSkuc3Vic2NyaWJlKChkaXJlY3Rpb246IERpcmVjdGlvbikgPT4ge1xuICAgICAgdGhpcy5kaXIgPSBkaXJlY3Rpb247XG4gICAgICB0aGlzLmNkci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmRpciA9IHRoaXMuZGlyZWN0aW9uYWxpdHkudmFsdWU7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLm56VmlzaWJsZUNoYW5nZS5jb21wbGV0ZSgpO1xuICAgIHRoaXMuZGVzdHJveSQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveSQuY29tcGxldGUoKTtcbiAgfVxuXG4gIHNob3coKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubnpWaXNpYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmlzRW1wdHkoKSkge1xuICAgICAgdGhpcy5uelZpc2libGUgPSB0cnVlO1xuICAgICAgdGhpcy5uelZpc2libGVDaGFuZ2UubmV4dCh0cnVlKTtcbiAgICAgIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgICB9XG5cbiAgICAvLyBmb3IgbHRyIGZvciBvdmVybGF5IHRvIGRpc3BsYXkgdG9vbHRpcCBpbiBjb3JyZWN0IHBsYWNlbWVudCBpbiBydGwgZGlyZWN0aW9uLlxuICAgIGlmICh0aGlzLm9yaWdpbiAmJiB0aGlzLm92ZXJsYXkgJiYgdGhpcy5vdmVybGF5Lm92ZXJsYXlSZWYgJiYgdGhpcy5vdmVybGF5Lm92ZXJsYXlSZWYuZ2V0RGlyZWN0aW9uKCkgPT09ICdydGwnKSB7XG4gICAgICB0aGlzLm92ZXJsYXkub3ZlcmxheVJlZi5zZXREaXJlY3Rpb24oJ2x0cicpO1xuICAgIH1cbiAgfVxuXG4gIGhpZGUoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLm56VmlzaWJsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMubnpWaXNpYmxlID0gZmFsc2U7XG4gICAgdGhpcy5uelZpc2libGVDaGFuZ2UubmV4dChmYWxzZSk7XG4gICAgdGhpcy5jZHIuZGV0ZWN0Q2hhbmdlcygpO1xuICB9XG5cbiAgdXBkYXRlQnlEaXJlY3RpdmUoKTogdm9pZCB7XG4gICAgdGhpcy51cGRhdGVTdHlsZXMoKTtcbiAgICB0aGlzLmNkci5kZXRlY3RDaGFuZ2VzKCk7XG5cbiAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMudXBkYXRlUG9zaXRpb24oKTtcbiAgICAgIHRoaXMudXBkYXRlVmlzaWJpbGl0eUJ5VGl0bGUoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JjZSB0aGUgY29tcG9uZW50IHRvIHVwZGF0ZSBpdHMgcG9zaXRpb24uXG4gICAqL1xuICB1cGRhdGVQb3NpdGlvbigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5vcmlnaW4gJiYgdGhpcy5vdmVybGF5ICYmIHRoaXMub3ZlcmxheS5vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLm92ZXJsYXkub3ZlcmxheVJlZi51cGRhdGVQb3NpdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIG9uUG9zaXRpb25DaGFuZ2UocG9zaXRpb246IENvbm5lY3RlZE92ZXJsYXlQb3NpdGlvbkNoYW5nZSk6IHZvaWQge1xuICAgIHRoaXMucHJlZmVycmVkUGxhY2VtZW50ID0gZ2V0UGxhY2VtZW50TmFtZShwb3NpdGlvbikhO1xuICAgIHRoaXMudXBkYXRlU3R5bGVzKCk7XG5cbiAgICAvLyBXZSBoYXZlIHRvIHRyaWdnZXIgaW1tZWRpYXRlIGNoYW5nZSBkZXRlY3Rpb24gb3IgdGhlIGVsZW1lbnQgd291bGQgYmxpbmsuXG4gICAgdGhpcy5jZHIuZGV0ZWN0Q2hhbmdlcygpO1xuICB9XG5cbiAgc2V0T3ZlcmxheU9yaWdpbihvcmlnaW46IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+KTogdm9pZCB7XG4gICAgdGhpcy5vcmlnaW4gPSBvcmlnaW47XG4gICAgdGhpcy5jZHIubWFya0ZvckNoZWNrKCk7XG4gIH1cblxuICBvbkNsaWNrT3V0c2lkZShldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5vcmlnaW4ubmF0aXZlRWxlbWVudC5jb250YWlucyhldmVudC50YXJnZXQpICYmIHRoaXMubnpUcmlnZ2VyICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmhpZGUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGlkZSB0aGUgY29tcG9uZW50IHdoaWxlIHRoZSBjb250ZW50IGlzIGVtcHR5LlxuICAgKi9cbiAgcHJpdmF0ZSB1cGRhdGVWaXNpYmlsaXR5QnlUaXRsZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5pc0VtcHR5KCkpIHtcbiAgICAgIHRoaXMuaGlkZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCB1cGRhdGVTdHlsZXMoKTogdm9pZCB7XG4gICAgdGhpcy5fY2xhc3NNYXAgPSB7XG4gICAgICBbdGhpcy5uek92ZXJsYXlDbGFzc05hbWVdOiB0cnVlLFxuICAgICAgW2Ake3RoaXMuX3ByZWZpeH0tcGxhY2VtZW50LSR7dGhpcy5wcmVmZXJyZWRQbGFjZW1lbnR9YF06IHRydWVcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEVtcHR5IGNvbXBvbmVudCBjYW5ub3QgYmUgb3BlbmVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFic3RyYWN0IGlzRW1wdHkoKTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVG9vbHRpcEVtcHR5KHZhbHVlOiBzdHJpbmcgfCBUZW1wbGF0ZVJlZjx2b2lkPiB8IG51bGwpOiBib29sZWFuIHtcbiAgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgVGVtcGxhdGVSZWYgPyBmYWxzZSA6IHZhbHVlID09PSAnJyB8fCAhaXNOb3ROaWwodmFsdWUpO1xufVxuIl19