import { __decorate } from "tslib";
import { OverlayModule } from '@angular/cdk/overlay';
import { NgClass, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, Directive, EventEmitter, Host, Input, Optional, Output, ViewEncapsulation } from '@angular/core';
import { zoomBigMotion } from 'ng-zorro-antd/core/animation';
import { WithConfig } from 'ng-zorro-antd/core/config';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { NzOverlayModule } from 'ng-zorro-antd/core/overlay';
import { InputBoolean } from 'ng-zorro-antd/core/util';
import { NzToolTipComponent, NzTooltipBaseDirective, isTooltipEmpty } from 'ng-zorro-antd/tooltip';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
import * as i2 from "ng-zorro-antd/core/no-animation";
import * as i3 from "@angular/cdk/overlay";
import * as i4 from "ng-zorro-antd/core/overlay";
import * as i5 from "ng-zorro-antd/core/outlet";
const NZ_CONFIG_MODULE_NAME = 'popover';
export class NzPopoverDirective extends NzTooltipBaseDirective {
    getProxyPropertyMap() {
        return {
            nzPopoverBackdrop: ['nzBackdrop', () => this.nzPopoverBackdrop],
            ...super.getProxyPropertyMap()
        };
    }
    constructor() {
        super(NzPopoverComponent);
        this._nzModuleName = NZ_CONFIG_MODULE_NAME;
        this.trigger = 'hover';
        this.placement = 'top';
        this.nzPopoverBackdrop = false;
        // eslint-disable-next-line @angular-eslint/no-output-rename
        this.visibleChange = new EventEmitter();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: NzPopoverDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.3.8", type: NzPopoverDirective, isStandalone: true, selector: "[nz-popover]", inputs: { arrowPointAtCenter: ["nzPopoverArrowPointAtCenter", "arrowPointAtCenter"], title: ["nzPopoverTitle", "title"], content: ["nzPopoverContent", "content"], directiveTitle: ["nz-popover", "directiveTitle"], trigger: ["nzPopoverTrigger", "trigger"], placement: ["nzPopoverPlacement", "placement"], origin: ["nzPopoverOrigin", "origin"], visible: ["nzPopoverVisible", "visible"], mouseEnterDelay: ["nzPopoverMouseEnterDelay", "mouseEnterDelay"], mouseLeaveDelay: ["nzPopoverMouseLeaveDelay", "mouseLeaveDelay"], overlayClassName: ["nzPopoverOverlayClassName", "overlayClassName"], overlayStyle: ["nzPopoverOverlayStyle", "overlayStyle"], nzPopoverBackdrop: "nzPopoverBackdrop" }, outputs: { visibleChange: "nzPopoverVisibleChange" }, host: { properties: { "class.ant-popover-open": "visible" } }, exportAs: ["nzPopover"], usesInheritance: true, ngImport: i0 }); }
}
__decorate([
    InputBoolean()
], NzPopoverDirective.prototype, "arrowPointAtCenter", void 0);
__decorate([
    WithConfig()
], NzPopoverDirective.prototype, "nzPopoverBackdrop", void 0);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: NzPopoverDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nz-popover]',
                    exportAs: 'nzPopover',
                    host: {
                        '[class.ant-popover-open]': 'visible'
                    },
                    standalone: true
                }]
        }], ctorParameters: () => [], propDecorators: { arrowPointAtCenter: [{
                type: Input,
                args: ['nzPopoverArrowPointAtCenter']
            }], title: [{
                type: Input,
                args: ['nzPopoverTitle']
            }], content: [{
                type: Input,
                args: ['nzPopoverContent']
            }], directiveTitle: [{
                type: Input,
                args: ['nz-popover']
            }], trigger: [{
                type: Input,
                args: ['nzPopoverTrigger']
            }], placement: [{
                type: Input,
                args: ['nzPopoverPlacement']
            }], origin: [{
                type: Input,
                args: ['nzPopoverOrigin']
            }], visible: [{
                type: Input,
                args: ['nzPopoverVisible']
            }], mouseEnterDelay: [{
                type: Input,
                args: ['nzPopoverMouseEnterDelay']
            }], mouseLeaveDelay: [{
                type: Input,
                args: ['nzPopoverMouseLeaveDelay']
            }], overlayClassName: [{
                type: Input,
                args: ['nzPopoverOverlayClassName']
            }], overlayStyle: [{
                type: Input,
                args: ['nzPopoverOverlayStyle']
            }], nzPopoverBackdrop: [{
                type: Input
            }], visibleChange: [{
                type: Output,
                args: ['nzPopoverVisibleChange']
            }] } });
