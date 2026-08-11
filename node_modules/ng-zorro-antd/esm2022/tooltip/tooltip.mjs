import { __decorate } from "tslib";
import { OverlayModule } from '@angular/cdk/overlay';
import { NgClass, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, Directive, EventEmitter, Host, Input, Optional, Output, ViewEncapsulation } from '@angular/core';
import { zoomBigMotion } from 'ng-zorro-antd/core/animation';
import { isPresetColor } from 'ng-zorro-antd/core/color';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { NzOverlayModule } from 'ng-zorro-antd/core/overlay';
import { InputBoolean } from 'ng-zorro-antd/core/util';
import { isTooltipEmpty, NzTooltipBaseComponent, NzTooltipBaseDirective } from './base';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
import * as i2 from "ng-zorro-antd/core/no-animation";
import * as i3 from "@angular/cdk/overlay";
import * as i4 from "ng-zorro-antd/core/outlet";
import * as i5 from "ng-zorro-antd/core/overlay";
export class NzTooltipDirective extends NzTooltipBaseDirective {
    constructor() {
        super(NzToolTipComponent);
        this.titleContext = null;
        this.trigger = 'hover';
        this.placement = 'top';
        this.cdkConnectedOverlayPush = true;
        // eslint-disable-next-line @angular-eslint/no-output-rename
        this.visibleChange = new EventEmitter();
    }
    getProxyPropertyMap() {
        return {
            ...super.getProxyPropertyMap(),
            nzTooltipColor: ['nzColor', () => this.nzTooltipColor],
            titleContext: ['nzTitleContext', () => this.titleContext]
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: NzTooltipDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.3.8", type: NzTooltipDirective, isStandalone: true, selector: "[nz-tooltip]", inputs: { title: ["nzTooltipTitle", "title"], titleContext: ["nzTooltipTitleContext", "titleContext"], directiveTitle: ["nz-tooltip", "directiveTitle"], trigger: ["nzTooltipTrigger", "trigger"], placement: ["nzTooltipPlacement", "placement"], origin: ["nzTooltipOrigin", "origin"], visible: ["nzTooltipVisible", "visible"], mouseEnterDelay: ["nzTooltipMouseEnterDelay", "mouseEnterDelay"], mouseLeaveDelay: ["nzTooltipMouseLeaveDelay", "mouseLeaveDelay"], overlayClassName: ["nzTooltipOverlayClassName", "overlayClassName"], overlayStyle: ["nzTooltipOverlayStyle", "overlayStyle"], arrowPointAtCenter: ["nzTooltipArrowPointAtCenter", "arrowPointAtCenter"], cdkConnectedOverlayPush: "cdkConnectedOverlayPush", nzTooltipColor: "nzTooltipColor" }, outputs: { visibleChange: "nzTooltipVisibleChange" }, host: { properties: { "class.ant-tooltip-open": "visible" } }, exportAs: ["nzTooltip"], usesInheritance: true, ngImport: i0 }); }
}
__decorate([
    InputBoolean()
], NzTooltipDirective.prototype, "arrowPointAtCenter", void 0);
__decorate([
    InputBoolean()
], NzTooltipDirective.prototype, "cdkConnectedOverlayPush", void 0);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: NzTooltipDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nz-tooltip]',
                    exportAs: 'nzTooltip',
                    host: {
                        '[class.ant-tooltip-open]': 'visible'
                    },
                    standalone: true
                }]
        }], ctorParameters: () => [], propDecorators: { title: [{
                type: Input,
                args: ['nzTooltipTitle']
            }], titleContext: [{
                type: Input,
                args: ['nzTooltipTitleContext']
            }], directiveTitle: [{
                type: Input,
                args: ['nz-tooltip']
            }], trigger: [{
                type: Input,
                args: ['nzTooltipTrigger']
            }], placement: [{
                type: Input,
                args: ['nzTooltipPlacement']
            }], origin: [{
                type: Input,
                args: ['nzTooltipOrigin']
            }], visible: [{
                type: Input,
                args: ['nzTooltipVisible']
            }], mouseEnterDelay: [{
                type: Input,
                args: ['nzTooltipMouseEnterDelay']
            }], mouseLeaveDelay: [{
                type: Input,
                args: ['nzTooltipMouseLeaveDelay']
            }], overlayClassName: [{
                type: Input,
                args: ['nzTooltipOverlayClassName']
            }], overlayStyle: [{
                type: Input,
                args: ['nzTooltipOverlayStyle']
            }], arrowPointAtCenter: [{
                type: Input,
                args: ['nzTooltipArrowPointAtCenter']
            }], cdkConnectedOverlayPush: [{
                type: Input
            }], nzTooltipColor: [{
                type: Input
            }], visibleChange: [{
                type: Output,
                args: ['nzTooltipVisibleChange']
            }] } });
