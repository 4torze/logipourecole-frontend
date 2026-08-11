/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Directionality } from '@angular/cdk/bidi';
import { ChangeDetectorRef, ElementRef, EventEmitter } from '@angular/core';
import { NzConfigKey } from 'ng-zorro-antd/core/config';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { BooleanInput, NgStyleInterface, NzTSType } from 'ng-zorro-antd/core/types';
import { NzToolTipComponent, NzTooltipBaseDirective, NzTooltipTrigger, PropertyMapping } from 'ng-zorro-antd/tooltip';
import * as i0 from "@angular/core";
export declare class NzPopoverDirective extends NzTooltipBaseDirective {
    static ngAcceptInputType_nzPopoverArrowPointAtCenter: BooleanInput;
    readonly _nzModuleName: NzConfigKey;
    arrowPointAtCenter?: boolean;
    title?: NzTSType;
    content?: NzTSType;
    directiveTitle?: NzTSType | null;
    trigger?: NzTooltipTrigger;
    placement?: string | string[];
    origin?: ElementRef<HTMLElement>;
    visible?: boolean;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    overlayClassName?: string;
    overlayStyle?: NgStyleInterface;
    nzPopoverBackdrop?: boolean;
    readonly visibleChange: EventEmitter<boolean>;
    protected getProxyPropertyMap(): PropertyMapping;
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<NzPopoverDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzPopoverDirective, "[nz-popover]", ["nzPopover"], { "arrowPointAtCenter": { "alias": "nzPopoverArrowPointAtCenter"; "required": false; }; "title": { "alias": "nzPopoverTitle"; "required": false; }; "content": { "alias": "nzPopoverContent"; "required": false; }; "directiveTitle": { "alias": "nz-popover"; "required": false; }; "trigger": { "alias": "nzPopoverTrigger"; "required": false; }; "placement": { "alias": "nzPopoverPlacement"; "required": false; }; "origin": { "alias": "nzPopoverOrigin"; "required": false; }; "visible": { "alias": "nzPopoverVisible"; "required": false; }; "mouseEnterDelay": { "alias": "nzPopoverMouseEnterDelay"; "required": false; }; "mouseLeaveDelay": { "alias": "nzPopoverMouseLeaveDelay"; "required": false; }; "overlayClassName": { "alias": "nzPopoverOverlayClassName"; "required": false; }; "overlayStyle": { "alias": "nzPopoverOverlayStyle"; "required": false; }; "nzPopoverBackdrop": { "alias": "nzPopoverBackdrop"; "required": false; }; }, { "visibleChange": "nzPopoverVisibleChange"; }, never, never, true, never>;
}
export declare class NzPopoverComponent extends NzToolTipComponent {
    _prefix: string;
    constructor(cdr: ChangeDetectorRef, directionality: Directionality, noAnimation?: NzNoAnimationDirective);
    get hasBackdrop(): boolean;
    protected isEmpty(): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzPopoverComponent, [null, { optional: true; }, { optional: true; host: true; }]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzPopoverComponent, "nz-popover", ["nzPopoverComponent"], {}, {}, never, never, true, never>;
}