export class NzPopoverComponent extends NzToolTipComponent {
    constructor(cdr, directionality, noAnimation) {
        super(cdr, directionality, noAnimation);
        this._prefix = 'ant-popover';
    }
    get hasBackdrop() {
        return this.nzTrigger === 'click' ? this.nzBackdrop : false;
    }
    isEmpty() {
        return isTooltipEmpty(this.nzTitle) && isTooltipEmpty(this.nzContent);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: NzPopoverComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i1.Directionality, optional: true }, { token: i2.NzNoAnimationDirective, host: true, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "17.3.8", type: NzPopoverComponent, isStandalone: true, selector: "nz-popover", exportAs: ["nzPopoverComponent"], usesInheritance: true, ngImport: i0, template: `
    <ng-template
      #overlay="cdkConnectedOverlay"
      cdkConnectedOverlay
      nzConnectedOverlay
      [cdkConnectedOverlayHasBackdrop]="hasBackdrop"
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayPositions]="_positions"
      [cdkConnectedOverlayOpen]="_visible"
      [cdkConnectedOverlayPush]="cdkConnectedOverlayPush"
      [nzArrowPointAtCenter]="nzArrowPointAtCenter"
      (overlayOutsideClick)="onClickOutside($event)"
      (detach)="hide()"
      (positionChange)="onPositionChange($event)"
    >
      <div
        class="ant-popover"
        [class.ant-popover-rtl]="dir === 'rtl'"
        [ngClass]="_classMap"
        [ngStyle]="nzOverlayStyle"
        [@.disabled]="!!noAnimation?.nzNoAnimation"
        [nzNoAnimation]="noAnimation?.nzNoAnimation"
        [@zoomBigMotion]="'active'"
      >
        <div class="ant-popover-content">
          <div class="ant-popover-arrow">
            <span class="ant-popover-arrow-content"></span>
          </div>
          <div class="ant-popover-inner" role="tooltip">
            <div>
              @if (nzTitle) {
                <div class="ant-popover-title">
                  <ng-container *nzStringTemplateOutlet="nzTitle">{{ nzTitle }}</ng-container>
                </div>
              }
              <div class="ant-popover-inner-content">
                <ng-container *nzStringTemplateOutlet="nzContent">{{ nzContent }}</ng-container>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: OverlayModule }, { kind: "directive", type: i3.CdkConnectedOverlay, selector: "[cdk-connected-overlay], [connected-overlay], [cdkConnectedOverlay]", inputs: ["cdkConnectedOverlayOrigin", "cdkConnectedOverlayPositions", "cdkConnectedOverlayPositionStrategy", "cdkConnectedOverlayOffsetX", "cdkConnectedOverlayOffsetY", "cdkConnectedOverlayWidth", "cdkConnectedOverlayHeight", "cdkConnectedOverlayMinWidth", "cdkConnectedOverlayMinHeight", "cdkConnectedOverlayBackdropClass", "cdkConnectedOverlayPanelClass", "cdkConnectedOverlayViewportMargin", "cdkConnectedOverlayScrollStrategy", "cdkConnectedOverlayOpen", "cdkConnectedOverlayDisableClose", "cdkConnectedOverlayTransformOriginOn", "cdkConnectedOverlayHasBackdrop", "cdkConnectedOverlayLockPosition", "cdkConnectedOverlayFlexibleDimensions", "cdkConnectedOverlayGrowAfterOpen", "cdkConnectedOverlayPush", "cdkConnectedOverlayDisposeOnNavigation"], outputs: ["backdropClick", "positionChange", "attach", "detach", "overlayKeydown", "overlayOutsideClick"], exportAs: ["cdkConnectedOverlay"] }, { kind: "ngmodule", type: NzOverlayModule }, { kind: "directive", type: i4.NzConnectedOverlayDirective, selector: "[cdkConnectedOverlay][nzConnectedOverlay]", inputs: ["nzArrowPointAtCenter"], exportAs: ["nzConnectedOverlay"] }, { kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "directive", type: NzNoAnimationDirective, selector: "[nzNoAnimation]", inputs: ["nzNoAnimation"], exportAs: ["nzNoAnimation"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i5.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }], animations: [zoomBigMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: NzPopoverComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-popover',
                    exportAs: 'nzPopoverComponent',
                    animations: [zoomBigMotion],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    preserveWhitespaces: false,
                    template: `
    <ng-template
      #overlay="cdkConnectedOverlay"
      cdkConnectedOverlay
      nzConnectedOverlay
      [cdkConnectedOverlayHasBackdrop]="hasBackdrop"
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayPositions]="_positions"
      [cdkConnectedOverlayOpen]="_visible"
      [cdkConnectedOverlayPush]="cdkConnectedOverlayPush"
      [nzArrowPointAtCenter]="nzArrowPointAtCenter"
      (overlayOutsideClick)="onClickOutside($event)"
      (detach)="hide()"
      (positionChange)="onPositionChange($event)"
    >
      <div
        class="ant-popover"
        [class.ant-popover-rtl]="dir === 'rtl'"
        [ngClass]="_classMap"
        [ngStyle]="nzOverlayStyle"
        [@.disabled]="!!noAnimation?.nzNoAnimation"
        [nzNoAnimation]="noAnimation?.nzNoAnimation"
        [@zoomBigMotion]="'active'"
      >
        <div class="ant-popover-content">
          <div class="ant-popover-arrow">
            <span class="ant-popover-arrow-content"></span>
          </div>
          <div class="ant-popover-inner" role="tooltip">
            <div>
              @if (nzTitle) {
                <div class="ant-popover-title">
                  <ng-container *nzStringTemplateOutlet="nzTitle">{{ nzTitle }}</ng-container>
                </div>
              }
              <div class="ant-popover-inner-content">
                <ng-container *nzStringTemplateOutlet="nzContent">{{ nzContent }}</ng-container>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `,
                    imports: [OverlayModule, NzOverlayModule, NgClass, NgStyle, NzNoAnimationDirective, NzOutletModule],
                    standalone: true
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i2.NzNoAnimationDirective, decorators: [{
                    type: Host
                }, {
                    type: Optional
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wb3Zlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2NvbXBvbmVudHMvcG9wb3Zlci9wb3BvdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFNQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDckQsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNuRCxPQUFPLEVBQ0wsdUJBQXVCLEVBRXZCLFNBQVMsRUFDVCxTQUFTLEVBRVQsWUFBWSxFQUNaLElBQUksRUFDSixLQUFLLEVBQ0wsUUFBUSxFQUNSLE1BQU0sRUFDTixpQkFBaUIsRUFDbEIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzdELE9BQU8sRUFBZSxVQUFVLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNwRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUN6RSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDM0QsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRTdELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN2RCxPQUFPLEVBQ0wsa0JBQWtCLEVBQ2xCLHNCQUFzQixFQUd0QixjQUFjLEVBQ2YsTUFBTSx1QkFBdUIsQ0FBQzs7Ozs7OztBQUUvQixNQUFNLHFCQUFxQixHQUFnQixTQUFTLENBQUM7QUFVckQsTUFBTSxPQUFPLGtCQUFtQixTQUFRLHNCQUFzQjtJQXVCekMsbUJBQW1CO1FBQ3BDLE9BQU87WUFDTCxpQkFBaUIsRUFBRSxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUM7WUFDL0QsR0FBRyxLQUFLLENBQUMsbUJBQW1CLEVBQUU7U0FDL0IsQ0FBQztJQUNKLENBQUM7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LEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsY0FBYyxDQUFDO29CQUNuRyxVQUFVLEVBQUUsSUFBSTtpQkFDakI7OzBCQU1JLFFBQVE7OzBCQUNSLElBQUk7OzBCQUFJLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9ORy1aT1JSTy9uZy16b3Jyby1hbnRkL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiAqL1xuXG5pbXBvcnQgeyBEaXJlY3Rpb25hbGl0eSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7IE92ZXJsYXlNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQgeyBOZ0NsYXNzLCBOZ1N0eWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSG9zdCxcbiAgSW5wdXQsXG4gIE9wdGlvbmFsLFxuICBPdXRwdXQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyB6b29tQmlnTW90aW9uIH0gZnJvbSAnbmctem9ycm8tYW50ZC9jb3JlL2FuaW1hdGlvbic7XG5pbXBvcnQgeyBOekNvbmZpZ0tleSwgV2l0aENvbmZpZyB9IGZyb20gJ25nLXpvcnJvLWFudGQvY29yZS9jb25maWcnO1xuaW1wb3J0IHsgTnpOb0FuaW1hdGlvbkRpcmVjdGl2ZSB9IGZyb20gJ25nLXpvcnJvLWFudGQvY29yZS9uby1hbmltYXRpb24nO1xuaW1wb3J0IHsgTnpPdXRsZXRNb2R1bGUgfSBmcm9tICduZy16b3Jyby1hbnRkL2NvcmUvb3V0bGV0JztcbmltcG9ydCB7IE56T3ZlcmxheU1vZHVsZSB9IGZyb20gJ25nLXpvcnJvLWFudGQvY29yZS9vdmVybGF5JztcbmltcG9ydCB7IEJvb2xlYW5JbnB1dCwgTmdTdHlsZUludGVyZmFjZSwgTnpUU1R5cGUgfSBmcm9tICduZy16b3Jyby1hbnRkL2NvcmUvdHlwZXMnO1xuaW1wb3J0IHsgSW5wdXRCb29sZWFuIH0gZnJvbSAnbmctem9ycm8tYW50ZC9jb3JlL3V0aWwnO1xuaW1wb3J0IHtcbiAgTnpUb29sVGlwQ29tcG9uZW50LFxuICBOelRvb2x0aXBCYXNlRGlyZWN0aXZlLFxuICBOelRvb2x0aXBUcmlnZ2VyLFxuICBQcm9wZXJ0eU1hcHBpbmcsXG4gIGlzVG9vbHRpcEVtcHR5XG59IGZyb20gJ25nLXpvcnJvLWFudGQvdG9vbHRpcCc7XG5cbmNvbnN0IE5aX0NPTkZJR19NT0RVTEVfTkFNRTogTnpDb25maWdLZXkgPSAncG9wb3Zlcic7XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tuei1wb3BvdmVyXScsXG4gIGV4cG9ydEFzOiAnbnpQb3BvdmVyJyxcbiAgaG9zdDoge1xuICAgICdbY2xhc3MuYW50LXBvcG92ZXItb3Blbl0nOiAndmlzaWJsZSdcbiAgfSxcbiAgc3RhbmRhbG9uZTogdHJ1ZVxufSlcbmV4cG9ydCBjbGFzcyBOelBvcG92ZXJEaXJlY3RpdmUgZXh0ZW5kcyBOelRvb2x0aXBCYXNlRGlyZWN0aXZlIHtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX256UG9wb3ZlckFycm93UG9pbnRBdENlbnRlcjogQm9vbGVhbklucHV0O1xuXG4gIHJlYWRvbmx5IF9uek1vZHVsZU5hbWU6IE56Q29uZmlnS2V5ID0gTlpfQ09ORklHX01PRFVMRV9OQU1FO1xuXG4gIEBJbnB1dCgnbnpQb3BvdmVyQXJyb3dQb2ludEF0Q2VudGVyJykgQElucHV0Qm9vbGVhbigpIG92ZXJyaWRlIGFycm93UG9pbnRBdENlbnRlcj86IGJvb2xlYW47XG4gIEBJbnB1dCgnbnpQb3BvdmVyVGl0bGUnKSBvdmVycmlkZSB0aXRsZT86IE56VFNUeXBlO1xuICBASW5wdXQoJ256UG9wb3ZlckNvbnRlbnQnKSBvdmVycmlkZSBjb250ZW50PzogTnpUU1R5cGU7XG4gIEBJbnB1dCgnbnotcG9wb3ZlcicpIG92ZXJyaWRlIGRpcmVjdGl2ZVRpdGxlPzogTnpUU1R5cGUgfCBudWxsO1xuICBASW5wdXQoJ256UG9wb3ZlclRyaWdnZXInKSBvdmVycmlkZSB0cmlnZ2VyPzogTnpUb29sdGlwVHJpZ2dlciA9ICdob3Zlcic7XG4gIEBJbnB1dCgnbnpQb3BvdmVyUGxhY2VtZW50Jykgb3ZlcnJpZGUgcGxhY2VtZW50Pzogc3RyaW5nIHwgc3RyaW5nW10gPSAndG9wJztcbiAgQElucHV0KCduelBvcG92ZXJPcmlnaW4nKSBvdmVycmlkZSBvcmlnaW4/OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PjtcbiAgQElucHV0KCduelBvcG92ZXJWaXNpYmxlJykgb3ZlcnJpZGUgdmlzaWJsZT86IGJvb2xlYW47XG4gIEBJbnB1dCgnbnpQb3BvdmVyTW91c2VFbnRlckRlbGF5Jykgb3ZlcnJpZGUgbW91c2VFbnRlckRlbGF5PzogbnVtYmVyO1xuICBASW5wdXQoJ256UG9wb3Zlck1vdXNlTGVhdmVEZWxheScpIG92ZXJyaWRlIG1vdXNlTGVhdmVEZWxheT86IG51bWJlcjtcbiAgQElucHV0KCduelBvcG92ZXJPdmVybGF5Q2xhc3NOYW1lJykgb3ZlcnJpZGUgb3ZlcmxheUNsYXNzTmFtZT86IHN0cmluZztcbiAgQElucHV0KCduelBvcG92ZXJPdmVybGF5U3R5bGUnKSBvdmVycmlkZSBvdmVybGF5U3R5bGU/OiBOZ1N0eWxlSW50ZXJmYWNlO1xuXG4gIEBJbnB1dCgpIEBXaXRoQ29uZmlnKCkgbnpQb3BvdmVyQmFja2Ryb3A/OiBib29sZWFuID0gZmFsc2U7XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEBhbmd1bGFyLWVzbGludC9uby1vdXRwdXQtcmVuYW1lXG4gIEBPdXRwdXQoJ256UG9wb3ZlclZpc2libGVDaGFuZ2UnKSBvdmVycmlkZSByZWFkb25seSB2aXNpYmxlQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxib29sZWFuPigpO1xuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBnZXRQcm94eVByb3BlcnR5TWFwKCk6IFByb3BlcnR5TWFwcGluZyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG56UG9wb3ZlckJhY2tkcm9wOiBbJ256QmFja2Ryb3AnLCAoKSA9PiB0aGlzLm56UG9wb3ZlckJhY2tkcm9wXSxcbiAgICAgIC4uLnN1cGVyLmdldFByb3h5UHJvcGVydHlNYXAoKVxuICAgIH07XG4gIH1cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihOelBvcG92ZXJDb21wb25lbnQpO1xuICB9XG59XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ256LXBvcG92ZXInLFxuICBleHBvcnRBczogJ256UG9wb3ZlckNvbXBvbmVudCcsXG4gIGFuaW1hdGlvbnM6IFt6b29tQmlnTW90aW9uXSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIHByZXNlcnZlV2hpdGVzcGFjZXM6IGZhbHNlLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxuZy10ZW1wbGF0ZVxuICAgICAgI292ZXJsYXk9XCJjZGtDb25uZWN0ZWRPdmVybGF5XCJcbiAgICAgIGNka0Nvbm5lY3RlZE92ZXJsYXlcbiAgICAgIG56Q29ubmVjdGVkT3ZlcmxheVxuICAgICAgW2Nka0Nvbm5lY3RlZE92ZXJsYXlIYXNCYWNrZHJvcF09XCJoYXNCYWNrZHJvcFwiXG4gICAgICBbY2RrQ29ubmVjdGVkT3ZlcmxheU9yaWdpbl09XCJvcmlnaW5cIlxuICAgICAgW2Nka0Nvbm5lY3RlZE92ZXJsYXlQb3NpdGlvbnNdPVwiX3Bvc2l0aW9uc1wiXG4gICAgICBbY2RrQ29ubmVjdGVkT3ZlcmxheU9wZW5dPVwiX3Zpc2libGVcIlxuICAgICAgW2Nka0Nvbm5lY3RlZE92ZXJsYXlQdXNoXT1cImNka0Nvbm5lY3RlZE92ZXJsYXlQdXNoXCJcbiAgICAgIFtuekFycm93UG9pbnRBdENlbnRlcl09XCJuekFycm93UG9pbnRBdENlbnRlclwiXG4gICAgICAob3ZlcmxheU91dHNpZGVDbGljayk9XCJvbkNsaWNrT3V0c2lkZSgkZXZlbnQpXCJcbiAgICAgIChkZXRhY2gpPVwiaGlkZSgpXCJcbiAgICAgIChwb3NpdGlvbkNoYW5nZSk9XCJvblBvc2l0aW9uQ2hhbmdlKCRldmVudClcIlxuICAgID5cbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3M9XCJhbnQtcG9wb3ZlclwiXG4gICAgICAgIFtjbGFzcy5hbnQtcG9wb3Zlci1ydGxdPVwiZGlyID09PSAncnRsJ1wiXG4gICAgICAgIFtuZ0NsYXNzXT1cIl9jbGFzc01hcFwiXG4gICAgICAgIFtuZ1N0eWxlXT1cIm56T3ZlcmxheVN0eWxlXCJcbiAgICAgICAgW0AuZGlzYWJsZWRdPVwiISFub0FuaW1hdGlvbj8ubnpOb0FuaW1hdGlvblwiXG4gICAgICAgIFtuek5vQW5pbWF0aW9uXT1cIm5vQW5pbWF0aW9uPy5uek5vQW5pbWF0aW9uXCJcbiAgICAgICAgW0B6b29tQmlnTW90aW9uXT1cIidhY3RpdmUnXCJcbiAgICAgID5cbiAgICAgICAgPGRpdiBjbGFzcz1cImFudC1wb3BvdmVyLWNvbnRlbnRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiYW50LXBvcG92ZXItYXJyb3dcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiYW50LXBvcG92ZXItYXJyb3ctY29udGVudFwiPjwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiYW50LXBvcG92ZXItaW5uZXJcIiByb2xlPVwidG9vbHRpcFwiPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgQGlmIChuelRpdGxlKSB7XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFudC1wb3BvdmVyLXRpdGxlXCI+XG4gICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuelN0cmluZ1RlbXBsYXRlT3V0bGV0PVwibnpUaXRsZVwiPnt7IG56VGl0bGUgfX08L25nLWNvbnRhaW5lcj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYW50LXBvcG92ZXItaW5uZXItY29udGVudFwiPlxuICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm56U3RyaW5nVGVtcGxhdGVPdXRsZXQ9XCJuekNvbnRlbnRcIj57eyBuekNvbnRlbnQgfX08L25nLWNvbnRhaW5lcj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L25nLXRlbXBsYXRlPlxuICBgLFxuICBpbXBvcnRzOiBbT3ZlcmxheU1vZHVsZSwgTnpPdmVybGF5TW9kdWxlLCBOZ0NsYXNzLCBOZ1N0eWxlLCBOek5vQW5pbWF0aW9uRGlyZWN0aXZlLCBOek91dGxldE1vZHVsZV0sXG4gIHN0YW5kYWxvbmU6IHRydWVcbn0pXG5leHBvcnQgY2xhc3MgTnpQb3BvdmVyQ29tcG9uZW50IGV4dGVuZHMgTnpUb29sVGlwQ29tcG9uZW50IHtcbiAgb3ZlcnJpZGUgX3ByZWZpeCA9ICdhbnQtcG9wb3Zlcic7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgY2RyOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBAT3B0aW9uYWwoKSBkaXJlY3Rpb25hbGl0eTogRGlyZWN0aW9uYWxpdHksXG4gICAgQEhvc3QoKSBAT3B0aW9uYWwoKSBub0FuaW1hdGlvbj86IE56Tm9BbmltYXRpb25EaXJlY3RpdmVcbiAgKSB7XG4gICAgc3VwZXIoY2RyLCBkaXJlY3Rpb25hbGl0eSwgbm9BbmltYXRpb24pO1xuICB9XG5cbiAgZ2V0IGhhc0JhY2tkcm9wKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm56VHJpZ2dlciA9PT0gJ2NsaWNrJyA/IHRoaXMubnpCYWNrZHJvcCA6IGZhbHNlO1xuICB9XG5cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzVG9vbHRpcEVtcHR5KHRoaXMubnpUaXRsZSkgJiYgaXNUb29sdGlwRW1wdHkodGhpcy5uekNvbnRlbnQpO1xuICB9XG59XG4iXX0=