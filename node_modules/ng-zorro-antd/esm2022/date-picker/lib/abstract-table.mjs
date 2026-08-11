/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { CandyDate } from 'ng-zorro-antd/core/time';
import * as i0 from "@angular/core";
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class AbstractTable {
    constructor() {
        this.headRow = [];
        this.bodyRows = [];
        this.MAX_ROW = 6;
        this.MAX_COL = 7;
        this.prefixCls = 'ant-picker';
        this.activeDate = new CandyDate();
        this.showWeek = false;
        this.selectedValue = []; // Range ONLY
        this.hoverValue = []; // Range ONLY
        this.canSelectWeek = false;
        this.valueChange = new EventEmitter();
        this.cellHover = new EventEmitter(); // Emitted when hover on a day by mouse enter
    }
    render() {
        if (this.activeDate) {
            this.headRow = this.makeHeadRow();
            this.bodyRows = this.makeBodyRows();
        }
    }
    hasRangeValue() {
        return this.selectedValue?.length > 0 || this.hoverValue?.length > 0;
    }
    getClassMap(cell) {
        return {
            [`ant-picker-cell`]: true,
            [`ant-picker-cell-in-view`]: true,
            [`ant-picker-cell-selected`]: cell.isSelected,
            [`ant-picker-cell-disabled`]: cell.isDisabled,
            [`ant-picker-cell-in-range`]: !!cell.isInSelectedRange,
            [`ant-picker-cell-range-start`]: !!cell.isSelectedStart,
            [`ant-picker-cell-range-end`]: !!cell.isSelectedEnd,
            [`ant-picker-cell-range-start-single`]: !!cell.isStartSingle,
            [`ant-picker-cell-range-end-single`]: !!cell.isEndSingle,
            [`ant-picker-cell-range-hover`]: !!cell.isInHoverRange,
            [`ant-picker-cell-range-hover-start`]: !!cell.isHoverStart,
            [`ant-picker-cell-range-hover-end`]: !!cell.isHoverEnd,
            [`ant-picker-cell-range-hover-edge-start`]: !!cell.isFirstCellInPanel,
            [`ant-picker-cell-range-hover-edge-end`]: !!cell.isLastCellInPanel,
            [`ant-picker-cell-range-start-near-hover`]: !!cell.isRangeStartNearHover,
            [`ant-picker-cell-range-end-near-hover`]: !!cell.isRangeEndNearHover
        };
    }
    ngOnInit() {
        this.render();
    }
    ngOnChanges(changes) {
        if (changes.activeDate && !changes.activeDate.currentValue) {
            this.activeDate = new CandyDate();
        }
        if (changes.disabledDate ||
            changes.locale ||
            changes.showWeek ||
            changes.selectWeek ||
            this.isDateRealChange(changes.activeDate) ||
            this.isDateRealChange(changes.value) ||
            this.isDateRealChange(changes.selectedValue) ||
            this.isDateRealChange(changes.hoverValue)) {
            this.render();
        }
    }
    isDateRealChange(change) {
        if (change) {
            const previousValue = change.previousValue;
            const currentValue = change.currentValue;
            if (Array.isArray(currentValue)) {
                return (!Array.isArray(previousValue) ||
                    currentValue.length !== previousValue.length ||
                    currentValue.some((value, index) => {
                        const previousCandyDate = previousValue[index];
                        return previousCandyDate instanceof CandyDate
                            ? previousCandyDate.isSameDay(value)
                            : previousCandyDate !== value;
                    }));
            }
            else {
                return !this.isSameDate(previousValue, currentValue);
            }
        }
        return false;
    }
    isSameDate(left, right) {
        return (!left && !right) || (left && right && right.isSameDay(left));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: AbstractTable, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.3.8", type: AbstractTable, inputs: { prefixCls: "prefixCls", value: "value", locale: "locale", activeDate: "activeDate", showWeek: "showWeek", selectedValue: "selectedValue", hoverValue: "hoverValue", disabledDate: "disabledDate", cellRender: "cellRender", fullCellRender: "fullCellRender", canSelectWeek: "canSelectWeek" }, outputs: { valueChange: "valueChange", cellHover: "cellHover" }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: AbstractTable, decorators: [{
            type: Directive
        }], propDecorators: { prefixCls: [{
                type: Input
            }], value: [{
                type: Input
            }], locale: [{
                type: Input
            }], activeDate: [{
                type: Input
            }], showWeek: [{
                type: Input
            }], selectedValue: [{
                type: Input
            }], hoverValue: [{
                type: Input
            }], disabledDate: [{
                type: Input
            }], cellRender: [{
                type: Input
            }], fullCellRender: [{
                type: Input
            }], canSelectWeek: [{
                type: Input
            }], valueChange: [{
                type: Output
            }], cellHover: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3QtdGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9jb21wb25lbnRzL2RhdGUtcGlja2VyL2xpYi9hYnN0cmFjdC10YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxPQUFPLEVBQ0wsU0FBUyxFQUNULFlBQVksRUFDWixLQUFLLEVBR0wsTUFBTSxFQUlQLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQzs7QUFPcEQsa0VBQWtFO0FBQ2xFLE1BQU0sT0FBZ0IsYUFBYTtJQUZuQztRQUdFLFlBQU8sR0FBZSxFQUFFLENBQUM7UUFDekIsYUFBUSxHQUFrQixFQUFFLENBQUM7UUFDN0IsWUFBTyxHQUFHLENBQUMsQ0FBQztRQUNaLFlBQU8sR0FBRyxDQUFDLENBQUM7UUFFSCxjQUFTLEdBQVcsWUFBWSxDQUFDO1FBR2pDLGVBQVUsR0FBYyxJQUFJLFNBQVMsRUFBRSxDQUFDO1FBQ3hDLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFDMUIsa0JBQWEsR0FBZ0IsRUFBRSxDQUFDLENBQUMsYUFBYTtRQUM5QyxlQUFVLEdBQWdCLEVBQUUsQ0FBQyxDQUFDLGFBQWE7UUFJM0Msa0JBQWEsR0FBWSxLQUFLLENBQUM7UUFFckIsZ0JBQVcsR0FBRyxJQUFJLFlBQVksRUFBYSxDQUFDO1FBQzVDLGNBQVMsR0FBRyxJQUFJLFlBQVksRUFBYSxDQUFDLENBQUMsNkNBQTZDO0tBdUY1RztJQXJGVyxNQUFNO1FBQ2QsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDdEMsQ0FBQztJQUNILENBQUM7SUFJRCxhQUFhO1FBQ1gsT0FBTyxJQUFJLENBQUMs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eSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2dpdGh1Yi5jb20vTkctWk9SUk8vbmctem9ycm8tYW50ZC9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKi9cblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBFdmVudEVtaXR0ZXIsXG4gIElucHV0LFxuICBPbkNoYW5nZXMsXG4gIE9uSW5pdCxcbiAgT3V0cHV0LFxuICBTaW1wbGVDaGFuZ2UsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIFRlbXBsYXRlUmVmXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBDYW5keURhdGUgfSBmcm9tICduZy16b3Jyby1hbnRkL2NvcmUvdGltZSc7XG5pbXBvcnQgeyBGdW5jdGlvblByb3AgfSBmcm9tICduZy16b3Jyby1hbnRkL2NvcmUvdHlwZXMnO1xuaW1wb3J0IHsgTnpDYWxlbmRhckkxOG5JbnRlcmZhY2UgfSBmcm9tICduZy16b3Jyby1hbnRkL2kxOG4nO1xuXG5pbXBvcnQgeyBEYXRlQm9keVJvdywgRGF0ZUNlbGwgfSBmcm9tICcuL2ludGVyZmFjZSc7XG5cbkBEaXJlY3RpdmUoKVxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEBhbmd1bGFyLWVzbGludC9kaXJlY3RpdmUtY2xhc3Mtc3VmZml4XG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQWJzdHJhY3RUYWJsZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzIHtcbiAgaGVhZFJvdzogRGF0ZUNlbGxbXSA9IFtdO1xuICBib2R5Um93czogRGF0ZUJvZHlSb3dbXSA9IFtdO1xuICBNQVhfUk9XID0gNjtcbiAgTUFYX0NPTCA9IDc7XG5cbiAgQElucHV0KCkgcHJlZml4Q2xzOiBzdHJpbmcgPSAnYW50LXBpY2tlcic7XG4gIEBJbnB1dCgpIHZhbHVlITogQ2FuZHlEYXRlO1xuICBASW5wdXQoKSBsb2NhbGUhOiBOekNhbGVuZGFySTE4bkludGVyZmFjZTtcbiAgQElucHV0KCkgYWN0aXZlRGF0ZTogQ2FuZHlEYXRlID0gbmV3IENhbmR5RGF0ZSgpO1xuICBASW5wdXQoKSBzaG93V2VlazogYm9vbGVhbiA9IGZhbHNlO1xuICBASW5wdXQoKSBzZWxlY3RlZFZhbHVlOiBDYW5keURhdGVbXSA9IFtdOyAvLyBSYW5nZSBPTkxZXG4gIEBJbnB1dCgpIGhvdmVyVmFsdWU6IENhbmR5RGF0ZVtdID0gW107IC8vIFJhbmdlIE9OTFlcbiAgQElucHV0KCkgZGlzYWJsZWREYXRlPzogKGQ6IERhdGUpID0+IGJvb2xlYW47XG4gIEBJbnB1dCgpIGNlbGxSZW5kZXI/OiBzdHJpbmcgfCBUZW1wbGF0ZVJlZjxEYXRlPiB8IEZ1bmN0aW9uUHJvcDxUZW1wbGF0ZVJlZjxEYXRlPiB8IHN0cmluZz47XG4gIEBJbnB1dCgpIGZ1bGxDZWxsUmVuZGVyPzogc3RyaW5nIHwgVGVtcGxhdGVSZWY8RGF0ZT4gfCBGdW5jdGlvblByb3A8VGVtcGxhdGVSZWY8RGF0ZT4gfCBzdHJpbmc+O1xuICBASW5wdXQoKSBjYW5TZWxlY3RXZWVrOiBib29sZWFuID0gZmFsc2U7XG5cbiAgQE91dHB1dCgpIHJlYWRvbmx5IHZhbHVlQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxDYW5keURhdGU+KCk7XG4gIEBPdXRwdXQoKSByZWFkb25seSBjZWxsSG92ZXIgPSBuZXcgRXZlbnRFbWl0dGVyPENhbmR5RGF0ZT4oKTsgLy8gRW1pdHRlZCB3aGVuIGhvdmVyIG9uIGEgZGF5IGJ5IG1vdXNlIGVudGVyXG5cbiAgcHJvdGVjdGVkIHJlbmRlcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5hY3RpdmVEYXRlKSB7XG4gICAgICB0aGlzLmhlYWRSb3cgPSB0aGlzLm1ha2VIZWFkUm93KCk7XG4gICAgICB0aGlzLmJvZHlSb3dzID0gdGhpcy5tYWtlQm9keVJvd3MoKTtcbiAgICB9XG4gIH1cblxuXG5cbiAgaGFzUmFuZ2VWYWx1ZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3RlZFZhbHVlPy5sZW5ndGggPiAwIHx8IHRoaXMuaG92ZXJWYWx1ZT8ubGVuZ3RoID4gMDtcbiAgfVxuXG4gIGdldENsYXNzTWFwKGNlbGw6IERhdGVDZWxsKTogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0ge1xuICAgIHJldHVybiB7XG4gICAgICBbYGFudC1waWNrZXItY2VsbGBdOiB0cnVlLFxuICAgICAgW2BhbnQtcGlja2VyLWNlbGwtaW4tdmlld2BdOiB0cnVlLFxuICAgICAgW2BhbnQtcGlja2VyLWNlbGwtc2VsZWN0ZWRgXTogY2VsbC5pc1NlbGVjdGVkLFxuICAgICAgW2BhbnQtcGlja2VyLWNlbGwtZGlzYWJsZWRgXTogY2VsbC5pc0Rpc2FibGVkLFxuICAgICAgW2BhbnQtcGlja2VyLWNlbGwtaW4tcmFuZ2VgXTogISFjZWxsLmlzSW5TZWxlY3RlZFJhbmdlLFxuICAgICAgW2BhbnQtcGlja2VyLWNlbGwtcmFuZ2Utc3RhcnRgXTogISFjZWxsLmlzU2VsZWN0ZWRTdGFydCxcbiAgICAgIFtgYW50LXBpY2tlci1jZWxsLXJhbmdlLWVuZGBdOiAhIWNlbGwuaXNTZWxlY3RlZEVuZCxcbiAgICAgIFtgYW50LXBpY2tlci1jZWxsLXJhbmdlLXN0YXJ0LXNpbmdsZWBdOiAhIWNlbGwuaXNTdGFydFNpbmdsZSxcbiAgICAgIFtgYW50LXBpY2tlci1jZWxsLXJhbmdlLWVuZC1zaW5nbGVgXTogISFjZWxsLmlzRW5kU2luZ2xlLFxuICAgICAgW2BhbnQtcGlja2VyLWNlbGwtcmFuZ2UtaG92ZXJgXTogISFjZWxsLmlzSW5Ib3ZlclJhbmdlLFxuICAgICAgW2BhbnQtcGlja2VyLWNlbGwtcmFuZ2UtaG92ZXItc3RhcnRgXTogISFjZWxsLmlzSG92ZXJTdGFydCxcbiAgICAgIFtgYW50LXBpY2tlci1jZWxsLXJhbmdlLWhvdmVyLWVuZGBdOiAhIWNlbGwuaXNIb3ZlckVuZCxcbiAgICAgIFtgYW50LXBpY2tlci1jZWxsLXJhbmdlLWhvdmVyLWVkZ2Utc3RhcnRgXTogISFjZWxsLmlzRmlyc3RDZWxsSW5QYW5lbCxcbiAgICAgIFtgYW50LXBpY2tlci1jZWxsLXJhbmdlLWhvdmVyLWVkZ2UtZW5kYF06ICEhY2VsbC5pc0xhc3RDZWxsSW5QYW5lbCxcbiAgICAgIFtgYW50LXBpY2tlci1jZWxsLXJhbmdlLXN0YXJ0LW5lYXItaG92ZXJgXTogISFjZWxsLmlzUmFuZ2VTdGFydE5lYXJIb3ZlcixcbiAgICAgIFtgYW50LXBpY2tlci1jZWxsLXJhbmdlLWVuZC1uZWFyLWhvdmVyYF06ICEhY2VsbC5pc1JhbmdlRW5kTmVhckhvdmVyXG4gICAgfTtcbiAgfVxuXG4gIGFic3RyYWN0IG1ha2VIZWFkUm93KCk6IERhdGVDZWxsW107XG4gIGFic3RyYWN0IG1ha2VCb2R5Um93cygpOiBEYXRlQm9keVJvd1tdO1xuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgaWYgKGNoYW5nZXMuYWN0aXZlRGF0ZSAmJiAhY2hhbmdlcy5hY3RpdmVEYXRlLmN1cnJlbnRWYWx1ZSkge1xuICAgICAgdGhpcy5hY3RpdmVEYXRlID0gbmV3IENhbmR5RGF0ZSgpO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIGNoYW5nZXMuZGlzYWJsZWREYXRlIHx8XG4gICAgICBjaGFuZ2VzLmxvY2FsZSB8fFxuICAgICAgY2hhbmdlcy5zaG93V2VlayB8fFxuICAgICAgY2hhbmdlcy5zZWxlY3RXZWVrIHx8XG4gICAgICB0aGlzLmlzRGF0ZVJlYWxDaGFuZ2UoY2hhbmdlcy5hY3RpdmVEYXRlKSB8fFxuICAgICAgdGhpcy5pc0RhdGVSZWFsQ2hhbmdlKGNoYW5nZXMudmFsdWUpIHx8XG4gICAgICB0aGlzLmlzRGF0ZVJlYWxDaGFuZ2UoY2hhbmdlcy5zZWxlY3RlZFZhbHVlKSB8fFxuICAgICAgdGhpcy5pc0RhdGVSZWFsQ2hhbmdlKGNoYW5nZXMuaG92ZXJWYWx1ZSlcbiAgICApIHtcbiAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBpc0RhdGVSZWFsQ2hhbmdlKGNoYW5nZTogU2ltcGxlQ2hhbmdlKTogYm9vbGVhbiB7XG4gICAgaWYgKGNoYW5nZSkge1xuICAgICAgY29uc3QgcHJldmlvdXNWYWx1ZTogQ2FuZHlEYXRlIHwgQ2FuZHlEYXRlW10gPSBjaGFuZ2UucHJldmlvdXNWYWx1ZTtcbiAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZTogQ2FuZHlEYXRlIHwgQ2FuZHlEYXRlW10gPSBjaGFuZ2UuY3VycmVudFZhbHVlO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY3VycmVudFZhbHVlKSkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICFBcnJheS5pc0FycmF5KHByZXZpb3VzVmFsdWUpIHx8XG4gICAgICAgICAgY3VycmVudFZhbHVlLmxlbmd0aCAhPT0gcHJldmlvdXNWYWx1ZS5sZW5ndGggfHxcbiAgICAgICAgICBjdXJyZW50VmFsdWUuc29tZSgodmFsdWUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcmV2aW91c0NhbmR5RGF0ZSA9IHByZXZpb3VzVmFsdWVbaW5kZXhdO1xuICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzQ2FuZHlEYXRlIGluc3RhbmNlb2YgQ2FuZHlEYXRlXG4gICAgICAgICAgICAgID8gcHJldmlvdXNDYW5keURhdGUuaXNTYW1lRGF5KHZhbHVlKVxuICAgICAgICAgICAgICA6IHByZXZpb3VzQ2FuZHlEYXRlICE9PSB2YWx1ZTtcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLmlzU2FtZURhdGUocHJldmlvdXNWYWx1ZSBhcyBDYW5keURhdGUsIGN1cnJlbnRWYWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgaXNTYW1lRGF0ZShsZWZ0OiBDYW5keURhdGUsIHJpZ2h0OiBDYW5keURhdGUpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKCFsZWZ0ICYmICFyaWdodCkgfHwgKGxlZnQgJiYgcmlnaHQgJiYgcmlnaHQuaXNTYW1lRGF5KGxlZnQpKTtcbiAgfVxufVxuIl19