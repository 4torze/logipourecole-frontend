import { __decorate } from "tslib";
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, forwardRef, Input, Optional, Output, ViewChildren, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { thumbMotion } from 'ng-zorro-antd/core/animation';
import { WithConfig } from 'ng-zorro-antd/core/config';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { InputBoolean } from 'ng-zorro-antd/core/util';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { normalizeOptions } from './types';
import * as i0 from "@angular/core";
import * as i1 from "ng-zorro-antd/core/config";
import * as i2 from "@angular/cdk/bidi";
import * as i3 from "ng-zorro-antd/icon";
import * as i4 from "ng-zorro-antd/core/outlet";
const NZ_CONFIG_MODULE_NAME = 'segmented';
export class NzSegmentedComponent {
    constructor(nzConfigService, cdr, directionality) {
        this.nzConfigService = nzConfigService;
        this.cdr = cdr;
        this.directionality = directionality;
        this._nzModuleName = NZ_CONFIG_MODULE_NAME;
        this.nzBlock = false;
        this.nzDisabled = false;
        this.nzOptions = [];
        this.nzSize = 'default';
        this.nzLabelTemplate = null;
        this.nzValueChange = new EventEmitter();
        this.dir = 'ltr';
        this.selectedIndex = 0;
        this.transitionedToIndex = -1;
        this.animationState = null;
        this.normalizedOptions = [];
        this.destroy$ = new Subject();
        this.onChange = () => { };
        this.onTouched = () => { };
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe(direction => {
            this.dir = direction;
            this.cdr.detectChanges();
        });
    }
    ngOnChanges(changes) {
        const { nzOptions } = changes;
        if (nzOptions) {
            this.normalizedOptions = normalizeOptions(nzOptions.currentValue);
        }
    }
    handleOptionClick(index) {
        if (this.nzDisabled) {
            return;
        }
        this.changeSelectedIndex(index);
        this.onChange(index);
        this.nzValueChange.emit(index);
    }
    handleThumbAnimationDone(e) {
        if (e.fromState === 'from') {
            this.selectedIndex = this.transitionedToIndex;
            this.transitionedToIndex = -1;
            this.animationState = null;
            this.cdr.detectChanges();
        }
    }
    writeValue(value) {
        if (typeof value === 'number' && value > -1) {
            this.changeSelectedIndex(value);
            this.cdr.markForCheck();
        }
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    changeSelectedIndex(index) {
        if (!this.listOfOptions || this.selectedIndex === -1 || this.selectedIndex === index) {
            return;
        }
        this.animationState = {
            value: 'from',
            params: getThumbAnimationProps(this.listOfOptions.get(this.selectedIndex).nativeElement)
        };
        this.selectedIndex = -1;
        this.cdr.detectChanges();
        this.animationState = {
            value: 'to',
            params: getThumbAnimationProps(this.listOfOptions.get(index).nativeElement)
        };
        this.transitionedToIndex = index;
        this.cdr.detectChanges();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: NzSegmentedComponent, deps: [{ token: i1.NzConfigService }, { token: i0.ChangeDetectorRef }, { token: i2.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "17.3.8", type: NzSegmentedComponent, isStandalone: true, selector: "nz-segmented", inputs: { nzBlock: "nzBlock", nzDisabled: "nzDisabled", nzOptions: "nzOptions", nzSize: "nzSize", nzLabelTemplate: "nzLabelTemplate" }, outputs: { nzValueChange: "nzValueChange" }, host: { properties: { "class.ant-segmented-disabled": "!!nzDisabled", "class.ant-segmented-rtl": "dir === 'rtl'", "class.ant-segmented-lg": "nzSize === 'large'", "class.ant-segmented-sm": "nzSize === 'small'", "class.ant-segmented-block": "!!nzBlock" }, classAttribute: "ant-segmented" }, providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NzSegmentedComponent), multi: true }], viewQueries: [{ propertyName: "listOfOptions", predicate: ["itemLabels"], descendants: true, read: ElementRef }], exportAs: ["nzSegmented"], usesOnChanges: true, ngImport: i0, template: `
    <!-- thumb motion div -->
    <div class="ant-segmented-group">
      @if (animationState) {
        <div
          [ngClass]="{ 'ant-segmented-thumb': true, 'ant-segmented-thumb-motion': true }"
          [@thumbMotion]="animationState"
          (@thumbMotion.done)="handleThumbAnimationDone($event)"
        ></div>
      }

      @for (item of normalizedOptions; track item; let i = $index) {
        <label
          #itemLabels
          [ngClass]="{
            'ant-segmented-item': true,
            'ant-segmented-item-selected': i === selectedIndex,
            'ant-segmented-item-disabled': !!nzDisabled || item.disabled
          }"
        >
          <input class="ant-segmented-item-input" type="radio" [checked]="i === selectedIndex" />
          <div class="ant-segmented-item-label" (click)="!item.disabled && handleOptionClick(i)">
            @if (item.icon) {
              <span class="ant-segmented-item-icon"><span nz-icon [nzType]="item.icon"></span></span>
              <span>
                <ng-container
                  *nzStringTemplateOutlet="item.useTemplate && nzLabelTemplate; context: { $implicit: item, index: i }"
                >
                  {{ item.label }}
                </ng-container>
              </span>
            } @else {
              <ng-container
                *nzStringTemplateOutlet="item.useTemplate && nzLabelTemplate; context: { $implicit: item, index: i }"
              >
                {{ item.label }}
              </ng-container>
            }
          </div>
        </label>
      }
    </div>
  `, isInline: true, dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i3.NzIconDirective, selector: "[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i4.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }], animations: [thumbMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
__decorate([
    InputBoolean()
], NzSegmentedComponent.prototype, "nzBlock", void 0);
__decorate([
    InputBoolean()
], NzSegmentedComponent.prototype, "nzDisabled", void 0);
__decorate([
    WithConfig()
], NzSegmentedComponent.prototype, "nzSize", void 0);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: NzSegmentedComponent, decorators: [{
            type: Component,
            args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    selector: 'nz-segmented',
                    exportAs: 'nzSegmented',
                    template: `
    <!-- thumb motion div -->
    <div class="ant-segmented-group">
      @if (animationState) {
        <div
          [ngClass]="{ 'ant-segmented-thumb': true, 'ant-segmented-thumb-motion': true }"
          [@thumbMotion]="animationState"
          (@thumbMotion.done)="handleThumbAnimationDone($event)"
        ></div>
      }

      @for (item of normalizedOptions; track item; let i = $index) {
        <label
          #itemLabels
          [ngClass]="{
            'ant-segmented-item': true,
            'ant-segmented-item-selected': i === selectedIndex,
            'ant-segmented-item-disabled': !!nzDisabled || item.disabled
          }"
        >
          <input class="ant-segmented-item-input" type="radio" [checked]="i === selectedIndex" />
          <div class="ant-segmented-item-label" (click)="!item.disabled && handleOptionClick(i)">
            @if (item.icon) {
              <span class="ant-segmented-item-icon"><span nz-icon [nzType]="item.icon"></span></span>
              <span>
                <ng-container
                  *nzStringTemplateOutlet="item.useTemplate && nzLabelTemplate; context: { $implicit: item, index: i }"
                >
                  {{ item.label }}
                </ng-container>
              </span>
            } @else {
              <ng-container
                *nzStringTemplateOutlet="item.useTemplate && nzLabelTemplate; context: { $implicit: item, index: i }"
              >
                {{ item.label }}
              </ng-container>
            }
          </div>
        </label>
      }
    </div>
  `,
                    host: {
                        class: 'ant-segmented',
                        '[class.ant-segmented-disabled]': '!!nzDisabled',
                        '[class.ant-segmented-rtl]': `dir === 'rtl'`,
                        '[class.ant-segmented-lg]': `nzSize === 'large'`,
                        '[class.ant-segmented-sm]': `nzSize === 'small'`,
                        '[class.ant-segmented-block]': `!!nzBlock`
                    },
                    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NzSegmentedComponent), multi: true }],
                    animations: [thumbMotion],
                    imports: [NgClass, NzIconModule, NzOutletModule],
                    standalone: true
                }]
        }], ctorParameters: () => [{ type: i1.NzConfigService }, { type: i0.ChangeDetectorRef }, { type: i2.Directionality, decorators: [{
                    type: Optional
                }] }], propDecorators: { listOfOptions: [{
                type: ViewChildren,
                args: ['itemLabels', { read: ElementRef }]
            }], nzBlock: [{
                type: Input
            }], nzDisabled: [{
                type: Input
            }], nzOptions: [{
                type: Input
            }], nzSize: [{
                type: Input
            }], nzLabelTemplate: [{
                type: Input
            }], nzValueChange: [{
                type: Output
            }] } });
