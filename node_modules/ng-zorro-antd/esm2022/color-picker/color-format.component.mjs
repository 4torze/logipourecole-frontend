import { __decorate } from "tslib";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { InputBoolean } from 'ng-zorro-antd/core/util';
import { NzInputDirective, NzInputGroupComponent } from 'ng-zorro-antd/input';
import { NzInputNumberComponent } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { generateColor } from './src/util/util';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "ng-zorro-antd/select";
export class NzColorFormatComponent {
    validatorFn() {
        return (control) => {
            const REGEXP = /^[0-9a-fA-F]{6}$/;
            if (!control.value) {
                return { error: true };
            }
            else if (!REGEXP.test(control.value)) {
                return { error: true };
            }
            return null;
        };
    }
    constructor(formBuilder) {
        this.formBuilder = formBuilder;
        this.format = null;
        this.colorValue = '';
        this.clearColor = false;
        this.nzDisabledAlpha = false;
        this.formatChange = new EventEmitter();
        this.nzOnFormatChange = new EventEmitter();
        this.destroy$ = new Subject();
        this.formatterPercent = (value) => `${value} %`;
        this.parserPercent = (value) => value.replace(' %', '');
        this.validateForm = this.formBuilder.nonNullable.group({
            isFormat: this.formBuilder.control('hex'),
            hex: this.formBuilder.control('1677FF', this.validatorFn()),
            hsbH: 215,
            hsbS: 91,
            hsbB: 100,
            rgbR: 22,
            rgbG: 119,
            rgbB: 255,
            roundA: 100
        });
    }
    ngOnInit() {
        this.validateForm.valueChanges
            .pipe(filter(() => this.validateForm.valid), debounceTime(200), distinctUntilChanged((prev, current) => Object.keys(prev).every(key => prev[key] === current[key])), takeUntil(this.destroy$))
            .subscribe(value => {
            let color = '';
            switch (value.isFormat) {
                case 'hsb':
                    color = generateColor({
                        h: Number(value.hsbH),
                        s: Number(value.hsbS) / 100,
                        b: Number(value.hsbB) / 100,
                        a: Number(value.roundA) / 100
                    }).toHsbString();
                    break;
                case 'rgb':
                    color = generateColor({
                        r: Number(value.rgbR),
                        g: Number(value.rgbG),
                        b: Number(value.rgbB),
                        a: Number(value.roundA) / 100
                    }).toRgbString();
                    break;
                default:
                    const hex = generateColor(value.hex);
                    const hexColor = generateColor({
                        r: hex.r,
                        g: hex.g,
                        b: hex.b,
                        a: Number(value.roundA) / 100
                    });
                    color = hexColor.getAlpha() < 1 ? hexColor.toHex8String() : hexColor.toHexString();
                    break;
            }
            this.formatChange.emit({ color, format: value.isFormat || this.format || 'hex' });
        });
        this.validateForm
            .get('isFormat')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe(value => {
            this.nzOnFormatChange.emit(value);
        });
    }
    ngOnChanges(changes) {
        const { colorValue, format, clearColor } = changes;
        if (colorValue) {
            const colorValue = {
                hex: generateColor(this.colorValue).toHex(),
                hsbH: Math.round(generateColor(this.colorValue).toHsb().h),
                hsbS: Math.round(generateColor(this.colorValue).toHsb().s * 100),
                hsbB: Math.round(generateColor(this.colorValue).toHsb().b * 100),
                rgbR: Math.round(generateColor(this.colorValue).r),
                rgbG: Math.round(generateColor(this.colorValue).g),
                rgbB: Math.round(generateColor(this.colorValue).b),
                roundA: Math.round(generateColor(this.colorValue).roundA * 100)
            };
            this.validateForm.patchValue(colorValue);
        }
        if (format && this.format) {
            this.validateForm.get('isFormat')?.patchValue(this.format);
        }
        if (clearColor && this.clearColor) {
            this.validateForm.get('roundA')?.patchValue(0);
        }
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: NzColorFormatComponent, deps: [{ token: i1.FormBuilder }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "17.3.8", type: NzColorFormatComponent, isStandalone: true, selector: "nz-color-format", inputs: { format: "format", colorValue: "colorValue", clearColor: "clearColor", nzDisabledAlpha: "nzDisabledAlpha" }, outputs: { formatChange: "formatChange", nzOnFormatChange: "nzOnFormatChange" }, exportAs: ["NzColorFormat"], usesOnChanges: true, ngImport: i0, template: `
    <div [formGroup]="validateForm" class="ant-color-picker-input-container">
      <div class="ant-color-picker-format-select">
        <nz-select formControlName="isFormat" nzBorderless nzSize="small">
          <nz-option nzValue="hex" nzLabel="HEX" />
          <nz-option nzValue="hsb" nzLabel="HSB" />
          <nz-option nzValue="rgb" nzLabel="RGB" />
        </nz-select>
      </div>

      <div class="ant-color-picker-input">
        @switch (validateForm.controls.isFormat.value) {
          @case ('hex') {
            <div class="ant-color-picker-hex-input">
              <nz-input-group nzPrefix="#" nzSize="small">
                <input nz-input nzSize="small" formControlName="hex" />
              </nz-input-group>
            </div>
          }
          @case ('hsb') {
            <div class="ant-color-picker-hsb-input">
              <div class="ant-color-picker-steppers ant-color-picker-hsb-input">
                <nz-input-number
                  formControlName="hsbH"
                  [nzMin]="0"
                  [nzMax]="360"
                  [nzStep]="1"
                  [nzPrecision]="0"
                  nzSize="small"
                />
              </div>
              <div class="ant-color-picker-steppers ant-color-picker-hsb-input">
                <nz-input-number
                  formControlName="hsbS"
                  [nzMin]="0"
                  [nzMax]="100"
                  [nzStep]="1"
                  [nzFormatter]="formatterPercent"
                  [nzParser]="parserPercent"
                  nzSize="small"
                />
              </div>
              <div class="ant-color-picker-steppers ant-color-picker-hsb-input">
                <nz-input-number
                  formControlName="hsbB"
                  [nzMin]="0"
                  [nzMax]="100"
                  [nzStep]="1"
                  [nzFormatter]="formatterPercent"
                  [nzParser]="parserPercent"
                  nzSize="small"
                />
              </div>
            </div>
          }
          @default {
            <div class="ant-color-picker-rgb-input">
              <div class="ant-color-picker-steppers ant-color-picker-rgb-input">
                <nz-input-number formControlName="rgbR" [nzMin]="0" [nzMax]="255" [nzStep]="1" nzSize="small" />
              </div>
              <div class="ant-color-picker-steppers ant-color-picker-rgb-input">
                <nz-input-number formControlName="rgbG" [nzMin]="0" [nzMax]="255" [nzStep]="1" nzSize="small" />
              </div>
              <div class="ant-color-picker-steppers ant-color-picker-rgb-input">
                <nz-input-number formControlName="rgbB" [nzMin]="0" [nzMax]="255" [nzStep]="1" nzSize="small" />
              </div>
            </div>
          }
        }
      </div>

      @if (!nzDisabledAlpha) {
        <div class="ant-color-picker-steppers ant-color-picker-alpha-input">
          <nz-input-number
            formControlName="roundA"
            [nzMin]="0"
            [nzMax]="100"
            [nzStep]="1"
            [nzFormatter]="formatterPercent"
            [nzParser]="parserPercent"
            nzSize="small"
          />
        </div>
      }
    </div>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: ReactiveFormsModule }, { kind: "directive", type: i1.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i1.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1.NgControlStatusGroup, selector: "[formGroupName],[formArrayName],[ngModelGroup],[formGroup],form:not([ngNoForm]),[ngForm]" }, { kind: "directive", type: i1.FormGroupDirective, selector: "[formGroup]", inputs: ["formGroup"], outputs: ["ngSubmit"], exportAs: ["ngForm"] }, { kind: "directive", type: i1.FormControlName, selector: "[formControlName]", inputs: ["formControlName", "disabled", "ngModel"], outputs: ["ngModelChange"] }, { kind: "ngmodule", type: NzSelectModule }, { kind: "component", type: i2.NzOptionComponent, selector: "nz-option", inputs: ["nzTitle", "nzLabel", "nzValue", "nzKey", "nzDisabled", "nzHide", "nzCustomContent"], exportAs: ["nzOption"] }, { kind: "component", type: i2.NzSelectComponent, selector: "nz-select", inputs: ["nzId", "nzSize", "nzStatus", "nzOptionHeightPx", "nzOptionOverflowSize", "nzDropdownClassName", "nzDropdownMatchSelectWidth", "nzDropdownStyle", "nzNotFoundContent", "nzPlaceHolder", "nzPlacement", "nzMaxTagCount", "nzDropdownRender", "nzCustomTemplate", "nzSuffixIcon", "nzClearIcon", "nzRemoveIcon", "nzMenuItemSelectedIcon", "nzTokenSeparators", "nzMaxTagPlaceholder", "nzMaxMultipleCount", "nzMode", "nzFilterOption", "compareWith", "nzAllowClear", "nzBorderless", "nzShowSearch", "nzLoading", "nzAutoFocus", "nzAutoClearSearchValue", "nzServerSearch", "nzDisabled", "nzOpen", "nzSelectOnTab", "nzBackdrop", "nzOptions", "nzShowArrow"], outputs: ["nzOnSearch", "nzScrollToBottom", "nzOpenChange", "nzBlur", "nzFocus"], exportAs: ["nzSelect"] }, { kind: "directive", type: NzInputDirective, selector: "input[nz-input],textarea[nz-input]", inputs: ["nzBorderless", "nzSize", "nzStepperless", "nzStatus", "disabled"], exportAs: ["nzInput"] }, { kind: "component", type: NzInputGroupComponent, selector: "nz-input-group", inputs: ["nzAddOnBeforeIcon", "nzAddOnAfterIcon", "nzPrefixIcon", "nzSuffixIcon", "nzAddOnBefore", "nzAddOnAfter", "nzPrefix", "nzStatus", "nzSuffix", "nzSize", "nzSearch", "nzCompact"], exportAs: ["nzInputGroup"] }, { kind: "component", type: NzInputNumberComponent, selector: "nz-input-number", inputs: ["nzSize", "nzMin", "nzMax", "nzParser", "nzPrecision", "nzPrecisionMode", "nzPlaceHolder", "nzStatus", "nzStep", "nzInputMode", "nzId", "nzDisabled", "nzReadOnly", "nzAutoFocus", "nzBorderless", "nzFormatter"], outputs: ["nzBlur", "nzFocus"], exportAs: ["nzInputNumber"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
__decorate([
    InputBoolean()
], NzColorFormatComponent.prototype, "nzDisabledAlpha", void 0);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: NzColorFormatComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-color-format',
                    exportAs: 'NzColorFormat',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    standalone: true,
                    imports: [ReactiveFormsModule, NzSelectModule, NzInputDirective, NzInputGroupComponent, NzInputNumberComponent],
                    template: `
    <div [formGroup]="validateForm" class="ant-color-picker-input-container">
      <div class="ant-color-picker-format-select">
        <nz-select formControlName="isFormat" nzBorderless nzSize="small">
          <nz-option nzValue="hex" nzLabel="HEX" />
          <nz-option nzValue="hsb" nzLabel="HSB" />
          <nz-option nzValue="rgb" nzLabel="RGB" />
        </nz-select>
      </div>

      <div class="ant-color-picker-input">
        @switch (validateForm.controls.isFormat.value) {
          @case ('hex') {
            <div class="ant-color-picker-hex-input">
              <nz-input-group nzPrefix="#" nzSize="small">
                <input nz-input nzSize="small" formControlName="hex" />
              </nz-input-group>
            </div>
          }
          @case ('hsb') {
            <div class="ant-color-picker-hsb-input">
              <div class="ant-color-picker-steppers ant-color-picker-hsb-input">
                <nz-input-number
                  formControlName="hsbH"
                  [nzMin]="0"
                  [nzMax]="360"
                  [nzStep]="1"
                  [nzPrecision]="0"
                  nzSize="small"
                />
              </div>
              <div class="ant-color-picker-steppers ant-color-picker-hsb-input">
                <nz-input-number
                  formControlName="hsbS"
                  [nzMin]="0"
                  [nzMax]="100"
                  [nzStep]="1"
                  [nzFormatter]="formatterPercent"
                  [nzParser]="parserPercent"
                  nzSize="small"
                />
              </div>
              <div class="ant-color-picker-steppers ant-color-picker-hsb-input">
                <nz-input-number
                  formControlName="hsbB"
                  [nzMin]="0"
                  [nzMax]="100"
                  [nzStep]="1"
                  [nzFormatter]="formatterPercent"
                  [nzParser]="parserPercent"
                  nzSize="small"
                />
              </div>
            </div>
          }
          @default {
            <div class="ant-color-picker-rgb-input">
              <div class="ant-color-picker-steppers ant-color-picker-rgb-input">
                <nz-input-number formControlName="rgbR" [nzMin]="0" [nzMax]="255" [nzStep]="1" nzSize="small" />
              </div>
              <div class="ant-color-picker-steppers ant-color-picker-rgb-input">
                <nz-input-number formControlName="rgbG" [nzMin]="0" [nzMax]="255" [nzStep]="1" nzSize="small" />
              </div>
              <div class="ant-color-picker-steppers ant-color-picker-rgb-input">
                <nz-input-number formControlName="rgbB" [nzMin]="0" [nzMax]="255" [nzStep]="1" nzSize="small" />
              </div>
            </div>
          }
        }
      </div>

      @if (!nzDisabledAlpha) {
        <div class="ant-color-picker-steppers ant-color-picker-alpha-input">
          <nz-input-number
            formControlName="roundA"
            [nzMin]="0"
            [nzMax]="100"
            [nzStep]="1"
            [nzFormatter]="formatterPercent"
            [nzParser]="parserPercent"
            nzSize="small"
          />
        </div>
      }
    </div>
  `
                }]
        }], ctorParameters: () => [{ type: i1.FormBuilder }], propDecorators: { format: [{
                type: Input
            }], colorValue: [{
                type: Input
            }], clearColor: [{
                type: Input
            }], nzDisabledAlpha: [{
                type: Input
            }], formatChange: [{
                type: Output
            }], nzOnFormatChange: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3ItZm9ybWF0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2NvbXBvbmVudHMvY29sb3ItcGlja2VyL2NvbG9yLWZvcm1hdC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRztBQUVILE9BQU8sRUFDTCx1QkFBdUIsRUFDdkIsU0FBUyxFQUNULFlBQVksRUFDWixLQUFLLEVBSUwsTUFBTSxFQUVQLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFLTCxtQkFBbUIsRUFHcEIsTUFBTSxnQkFBZ0IsQ0FBQztBQUN4QixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQy9CLE9BQU8sRUFBRSxZQUFZLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXZGLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUM5RSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUNwRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFFdEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDOzs7O0FBZ0doRCxNQUFNLE9BQU8sc0JBQXNCO0lBVWpDLFdBQVc7UUFDVCxPQUFPLENBQUMsT0FBd0IsRUFBMkIsRUFBRTtZQUMzRCxNQUFNLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQztZQUNsQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNuQixPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDO1lBQ3pCLENBQUM7aUJBQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FB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Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxRlQ7aUJBQ0Y7Z0ZBRVUsTUFBTTtzQkFBZCxLQUFLO2dCQUNHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBQ0csVUFBVTtzQkFBbEIsS0FBSztnQkFDbUIsZUFBZTtzQkFBdkMsS0FBSztnQkFDYSxZQUFZO3NCQUE5QixNQUFNO2dCQUNZLGdCQUFnQjtzQkFBbEMsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9naXRodWIuY29tL05HLVpPUlJPL25nLXpvcnJvLWFudGQvYmxvYi9tYXN0ZXIvTElDRU5TRVxuICovXG5cbmltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDb21wb25lbnQsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5wdXQsXG4gIE9uQ2hhbmdlcyxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIE91dHB1dCxcbiAgU2ltcGxlQ2hhbmdlc1xufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIEFic3RyYWN0Q29udHJvbCxcbiAgRm9ybUJ1aWxkZXIsXG4gIEZvcm1Db250cm9sLFxuICBGb3JtR3JvdXAsXG4gIFJlYWN0aXZlRm9ybXNNb2R1bGUsXG4gIFZhbGlkYXRpb25FcnJvcnMsXG4gIFZhbGlkYXRvckZuXG59IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGRlYm91bmNlVGltZSwgZGlzdGluY3RVbnRpbENoYW5nZWQsIGZpbHRlciwgdGFrZVVudGlsIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQgeyBJbnB1dEJvb2xlYW4gfSBmcm9tICduZy16b3Jyby1hbnRkL2NvcmUvdXRpbCc7XG5pbXBvcnQgeyBOeklucHV0RGlyZWN0aXZlLCBOeklucHV0R3JvdXBDb21wb25lbnQgfSBmcm9tICduZy16b3Jyby1hbnRkL2lucHV0JztcbmltcG9ydCB7IE56SW5wdXROdW1iZXJDb21wb25lbnQgfSBmcm9tICduZy16b3Jyby1hbnRkL2lucHV0LW51bWJlcic7XG5pbXBvcnQgeyBOelNlbGVjdE1vZHVsZSB9IGZyb20gJ25nLXpvcnJvLWFudGQvc2VsZWN0JztcblxuaW1wb3J0IHsgZ2VuZXJhdGVDb2xvciB9IGZyb20gJy4vc3JjL3V0aWwvdXRpbCc7XG5pbXBvcnQgeyBOekNvbG9yUGlja2VyRm9ybWF0VHlwZSwgVmFsaWRGb3JtS2V5IH0gZnJvbSAnLi90eXBpbmdzJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbnotY29sb3ItZm9ybWF0JyxcbiAgZXhwb3J0QXM6ICdOekNvbG9yRm9ybWF0JyxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtSZWFjdGl2ZUZvcm1zTW9kdWxlLCBOelNlbGVjdE1vZHVsZSwgTnpJbnB1dERpcmVjdGl2ZSwgTnpJbnB1dEdyb3VwQ29tcG9uZW50LCBOeklucHV0TnVtYmVyQ29tcG9uZW50XSxcbiAgdGVtcGxhdGU6IGBcbiAgICA8ZGl2IFtmb3JtR3JvdXBdPVwidmFsaWRhdGVGb3JtXCIgY2xhc3M9XCJhbnQtY29sb3ItcGlja2VyLWlucHV0LWNvbnRhaW5lclwiPlxuICAgICAgPGRpdiBjbGFzcz1cImFudC1jb2xvci1waWNrZXItZm9ybWF0LXNlbGVjdFwiPlxuICAgICAgICA8bnotc2VsZWN0IGZvcm1Db250cm9sTmFtZT1cImlzRm9ybWF0XCIgbnpCb3JkZXJsZXNzIG56U2l6ZT1cInNtYWxsXCI+XG4gICAgICAgICAgPG56LW9wdGlvbiBuelZhbHVlPVwiaGV4XCIgbnpMYWJlbD1cIkhFWFwiIC8+XG4gICAgICAgICAgPG56LW9wdGlvbiBuelZhbHVlPVwiaHNiXCIgbnpMYWJlbD1cIkhTQlwiIC8+XG4gICAgICAgICAgPG56LW9wdGlvbiBuelZhbHVlPVwicmdiXCIgbnpMYWJlbD1cIlJHQlwiIC8+XG4gICAgICAgIDwvbnotc2VsZWN0PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJhbnQtY29sb3ItcGlja2VyLWlucHV0XCI+XG4gICAgICAgIEBzd2l0Y2ggKHZhbGlkYXRlRm9ybS5jb250cm9scy5pc0Zvcm1hdC52YWx1ZSkge1xuICAgICAgICAgIEBjYXNlICgnaGV4Jykge1xuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFudC1jb2xvci1waWNrZXItaGV4LWlucHV0XCI+XG4gICAgICAgICAgICAgIDxuei1pbnB1dC1ncm91cCBuelByZWZpeD1cIiNcIiBuelNpemU9XCJzbWFsbFwiPlxuICAgICAgICAgICAgICAgIDxpbnB1dCBuei1pbnB1dCBuelNpemU9XCJzbWFsbFwiIGZvcm1Db250cm9sTmFtZT1cImhleFwiIC8+XG4gICAgICAgICAgICAgIDwvbnotaW5wdXQtZ3JvdXA+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB9XG4gICAgICAgICAgQGNhc2UgKCdoc2InKSB7XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYW50LWNvbG9yLXBpY2tlci1oc2ItaW5wdXRcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFudC1jb2xvci1waWNrZXItc3RlcHBlcnMgYW50LWNvbG9yLXBpY2tlci1oc2ItaW5wdXRcIj5cbiAgICAgICAgICAgICAgICA8bnotaW5wdXQtbnVtYmVyXG4gICAgICAgICAgICAgICAgICBmb3JtQ29udHJvbE5hbWU9XCJoc2JIXCJcbiAgICAgICAgICAgICAgICAgIFtuek1pbl09XCIwXCJcbiAgICAgICAgICAgICAgICAgIFtuek1heF09XCIzNjBcIlxuICAgICAgICAgICAgICAgICAgW256U3RlcF09XCIxXCJcbiAgICAgICAgICAgICAgICAgIFtuelByZWNpc2lvbl09XCIwXCJcbiAgICAgICAgICAgICAgICAgIG56U2l6ZT1cInNtYWxsXCJcbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFudC1jb2xvci1waWNrZXItc3RlcHBlcnMgYW50LWNvbG9yLXBpY2tlci1oc2ItaW5wdXRcIj5cbiAgICAgICAgICAgICAgICA8bnotaW5wdXQtbnVtYmVyXG4gICAgICAgICAgICAgICAgICBmb3JtQ29udHJvbE5hbWU9XCJoc2JTXCJcbiAgICAgICAgICAgICAgICAgIFtuek1pbl09XCIwXCJcbiAgICAgICAgICAgICAgICAgIFtuek1heF09XCIxMDBcIlxuICAgICAgICAgICAgICAgICAgW256U3RlcF09XCIxXCJcbiAgICAgICAgICAgICAgICAgIFtuekZvcm1hdHRlcl09XCJmb3JtYXR0ZXJQZXJjZW50XCJcbiAgICAgICAgICAgICAgICAgIFtuelBhcnNlcl09XCJwYXJzZXJQZXJjZW50XCJcbiAgICAgICAgICAgICAgICAgIG56U2l6ZT1cInNtYWxsXCJcbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFudC1jb2xvci1waWNrZXItc3RlcHBlcnMgYW50LWNvbG9yLXBpY2tlci1oc2ItaW5wdXRcIj5cbiAgICAgICAgICAgICAgICA8bnotaW5wdXQtbnVtYmVyXG4gICAgICAgICAgICAgICAgICBmb3JtQ29udHJvbE5hbWU9XCJoc2JCXCJcbiAgICAgICAgICAgICAgICAgIFtuek1pbl09XCIwXCJcbiAgICAgICAgICAgICAgICAgIFtuek1heF09XCIxMDBcIlxuICAgICAgICAgICAgICAgICAgW256U3RlcF09XCIxXCJcbiAgICAgICAgICAgICAgICAgIFtuekZvcm1hdHRlcl09XCJmb3JtYXR0ZXJQZXJjZW50XCJcbiAgICAgICAgICAgICAgICAgIFtuelBhcnNlcl09XCJwYXJzZXJQZXJjZW50XCJcbiAgICAgICAgICAgICAgICAgIG56U2l6ZT1cInNtYWxsXCJcbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIH1cbiAgICAgICAgICBAZGVmYXVsdCB7XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYW50LWNvbG9yLXBpY2tlci1yZ2ItaW5wdXRcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFudC1jb2xvci1waWNrZXItc3RlcHBlcnMgYW50LWNvbG9yLXBpY2tlci1yZ2ItaW5wdXRcIj5cbiAgICAgICAgICAgICAgICA8bnotaW5wdXQtbnVtYmVyIGZvcm1Db250cm9sTmFtZT1cInJnYlJcIiBbbnpNaW5dPVwiMFwiIFtuek1heF09XCIyNTVcIiBbbnpTdGVwXT1cIjFcIiBuelNpemU9XCJzbWFsbFwiIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYW50LWNvbG9yLXBpY2tlci1zdGVwcGVycyBhbnQtY29sb3ItcGlja2VyLXJnYi1pbnB1dFwiPlxuICAgICAgICAgICAgICAgIDxuei1pbnB1dC1udW1iZXIgZm9ybUNvbnRyb2xOYW1lPVwicmdiR1wiIFtuek1pbl09XCIwXCIgW256TWF4XT1cIjI1NVwiIFtuelN0ZXBdPVwiMVwiIG56U2l6ZT1cInNtYWxsXCIgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhbnQtY29sb3ItcGlja2VyLXN0ZXBwZXJzIGFudC1jb2xvci1waWNrZXItcmdiLWlucHV0XCI+XG4gICAgICAgICAgICAgICAgPG56LWlucHV0LW51bWJlciBmb3JtQ29udHJvbE5hbWU9XCJyZ2JCXCIgW256TWluXT1cIjBcIiBbbnpNYXhdPVwiMjU1XCIgW256U3RlcF09XCIxXCIgbnpTaXplPVwic21hbGxcIiAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgPC9kaXY+XG5cbiAgICAgIEBpZiAoIW56RGlzYWJsZWRBbHBoYSkge1xuICAgICAgICA8ZGl2IGNsYXNzPVwiYW50LWNvbG9yLXBpY2tlci1zdGVwcGVycyBhbnQtY29sb3ItcGlja2VyLWFscGhhLWlucHV0XCI+XG4gICAgICAgICAgPG56LWlucHV0LW51bWJlclxuICAgICAgICAgICAgZm9ybUNvbnRyb2xOYW1lPVwicm91bmRBXCJcbiAgICAgICAgICAgIFtuek1pbl09XCIwXCJcbiAgICAgICAgICAgIFtuek1heF09XCIxMDBcIlxuICAgICAgICAgICAgW256U3RlcF09XCIxXCJcbiAgICAgICAgICAgIFtuekZvcm1hdHRlcl09XCJmb3JtYXR0ZXJQZXJjZW50XCJcbiAgICAgICAgICAgIFtuelBhcnNlcl09XCJwYXJzZXJQZXJjZW50XCJcbiAgICAgICAgICAgIG56U2l6ZT1cInNtYWxsXCJcbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIH1cbiAgICA8L2Rpdj5cbiAgYFxufSlcbmV4cG9ydCBjbGFzcyBOekNvbG9yRm9ybWF0Q29tcG9uZW50IGltcGxlbWVudHMgT25DaGFuZ2VzLCBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGZvcm1hdDogTnpDb2xvclBpY2tlckZvcm1hdFR5cGUgfCBudWxsID0gbnVsbDtcbiAgQElucHV0KCkgY29sb3JWYWx1ZTogc3RyaW5nID0gJyc7XG4gIEBJbnB1dCgpIGNsZWFyQ29sb3I6IGJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgQElucHV0Qm9vbGVhbigpIG56RGlzYWJsZWRBbHBoYTogYm9vbGVhbiA9IGZhbHNlO1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgZm9ybWF0Q2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjx7IGNvbG9yOiBzdHJpbmc7IGZvcm1hdDogTnpDb2xvclBpY2tlckZvcm1hdFR5cGUgfT4oKTtcbiAgQE91dHB1dCgpIHJlYWRvbmx5IG56T25Gb3JtYXRDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPE56Q29sb3JQaWNrZXJGb3JtYXRUeXBlPigpO1xuXG4gIHByaXZhdGUgZGVzdHJveSQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIHZhbGlkYXRvckZuKCk6IFZhbGlkYXRvckZuIHtcbiAgICByZXR1cm4gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsID0+IHtcbiAgICAgIGNvbnN0IFJFR0VYUCA9IC9eWzAtOWEtZkEtRl17Nn0kLztcbiAgICAgIGlmICghY29udHJvbC52YWx1ZSkge1xuICAgICAgICByZXR1cm4geyBlcnJvcjogdHJ1ZSB9O1xuICAgICAgfSBlbHNlIGlmICghUkVHRVhQLnRlc3QoY29udHJvbC52YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHsgZXJyb3I6IHRydWUgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG4gIH1cblxuICB2YWxpZGF0ZUZvcm06IEZvcm1Hcm91cDx7XG4gICAgaXNGb3JtYXQ6IEZvcm1Db250cm9sPE56Q29sb3JQaWNrZXJGb3JtYXRUeXBlIHwgbnVsbD47XG4gICAgaGV4OiBGb3JtQ29udHJvbDxzdHJpbmcgfCBudWxsPjtcbiAgICBoc2JIOiBGb3JtQ29udHJvbDxudW1iZXI+O1xuICAgIGhzYlM6IEZvcm1Db250cm9sPG51bWJlcj47XG4gICAgaHNiQjogRm9ybUNvbnRyb2w8bnVtYmVyPjtcbiAgICByZ2JSOiBGb3JtQ29udHJvbDxudW1iZXI+O1xuICAgIHJnYkc6IEZvcm1Db250cm9sPG51bWJlcj47XG4gICAgcmdiQjogRm9ybUNvbnRyb2w8bnVtYmVyPjtcbiAgICByb3VuZEE6IEZvcm1Db250cm9sPG51bWJlcj47XG4gIH0+O1xuXG4gIGZvcm1hdHRlclBlcmNlbnQgPSAodmFsdWU6IG51bWJlcik6IHN0cmluZyA9PiBgJHt2YWx1ZX0gJWA7XG4gIHBhcnNlclBlcmNlbnQgPSAodmFsdWU6IHN0cmluZyk6IHN0cmluZyA9PiB2YWx1ZS5yZXBsYWNlKCcgJScsICcnKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGZvcm1CdWlsZGVyOiBGb3JtQnVpbGRlcikge1xuICAgIHRoaXMudmFsaWRhdGVGb3JtID0gdGhpcy5mb3JtQnVpbGRlci5ub25OdWxsYWJsZS5ncm91cCh7XG4gICAgICBpc0Zvcm1hdDogdGhpcy5mb3JtQnVpbGRlci5jb250cm9sPE56Q29sb3JQaWNrZXJGb3JtYXRUeXBlPignaGV4JyksXG4gICAgICBoZXg6IHRoaXMuZm9ybUJ1aWxkZXIuY29udHJvbDxzdHJpbmc+KCcxNjc3RkYnLCB0aGlzLnZhbGlkYXRvckZuKCkpLFxuICAgICAgaHNiSDogMjE1LFxuICAgICAgaHNiUzogOTEsXG4gICAgICBoc2JCOiAxMDAsXG4gICAgICByZ2JSOiAyMixcbiAgICAgIHJnYkc6IDExOSxcbiAgICAgIHJnYkI6IDI1NSxcbiAgICAgIHJvdW5kQTogMTAwXG4gICAgfSk7XG4gIH1cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLnZhbGlkYXRlRm9ybS52YWx1ZUNoYW5nZXNcbiAgICAgIC5waXBlKFxuICAgICAgICBmaWx0ZXIoKCkgPT4gdGhpcy52YWxpZGF0ZUZvcm0udmFsaWQpLFxuICAgICAgICBkZWJvdW5jZVRpbWUoMjAwKSxcbiAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKHByZXYsIGN1cnJlbnQpID0+XG4gICAgICAgICAgT2JqZWN0LmtleXMocHJldikuZXZlcnkoa2V5ID0+IHByZXZba2V5IGFzIFZhbGlkRm9ybUtleV0gPT09IGN1cnJlbnRba2V5IGFzIFZhbGlkRm9ybUtleV0pXG4gICAgICAgICksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKVxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSh2YWx1ZSA9PiB7XG4gICAgICAgIGxldCBjb2xvciA9ICcnO1xuICAgICAgICBzd2l0Y2ggKHZhbHVlLmlzRm9ybWF0KSB7XG4gICAgICAgICAgY2FzZSAnaHNiJzpcbiAgICAgICAgICAgIGNvbG9yID0gZ2VuZXJhdGVDb2xvcih7XG4gICAgICAgICAgICAgIGg6IE51bWJlcih2YWx1ZS5oc2JIKSxcbiAgICAgICAgICAgICAgczogTnVtYmVyKHZhbHVlLmhzYlMpIC8gMTAwLFxuICAgICAgICAgICAgICBiOiBOdW1iZXIodmFsdWUuaHNiQikgLyAxMDAsXG4gICAgICAgICAgICAgIGE6IE51bWJlcih2YWx1ZS5yb3VuZEEpIC8gMTAwXG4gICAgICAgICAgICB9KS50b0hzYlN0cmluZygpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAncmdiJzpcbiAgICAgICAgICAgIGNvbG9yID0gZ2VuZXJhdGVDb2xvcih7XG4gICAgICAgICAgICAgIHI6IE51bWJlcih2YWx1ZS5yZ2JSKSxcbiAgICAgICAgICAgICAgZzogTnVtYmVyKHZhbHVlLnJnYkcpLFxuICAgICAgICAgICAgICBiOiBOdW1iZXIodmFsdWUucmdiQiksXG4gICAgICAgICAgICAgIGE6IE51bWJlcih2YWx1ZS5yb3VuZEEpIC8gMTAwXG4gICAgICAgICAgICB9KS50b1JnYlN0cmluZygpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGNvbnN0IGhleCA9IGdlbmVyYXRlQ29sb3IodmFsdWUuaGV4IGFzIE56Q29sb3JQaWNrZXJGb3JtYXRUeXBlKTtcbiAgICAgICAgICAgIGNvbnN0IGhleENvbG9yID0gZ2VuZXJhdGVDb2xvcih7XG4gICAgICAgICAgICAgIHI6IGhleC5yLFxuICAgICAgICAgICAgICBnOiBoZXguZyxcbiAgICAgICAgICAgICAgYjogaGV4LmIsXG4gICAgICAgICAgICAgIGE6IE51bWJlcih2YWx1ZS5yb3VuZEEpIC8gMTAwXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbG9yID0gaGV4Q29sb3IuZ2V0QWxwaGEoKSA8IDEgPyBoZXhDb2xvci50b0hleDhTdHJpbmcoKSA6IGhleENvbG9yLnRvSGV4U3RyaW5nKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZvcm1hdENoYW5nZS5lbWl0KHsgY29sb3IsIGZvcm1hdDogdmFsdWUuaXNGb3JtYXQgfHwgdGhpcy5mb3JtYXQgfHwgJ2hleCcgfSk7XG4gICAgICB9KTtcblxuICAgIHRoaXMudmFsaWRhdGVGb3JtXG4gICAgICAuZ2V0KCdpc0Zvcm1hdCcpXG4gICAgICA/LnZhbHVlQ2hhbmdlcy5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKSlcbiAgICAgIC5zdWJzY3JpYmUodmFsdWUgPT4ge1xuICAgICAgICB0aGlzLm56T25Gb3JtYXRDaGFuZ2UuZW1pdCh2YWx1ZSBhcyBOekNvbG9yUGlja2VyRm9ybWF0VHlwZSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbG9yVmFsdWUsIGZvcm1hdCwgY2xlYXJDb2xvciB9ID0gY2hhbmdlcztcbiAgICBpZiAoY29sb3JWYWx1ZSkge1xuICAgICAgY29uc3QgY29sb3JWYWx1ZSA9IHtcbiAgICAgICAgaGV4OiBnZW5lcmF0ZUNvbG9yKHRoaXMuY29sb3JWYWx1ZSkudG9IZXgoKSxcbiAgICAgICAgaHNiSDogTWF0aC5yb3VuZChnZW5lcmF0ZUNvbG9yKHRoaXMuY29sb3JWYWx1ZSkudG9Ic2IoKS5oKSxcbiAgICAgICAgaHNiUzogTWF0aC5yb3VuZChnZW5lcmF0ZUNvbG9yKHRoaXMuY29sb3JWYWx1ZSkudG9Ic2IoKS5zICogMTAwKSxcbiAgICAgICAgaHNiQjogTWF0aC5yb3VuZChnZW5lcmF0ZUNvbG9yKHRoaXMuY29sb3JWYWx1ZSkudG9Ic2IoKS5iICogMTAwKSxcbiAgICAgICAgcmdiUjogTWF0aC5yb3VuZChnZW5lcmF0ZUNvbG9yKHRoaXMuY29sb3JWYWx1ZSkuciksXG4gICAgICAgIHJnYkc6IE1hdGgucm91bmQoZ2VuZXJhdGVDb2xvcih0aGlzLmNvbG9yVmFsdWUpLmcpLFxuICAgICAgICByZ2JCOiBNYXRoLnJvdW5kKGdlbmVyYXRlQ29sb3IodGhpcy5jb2xvclZhbHVlKS5iKSxcbiAgICAgICAgcm91bmRBOiBNYXRoLnJvdW5kKGdlbmVyYXRlQ29sb3IodGhpcy5jb2xvclZhbHVlKS5yb3VuZEEgKiAxMDApXG4gICAgICB9O1xuICAgICAgdGhpcy52YWxpZGF0ZUZvcm0ucGF0Y2hWYWx1ZShjb2xvclZhbHVlKTtcbiAgICB9XG5cbiAgICBpZiAoZm9ybWF0ICYmIHRoaXMuZm9ybWF0KSB7XG4gICAgICB0aGlzLnZhbGlkYXRlRm9ybS5nZXQoJ2lzRm9ybWF0Jyk/LnBhdGNoVmFsdWUodGhpcy5mb3JtYXQpO1xuICAgIH1cblxuICAgIGlmIChjbGVhckNvbG9yICYmIHRoaXMuY2xlYXJDb2xvcikge1xuICAgICAgdGhpcy52YWxpZGF0ZUZvcm0uZ2V0KCdyb3VuZEEnKT8ucGF0Y2hWYWx1ZSgwKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlc3Ryb3kkLm5leHQoKTtcbiAgICB0aGlzLmRlc3Ryb3kkLmNvbXBsZXRlKCk7XG4gIH1cbn1cbiJdfQ==