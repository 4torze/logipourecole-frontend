import { __decorate } from "tslib";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { DOCUMENT, NgClass, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, Directive, ElementRef, EventEmitter, Host, Inject, Input, Optional, Output, ViewChildren, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, first, takeUntil } from 'rxjs/operators';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { zoomBigMotion } from 'ng-zorro-antd/core/animation';
import { WithConfig } from 'ng-zorro-antd/core/config';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { NzOverlayModule } from 'ng-zorro-antd/core/overlay';
import { InputBoolean, wrapIntoObservable } from 'ng-zorro-antd/core/util';
import { NzI18nModule } from 'ng-zorro-antd/i18n';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipComponent, NzTooltipBaseDirective } from 'ng-zorro-antd/tooltip';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
import * as i2 from "ng-zorro-antd/core/no-animation";
import * as i3 from "@angular/cdk/overlay";
import * as i4 from "ng-zorro-antd/core/overlay";
import * as i5 from "@angular/cdk/a11y";
import * as i6 from "ng-zorro-antd/core/outlet";
import * as i7 from "ng-zorro-antd/icon";
import * as i8 from "ng-zorro-antd/button";
import * as i9 from "ng-zorro-antd/core/transition-patch";
import * as i10 from "ng-zorro-antd/core/wave";
import * as i11 from "ng-zorro-antd/i18n";
const NZ_CONFIG_MODULE_NAME = 'popconfirm';
export class NzPopconfirmDirective extends NzTooltipBaseDirective {
    getProxyPropertyMap() {
        return {
            nzOkText: ['nzOkText', () => this.nzOkText],
            nzOkType: ['nzOkType', () => this.nzOkType],
            nzOkDanger: ['nzOkDanger', () => this.nzOkDanger],
            nzOkDisabled: ['nzOkDisabled', () => this.nzOkDisabled],
            nzCancelText: ['nzCancelText', () => this.nzCancelText],
            nzBeforeConfirm: ['nzBeforeConfirm', () => this.nzBeforeConfirm],
            nzCondition: ['nzCondition', () => this.nzCondition],
            nzIcon: ['nzIcon', () => this.nzIcon],
            nzPopconfirmShowArrow: ['nzPopconfirmShowArrow', () => this.nzPopconfirmShowArrow],
            nzPopconfirmBackdrop: ['nzBackdrop', () => this.nzPopconfirmBackdrop],
            nzAutoFocus: ['nzAutoFocus', () => this.nzAutofocus],
            ...super.getProxyPropertyMap()
        };
    }
    constructor() {
        super(NzPopconfirmComponent);
        this._nzModuleName = NZ_CONFIG_MODULE_NAME;
        this.trigger = 'click';
        this.placement = 'top';
        this.nzCondition = false;
        this.nzPopconfirmShowArrow = true;
        this.nzPopconfirmBackdrop = false;
        this.nzAutofocus = null;
        // eslint-disable-next-line @angular-eslint/no-output-rename
        this.visibleChange = new EventEmitter();
        this.nzOnCancel = new EventEmitter();
        this.nzOnConfirm = new EventEmitter();
    }
    /**
     * @override
     */
    createComponent() {
        super.createComponent();
        this.component.nzOnCancel.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.nzOnCancel.emit();
        });
        this.component.nzOnConfirm.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.nzOnConfirm.emit();
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: NzPopconfirmDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.3.8", type: NzPopconfirmDirective, isStandalone: true, selector: "[nz-popconfirm]", inputs: { arrowPointAtCenter: ["nzPopconfirmArrowPointAtCenter", "arrowPointAtCenter"], title: ["nzPopconfirmTitle", "title"], directiveTitle: ["nz-popconfirm", "directiveTitle"], trigger: ["nzPopconfirmTrigger", "trigger"], placement: ["nzPopconfirmPlacement", "placement"], origin: ["nzPopconfirmOrigin", "origin"], mouseEnterDelay: ["nzPopconfirmMouseEnterDelay", "mouseEnterDelay"], mouseLeaveDelay: ["nzPopconfirmMouseLeaveDelay", "mouseLeaveDelay"], overlayClassName: ["nzPopconfirmOverlayClassName", "overlayClassName"], overlayStyle: ["nzPopconfirmOverlayStyle", "overlayStyle"], visible: ["nzPopconfirmVisible", "visible"], nzOkText: "nzOkText", nzOkType: "nzOkType", nzOkDisabled: "nzOkDisabled", nzOkDanger: "nzOkDanger", nzCancelText: "nzCancelText", nzBeforeConfirm: "nzBeforeConfirm", nzIcon: "nzIcon", nzCondition: "nzCondition", nzPopconfirmShowArrow: "nzPopconfirmShowArrow", nzPopconfirmBackdrop: "nzPopconfirmBackdrop", nzAutofocus: "nzAutofocus" }, outputs: { visibleChange: "nzPopconfirmVisibleChange", nzOnCancel: "nzOnCancel", nzOnConfirm: "nzOnConfirm" }, host: { properties: { "class.ant-popover-open": "visible" } }, exportAs: ["nzPopconfirm"], usesInheritance: true, ngImport: i0 }); }
}
__decorate([
    InputBoolean()
], NzPopconfirmDirective.prototype, "arrowPointAtCenter", void 0);
__decorate([
    InputBoolean()
], NzPopconfirmDirective.prototype, "nzOkDisabled", void 0);
__decorate([
    InputBoolean()
], NzPopconfirmDirective.prototype, "nzOkDanger", void 0);
__decorate([
    InputBoolean()
], NzPopconfirmDirective.prototype, "nzCondition", void 0);
__decorate([
    InputBoolean()
], NzPopconfirmDirective.prototype, "nzPopconfirmShowArrow", void 0);
__decorate([
    WithConfig()
], NzPopconfirmDirective.prototype, "nzPopconfirmBackdrop", void 0);
__decorate([
    WithConfig()
], NzPopconfirmDirective.prototype, "nzAutofocus", void 0);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: NzPopconfirmDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nz-popconfirm]',
                    exportAs: 'nzPopconfirm',
                    host: {
                        '[class.ant-popover-open]': 'visible'
                    },
                    standalone: true
                }]
        }], ctorParameters: () => [], propDecorators: { arrowPointAtCenter: [{
                type: Input,
                args: ['nzPopconfirmArrowPointAtCenter']
            }], title: [{
                type: Input,
                args: ['nzPopconfirmTitle']
            }], directiveTitle: [{
                type: Input,
                args: ['nz-popconfirm']
            }], trigger: [{
                type: Input,
                args: ['nzPopconfirmTrigger']
            }], placement: [{
                type: Input,
                args: ['nzPopconfirmPlacement']
            }], origin: [{
                type: Input,
                args: ['nzPopconfirmOrigin']
            }], mouseEnterDelay: [{
                type: Input,
                args: ['nzPopconfirmMouseEnterDelay']
            }], mouseLeaveDelay: [{
                type: Input,
                args: ['nzPopconfirmMouseLeaveDelay']
            }], overlayClassName: [{
                type: Input,
                args: ['nzPopconfirmOverlayClassName']
            }], overlayStyle: [{
                type: Input,
                args: ['nzPopconfirmOverlayStyle']
            }], visible: [{
                type: Input,
                args: ['nzPopconfirmVisible']
            }], nzOkText: [{
                type: Input
            }], nzOkType: [{
                type: Input
            }], nzOkDisabled: [{
                type: Input
            }], nzOkDanger: [{
                type: Input
            }], nzCancelText: [{
                type: Input
            }], nzBeforeConfirm: [{
                type: Input
            }], nzIcon: [{
                type: Input
            }], nzCondition: [{
                type: Input
            }], nzPopconfirmShowArrow: [{
                type: Input
            }], nzPopconfirmBackdrop: [{
                type: Input
            }], nzAutofocus: [{
                type: Input
            }], visibleChange: [{
                type: Output,
                args: ['nzPopconfirmVisibleChange']
            }], nzOnCancel: [{
                type: Output
            }], nzOnConfirm: [{
                type: Output
            }] } });
