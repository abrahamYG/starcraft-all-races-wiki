import {Component, Input, OnInit} from '@angular/core';
import {environment} from "../../../environments/environment";
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import {SCDataService} from "../../sc-data.service";
import {Observable} from "rxjs";


@Component({
  selector: 'sc-unit-references',
  templateUrl: './unit-references.component.html',
  styleUrls: ['./unit-references.component.less']
})
export class UnitReferencesComponent {
  _unit: any;
  get unit(): any { return this._unit }
  @Input() set unit(value: any) { this._unit = value }

  constructor(public scdata: SCDataService) {
  }

  weaponFields = [
    {title: 'Id', field: 'Id'},
    {title: 'Name', field: 'Name'},
    {title: 'Targets', field: 'TargetFilters'},
    {title: 'Range', field: 'Range'},
    {title: 'Period', field: 'Period'},
    {title: 'Count', field: 'DisplayAttackCount'},
    {title: 'Damage', field: 'Amount'},
    {
      title: 'Bonus',
      get: (entity: any) => entity.AttributeBonus && Object.entries(entity.AttributeBonus)
        .map(([key,value]) => `+${value} vs ${key}`)
        .join(',')
    }
  ]
}
