import { __decorate } from "tslib";
import { NgStyle, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ContentChild, ContentChildren, Input, Optional, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WithConfig } from 'ng-zorro-antd/core/config';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { InputBoolean } from 'ng-zorro-antd/core/util';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzCardGridDirective } from './card-grid.directive';
import { NzCardTabComponent } from './card-tab.component';
import * as i0 from "@angular/core";
import * as i1 from "ng-zorro-antd/core/config";
import * as i2 from "@angular/cdk/bidi";
import * as i3 from "ng-zorro-antd/core/outlet";
import * as i4 from "ng-zorro-antd/skeleton";
const NZ_CONFIG_MODULE_NAME = 'card';
export class NzCardComponent {
    constructor(nzConfigService, cdr, directionality) {
        this.nzConfigService = nzConfigService;
        this.cdr = cdr;
        this.directionality = directionality;
        this._nzModuleName = NZ_CONFIG_MODULE_NAME;
        this.nzBordered = true;
        this.nzBorderless = false;
        this.nzLoading = false;
        this.nzHoverable = false;
        this.nzBodyStyle = null;
        this.nzActions = [];
        this.nzType = null;
        this.nzSize = 'default';
        this.dir = 'ltr';
        this.destroy$ = new Subject();
        this.nzConfigService
            .getConfigChangeEventForComponent(NZ_CONFIG_MODULE_NAME)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
            this.cdr.markForCheck();
        });
    }
    ngOnInit() {
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
            this.cdr.detectChanges();
        });
        this.dir = this.directionality.value;
    }
    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: NzCardComponent, deps: [{ token: i1.NzConfigService }, { token: i0.ChangeDetectorRef }, { token: i2.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "17.3.8", type: NzCardComponent, isStandalone: true, selector: "nz-card", inputs: { nzBordered: "nzBordered", nzBorderless: "nzBorderless", nzLoading: "nzLoading", nzHoverable: "nzHoverable", nzBodyStyle: "nzBodyStyle", nzCover: "nzCover", nzActions: "nzActions", nzType: "nzType", nzSize: "nzSize", nzTitle: "nzTitle", nzExtra: "nzExtra" }, host: { properties: { "class.ant-card-loading": "nzLoading", "class.ant-card-bordered": "nzBorderless === false && nzBordered", "class.ant-card-hoverable": "nzHoverable", "class.ant-card-small": "nzSize === \"small\"", "class.ant-card-contain-grid": "listOfNzCardGridDirective && listOfNzCardGridDirective.length", "class.ant-card-type-inner": "nzType === \"inner\"", "class.ant-card-contain-tabs": "!!listOfNzCardTabComponent", "class.ant-card-rtl": "dir === 'rtl'" }, classAttribute: "ant-card" }, queries: [{ propertyName: "listOfNzCardTabComponent", first: true, predicate: NzCardTabComponent, descendants: true }, { propertyName: "listOfNzCardGridDirective", predicate: NzCardGridDirective }], exportAs: ["nzCard"], ngImport: i0, template: `
    @if (nzTitle || nzExtra || listOfNzCardTabComponent) {
      <div class="ant-card-head">
        <div class="ant-card-head-wrapper">
          @if (nzTitle) {
            <div class="ant-card-head-title">
              <ng-container *nzStringTemplateOutlet="nzTitle">{{ nzTitle }}</ng-container>
            </div>
          }
          @if (nzExtra) {
            <div class="ant-card-extra">
              <ng-container *nzStringTemplateOutlet="nzExtra">{{ nzExtra }}</ng-container>
            </div>
          }
        </div>
        @if (listOfNzCardTabComponent) {
          <ng-template [ngTemplateOutlet]="listOfNzCardTabComponent.template" />
        }
      </div>
    }

    @if (nzCover) {
      <div class="ant-card-cover">
        <ng-template [ngTemplateOutlet]="nzCover" />
      </div>
    }

    <div class="ant-card-body" [ngStyle]="nzBodyStyle">
      @if (nzLoading) {
        <nz-skeleton [nzActive]="true" [nzTitle]="false" [nzParagraph]="{ rows: 4 }"></nz-skeleton>
      } @else {
        <ng-content />
      }
    </div>
    @if (nzActions.length) {
      <ul class="ant-card-actions">
        @for (action of nzActions; track $index) {
          <li [style.width.%]="100 / nzActions.length">
            <span><ng-template [ngTemplateOutlet]="action" /></span>
          </li>
        }
      </ul>
    }
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i3.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "ngmodule", type: NzSkeletonModule }, { kind: "component", type: i4.NzSkeletonComponent, selector: "nz-skeleton", inputs: ["nzActive", "nzLoading", "nzRound", "nzTitle", "nzAvatar", "nzParagraph"], exportAs: ["nzSkeleton"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
__decorate([
    WithConfig(),
    InputBoolean()
], NzCardComponent.prototype, "nzBordered", void 0);
__decorate([
    WithConfig(),
    InputBoolean()
], NzCardComponent.prototype, "nzBorderless", void 0);
__decorate([
    InputBoolean()
], NzCardComponent.prototype, "nzLoading", void 0);
__decorate([
    WithConfig(),
    InputBoolean()
], NzCardComponent.prototype, "nzHoverable", void 0);
__decorate([
    WithConfig()
], NzCardComponent.prototype, "nzSize", void 0);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.8", ngImport: i0, type: NzCardComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-card',
                    exportAs: 'nzCard',
                    preserveWhitespaces: false,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    template: `
    @if (nzTitle || nzExtra || listOfNzCardTabComponent) {
      <div class="ant-card-head">
        <div class="ant-card-head-wrapper">
          @if (nzTitle) {
            <div class="ant-card-head-title">
              <ng-container *nzStringTemplateOutlet="nzTitle">{{ nzTitle }}</ng-container>
            </div>
          }
          @if (nzExtra) {
            <div class="ant-card-extra">
              <ng-container *nzStringTemplateOutlet="nzExtra">{{ nzExtra }}</ng-container>
            </div>
          }
        </div>
        @if (listOfNzCardTabComponent) {
          <ng-template [ngTemplateOutlet]="listOfNzCardTabComponent.template" />
        }
      </div>
    }

    @if (nzCover) {
      <div class="ant-card-cover">
        <ng-template [ngTemplateOutlet]="nzCover" />
      </div>
    }

    <div class="ant-card-body" [ngStyle]="nzBodyStyle">
      @if (nzLoading) {
        <nz-skeleton [nzActive]="true" [nzTitle]="false" [nzParagraph]="{ rows: 4 }"></nz-skeleton>
      } @else {
        <ng-content />
      }
    </div>
    @if (nzActions.length) {
      <ul class="ant-card-actions">
        @for (action of nzActions; track $index) {
          <li [style.width.%]="100 / nzActions.length">
            <span><ng-template [ngTemplateOutlet]="action" /></span>
          </li>
        }
      </ul>
    }
  `,
                    host: {
                        class: 'ant-card',
                        '[class.ant-card-loading]': 'nzLoading',
                        '[class.ant-card-bordered]': 'nzBorderless === false && nzBordered',
                        '[class.ant-card-hoverable]': 'nzHoverable',
                        '[class.ant-card-small]': 'nzSize === "small"',
                        '[class.ant-card-contain-grid]': 'listOfNzCardGridDirective && listOfNzCardGridDirective.length',
                        '[class.ant-card-type-inner]': 'nzType === "inner"',
                        '[class.ant-card-contain-tabs]': '!!listOfNzCardTabComponent',
                        '[class.ant-card-rtl]': `dir === 'rtl'`
                    },
                    imports: [NzOutletModule, NgTemplateOutlet, NgStyle, NzSkeletonModule],
                    standalone: true
                }]
        }], ctorParameters: () => [{ type: i1.NzConfigService }, { type: i0.ChangeDetectorRef }, { type: i2.Directionality, decorators: [{
                    type: Optional
                }] }], propDecorators: { nzBordered: [{
                type: Input
            }], nzBorderless: [{
                type: Input
            }], nzLoading: [{
                type: Input
            }], nzHoverable: [{
                type: Input
            }], nzBodyStyle: [{
                type: Input
            }], nzCover: [{
                type: Input
            }], nzActions: [{
                type: Input
            }], nzType: [{
                type: Input
            }], nzSize: [{
                type: Input
            }], nzTitle: [{
                type: Input
            }], nzExtra: [{
                type: Input
            }], listOfNzCardTabComponent: [{
                type: ContentChild,
                args: [NzCardTabComponent, { static: false }]
            }], listOfNzCardGridDirective: [{
                type: ContentChildren,
                args: [NzCardGridDirective]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyZC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9jb21wb25lbnRzL2NhcmQvY2FyZC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQU1BLE9BQU8sRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUM1RCxPQUFPLEVBQ0wsdUJBQXVCLEVBRXZCLFNBQVMsRUFDVCxZQUFZLEVBQ1osZUFBZSxFQUNmLEtBQUssRUFHTCxRQUFRLEVBR1IsaUJBQWlCLEVBQ2xCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDL0IsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRTNDLE9BQU8sRUFBZ0MsVUFBVSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDckYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRTNELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUUxRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQzs7Ozs7O0FBRTFELE1BQU0scUJBQXFCLEdBQWdCLE1BQU0sQ0FBQztBQWtFbEQsTUFBTSxPQUFPLGVBQWU7SUF3QjFCLFlBQ1MsZUFBZ0MsRUFDL0IsR0FBc0IsRUFDVixjQUE4QjtRQUYzQyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFDL0IsUUFBRyxHQUFILEdBQUcsQ0FBbUI7UUFDVixtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7UUExQjNDLGtCQUFhLEdBQWdCLHFCQUFxQixDQUFDO1FBTXJCLGVBQVUsR0FBWSxJQUFJLENBQUM7UUFDM0IsaUJBQVks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WTtzQkFBbEQsS0FBSztnQkFDbUIsU0FBUztzQkFBakMsS0FBSztnQkFDaUMsV0FBVztzQkFBakQsS0FBSztnQkFDRyxXQUFXO3NCQUFuQixLQUFLO2dCQUNHLE9BQU87c0JBQWYsS0FBSztnQkFDRyxTQUFTO3NCQUFqQixLQUFLO2dCQUNHLE1BQU07c0JBQWQsS0FBSztnQkFDaUIsTUFBTTtzQkFBNUIsS0FBSztnQkFDRyxPQUFPO3NCQUFmLEtBQUs7Z0JBQ0csT0FBTztzQkFBZixLQUFLO2dCQUMrQyx3QkFBd0I7c0JBQTVFLFlBQVk7dUJBQUMsa0JBQWtCLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFO2dCQUNiLHlCQUF5QjtzQkFBOUQsZUFBZTt1QkFBQyxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9ORy1aT1JSTy9uZy16b3Jyby1hbnRkL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiAqL1xuXG5pbXBvcnQgeyBEaXJlY3Rpb24sIERpcmVjdGlvbmFsaXR5IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHsgTmdTdHlsZSwgTmdUZW1wbGF0ZU91dGxldCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgQ29udGVudENoaWxkLFxuICBDb250ZW50Q2hpbGRyZW4sXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3B0aW9uYWwsXG4gIFF1ZXJ5TGlzdCxcbiAgVGVtcGxhdGVSZWYsXG4gIFZpZXdFbmNhcHN1bGF0aW9uXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgdGFrZVVudGlsIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQgeyBOekNvbmZpZ0tleSwgTnpDb25maWdTZXJ2aWNlLCBXaXRoQ29uZmlnIH0gZnJvbSAnbmctem9ycm8tYW50ZC9jb3JlL2NvbmZpZyc7XG5pbXBvcnQgeyBOek91dGxldE1vZHVsZSB9IGZyb20gJ25nLXpvcnJvLWFudGQvY29yZS9vdXRsZXQnO1xuaW1wb3J0IHsgQm9vbGVhbklucHV0LCBOZ1N0eWxlSW50ZXJmYWNlLCBOelNpemVEU1R5cGUgfSBmcm9tICduZy16b3Jyby1hbnRkL2NvcmUvdHlwZXMnO1xuaW1wb3J0IHsgSW5wdXRCb29sZWFuIH0gZnJvbSAnbmctem9ycm8tYW50ZC9jb3JlL3V0aWwnO1xuaW1wb3J0IHsgTnpTa2VsZXRvbk1vZHVsZSB9IGZyb20gJ25nLXpvcnJvLWFudGQvc2tlbGV0b24nO1xuXG5pbXBvcnQgeyBOekNhcmRHcmlkRGlyZWN0aXZlIH0gZnJvbSAnLi9jYXJkLWdyaWQuZGlyZWN0aXZlJztcbmltcG9ydCB7IE56Q2FyZFRhYkNvbXBvbmVudCB9IGZyb20gJy4vY2FyZC10YWIuY29tcG9uZW50JztcblxuY29uc3QgTlpfQ09ORklHX01PRFVMRV9OQU1FOiBOekNvbmZpZ0tleSA9ICdjYXJkJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbnotY2FyZCcsXG4gIGV4cG9ydEFzOiAnbnpDYXJkJyxcbiAgcHJlc2VydmVXaGl0ZXNwYWNlczogZmFsc2UsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICB0ZW1wbGF0ZTogYFxuICAgIEBpZiAobnpUaXRsZSB8fCBuekV4dHJhIHx8IGxpc3RPZk56Q2FyZFRhYkNvbXBvbmVudCkge1xuICAgICAgPGRpdiBjbGFzcz1cImFudC1jYXJkLWhlYWRcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImFudC1jYXJkLWhlYWQtd3JhcHBlclwiPlxuICAgICAgICAgIEBpZiAobnpUaXRsZSkge1xuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFudC1jYXJkLWhlYWQtdGl0bGVcIj5cbiAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbnpTdHJpbmdUZW1wbGF0ZU91dGxldD1cIm56VGl0bGVcIj57eyBuelRpdGxlIH19PC9uZy1jb250YWluZXI+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB9XG4gICAgICAgICAgQGlmIChuekV4dHJhKSB7XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYW50LWNhcmQtZXh0cmFcIj5cbiAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbnpTdHJpbmdUZW1wbGF0ZU91dGxldD1cIm56RXh0cmFcIj57eyBuekV4dHJhIH19PC9uZy1jb250YWluZXI+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBAaWYgKGxpc3RPZk56Q2FyZFRhYkNvbXBvbmVudCkge1xuICAgICAgICAgIDxuZy10ZW1wbGF0ZSBbbmdUZW1wbGF0ZU91dGxldF09XCJsaXN0T2ZOekNhcmRUYWJDb21wb25lbnQudGVtcGxhdGVcIiAvPlxuICAgICAgICB9XG4gICAgICA8L2Rpdj5cbiAgICB9XG5cbiAgICBAaWYgKG56Q292ZXIpIHtcbiAgICAgIDxkaXYgY2xhc3M9XCJhbnQtY2FyZC1jb3ZlclwiPlxuICAgICAgICA8bmctdGVtcGxhdGUgW25nVGVtcGxhdGVPdXRsZXRdPVwibnpDb3ZlclwiIC8+XG4gICAgICA8L2Rpdj5cbiAgICB9XG5cbiAgICA8ZGl2IGNsYXNzPVwiYW50LWNhcmQtYm9keVwiIFtuZ1N0eWxlXT1cIm56Qm9keVN0eWxlXCI+XG4gICAgICBAaWYgKG56TG9hZGluZykge1xuICAgICAgICA8bnotc2tlbGV0b24gW256QWN0aXZlXT1cInRydWVcIiBbbnpUaXRsZV09XCJmYWxzZVwiIFtuelBhcmFncmFwaF09XCJ7IHJvd3M6IDQgfVwiPjwvbnotc2tlbGV0b24+XG4gICAgICB9IEBlbHNlIHtcbiAgICAgICAgPG5nLWNvbnRlbnQgLz5cbiAgICAgIH1cbiAgICA8L2Rpdj5cbiAgICBAaWYgKG56QWN0aW9ucy5sZW5ndGgpIHtcbiAgICAgIDx1bCBjbGFzcz1cImFudC1jYXJkLWFjdGlvbnNcIj5cbiAgICAgICAgQGZvciAoYWN0aW9uIG9mIG56QWN0aW9uczsgdHJhY2sgJGluZGV4KSB7XG4gICAgICAgICAgPGxpIFtzdHlsZS53aWR0aC4lXT1cIjEwMCAvIG56QWN0aW9ucy5sZW5ndGhcIj5cbiAgICAgICAgICAgIDxzcGFuPjxuZy10ZW1wbGF0ZSBbbmdUZW1wbGF0ZU91dGxldF09XCJhY3Rpb25cIiAvPjwvc3Bhbj5cbiAgICAgICAgICA8L2xpPlxuICAgICAgICB9XG4gICAgICA8L3VsPlxuICAgIH1cbiAgYCxcbiAgaG9zdDoge1xuICAgIGNsYXNzOiAnYW50LWNhcmQnLFxuICAgICdbY2xhc3MuYW50LWNhcmQtbG9hZGluZ10nOiAnbnpMb2FkaW5nJyxcbiAgICAnW2NsYXNzLmFudC1jYXJkLWJvcmRlcmVkXSc6ICduekJvcmRlcmxlc3MgPT09IGZhbHNlICYmIG56Qm9yZGVyZWQnLFxuICAgICdbY2xhc3MuYW50LWNhcmQtaG92ZXJhYmxlXSc6ICduekhvdmVyYWJsZScsXG4gICAgJ1tjbGFzcy5hbnQtY2FyZC1zbWFsbF0nOiAnbnpTaXplID09PSBcInNtYWxsXCInLFxuICAgICdbY2xhc3MuYW50LWNhcmQtY29udGFpbi1ncmlkXSc6ICdsaXN0T2ZOekNhcmRHcmlkRGlyZWN0aXZlICYmIGxpc3RPZk56Q2FyZEdyaWREaXJlY3RpdmUubGVuZ3RoJyxcbiAgICAnW2NsYXNzLmFudC1jYXJkLXR5cGUtaW5uZXJdJzogJ256VHlwZSA9PT0gXCJpbm5lclwiJyxcbiAgICAnW2NsYXNzLmFudC1jYXJkLWNvbnRhaW4tdGFic10nOiAnISFsaXN0T2ZOekNhcmRUYWJDb21wb25lbnQnLFxuICAgICdbY2xhc3MuYW50LWNhcmQtcnRsXSc6IGBkaXIgPT09ICdydGwnYFxuICB9LFxuICBpbXBvcnRzOiBbTnpPdXRsZXRNb2R1bGUsIE5nVGVtcGxhdGVPdXRsZXQsIE5nU3R5bGUsIE56U2tlbGV0b25Nb2R1bGVdLFxuICBzdGFuZGFsb25lOiB0cnVlXG59KVxuZXhwb3J0IGNsYXNzIE56Q2FyZENvbXBvbmVudCBpbXBsZW1lbnRzIE9uRGVzdHJveSwgT25Jbml0IHtcbiAgcmVhZG9ubHkgX256TW9kdWxlTmFtZTogTnpDb25maWdLZXkgPSBOWl9DT05GSUdfTU9EVUxFX05BTUU7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9uekJvcmRlcmVkOiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9uekJvcmRlcmxlc3M6IEJvb2xlYW5JbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX256TG9hZGluZzogQm9vbGVhbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbnpIb3ZlcmFibGU6IEJvb2xlYW5JbnB1dDtcblxuICBASW5wdXQoKSBAV2l0aENvbmZpZygpIEBJbnB1dEJvb2xlYW4oKSBuekJvcmRlcmVkOiBib29sZWFuID0gdHJ1ZTtcbiAgQElucHV0KCkgQFdpdGhDb25maWcoKSBASW5wdXRCb29sZWFuKCkgbnpCb3JkZXJsZXNzOiBib29sZWFuID0gZmFsc2U7XG4gIEBJbnB1dCgpIEBJbnB1dEJvb2xlYW4oKSBuekxvYWRpbmcgPSBmYWxzZTtcbiAgQElucHV0KCkgQFdpdGhDb25maWcoKSBASW5wdXRCb29sZWFuKCkgbnpIb3ZlcmFibGU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgbnpCb2R5U3R5bGU6IE5nU3R5bGVJbnRlcmZhY2UgfCBudWxsID0gbnVsbDtcbiAgQElucHV0KCkgbnpDb3Zlcj86IFRlbXBsYXRlUmVmPHZvaWQ+O1xuICBASW5wdXQoKSBuekFjdGlvbnM6IEFycmF5PFRlbXBsYXRlUmVmPHZvaWQ+PiA9IFtdO1xuICBASW5wdXQoKSBuelR5cGU6IHN0cmluZyB8ICdpbm5lcicgfCBudWxsID0gbnVsbDtcbiAgQElucHV0KCkgQFdpdGhDb25maWcoKSBuelNpemU6IE56U2l6ZURTVHlwZSA9ICdkZWZhdWx0JztcbiAgQElucHV0KCkgbnpUaXRsZT86IHN0cmluZyB8IFRlbXBsYXRlUmVmPHZvaWQ+O1xuICBASW5wdXQoKSBuekV4dHJhPzogc3RyaW5nIHwgVGVtcGxhdGVSZWY8dm9pZD47XG4gIEBDb250ZW50Q2hpbGQoTnpDYXJkVGFiQ29tcG9uZW50LCB7IHN0YXRpYzogZmFsc2UgfSkgbGlzdE9mTnpDYXJkVGFiQ29tcG9uZW50PzogTnpDYXJkVGFiQ29tcG9uZW50O1xuICBAQ29udGVudENoaWxkcmVuKE56Q2FyZEdyaWREaXJlY3RpdmUpIGxpc3RPZk56Q2FyZEdyaWREaXJlY3RpdmUhOiBRdWVyeUxpc3Q8TnpDYXJkR3JpZERpcmVjdGl2ZT47XG4gIGRpcjogRGlyZWN0aW9uID0gJ2x0cic7XG5cbiAgcHJpdmF0ZSBkZXN0cm95JCA9IG5ldyBTdWJqZWN0PGJvb2xlYW4+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIG56Q29uZmlnU2VydmljZTogTnpDb25maWdTZXJ2aWNlLFxuICAgIHByaXZhdGUgY2RyOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIGRpcmVjdGlvbmFsaXR5OiBEaXJlY3Rpb25hbGl0eVxuICApIHtcbiAgICB0aGlzLm56Q29uZmlnU2VydmljZVxuICAgICAgLmdldENvbmZpZ0NoYW5nZUV2ZW50Rm9yQ29tcG9uZW50KE5aX0NPTkZJR19NT0RVTEVfTkFNRSlcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICB0aGlzLmNkci5tYXJrRm9yQ2hlY2soKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgdGhpcy5kaXJlY3Rpb25hbGl0eS5jaGFuZ2U/LnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveSQpKS5zdWJzY3JpYmUoKGRpcmVjdGlvbjogRGlyZWN0aW9uKSA9PiB7XG4gICAgICB0aGlzLmRpciA9IGRpcmVjdGlvbjtcbiAgICAgIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuZGlyID0gdGhpcy5kaXJlY3Rpb25hbGl0eS52YWx1ZTtcbiAgfVxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlc3Ryb3kkLm5leHQodHJ1ZSk7XG4gICAgdGhpcy5kZXN0cm95JC5jb21wbGV0ZSgpO1xuICB9XG59XG4iXX0=