function getThumbAnimationProps(element) {
    return {
        transform: element.offsetLeft,
        width: element.clientWidth
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VnbWVudGVkLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2NvbXBvbmVudHMvc2VnbWVudGVkL3NlZ21lbnRlZC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQU1BLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMxQyxPQUFPLEVBQ0wsdUJBQXVCLEVBRXZCLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLFVBQVUsRUFDVixLQUFLLEVBRUwsUUFBUSxFQUNSLE1BQU0sRUFJTixZQUFZLEVBQ1osaUJBQWlCLEVBQ2xCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBd0IsaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6RSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQy9CLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUUzQyxPQUFPLEVBQXVCLFdBQVcsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ2hGLE9BQU8sRUFBZ0MsVUFBVSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDckYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRTNELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFbEQsT0FBTyxFQUFFLGdCQUFnQixFQUE4RCxNQUFNLFNBQVMsQ0FBQzs7Ozs7O0FBRXZHLE1BQU0scUJBQXFCLEdBQWdCLFdBQVcsQ0FBQztBQStEdkQsTUFBTSxPQUFPLG9CQUFvQjtJQXNDL0IsWUFDa0IsZUFBZ0MsRUFDL0IsR0FBc0IsRUFDVixjQUE4QjtRQUYzQyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFDL0IsUUFBRyxHQUFILEdBQUcsQ0FBbUI7UUFDVixtQkFBYyxHQUFkLGNB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bnQiOlsiLyoqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2dpdGh1Yi5jb20vTkctWk9SUk8vbmctem9ycm8tYW50ZC9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKi9cblxuaW1wb3J0IHsgRGlyZWN0aW9uLCBEaXJlY3Rpb25hbGl0eSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7IE5nQ2xhc3MgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgZm9yd2FyZFJlZixcbiAgSW5wdXQsXG4gIE9uQ2hhbmdlcyxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgUXVlcnlMaXN0LFxuICBTaW1wbGVDaGFuZ2VzLFxuICBUZW1wbGF0ZVJlZixcbiAgVmlld0NoaWxkcmVuLFxuICBWaWV3RW5jYXBzdWxhdGlvblxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUiB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IHRha2VVbnRpbCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgVGh1bWJBbmltYXRpb25Qcm9wcywgdGh1bWJNb3Rpb24gfSBmcm9tICduZy16b3Jyby1hbnRkL2NvcmUvYW5pbWF0aW9uJztcbmltcG9ydCB7IE56Q29uZmlnS2V5LCBOekNvbmZpZ1NlcnZpY2UsIFdpdGhDb25maWcgfSBmcm9tICduZy16b3Jyby1hbnRkL2NvcmUvY29uZmlnJztcbmltcG9ydCB7IE56T3V0bGV0TW9kdWxlIH0gZnJvbSAnbmctem9ycm8tYW50ZC9jb3JlL291dGxldCc7XG5pbXBvcnQgeyBCb29sZWFuSW5wdXQsIE56U2FmZUFueSwgTnpTaXplTERTVHlwZSwgT25DaGFuZ2VUeXBlLCBPblRvdWNoZWRUeXBlIH0gZnJvbSAnbmctem9ycm8tYW50ZC9jb3JlL3R5cGVzJztcbmltcG9ydCB7IElucHV0Qm9vbGVhbiB9IGZyb20gJ25nLXpvcnJvLWFudGQvY29yZS91dGlsJztcbmltcG9ydCB7IE56SWNvbk1vZHVsZSB9IGZyb20gJ25nLXpvcnJvLWFudGQvaWNvbic7XG5cbmltcG9ydCB7IG5vcm1hbGl6ZU9wdGlvbnMsIE56Tm9ybWFsaXplZE9wdGlvbnMsIE56U2VnbWVudGVkT3B0aW9uLCBOelNlZ21lbnRlZE9wdGlvbnMgfSBmcm9tICcuL3R5cGVzJztcblxuY29uc3QgTlpfQ09ORklHX01PRFVMRV9OQU1FOiBOekNvbmZpZ0tleSA9ICdzZWdtZW50ZWQnO1xuXG5AQ29tcG9uZW50KHtcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIHNlbGVjdG9yOiAnbnotc2VnbWVudGVkJyxcbiAgZXhwb3J0QXM6ICduelNlZ21lbnRlZCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPCEtLSB0aHVtYiBtb3Rpb24gZGl2IC0tPlxuICAgIDxkaXYgY2xhc3M9XCJhbnQtc2VnbWVudGVkLWdyb3VwXCI+XG4gICAgICBAaWYgKGFuaW1hdGlvblN0YXRlKSB7XG4gICAgICAgIDxkaXZcbiAgICAgICAgICBbbmdDbGFzc109XCJ7ICdhbnQtc2VnbWVudGVkLXRodW1iJzogdHJ1ZSwgJ2FudC1zZWdtZW50ZWQtdGh1bWItbW90aW9uJzogdHJ1ZSB9XCJcbiAgICAgICAgICBbQHRodW1iTW90aW9uXT1cImFuaW1hdGlvblN0YXRlXCJcbiAgICAgICAgICAoQHRodW1iTW90aW9uLmRvbmUpPVwiaGFuZGxlVGh1bWJBbmltYXRpb25Eb25lKCRldmVudClcIlxuICAgICAgICA+PC9kaXY+XG4gICAgICB9XG5cbiAgICAgIEBmb3IgKGl0ZW0gb2Ygbm9ybWFsaXplZE9wdGlvbnM7IHRyYWNrIGl0ZW07IGxldCBpID0gJGluZGV4KSB7XG4gICAgICAgIDxsYWJlbFxuICAgICAgICAgICNpdGVtTGFiZWxzXG4gICAgICAgICAgW25nQ2xhc3NdPVwie1xuICAgICAgICAgICAgJ2FudC1zZWdtZW50ZWQtaXRlbSc6IHRydWUsXG4gICAgICAgICAgICAnYW50LXNlZ21lbnRlZC1pdGVtLXNlbGVjdGVkJzogaSA9PT0gc2VsZWN0ZWRJbmRleCxcbiAgICAgICAgICAgICdhbnQtc2VnbWVudGVkLWl0ZW0tZGlzYWJsZWQnOiAhIW56RGlzYWJsZWQgfHwgaXRlbS5kaXNhYmxlZFxuICAgICAgICAgIH1cIlxuICAgICAgICA+XG4gICAgICAgICAgPGlucHV0IGNsYXNzPVwiYW50LXNlZ21lbnRlZC1pdGVtLWlucHV0XCIgdHlwZT1cInJhZGlvXCIgW2NoZWNrZWRdPVwiaSA9PT0gc2VsZWN0ZWRJbmRleFwiIC8+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImFudC1zZWdtZW50ZWQtaXRlbS1sYWJlbFwiIChjbGljayk9XCIhaXRlbS5kaXNhYmxlZCAmJiBoYW5kbGVPcHRpb25DbGljayhpKVwiPlxuICAgICAgICAgICAgQGlmIChpdGVtLmljb24pIHtcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJhbnQtc2VnbWVudGVkLWl0ZW0taWNvblwiPjxzcGFuIG56LWljb24gW256VHlwZV09XCJpdGVtLmljb25cIj48L3NwYW4+PC9zcGFuPlxuICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyXG4gICAgICAgICAgICAgICAgICAqbnpTdHJpbmdUZW1wbGF0ZU91dGxldD1cIml0ZW0udXNlVGVtcGxhdGUgJiYgbnpMYWJlbFRlbXBsYXRlOyBjb250ZXh0OiB7ICRpbXBsaWNpdDogaXRlbSwgaW5kZXg6IGkgfVwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge3sgaXRlbS5sYWJlbCB9fVxuICAgICAgICAgICAgICAgIDwvbmctY29udGFpbmVyPlxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICB9IEBlbHNlIHtcbiAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lclxuICAgICAgICAgICAgICAgICpuelN0cmluZ1RlbXBsYXRlT3V0bGV0PVwiaXRlbS51c2VUZW1wbGF0ZSAmJiBuekxhYmVsVGVtcGxhdGU7IGNvbnRleHQ6IHsgJGltcGxpY2l0OiBpdGVtLCBpbmRleDogaSB9XCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHt7IGl0ZW0ubGFiZWwgfX1cbiAgICAgICAgICAgICAgPC9uZy1jb250YWluZXI+XG4gICAgICAgICAgICB9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICB9XG4gICAgPC9kaXY+XG4gIGAsXG4gIGhvc3Q6IHtcbiAgICBjbGFzczogJ2FudC1zZWdtZW50ZWQnLFxuICAgICdbY2xhc3MuYW50LXNlZ21lbnRlZC1kaXNhYmxlZF0nOiAnISFuekRpc2FibGVkJyxcbiAgICAnW2NsYXNzLmFudC1zZWdtZW50ZWQtcnRsXSc6IGBkaXIgPT09ICdydGwnYCxcbiAgICAnW2NsYXNzLmFudC1zZWdtZW50ZWQtbGddJzogYG56U2l6ZSA9PT0gJ2xhcmdlJ2AsXG4gICAgJ1tjbGFzcy5hbnQtc2VnbWVudGVkLXNtXSc6IGBuelNpemUgPT09ICdzbWFsbCdgLFxuICAgICdbY2xhc3MuYW50LXNlZ21lbnRlZC1ibG9ja10nOiBgISFuekJsb2NrYFxuICB9LFxuICBwcm92aWRlcnM6IFt7IHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLCB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBOelNlZ21lbnRlZENvbXBvbmVudCksIG11bHRpOiB0cnVlIH1dLFxuICBhbmltYXRpb25zOiBbdGh1bWJNb3Rpb25dLFxuICBpbXBvcnRzOiBbTmdDbGFzcywgTnpJY29uTW9kdWxlLCBOek91dGxldE1vZHVsZV0sXG4gIHN0YW5kYWxvbmU6IHRydWVcbn0pXG5leHBvcnQgY2xhc3MgTnpTZWdtZW50ZWRDb21wb25lbnQgaW1wbGVtZW50cyBPbkNoYW5nZXMsIENvbnRyb2xWYWx1ZUFjY2Vzc29yIHtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX256RGlzYWJsZWQ6IEJvb2xlYW5JbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX256QmxvY2s6IEJvb2xlYW5JbnB1dDtcblxuICByZWFkb25seSBfbnpNb2R1bGVOYW1lOiBOekNvbmZpZ0tleSA9IE5aX0NPTkZJR19NT0RVTEVfTkFNRTtcblxuICBAVmlld0NoaWxkcmVuKCdpdGVtTGFiZWxzJywgeyByZWFkOiBFbGVtZW50UmVmIH0pIGxpc3RPZk9wdGlvbnMhOiBRdWVyeUxpc3Q8RWxlbWVudFJlZj47XG5cbiAgQElucHV0KClcbiAgQElucHV0Qm9vbGVhbigpXG4gIG56QmxvY2s6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBASW5wdXQoKVxuICBASW5wdXRCb29sZWFuKClcbiAgbnpEaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIEBJbnB1dCgpIG56T3B0aW9uczogTnpTZWdtZW50ZWRPcHRpb25zID0gW107XG5cbiAgQElucHV0KCkgQFdpdGhDb25maWcoKSBuelNpemU6IE56U2l6ZUxEU1R5cGUgPSAnZGVmYXVsdCc7XG5cbiAgQElucHV0KCkgbnpMYWJlbFRlbXBsYXRlOiBUZW1wbGF0ZVJlZjx7ICRpbXBsaWNpdDogTnpTZWdtZW50ZWRPcHRpb247IGluZGV4OiBudW1iZXIgfT4gfCBudWxsID0gbnVsbDtcblxuICBAT3V0cHV0KCkgcmVhZG9ubHkgbnpWYWx1ZUNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPigpO1xuXG4gIHB1YmxpYyBkaXI6IERpcmVjdGlvbiA9ICdsdHInO1xuXG4gIHB1YmxpYyBzZWxlY3RlZEluZGV4ID0gMDtcbiAgcHVibGljIHRyYW5zaXRpb25lZFRvSW5kZXggPSAtMTtcbiAgcHVibGljIGFuaW1hdGlvblN0YXRlOiBudWxsIHwgeyB2YWx1ZTogc3RyaW5nOyBwYXJhbXM6IFRodW1iQW5pbWF0aW9uUHJvcHMgfSA9IG51bGw7XG5cbiAgcHVibGljIG5vcm1hbGl6ZWRPcHRpb25zOiBOek5vcm1hbGl6ZWRPcHRpb25zID0gW107XG5cbiAgcHJpdmF0ZSBkZXN0cm95JCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgb25DaGFuZ2U6IE9uQ2hhbmdlVHlwZSA9ICgpID0+IHt9O1xuXG4gIG9uVG91Y2hlZDogT25Ub3VjaGVkVHlwZSA9ICgpID0+IHt9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZWFkb25seSBuekNvbmZpZ1NlcnZpY2U6IE56Q29uZmlnU2VydmljZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNkcjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSBkaXJlY3Rpb25hbGl0eTogRGlyZWN0aW9uYWxpdHlcbiAgKSB7XG4gICAgdGhpcy5kaXJlY3Rpb25hbGl0eS5jaGFuZ2U/LnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveSQpKS5zdWJzY3JpYmUoZGlyZWN0aW9uID0+IHtcbiAgICAgIHRoaXMuZGlyID0gZGlyZWN0aW9uO1xuICAgICAgdGhpcy5jZHIuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIH0pO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xuICAgIGNvbnN0IHsgbnpPcHRpb25zIH0gPSBjaGFuZ2VzO1xuICAgIGlmIChuek9wdGlvbnMpIHtcbiAgICAgIHRoaXMubm9ybWFsaXplZE9wdGlvbnMgPSBub3JtYWxpemVPcHRpb25zKG56T3B0aW9ucy5jdXJyZW50VmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZU9wdGlvbkNsaWNrKGluZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5uekRpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5jaGFuZ2VTZWxlY3RlZEluZGV4KGluZGV4KTtcblxuICAgIHRoaXMub25DaGFuZ2UoaW5kZXgpO1xuICAgIHRoaXMubnpWYWx1ZUNoYW5nZS5lbWl0KGluZGV4KTtcbiAgfVxuXG4gIGhhbmRsZVRodW1iQW5pbWF0aW9uRG9uZShlOiBOelNhZmVBbnkpOiB2b2lkIHtcbiAgICBpZiAoZS5mcm9tU3RhdGUgPT09ICdmcm9tJykge1xuICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gdGhpcy50cmFuc2l0aW9uZWRUb0luZGV4O1xuICAgICAgdGhpcy50cmFuc2l0aW9uZWRUb0luZGV4ID0gLTE7XG4gICAgICB0aGlzLmFuaW1hdGlvblN0YXRlID0gbnVsbDtcbiAgICAgIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgICB9XG4gIH1cblxuICB3cml0ZVZhbHVlKHZhbHVlOiBudW1iZXIgfCBudWxsKTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgdmFsdWUgPiAtMSkge1xuICAgICAgdGhpcy5jaGFuZ2VTZWxlY3RlZEluZGV4KHZhbHVlKTtcbiAgICAgIHRoaXMuY2RyLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxuXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46IE9uQ2hhbmdlVHlwZSk6IHZvaWQge1xuICAgIHRoaXMub25DaGFuZ2UgPSBmbjtcbiAgfVxuXG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiBPblRvdWNoZWRUeXBlKTogdm9pZCB7XG4gICAgdGhpcy5vblRvdWNoZWQgPSBmbjtcbiAgfVxuXG4gIHByaXZhdGUgY2hhbmdlU2VsZWN0ZWRJbmRleChpbmRleDogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmxpc3RPZk9wdGlvbnMgfHwgdGhpcy5zZWxlY3RlZEluZGV4ID09PSAtMSB8fCB0aGlzLnNlbGVjdGVkSW5kZXggPT09IGluZGV4KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5hbmltYXRpb25TdGF0ZSA9IHtcbiAgICAgIHZhbHVlOiAnZnJvbScsXG4gICAgICBwYXJhbXM6IGdldFRodW1iQW5pbWF0aW9uUHJvcHModGhpcy5saXN0T2ZPcHRpb25zLmdldCh0aGlzLnNlbGVjdGVkSW5kZXgpIS5uYXRpdmVFbGVtZW50ISlcbiAgICB9O1xuICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcblxuICAgIHRoaXMuYW5pbWF0aW9uU3RhdGUgPSB7XG4gICAgICB2YWx1ZTogJ3RvJyxcbiAgICAgIHBhcmFtczogZ2V0VGh1bWJBbmltYXRpb25Qcm9wcyh0aGlzLmxpc3RPZk9wdGlvbnMuZ2V0KGluZGV4KSEubmF0aXZlRWxlbWVudCEpXG4gICAgfTtcbiAgICB0aGlzLnRyYW5zaXRpb25lZFRvSW5kZXggPSBpbmRleDtcbiAgICB0aGlzLmNkci5kZXRlY3RDaGFuZ2VzKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0VGh1bWJBbmltYXRpb25Qcm9wcyhlbGVtZW50OiBIVE1MRWxlbWVudCk6IFRodW1iQW5pbWF0aW9uUHJvcHMge1xuICByZXR1cm4ge1xuICAgIHRyYW5zZm9ybTogZWxlbWVudC5vZmZzZXRMZWZ0LFxuICAgIHdpZHRoOiBlbGVtZW50LmNsaWVudFdpZHRoXG4gIH07XG59XG4iXX0=