export class NzPopconfirmComponent extends NzToolTipComponent {
    constructor(cdr, elementRef, directionality, document, noAnimation) {
        super(cdr, directionality, noAnimation);
        this.elementRef = elementRef;
        this.nzCondition = false;
        this.nzPopconfirmShowArrow = true;
        this.nzOkType = 'primary';
        this.nzOkDanger = false;
        this.nzOkDisabled = false;
        this.nzAutoFocus = null;
        this.nzBeforeConfirm = null;
        this.nzOnCancel = new Subject();
        this.nzOnConfirm = new Subject();
        this._trigger = 'click';
        this.elementFocusedBeforeModalWasOpened = null;
        this._prefix = 'ant-popover';
        this.confirmLoading = false;
        this.document = document;
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this.nzOnCancel.complete();
        this.nzOnConfirm.complete();
    }
    /**
     * @override
     */
    show() {
        if (!this.nzCondition) {
            this.capturePreviouslyFocusedElement();
            super.show();
        }
        else {
            this.onConfirm();
        }
    }
    hide() {
        super.hide();
        this.restoreFocus();
    }
    handleConfirm() {
        this.nzOnConfirm.next();
        super.hide();
    }
    onCancel() {
        this.nzOnCancel.next();
        super.hide();
    }
    onConfirm() {
        if (this.nzBeforeConfirm) {
            const observable = wrapIntoObservable(this.nzBeforeConfirm()).pipe(first());
            this.confirmLoading = true;
            observable
                .pipe(finalize(() => {
                this.confirmLoading = false;
                this.cdr.markForCheck();
            }), takeUntil(this.nzVisibleChange), takeUntil(this.destroy$))
                .subscribe(value => {
                if (value) {
                    this.handleConfirm();
                }
            });
        }
        else {
            this.handleConfirm();
        }
    }
    capturePreviouslyFocusedElement() {
        if (this.document) {
            this.elementFocusedBeforeModalWasOpened = this.document.activeElement;
        }
    }
    restoreFocus() {
        const toFocus = this.elementFocusedBeforeModalWasOpened;
        // We need the extra check, because IE can set the `activeElement` to null in some cases.
        if (toFocus && typeof toFocus.focus === 'function') {
            const activeElement = this.document.activeElement;
            const element = this.elementRef.nativeElement;
            if (!activeElement ||
                activeElement === this.document.body ||
                activeElement === element ||
                element.contains(activeElement)) {
                toFocus.focus();
            }
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: NzPopconfirmComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: i1.Directionality, optional: true }, { token: DOCUMENT, optional: true }, { token: i2.NzNoAnimationDirective, host: true, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "17.3.8", type: NzPopconfirmComponent, isStandalone: true, selector: "nz-popconfirm", viewQueries: [{ propertyName: "okBtn", predicate: ["okBtn"], descendants: true, read: ElementRef }, { propertyName: "cancelBtn", predicate: ["cancelBtn"], descendants: true, read: ElementRef }], exportAs: ["nzPopconfirmComponent"], usesInheritance: true, ngImport: i0, template: `
    <ng-template
      #overlay="cdkConnectedOverlay"
      cdkConnectedOverlay
      nzConnectedOverlay
      [cdkConnectedOverlayHasBackdrop]="nzBackdrop"
      [cdkConnectedOverlayOrigin]="origin"
      (overlayOutsideClick)="onClickOutside($event)"
      (detach)="hide()"
      (positionChange)="onPositionChange($event)"
      [cdkConnectedOverlayPositions]="_positions"
      [cdkConnectedOverlayOpen]="_visible"
      [cdkConnectedOverlayPush]="cdkConnectedOverlayPush"
      [nzArrowPointAtCenter]="nzArrowPointAtCenter"
    >
      <div
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="nzAutoFocus !== null"
        class="ant-popover"
        [ngClass]="_classMap"
        [class.ant-popover-rtl]="dir === 'rtl'"
        [ngStyle]="nzOverlayStyle"
        [@.disabled]="!!noAnimation?.nzNoAnimation"
        [nzNoAnimation]="noAnimation?.nzNoAnimation"
        [@zoomBigMotion]="'active'"
      >
        <div class="ant-popover-content">
          @if (nzPopconfirmShowArrow) {
            <div class="ant-popover-arrow">
              <span class="ant-popover-arrow-content"></span>
            </div>
          }
          <div class="ant-popover-inner">
            <div>
              <div class="ant-popover-inner-content">
                <div class="ant-popover-message">
                  <ng-container *nzStringTemplateOutlet="nzTitle">
                    <ng-container *nzStringTemplateOutlet="nzIcon; let icon">
                      <span class="ant-popover-message-icon">
                        <span nz-icon [nzType]="icon || 'exclamation-circle'" nzTheme="fill"></span>
                      </span>
                    </ng-container>
                    <div class="ant-popover-message-title">{{ nzTitle }}</div>
                  </ng-container>
                </div>
                <div class="ant-popover-buttons">
                  <button
                    nz-button
                    #cancelBtn
                    [nzSize]="'small'"
                    (click)="onCancel()"
                    [attr.cdkFocusInitial]="nzAutoFocus === 'cancel' || null"
                  >
                    @if (nzCancelText) {
                      {{ nzCancelText }}
                    } @else {
                      {{ 'Modal.cancelText' | nzI18n }}
                    }
                  </button>
                  <button
                    nz-button
                    #okBtn
                    [nzSize]="'small'"
                    [nzType]="nzOkType !== 'danger' ? nzOkType : 'primary'"
                    [nzDanger]="nzOkDanger || nzOkType === 'danger'"
                    [nzLoading]="confirmLoading"
                    [disabled]="nzOkDisabled"
                    (click)="onConfirm()"
                    [attr.cdkFocusInitial]="nzAutoFocus === 'ok' || null"
                  >
                    @if (nzOkText) {
                      {{ nzOkText }}
                    } @else {
                      {{ 'Modal.okText' | nzI18n }}
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: OverlayModule }, { kind: "directive", type: i3.CdkConnectedOverlay, selector: "[cdk-connected-overlay], [connected-overlay], [cdkConnectedOverlay]", inputs: ["cdkConnectedOverlayOrigin", "cdkConnectedOverlayPositions", "cdkConnectedOverlayPositionStrategy", "cdkConnectedOverlayOffsetX", "cdkConnectedOverlayOffsetY", "cdkConnectedOverlayWidth", "cdkConnectedOverlayHeight", "cdkConnectedOverlayMinWidth", "cdkConnectedOverlayMinHeight", "cdkConnectedOverlayBackdropClass", "cdkConnectedOverlayPanelClass", "cdkConnectedOverlayViewportMargin", "cdkConnectedOverlayScrollStrategy", "cdkConnectedOverlayOpen", "cdkConnectedOverlayDisableClose", "cdkConnectedOverlayTransformOriginOn", "cdkConnectedOverlayHasBackdrop", "cdkConnectedOverlayLockPosition", "cdkConnectedOverlayFlexibleDimensions", "cdkConnectedOverlayGrowAfterOpen", "cdkConnectedOverlayPush", "cdkConnectedOverlayDisposeOnNavigation"], outputs: ["backdropClick", "positionChange", "attach", "detach", "overlayKeydown", "overlayOutsideClick"], exportAs: ["cdkConnectedOverlay"] }, { kind: "ngmodule", type: NzOverlayModule }, { kind: "directive", type: i4.NzConnectedOverlayDirective, selector: "[cdkConnectedOverlay][nzConnectedOverlay]", inputs: ["nzArrowPointAtCenter"], exportAs: ["nzConnectedOverlay"] }, { kind: "ngmodule", type: A11yModule }, { kind: "directive", type: i5.CdkTrapFocus, selector: "[cdkTrapFocus]", inputs: ["cdkTrapFocus", "cdkTrapFocusAutoCapture"], exportAs: ["cdkTrapFocus"] }, { kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "directive", type: NzNoAnimationDirective, selector: "[nzNoAnimation]", inputs: ["nzNoAnimation"], exportAs: ["nzNoAnimation"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i6.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i7.NzIconDirective, selector: "[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: NzButtonModule }, { kind: "component", type: i8.NzButtonComponent, selector: "button[nz-button], a[nz-button]", inputs: ["nzBlock", "nzGhost", "nzSearch", "nzLoading", "nzDanger", "disabled", "tabIndex", "nzType", "nzShape", "nzSize"], exportAs: ["nzButton"] }, { kind: "directive", type: i9.ɵNzTransitionPatchDirective, selector: "[nz-button], nz-button-group, [nz-icon], [nz-menu-item], [nz-submenu], nz-select-top-control, nz-select-placeholder, nz-input-group", inputs: ["hidden"] }, { kind: "directive", type: i10.NzWaveDirective, selector: "[nz-wave],button[nz-button]:not([nzType=\"link\"]):not([nzType=\"text\"])", inputs: ["nzWaveExtraNode"], exportAs: ["nzWave"] }, { kind: "ngmodule", type: NzI18nModule }, { kind: "pipe", type: i11.NzI18nPipe, name: "nzI18n" }], animations: [zoomBigMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: NzPopconfirmComponent, decorators: [{
            type: Component,
            args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    selector: 'nz-popconfirm',
                    exportAs: 'nzPopconfirmComponent',
                    preserveWhitespaces: false,
                    animations: [zoomBigMotion],
                    template: `
    <ng-template
      #overlay="cdkConnectedOverlay"
      cdkConnectedOverlay
      nzConnectedOverlay
      [cdkConnectedOverlayHasBackdrop]="nzBackdrop"
      [cdkConnectedOverlayOrigin]="origin"
      (overlayOutsideClick)="onClickOutside($event)"
      (detach)="hide()"
      (positionChange)="onPositionChange($event)"
      [cdkConnectedOverlayPositions]="_positions"
      [cdkConnectedOverlayOpen]="_visible"
      [cdkConnectedOverlayPush]="cdkConnectedOverlayPush"
      [nzArrowPointAtCenter]="nzArrowPointAtCenter"
    >
      <div
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="nzAutoFocus !== null"
        class="ant-popover"
        [ngClass]="_classMap"
        [class.ant-popover-rtl]="dir === 'rtl'"
        [ngStyle]="nzOverlayStyle"
        [@.disabled]="!!noAnimation?.nzNoAnimation"
        [nzNoAnimation]="noAnimation?.nzNoAnimation"
        [@zoomBigMotion]="'active'"
      >
        <div class="ant-popover-content">
          @if (nzPopconfirmShowArrow) {
            <div class="ant-popover-arrow">
              <span class="ant-popover-arrow-content"></span>
            </div>
          }
          <div class="ant-popover-inner">
            <div>
              <div class="ant-popover-inner-content">
                <div class="ant-popover-message">
                  <ng-container *nzStringTemplateOutlet="nzTitle">
                    <ng-container *nzStringTemplateOutlet="nzIcon; let icon">
                      <span class="ant-popover-message-icon">
                        <span nz-icon [nzType]="icon || 'exclamation-circle'" nzTheme="fill"></span>
                      </span>
                    </ng-container>
                    <div class="ant-popover-message-title">{{ nzTitle }}</div>
                  </ng-container>
                </div>
                <div class="ant-popover-buttons">
                  <button
                    nz-button
                    #cancelBtn
                    [nzSize]="'small'"
                    (click)="onCancel()"
                    [attr.cdkFocusInitial]="nzAutoFocus === 'cancel' || null"
                  >
                    @if (nzCancelText) {
                      {{ nzCancelText }}
                    } @else {
                      {{ 'Modal.cancelText' | nzI18n }}
                    }
                  </button>
                  <button
                    nz-button
                    #okBtn
                    [nzSize]="'small'"
                    [nzType]="nzOkType !== 'danger' ? nzOkType : 'primary'"
                    [nzDanger]="nzOkDanger || nzOkType === 'danger'"
                    [nzLoading]="confirmLoading"
                    [disabled]="nzOkDisabled"
                    (click)="onConfirm()"
                    [attr.cdkFocusInitial]="nzAutoFocus === 'ok' || null"
                  >
                    @if (nzOkText) {
                      {{ nzOkText }}
                    } @else {
                      {{ 'Modal.okText' | nzI18n }}
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `,
                    imports: [
                        OverlayModule,
                        NzOverlayModule,
                        A11yModule,
                        NgClass,
                        NgStyle,
                        NzNoAnimationDirective,
                        NzOutletModule,
                        NzIconModule,
                        NzButtonModule,
                        NzI18nModule
                    ],
                    standalone: true
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i2.NzNoAnimationDirective, decorators: [{
                    type: Host
                }, {
                    type: Optional
                }] }], propDecorators: { okBtn: [{
                type: ViewChildren,
                args: ['okBtn', { read: ElementRef }]
            }], cancelBtn: [{
                type: ViewChildren,
                args: ['cancelBtn', { read: ElementRef }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wY29uZmlybS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2NvbXBvbmVudHMvcG9wY29uZmlybS9wb3Bjb25maXJtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7QUFFSCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFL0MsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzdELE9BQU8sRUFDTCx1QkFBdUIsRUFFdkIsU0FBUyxFQUNULFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLElBQUksRUFDSixNQUFNLEVBQ04sS0FBSyxFQUVMLFFBQVEsRUFDUixNQUFNLEVBR04sWUFBWSxFQUNaLGlCQUFpQixFQUNsQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRTVELE9BQU8sRUFBRSxjQUFjLEVBQWdCLE1BQU0sc0JBQXNCLENBQUM7QUFDcEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzdELE9BQU8sRUFBZSxVQUFVLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNwRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUN6RSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDM0QsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRTdELE9BQU8sRUFBRSxZQUFZLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUMzRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1B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QUFhLGdpQ0FDYixlQUFlLHNOQUNmLFVBQVUsMExBQ1YsT0FBTyxvRkFDUCxPQUFPLDJFQUNQLHNCQUFzQixtSEFDdEIsY0FBYyxnUEFDZCxZQUFZLGlOQUNaLGNBQWMsZ3JCQUNkLFlBQVkseUVBL0ZGLENBQUMsYUFBYSxDQUFDOzsyRkFtR2hCLHFCQUFxQjtrQkF6R2pDLFNBQVM7bUJBQUM7b0JBQ1QsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07b0JBQy9DLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO29CQUNyQyxRQUFRLEVBQUUsZUFBZTtvQkFDekIsUUFBUSxFQUFFLHVCQUF1QjtvQkFDakMsbUJBQW1CLEVBQUUsS0FBSztvQkFDMUIsVUFBVSxFQUFFLENBQUMsYUFBYSxDQUFDO29CQUMzQixRQUFRLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUZUO29CQUNELE9BQU8sRUFBRTt3QkFDUCxhQUFhO3dCQUNiLGVBQWU7d0JBQ2YsVUFBVTt3QkFDVixPQUFPO3dCQUNQLE9BQU87d0JBQ1Asc0JBQXNCO3dCQUN0QixjQUFjO3dCQUNkLFlBQVk7d0JBQ1osY0FBYzt3QkFDZCxZQUFZO3FCQUNiO29CQUNELFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs7MEJBOEJJLFFBQVE7OzBCQUNSLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsUUFBUTs7MEJBQzNCLElBQUk7OzBCQUFJLFFBQVE7eUNBOUIwQixLQUFLO3NCQUFqRCxZQUFZO3VCQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUU7Z0JBQ00sU0FBUztzQkFBekQsWUFBWTt1QkFBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2dpdGh1Yi5jb20vTkctWk9SUk8vbmctem9ycm8tYW50ZC9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKi9cblxuaW1wb3J0IHsgQTExeU1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7IERpcmVjdGlvbmFsaXR5IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHsgT3ZlcmxheU1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7IERPQ1VNRU5ULCBOZ0NsYXNzLCBOZ1N0eWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSG9zdCxcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgT3V0cHV0LFxuICBRdWVyeUxpc3QsXG4gIFRlbXBsYXRlUmVmLFxuICBWaWV3Q2hpbGRyZW4sXG4gIFZpZXdFbmNhcHN1bGF0aW9uXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZmluYWxpemUsIGZpcnN0LCB0YWtlVW50aWwgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7IE56QnV0dG9uTW9kdWxlLCBOekJ1dHRvblR5cGUgfSBmcm9tICduZy16b3Jyby1hbnRkL2J1dHRvbic7XG5pbXBvcnQgeyB6b29tQmlnTW90aW9uIH0gZnJvbSAnbmctem9ycm8tYW50ZC9jb3JlL2FuaW1hdGlvbic7XG5pbXBvcnQgeyBOekNvbmZpZ0tleSwgV2l0aENvbmZpZyB9IGZyb20gJ25nLXpvcnJvLWFudGQvY29yZS9jb25maWcnO1xuaW1wb3J0IHsgTnpOb0FuaW1hdGlvbkRpcmVjdGl2ZSB9IGZyb20gJ25nLXpvcnJvLWFudGQvY29yZS9uby1hbmltYXRpb24nO1xuaW1wb3J0IHsgTnpPdXRsZXRNb2R1bGUgfSBmcm9tICduZy16b3Jyby1hbnRkL2NvcmUvb3V0bGV0JztcbmltcG9ydCB7IE56T3ZlcmxheU1vZHVsZSB9IGZyb20gJ25nLXpvcnJvLWFudGQvY29yZS9vdmVybGF5JztcbmltcG9ydCB7IEJvb2xlYW5JbnB1dCwgTmdTdHlsZUludGVyZmFjZSwgTnpTYWZlQW55LCBOelRTVHlwZSB9IGZyb20gJ25nLXpvcnJvLWFudGQvY29yZS90eXBlcyc7XG5pbXBvcnQgeyBJbnB1dEJvb2xlYW4sIHdyYXBJbnRvT2JzZXJ2YWJsZSB9IGZyb20gJ25nLXpvcnJvLWFudGQvY29yZS91dGlsJztcbmltcG9ydCB7IE56STE4bk1vZHVsZSB9IGZyb20gJ25nLXpvcnJvLWFudGQvaTE4bic7XG5pbXBvcnQgeyBOekljb25Nb2R1bGUgfSBmcm9tICduZy16b3Jyby1hbnRkL2ljb24nO1xuaW1wb3J0IHsgTnpUb29sVGlwQ29tcG9uZW50LCBOelRvb2x0aXBCYXNlRGlyZWN0aXZlLCBOelRvb2x0aXBUcmlnZ2VyLCBQcm9wZXJ0eU1hcHBpbmcgfSBmcm9tICduZy16b3Jyby1hbnRkL3Rvb2x0aXAnO1xuXG5leHBvcnQgdHlwZSBOekF1dG9Gb2N1c1R5cGUgPSBudWxsIHwgJ29rJyB8ICdjYW5jZWwnO1xuXG5jb25zdCBOWl9DT05GSUdfTU9EVUxFX05BTUU6IE56Q29uZmlnS2V5ID0gJ3BvcGNvbmZpcm0nO1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbnotcG9wY29uZmlybV0nLFxuICBleHBvcnRBczogJ256UG9wY29uZmlybScsXG4gIGhvc3Q6IHtcbiAgICAnW2NsYXNzLmFudC1wb3BvdmVyLW9wZW5dJzogJ3Zpc2libGUnXG4gIH0sXG4gIHN0YW5kYWxvbmU6IHRydWVcbn0pXG5leHBvcnQgY2xhc3MgTnpQb3Bjb25maXJtRGlyZWN0aXZlIGV4dGVuZHMgTnpUb29sdGlwQmFzZURpcmVjdGl2ZSB7XG4gIHJlYWRvbmx5IF9uek1vZHVsZU5hbWU6IE56Q29uZmlnS2V5ID0gTlpfQ09ORklHX01PRFVMRV9OQU1FO1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbnpPa0RhbmdlcjogQm9vbGVhbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbnpPa0Rpc2FibGVkOiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9uekNvbmRpdGlvbjogQm9vbGVhbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbnpQb3Bjb25maXJtU2hvd0Fycm93OiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9uelBvcGNvbmZpcm1BcnJvd1BvaW50QXRDZW50ZXI6IEJvb2xlYW5JbnB1dDtcblxuICBASW5wdXQoJ256UG9wY29uZmlybUFycm93UG9pbnRBdENlbnRlcicpIEBJbnB1dEJvb2xlYW4oKSBvdmVycmlkZSBhcnJvd1BvaW50QXRDZW50ZXI/OiBib29sZWFuO1xuICBASW5wdXQoJ256UG9wY29uZmlybVRpdGxlJykgb3ZlcnJpZGUgdGl0bGU/OiBOelRTVHlwZTtcbiAgQElucHV0KCduei1wb3Bjb25maXJtJykgb3ZlcnJpZGUgZGlyZWN0aXZlVGl0bGU/OiBOelRTVHlwZSB8IG51bGw7XG4gIEBJbnB1dCgnbnpQb3Bjb25maXJtVHJpZ2dlcicpIG92ZXJyaWRlIHRyaWdnZXI/OiBOelRvb2x0aXBUcmlnZ2VyID0gJ2NsaWNrJztcbiAgQElucHV0KCduelBvcGNvbmZpcm1QbGFjZW1lbnQnKSBvdmVycmlkZSBwbGFjZW1lbnQ/OiBzdHJpbmcgfCBzdHJpbmdbXSA9ICd0b3AnO1xuICBASW5wdXQoJ256UG9wY29uZmlybU9yaWdpbicpIG92ZXJyaWRlIG9yaWdpbj86IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+O1xuICBASW5wdXQoJ256UG9wY29uZmlybU1vdXNlRW50ZXJEZWxheScpIG92ZXJyaWRlIG1vdXNlRW50ZXJEZWxheT86IG51bWJlcjtcbiAgQElucHV0KCduelBvcGNvbmZpcm1Nb3VzZUxlYXZlRGVsYXknKSBvdmVycmlkZSBtb3VzZUxlYXZlRGVsYXk/OiBudW1iZXI7XG4gIEBJbnB1dCgnbnpQb3Bjb25maXJtT3ZlcmxheUNsYXNzTmFtZScpIG92ZXJyaWRlIG92ZXJsYXlDbGFzc05hbWU/OiBzdHJpbmc7XG4gIEBJbnB1dCgnbnpQb3Bjb25maXJtT3ZlcmxheVN0eWxlJykgb3ZlcnJpZGUgb3ZlcmxheVN0eWxlPzogTmdTdHlsZUludGVyZmFjZTtcbiAgQElucHV0KCduelBvcGNvbmZpcm1WaXNpYmxlJykgb3ZlcnJpZGUgdmlzaWJsZT86IGJvb2xlYW47XG4gIEBJbnB1dCgpIG56T2tUZXh0Pzogc3RyaW5nO1xuICBASW5wdXQoKSBuek9rVHlwZT86IHN0cmluZztcbiAgQElucHV0KCkgQElucHV0Qm9vbGVhbigpIG56T2tEaXNhYmxlZD86IGJvb2xlYW47XG4gIEBJbnB1dCgpIEBJbnB1dEJvb2xlYW4oKSBuek9rRGFuZ2VyPzogYm9vbGVhbjtcbiAgQElucHV0KCkgbnpDYW5jZWxUZXh0Pzogc3RyaW5nO1xuICBASW5wdXQoKSBuekJlZm9yZUNvbmZpcm0/OiAoKSA9PiBPYnNlcnZhYmxlPGJvb2xlYW4+IHwgUHJvbWlzZTxib29sZWFuPiB8IGJvb2xlYW47XG4gIEBJbnB1dCgpIG56SWNvbj86IHN0cmluZyB8IFRlbXBsYXRlUmVmPHZvaWQ+O1xuICBASW5wdXQoKSBASW5wdXRCb29sZWFuKCkgbnpDb25kaXRpb246IGJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgQElucHV0Qm9vbGVhbigpIG56UG9wY29uZmlybVNob3dBcnJvdzogYm9vbGVhbiA9IHRydWU7XG4gIEBJbnB1dCgpIEBXaXRoQ29uZmlnKCkgbnpQb3Bjb25maXJtQmFja2Ryb3A/OiBib29sZWFuID0gZmFsc2U7XG4gIEBJbnB1dCgpIEBXaXRoQ29uZmlnKCkgbnpBdXRvZm9jdXM6IE56QXV0b0ZvY3VzVHlwZSA9IG51bGw7XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEBhbmd1bGFyLWVzbGludC9uby1vdXRwdXQtcmVuYW1lXG4gIEBPdXRwdXQoJ256UG9wY29uZmlybVZpc2libGVDaGFuZ2UnKSBvdmVycmlkZSByZWFkb25seSB2aXNpYmxlQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxib29sZWFuPigpO1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgbnpPbkNhbmNlbCA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcbiAgQE91dHB1dCgpIHJlYWRvbmx5IG56T25Db25maXJtID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBnZXRQcm94eVByb3BlcnR5TWFwKCk6IFByb3BlcnR5TWFwcGluZyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG56T2tUZXh0OiBbJ256T2tUZXh0JywgKCkgPT4gdGhpcy5uek9rVGV4dF0sXG4gICAgICBuek9rVHlwZTogWyduek9rVHlwZScsICgpID0+IHRoaXMubnpPa1R5cGVdLFxuICAgICAgbnpPa0RhbmdlcjogWyduek9rRGFuZ2VyJywgKCkgPT4gdGhpcy5uek9rRGFuZ2VyXSxcbiAgICAgIG56T2tEaXNhYmxlZDogWyduek9rRGlzYWJsZWQnLCAoKSA9PiB0aGlzLm56T2tEaXNhYmxlZF0sXG4gICAgICBuekNhbmNlbFRleHQ6IFsnbnpDYW5jZWxUZXh0JywgKCkgPT4gdGhpcy5uekNhbmNlbFRleHRdLFxuICAgICAgbnpCZWZvcmVDb25maXJtOiBbJ256QmVmb3JlQ29uZmlybScsICgpID0+IHRoaXMubnpCZWZvcmVDb25maXJtXSxcbiAgICAgIG56Q29uZGl0aW9uOiBbJ256Q29uZGl0aW9uJywgKCkgPT4gdGhpcy5uekNvbmRpdGlvbl0sXG4gICAgICBuekljb246IFsnbnpJY29uJywgKCkgPT4gdGhpcy5uekljb25dLFxuICAgICAgbnpQb3Bjb25maXJtU2hvd0Fycm93OiBbJ256UG9wY29uZmlybVNob3dBcnJvdycsICgpID0+IHRoaXMubnpQb3Bjb25maXJtU2hvd0Fycm93XSxcbiAgICAgIG56UG9wY29uZmlybUJhY2tkcm9wOiBbJ256QmFja2Ryb3AnLCAoKSA9PiB0aGlzLm56UG9wY29uZmlybUJhY2tkcm9wXSxcbiAgICAgIG56QXV0b0ZvY3VzOiBbJ256QXV0b0ZvY3VzJywgKCkgPT4gdGhpcy5uekF1dG9mb2N1c10sXG4gICAgICAuLi5zdXBlci5nZXRQcm94eVByb3BlcnR5TWFwKClcbiAgICB9O1xuICB9XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoTnpQb3Bjb25maXJtQ29tcG9uZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIHByb3RlY3RlZCBvdmVycmlkZSBjcmVhdGVDb21wb25lbnQoKTogdm9pZCB7XG4gICAgc3VwZXIuY3JlYXRlQ29tcG9uZW50KCk7XG5cbiAgICAodGhpcy5jb21wb25lbnQgYXMgTnpQb3Bjb25maXJtQ29tcG9uZW50KS5uek9uQ2FuY2VsLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveSQpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5uek9uQ2FuY2VsLmVtaXQoKTtcbiAgICB9KTtcbiAgICAodGhpcy5jb21wb25lbnQgYXMgTnpQb3Bjb25maXJtQ29tcG9uZW50KS5uek9uQ29uZmlybS5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMubnpPbkNvbmZpcm0uZW1pdCgpO1xuICAgIH0pO1xuICB9XG59XG5cbkBDb21wb25lbnQoe1xuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgc2VsZWN0b3I6ICduei1wb3Bjb25maXJtJyxcbiAgZXhwb3J0QXM6ICduelBvcGNvbmZpcm1Db21wb25lbnQnLFxuICBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiBmYWxzZSxcbiAgYW5pbWF0aW9uczogW3pvb21CaWdNb3Rpb25dLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxuZy10ZW1wbGF0ZVxuICAgICAgI292ZXJsYXk9XCJjZGtDb25uZWN0ZWRPdmVybGF5XCJcbiAgICAgIGNka0Nvbm5lY3RlZE92ZXJsYXlcbiAgICAgIG56Q29ubmVjdGVkT3ZlcmxheVxuICAgICAgW2Nka0Nvbm5lY3RlZE92ZXJsYXlIYXNCYWNrZHJvcF09XCJuekJhY2tkcm9wXCJcbiAgICAgIFtjZGtDb25uZWN0ZWRPdmVybGF5T3JpZ2luXT1cIm9yaWdpblwiXG4gICAgICAob3ZlcmxheU91dHNpZGVDbGljayk9XCJvbkNsaWNrT3V0c2lkZSgkZXZlbnQpXCJcbiAgICAgIChkZXRhY2gpPVwiaGlkZSgpXCJcbiAgICAgIChwb3NpdGlvbkNoYW5nZSk9XCJvblBvc2l0aW9uQ2hhbmdlKCRldmVudClcIlxuICAgICAgW2Nka0Nvbm5lY3RlZE92ZXJsYXlQb3NpdGlvbnNdPVwiX3Bvc2l0aW9uc1wiXG4gICAgICBbY2RrQ29ubmVjdGVkT3ZlcmxheU9wZW5dPVwiX3Zpc2libGVcIlxuICAgICAgW2Nka0Nvbm5lY3RlZE92ZXJsYXlQdXNoXT1cImNka0Nvbm5lY3RlZE92ZXJsYXlQdXNoXCJcbiAgICAgIFtuekFycm93UG9pbnRBdENlbnRlcl09XCJuekFycm93UG9pbnRBdENlbnRlclwiXG4gICAgPlxuICAgICAgPGRpdlxuICAgICAgICBjZGtUcmFwRm9jdXNcbiAgICAgICAgW2Nka1RyYXBGb2N1c0F1dG9DYXB0dXJlXT1cIm56QXV0b0ZvY3VzICE9PSBudWxsXCJcbiAgICAgICAgY2xhc3M9XCJhbnQtcG9wb3ZlclwiXG4gICAgICAgIFtuZ0NsYXNzXT1cIl9jbGFzc01hcFwiXG4gICAgICAgIFtjbGFzcy5hbnQtcG9wb3Zlci1ydGxdPVwiZGlyID09PSAncnRsJ1wiXG4gICAgICAgIFtuZ1N0eWxlXT1cIm56T3ZlcmxheVN0eWxlXCJcbiAgICAgICAgW0AuZGlzYWJsZWRdPVwiISFub0FuaW1hdGlvbj8ubnpOb0FuaW1hdGlvblwiXG4gICAgICAgIFtuek5vQW5pbWF0aW9uXT1cIm5vQW5pbWF0aW9uPy5uek5vQW5pbWF0aW9uXCJcbiAgICAgICAgW0B6b29tQmlnTW90aW9uXT1cIidhY3RpdmUnXCJcbiAgICAgID5cbiAgICAgICAgPGRpdiBjbGFzcz1cImFudC1wb3BvdmVyLWNvbnRlbnRcIj5cbiAgICAgICAgICBAaWYgKG56UG9wY29uZmlybVNob3dBcnJvdykge1xuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFudC1wb3BvdmVyLWFycm93XCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiYW50LXBvcG92ZXItYXJyb3ctY29udGVudFwiPjwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIH1cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiYW50LXBvcG92ZXItaW5uZXJcIj5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhbnQtcG9wb3Zlci1pbm5lci1jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFudC1wb3BvdmVyLW1lc3NhZ2VcIj5cbiAgICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm56U3RyaW5nVGVtcGxhdGVPdXRsZXQ9XCJuelRpdGxlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm56U3RyaW5nVGVtcGxhdGVPdXRsZXQ9XCJuekljb247IGxldCBpY29uXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJhbnQtcG9wb3Zlci1tZXNzYWdlLWljb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIG56LWljb24gW256VHlwZV09XCJpY29uIHx8ICdleGNsYW1hdGlvbi1jaXJjbGUnXCIgbnpUaGVtZT1cImZpbGxcIj48L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L25nLWNvbnRhaW5lcj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFudC1wb3BvdmVyLW1lc3NhZ2UtdGl0bGVcIj57eyBuelRpdGxlIH19PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L25nLWNvbnRhaW5lcj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYW50LXBvcG92ZXItYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBuei1idXR0b25cbiAgICAgICAgICAgICAgICAgICAgI2NhbmNlbEJ0blxuICAgICAgICAgICAgICAgICAgICBbbnpTaXplXT1cIidzbWFsbCdcIlxuICAgICAgICAgICAgICAgICAgICAoY2xpY2spPVwib25DYW5jZWwoKVwiXG4gICAgICAgICAgICAgICAgICAgIFthdHRyLmNka0ZvY3VzSW5pdGlhbF09XCJuekF1dG9Gb2N1cyA9PT0gJ2NhbmNlbCcgfHwgbnVsbFwiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIEBpZiAobnpDYW5jZWxUZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAge3sgbnpDYW5jZWxUZXh0IH19XG4gICAgICAgICAgICAgICAgICAgIH0gQGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIHt7ICdNb2RhbC5jYW5jZWxUZXh0JyB8IG56STE4biB9fVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgbnotYnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICNva0J0blxuICAgICAgICAgICAgICAgICAgICBbbnpTaXplXT1cIidzbWFsbCdcIlxuICAgICAgICAgICAgICAgICAgICBbbnpUeXBlXT1cIm56T2tUeXBlICE9PSAnZGFuZ2VyJyA/IG56T2tUeXBlIDogJ3ByaW1hcnknXCJcbiAgICAgICAgICAgICAgICAgICAgW256RGFuZ2VyXT1cIm56T2tEYW5nZXIgfHwgbnpPa1R5cGUgPT09ICdkYW5nZXInXCJcbiAgICAgICAgICAgICAgICAgICAgW256TG9hZGluZ109XCJjb25maXJtTG9hZGluZ1wiXG4gICAgICAgICAgICAgICAgICAgIFtkaXNhYmxlZF09XCJuek9rRGlzYWJsZWRcIlxuICAgICAgICAgICAgICAgICAgICAoY2xpY2spPVwib25Db25maXJtKClcIlxuICAgICAgICAgICAgICAgICAgICBbYXR0ci5jZGtGb2N1c0luaXRpYWxdPVwibnpBdXRvRm9jdXMgPT09ICdvaycgfHwgbnVsbFwiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIEBpZiAobnpPa1RleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICB7eyBuek9rVGV4dCB9fVxuICAgICAgICAgICAgICAgICAgICB9IEBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICB7eyAnTW9kYWwub2tUZXh0JyB8IG56STE4biB9fVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L25nLXRlbXBsYXRlPlxuICBgLFxuICBpbXBvcnRzOiBbXG4gICAgT3ZlcmxheU1vZHVsZSxcbiAgICBOek92ZXJsYXlNb2R1bGUsXG4gICAgQTExeU1vZHVsZSxcbiAgICBOZ0NsYXNzLFxuICAgIE5nU3R5bGUsXG4gICAgTnpOb0FuaW1hdGlvbkRpcmVjdGl2ZSxcbiAgICBOek91dGxldE1vZHVsZSxcbiAgICBOekljb25Nb2R1bGUsXG4gICAgTnpCdXR0b25Nb2R1bGUsXG4gICAgTnpJMThuTW9kdWxlXG4gIF0sXG4gIHN0YW5kYWxvbmU6IHRydWVcbn0pXG5leHBvcnQgY2xhc3MgTnpQb3Bjb25maXJtQ29tcG9uZW50IGV4dGVuZHMgTnpUb29sVGlwQ29tcG9uZW50IGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgQFZpZXdDaGlsZHJlbignb2tCdG4nLCB7IHJlYWQ6IEVsZW1lbnRSZWYgfSkgb2tCdG4hOiBRdWVyeUxpc3Q8RWxlbWVudFJlZj47XG4gIEBWaWV3Q2hpbGRyZW4oJ2NhbmNlbEJ0bicsIHsgcmVhZDogRWxlbWVudFJlZiB9KSBjYW5jZWxCdG4hOiBRdWVyeUxpc3Q8RWxlbWVudFJlZj47XG5cbiAgbnpDYW5jZWxUZXh0Pzogc3RyaW5nO1xuICBuekNvbmRpdGlvbiA9IGZhbHNlO1xuICBuelBvcGNvbmZpcm1TaG93QXJyb3cgPSB0cnVlO1xuICBuekljb24/OiBzdHJpbmcgfCBUZW1wbGF0ZVJlZjx2b2lkPjtcbiAgbnpPa1RleHQ/OiBzdHJpbmc7XG4gIG56T2tUeXBlOiBOekJ1dHRvblR5cGUgfCAnZGFuZ2VyJyA9ICdwcmltYXJ5JztcbiAgbnpPa0RhbmdlcjogYm9vbGVhbiA9IGZhbHNlO1xuICBuek9rRGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgbnpBdXRvRm9jdXM6IE56QXV0b0ZvY3VzVHlwZSA9IG51bGw7XG4gIG56QmVmb3JlQ29uZmlybTogKCgpID0+IE9ic2VydmFibGU8Ym9vbGVhbj4gfCBQcm9taXNlPGJvb2xlYW4+IHwgYm9vbGVhbikgfCBudWxsID0gbnVsbDtcblxuICByZWFkb25seSBuek9uQ2FuY2VsID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcbiAgcmVhZG9ubHkgbnpPbkNvbmZpcm0gPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBfdHJpZ2dlcjogTnpUb29sdGlwVHJpZ2dlciA9ICdjbGljayc7XG4gIHByaXZhdGUgZWxlbWVudEZvY3VzZWRCZWZvcmVNb2RhbFdhc09wZW5lZDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBkb2N1bWVudDogRG9jdW1lbnQ7XG5cbiAgb3ZlcnJpZGUgX3ByZWZpeCA9ICdhbnQtcG9wb3Zlcic7XG5cbiAgY29uZmlybUxvYWRpbmcgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBjZHI6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHByaXZhdGUgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICBAT3B0aW9uYWwoKSBkaXJlY3Rpb25hbGl0eTogRGlyZWN0aW9uYWxpdHksXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChET0NVTUVOVCkgZG9jdW1lbnQ6IE56U2FmZUFueSxcbiAgICBASG9zdCgpIEBPcHRpb25hbCgpIG5vQW5pbWF0aW9uPzogTnpOb0FuaW1hdGlvbkRpcmVjdGl2ZVxuICApIHtcbiAgICBzdXBlcihjZHIsIGRpcmVjdGlvbmFsaXR5LCBub0FuaW1hdGlvbik7XG4gICAgdGhpcy5kb2N1bWVudCA9IGRvY3VtZW50O1xuICB9XG5cbiAgb3ZlcnJpZGUgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcblxuICAgIHRoaXMubnpPbkNhbmNlbC5jb21wbGV0ZSgpO1xuICAgIHRoaXMubnpPbkNvbmZpcm0uY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIG92ZXJyaWRlIHNob3coKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLm56Q29uZGl0aW9uKSB7XG4gICAgICB0aGlzLmNhcHR1cmVQcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQoKTtcbiAgICAgIHN1cGVyLnNob3coKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbkNvbmZpcm0oKTtcbiAgICB9XG4gIH1cblxuICBvdmVycmlkZSBoaWRlKCk6IHZvaWQge1xuICAgIHN1cGVyLmhpZGUoKTtcbiAgICB0aGlzLnJlc3RvcmVGb2N1cygpO1xuICB9XG5cbiAgaGFuZGxlQ29uZmlybSgpOiB2b2lkIHtcbiAgICB0aGlzLm56T25Db25maXJtLm5leHQoKTtcbiAgICBzdXBlci5oaWRlKCk7XG4gIH1cblxuICBvbkNhbmNlbCgpOiB2b2lkIHtcbiAgICB0aGlzLm56T25DYW5jZWwubmV4dCgpO1xuICAgIHN1cGVyLmhpZGUoKTtcbiAgfVxuXG4gIG9uQ29uZmlybSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5uekJlZm9yZUNvbmZpcm0pIHtcbiAgICAgIGNvbnN0IG9ic2VydmFibGUgPSB3cmFwSW50b09ic2VydmFibGUodGhpcy5uekJlZm9yZUNvbmZpcm0oKSkucGlwZShmaXJzdCgpKTtcbiAgICAgIHRoaXMuY29uZmlybUxvYWRpbmcgPSB0cnVlO1xuICAgICAgb2JzZXJ2YWJsZVxuICAgICAgICAucGlwZShcbiAgICAgICAgICBmaW5hbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpcm1Mb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmNkci5tYXJrRm9yQ2hlY2soKTtcbiAgICAgICAgICB9KSxcbiAgICAgICAgICB0YWtlVW50aWwodGhpcy5uelZpc2libGVDaGFuZ2UpLFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKVxuICAgICAgICApXG4gICAgICAgIC5zdWJzY3JpYmUodmFsdWUgPT4ge1xuICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVDb25maXJtKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oYW5kbGVDb25maXJtKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjYXB0dXJlUHJldmlvdXNseUZvY3VzZWRFbGVtZW50KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmRvY3VtZW50KSB7XG4gICAgICB0aGlzLmVsZW1lbnRGb2N1c2VkQmVmb3JlTW9kYWxXYXNPcGVuZWQgPSB0aGlzLmRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZXN0b3JlRm9jdXMoKTogdm9pZCB7XG4gICAgY29uc3QgdG9Gb2N1cyA9IHRoaXMuZWxlbWVudEZvY3VzZWRCZWZvcmVNb2RhbFdhc09wZW5lZCBhcyBIVE1MRWxlbWVudDtcblxuICAgIC8vIFdlIG5lZWQgdGhlIGV4dHJhIGNoZWNrLCBiZWNhdXNlIElFIGNhbiBzZXQgdGhlIGBhY3RpdmVFbGVtZW50YCB0byBudWxsIGluIHNvbWUgY2FzZXMuXG4gICAgaWYgKHRvRm9jdXMgJiYgdHlwZW9mIHRvRm9jdXMuZm9jdXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnN0IGFjdGl2ZUVsZW1lbnQgPSB0aGlzLmRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgYXMgRWxlbWVudDtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcblxuICAgICAgaWYgKFxuICAgICAgICAhYWN0aXZlRWxlbWVudCB8fFxuICAgICAgICBhY3RpdmVFbGVtZW50ID09PSB0aGlzLmRvY3VtZW50LmJvZHkgfHxcbiAgICAgICAgYWN0aXZlRWxlbWVudCA9PT0gZWxlbWVudCB8fFxuICAgICAgICBlbGVtZW50LmNvbnRhaW5zKGFjdGl2ZUVsZW1lbnQpXG4gICAgICApIHtcbiAgICAgICAgdG9Gb2N1cy5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19