export class NzToolTipComponent extends NzTooltipBaseComponent {
    constructor(cdr, directionality, noAnimation) {
        super(cdr, directionality, noAnimation);
        this.nzTitle = null;
        this.nzTitleContext = null;
        this._contentStyleMap = {};
    }
    isEmpty() {
        return isTooltipEmpty(this.nzTitle);
    }
    updateStyles() {
        const isColorPreset = this.nzColor && isPresetColor(this.nzColor);
        this._classMap = {
            [this.nzOverlayClassName]: true,
            [`${this._prefix}-placement-${this.preferredPlacement}`]: true,
            [`${this._prefix}-${this.nzColor}`]: isColorPreset
        };
        this._contentStyleMap = {
            backgroundColor: !!this.nzColor && !isColorPreset ? this.nzColor : null,
            '--color': this.nzColor
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: NzToolTipComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i1.Directionality, optional: true }, { token: i2.NzNoAnimationDirective, host: true, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.8", type: NzToolTipComponent, isStandalone: true, selector: "nz-tooltip", exportAs: ["nzTooltipComponent"], usesInheritance: true, ngImport: i0, template: `
    <ng-template
      #overlay="cdkConnectedOverlay"
      cdkConnectedOverlay
      nzConnectedOverlay
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayOpen]="_visible"
      [cdkConnectedOverlayPositions]="_positions"
      [cdkConnectedOverlayPush]="cdkConnectedOverlayPush"
      [nzArrowPointAtCenter]="nzArrowPointAtCenter"
      (overlayOutsideClick)="onClickOutside($event)"
      (detach)="hide()"
      (positionChange)="onPositionChange($event)"
    >
      <div
        class="ant-tooltip"
        [class.ant-tooltip-rtl]="dir === 'rtl'"
        [ngClass]="_classMap"
        [ngStyle]="nzOverlayStyle"
        [@.disabled]="!!noAnimation?.nzNoAnimation"
        [nzNoAnimation]="noAnimation?.nzNoAnimation"
        [@zoomBigMotion]="'active'"
      >
        <div class="ant-tooltip-content">
          <div class="ant-tooltip-arrow">
            <span class="ant-tooltip-arrow-content" [ngStyle]="_contentStyleMap"></span>
          </div>
          <div class="ant-tooltip-inner" [ngStyle]="_contentStyleMap">
            <ng-container *nzStringTemplateOutlet="nzTitle; context: nzTitleContext">{{ nzTitle }}</ng-container>
          </div>
        </div>
      </div>
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: OverlayModule }, { kind: "directive", type: i3.CdkConnectedOverlay, selector: "[cdk-connected-overlay], [connected-overlay], [cdkConnectedOverlay]", inputs: ["cdkConnectedOverlayOrigin", "cdkConnectedOverlayPositions", "cdkConnectedOverlayPositionStrategy", "cdkConnectedOverlayOffsetX", "cdkConnectedOverlayOffsetY", "cdkConnectedOverlayWidth", "cdkConnectedOverlayHeight", "cdkConnectedOverlayMinWidth", "cdkConnectedOverlayMinHeight", "cdkConnectedOverlayBackdropClass", "cdkConnectedOverlayPanelClass", "cdkConnectedOverlayViewportMargin", "cdkConnectedOverlayScrollStrategy", "cdkConnectedOverlayOpen", "cdkConnectedOverlayDisableClose", "cdkConnectedOverlayTransformOriginOn", "cdkConnectedOverlayHasBackdrop", "cdkConnectedOverlayLockPosition", "cdkConnectedOverlayFlexibleDimensions", "cdkConnectedOverlayGrowAfterOpen", "cdkConnectedOverlayPush", "cdkConnectedOverlayDisposeOnNavigation"], outputs: ["backdropClick", "positionChange", "attach", "detach", "overlayKeydown", "overlayOutsideClick"], exportAs: ["cdkConnectedOverlay"] }, { kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "directive", type: NzNoAnimationDirective, selector: "[nzNoAnimation]", inputs: ["nzNoAnimation"], exportAs: ["nzNoAnimation"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i4.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }, { kind: "ngmodule", type: NzOverlayModule }, { kind: "directive", type: i5.NzConnectedOverlayDirective, selector: "[cdkConnectedOverlay][nzConnectedOverlay]", inputs: ["nzArrowPointAtCenter"], exportAs: ["nzConnectedOverlay"] }], animations: [zoomBigMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: NzToolTipComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-tooltip',
                    exportAs: 'nzTooltipComponent',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    animations: [zoomBigMotion],
                    template: `
    <ng-template
      #overlay="cdkConnectedOverlay"
      cdkConnectedOverlay
      nzConnectedOverlay
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayOpen]="_visible"
      [cdkConnectedOverlayPositions]="_positions"
      [cdkConnectedOverlayPush]="cdkConnectedOverlayPush"
      [nzArrowPointAtCenter]="nzArrowPointAtCenter"
      (overlayOutsideClick)="onClickOutside($event)"
      (detach)="hide()"
      (positionChange)="onPositionChange($event)"
    >
      <div
        class="ant-tooltip"
        [class.ant-tooltip-rtl]="dir === 'rtl'"
        [ngClass]="_classMap"
        [ngStyle]="nzOverlayStyle"
        [@.disabled]="!!noAnimation?.nzNoAnimation"
        [nzNoAnimation]="noAnimation?.nzNoAnimation"
        [@zoomBigMotion]="'active'"
      >
        <div class="ant-tooltip-content">
          <div class="ant-tooltip-arrow">
            <span class="ant-tooltip-arrow-content" [ngStyle]="_contentStyleMap"></span>
          </div>
          <div class="ant-tooltip-inner" [ngStyle]="_contentStyleMap">
            <ng-container *nzStringTemplateOutlet="nzTitle; context: nzTitleContext">{{ nzTitle }}</ng-container>
          </div>
        </div>
      </div>
    </ng-template>
  `,
                    preserveWhitespaces: false,
                    imports: [OverlayModule, NgClass, NgStyle, NzNoAnimationDirective, NzOutletModule, NzOverlayModule],
                    standalone: true
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i2.NzNoAnimationDirective, decorators: [{
                    type: Host
                }, {
                    type: Optional
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHRpcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2NvbXBvbmVudHMvdG9vbHRpcC90b29sdGlwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFNQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDckQsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNuRCxPQUFPLEVBQ0wsdUJBQXVCLEVBRXZCLFNBQVMsRUFDVCxTQUFTLEVBRVQsWUFBWSxFQUNaLElBQUksRUFDSixLQUFLLEVBQ0wsUUFBUSxFQUNSLE1BQU0sRUFDTixpQkFBaUIsRUFDbEIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzdELE9BQU8sRUFBRSxhQUFhLEVBQWlCLE1BQU0sMEJBQTBCLENBQUM7QUFDeEUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDekUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzNELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUU3RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFdkQsT0FBTyxFQUNMLGNBQWMsRUFDZCxzQkFBc0IsRUFDdEIsc0JBQXNCLEVBR3ZCLE1BQU0sUUFBUSxDQUFDOzs7Ozs7O0FBVWhCLE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxzQkFBc0I7SUFxQjVEO1FBQ0UsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFsQkksaUJBQVksR0FBbUIsSUFBSSxDQUFDO1FBRWhDLFlBQU8sR0FBc0IsT0FBTyxDQUFDO1FBQ25DLGNBQVMsR0FBdUIsS0FBSyxDQUFDO1FBUTFDLDRCQUF1QixHQUFhLElBQUksQ0FBQztRQUczRSw0REFBNEQ7UUFDUixrQkFBYSxHQUFHLElBQUks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QixrQkFBa0IsK0hBdENuQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUNULDJEQUVTLGFBQWEsaWlDQUFFLE9BQU8sb0ZBQUUsT0FBTywyRUFBRSxzQkFBc0IsbUhBQUUsY0FBYyxnUEFBRSxlQUFlLHlNQXBDdEYsQ0FBQyxhQUFhLENBQUM7OzJGQXVDaEIsa0JBQWtCO2tCQTVDOUIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsWUFBWTtvQkFDdEIsUUFBUSxFQUFFLG9CQUFvQjtvQkFDOUIsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07b0JBQy9DLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO29CQUNyQyxVQUFVLEVBQUUsQ0FBQyxhQUFhLENBQUM7b0JBQzNCLFFBQVEsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUNUO29CQUNELG1CQUFtQixFQUFFLEtBQUs7b0JBQzFCLE9BQU8sRUFBRSxDQUFDLGFBQWEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLGNBQWMsRUFBRSxlQUFlLENBQUM7b0JBQ25HLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs7MEJBV0ksUUFBUTs7MEJBQ1IsSUFBSTs7MEJBQUksUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9naXRodWIuY29tL05HLVpPUlJPL25nLXpvcnJvLWFudGQvYmxvYi9tYXN0ZXIvTElDRU5TRVxuICovXG5cbmltcG9ydCB7IERpcmVjdGlvbmFsaXR5IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHsgT3ZlcmxheU1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7IE5nQ2xhc3MsIE5nU3R5bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBIb3N0LFxuICBJbnB1dCxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgVmlld0VuY2Fwc3VsYXRpb25cbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IHpvb21CaWdNb3Rpb24gfSBmcm9tICduZy16b3Jyby1hbnRkL2NvcmUvYW5pbWF0aW9uJztcbmltcG9ydCB7IGlzUHJlc2V0Q29sb3IsIE56UHJlc2V0Q29sb3IgfSBmcm9tICduZy16b3Jyby1hbnRkL2NvcmUvY29sb3InO1xuaW1wb3J0IHsgTnpOb0FuaW1hdGlvbkRpcmVjdGl2ZSB9IGZyb20gJ25nLXpvcnJvLWFudGQvY29yZS9uby1hbmltYXRpb24nO1xuaW1wb3J0IHsgTnpPdXRsZXRNb2R1bGUgfSBmcm9tICduZy16b3Jyby1hbnRkL2NvcmUvb3V0bGV0JztcbmltcG9ydCB7IE56T3ZlcmxheU1vZHVsZSB9IGZyb20gJ25nLXpvcnJvLWFudGQvY29yZS9vdmVybGF5JztcbmltcG9ydCB7IEJvb2xlYW5JbnB1dCwgTmdTdHlsZUludGVyZmFjZSwgTnpUU1R5cGUgfSBmcm9tICduZy16b3Jyby1hbnRkL2NvcmUvdHlwZXMnO1xuaW1wb3J0IHsgSW5wdXRCb29sZWFuIH0gZnJvbSAnbmctem9ycm8tYW50ZC9jb3JlL3V0aWwnO1xuXG5pbXBvcnQge1xuICBpc1Rvb2x0aXBFbXB0eSxcbiAgTnpUb29sdGlwQmFzZUNvbXBvbmVudCxcbiAgTnpUb29sdGlwQmFzZURpcmVjdGl2ZSxcbiAgTnpUb29sdGlwVHJpZ2dlcixcbiAgUHJvcGVydHlNYXBwaW5nXG59IGZyb20gJy4vYmFzZSc7XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tuei10b29sdGlwXScsXG4gIGV4cG9ydEFzOiAnbnpUb29sdGlwJyxcbiAgaG9zdDoge1xuICAgICdbY2xhc3MuYW50LXRvb2x0aXAtb3Blbl0nOiAndmlzaWJsZSdcbiAgfSxcbiAgc3RhbmRhbG9uZTogdHJ1ZVxufSlcbmV4cG9ydCBjbGFzcyBOelRvb2x0aXBEaXJlY3RpdmUgZXh0ZW5kcyBOelRvb2x0aXBCYXNlRGlyZWN0aXZlIHtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX256VG9vbHRpcEFycm93UG9pbnRBdENlbnRlcjogQm9vbGVhbklucHV0O1xuXG4gIEBJbnB1dCgnbnpUb29sdGlwVGl0bGUnKSBvdmVycmlkZSB0aXRsZT86IE56VFNUeXBlIHwgbnVsbDtcbiAgQElucHV0KCduelRvb2x0aXBUaXRsZUNvbnRleHQnKSB0aXRsZUNvbnRleHQ/OiBPYmplY3QgfCBudWxsID0gbnVsbDtcbiAgQElucHV0KCduei10b29sdGlwJykgb3ZlcnJpZGUgZGlyZWN0aXZlVGl0bGU/OiBOelRTVHlwZSB8IG51bGw7XG4gIEBJbnB1dCgnbnpUb29sdGlwVHJpZ2dlcicpIG92ZXJyaWRlIHRyaWdnZXI/OiBOelRvb2x0aXBUcmlnZ2VyID0gJ2hvdmVyJztcbiAgQElucHV0KCduelRvb2x0aXBQbGFjZW1lbnQnKSBvdmVycmlkZSBwbGFjZW1lbnQ/OiBzdHJpbmcgfCBzdHJpbmdbXSA9ICd0b3AnO1xuICBASW5wdXQoJ256VG9vbHRpcE9yaWdpbicpIG92ZXJyaWRlIG9yaWdpbj86IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+O1xuICBASW5wdXQoJ256VG9vbHRpcFZpc2libGUnKSBvdmVycmlkZSB2aXNpYmxlPzogYm9vbGVhbjtcbiAgQElucHV0KCduelRvb2x0aXBNb3VzZUVudGVyRGVsYXknKSBvdmVycmlkZSBtb3VzZUVudGVyRGVsYXk/OiBudW1iZXI7XG4gIEBJbnB1dCgnbnpUb29sdGlwTW91c2VMZWF2ZURlbGF5Jykgb3ZlcnJpZGUgbW91c2VMZWF2ZURlbGF5PzogbnVtYmVyO1xuICBASW5wdXQoJ256VG9vbHRpcE92ZXJsYXlDbGFzc05hbWUnKSBvdmVycmlkZSBvdmVybGF5Q2xhc3NOYW1lPzogc3RyaW5nO1xuICBASW5wdXQoJ256VG9vbHRpcE92ZXJsYXlTdHlsZScpIG92ZXJyaWRlIG92ZXJsYXlTdHlsZT86IE5nU3R5bGVJbnRlcmZhY2U7XG4gIEBJbnB1dCgnbnpUb29sdGlwQXJyb3dQb2ludEF0Q2VudGVyJykgQElucHV0Qm9vbGVhbigpIG92ZXJyaWRlIGFycm93UG9pbnRBdENlbnRlcj86IGJvb2xlYW47XG4gIEBJbnB1dCgpIEBJbnB1dEJvb2xlYW4oKSBvdmVycmlkZSBjZGtDb25uZWN0ZWRPdmVybGF5UHVzaD86IGJvb2xlYW4gPSB0cnVlO1xuICBASW5wdXQoKSBuelRvb2x0aXBDb2xvcj86IHN0cmluZztcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQGFuZ3VsYXItZXNsaW50L25vLW91dHB1dC1yZW5hbWVcbiAgQE91dHB1dCgnbnpUb29sdGlwVmlzaWJsZUNoYW5nZScpIG92ZXJyaWRlIHJlYWRvbmx5IHZpc2libGVDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPGJvb2xlYW4+KCk7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoTnpUb29sVGlwQ29tcG9uZW50KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBnZXRQcm94eVByb3BlcnR5TWFwKCk6IFByb3BlcnR5TWFwcGluZyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLnN1cGVyLmdldFByb3h5UHJvcGVydHlNYXAoKSxcbiAgICAgIG56VG9vbHRpcENvbG9yOiBbJ256Q29sb3InLCAoKSA9PiB0aGlzLm56VG9vbHRpcENvbG9yXSxcbiAgICAgIHRpdGxlQ29udGV4dDogWyduelRpdGxlQ29udGV4dCcsICgpID0+IHRoaXMudGl0bGVDb250ZXh0XVxuICAgIH07XG4gIH1cbn1cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbnotdG9vbHRpcCcsXG4gIGV4cG9ydEFzOiAnbnpUb29sdGlwQ29tcG9uZW50JyxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIGFuaW1hdGlvbnM6IFt6b29tQmlnTW90aW9uXSxcbiAgdGVtcGxhdGU6IGBcbiAgICA8bmctdGVtcGxhdGVcbiAgICAgICNvdmVybGF5PVwiY2RrQ29ubmVjdGVkT3ZlcmxheVwiXG4gICAgICBjZGtDb25uZWN0ZWRPdmVybGF5XG4gICAgICBuekNvbm5lY3RlZE92ZXJsYXlcbiAgICAgIFtjZGtDb25uZWN0ZWRPdmVybGF5T3JpZ2luXT1cIm9yaWdpblwiXG4gICAgICBbY2RrQ29ubmVjdGVkT3ZlcmxheU9wZW5dPVwiX3Zpc2libGVcIlxuICAgICAgW2Nka0Nvbm5lY3RlZE92ZXJsYXlQb3NpdGlvbnNdPVwiX3Bvc2l0aW9uc1wiXG4gICAgICBbY2RrQ29ubmVjdGVkT3ZlcmxheVB1c2hdPVwiY2RrQ29ubmVjdGVkT3ZlcmxheVB1c2hcIlxuICAgICAgW256QXJyb3dQb2ludEF0Q2VudGVyXT1cIm56QXJyb3dQb2ludEF0Q2VudGVyXCJcbiAgICAgIChvdmVybGF5T3V0c2lkZUNsaWNrKT1cIm9uQ2xpY2tPdXRzaWRlKCRldmVudClcIlxuICAgICAgKGRldGFjaCk9XCJoaWRlKClcIlxuICAgICAgKHBvc2l0aW9uQ2hhbmdlKT1cIm9uUG9zaXRpb25DaGFuZ2UoJGV2ZW50KVwiXG4gICAgPlxuICAgICAgPGRpdlxuICAgICAgICBjbGFzcz1cImFudC10b29sdGlwXCJcbiAgICAgICAgW2NsYXNzLmFudC10b29sdGlwLXJ0bF09XCJkaXIgPT09ICdydGwnXCJcbiAgICAgICAgW25nQ2xhc3NdPVwiX2NsYXNzTWFwXCJcbiAgICAgICAgW25nU3R5bGVdPVwibnpPdmVybGF5U3R5bGVcIlxuICAgICAgICBbQC5kaXNhYmxlZF09XCIhIW5vQW5pbWF0aW9uPy5uek5vQW5pbWF0aW9uXCJcbiAgICAgICAgW256Tm9BbmltYXRpb25dPVwibm9BbmltYXRpb24/Lm56Tm9BbmltYXRpb25cIlxuICAgICAgICBbQHpvb21CaWdNb3Rpb25dPVwiJ2FjdGl2ZSdcIlxuICAgICAgPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiYW50LXRvb2x0aXAtY29udGVudFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJhbnQtdG9vbHRpcC1hcnJvd1wiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJhbnQtdG9vbHRpcC1hcnJvdy1jb250ZW50XCIgW25nU3R5bGVdPVwiX2NvbnRlbnRTdHlsZU1hcFwiPjwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiYW50LXRvb2x0aXAtaW5uZXJcIiBbbmdTdHlsZV09XCJfY29udGVudFN0eWxlTWFwXCI+XG4gICAgICAgICAgICA8bmctY29udGFpbmVyICpuelN0cmluZ1RlbXBsYXRlT3V0bGV0PVwibnpUaXRsZTsgY29udGV4dDogbnpUaXRsZUNvbnRleHRcIj57eyBuelRpdGxlIH19PC9uZy1jb250YWluZXI+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9uZy10ZW1wbGF0ZT5cbiAgYCxcbiAgcHJlc2VydmVXaGl0ZXNwYWNlczogZmFsc2UsXG4gIGltcG9ydHM6IFtPdmVybGF5TW9kdWxlLCBOZ0NsYXNzLCBOZ1N0eWxlLCBOek5vQW5pbWF0aW9uRGlyZWN0aXZlLCBOek91dGxldE1vZHVsZSwgTnpPdmVybGF5TW9kdWxlXSxcbiAgc3RhbmRhbG9uZTogdHJ1ZVxufSlcbmV4cG9ydCBjbGFzcyBOelRvb2xUaXBDb21wb25lbnQgZXh0ZW5kcyBOelRvb2x0aXBCYXNlQ29tcG9uZW50IHtcbiAgb3ZlcnJpZGUgbnpUaXRsZTogTnpUU1R5cGUgfCBudWxsID0gbnVsbDtcbiAgbnpUaXRsZUNvbnRleHQ6IE9iamVjdCB8IG51bGwgPSBudWxsO1xuXG4gIG56Q29sb3I/OiBzdHJpbmcgfCBOelByZXNldENvbG9yO1xuXG4gIF9jb250ZW50U3R5bGVNYXA6IE5nU3R5bGVJbnRlcmZhY2UgPSB7fTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBjZHI6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIEBPcHRpb25hbCgpIGRpcmVjdGlvbmFsaXR5OiBEaXJlY3Rpb25hbGl0eSxcbiAgICBASG9zdCgpIEBPcHRpb25hbCgpIG5vQW5pbWF0aW9uPzogTnpOb0FuaW1hdGlvbkRpcmVjdGl2ZVxuICApIHtcbiAgICBzdXBlcihjZHIsIGRpcmVjdGlvbmFsaXR5LCBub0FuaW1hdGlvbik7XG4gIH1cblxuICBwcm90ZWN0ZWQgaXNFbXB0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNUb29sdGlwRW1wdHkodGhpcy5uelRpdGxlKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBvdmVycmlkZSB1cGRhdGVTdHlsZXMoKTogdm9pZCB7XG4gICAgY29uc3QgaXNDb2xvclByZXNldCA9IHRoaXMubnpDb2xvciAmJiBpc1ByZXNldENvbG9yKHRoaXMubnpDb2xvcik7XG5cbiAgICB0aGlzLl9jbGFzc01hcCA9IHtcbiAgICAgIFt0aGlzLm56T3ZlcmxheUNsYXNzTmFtZV06IHRydWUsXG4gICAgICBbYCR7dGhpcy5fcHJlZml4fS1wbGFjZW1lbnQtJHt0aGlzLnByZWZlcnJlZFBsYWNlbWVudH1gXTogdHJ1ZSxcbiAgICAgIFtgJHt0aGlzLl9wcmVmaXh9LSR7dGhpcy5uekNvbG9yfWBdOiBpc0NvbG9yUHJlc2V0XG4gICAgfTtcblxuICAgIHRoaXMuX2NvbnRlbnRTdHlsZU1hcCA9IHtcbiAgICAgIGJhY2tncm91bmRDb2xvcjogISF0aGlzLm56Q29sb3IgJiYgIWlzQ29sb3JQcmVzZXQgPyB0aGlzLm56Q29sb3IgOiBudWxsLFxuICAgICAgJy0tY29sb3InOiB0aGlzLm56Q29sb3JcbiAgICB9O1xuICB9XG59XG4iXX0=