import {Component, Input} from '@angular/core';

@Component({
  selector: 'sc-unit-statusbar',
  templateUrl: './unit-statusbar.component.html',
  styleUrls: ['./unit-statusbar.component.less']
})
export class UnitStatusbarComponent {
  _unit: any;
  get unit(): any { return this._unit }
  @Input() set unit(value: any) { this._unit = value }

  energyStyles(value: number){
    return {'background-size':  Math.ceil(25 / ((value)        / 32)) + 'px 3px' }
  }
  vitalityStyles(value: number){
    return {'background-size':  Math.ceil(48 / ((value)        / 32)) + 'px 3px' }
  }
  vitalityMoreStyles(value: number){
    return {'background-size':  Math.ceil(48 / ((value - 1000) / 32)) + 'px 3px, 2px 3px, 50px 3px'}
  }
  vitalityStylesEvenMoreStyles(value: number){
    return {'background-size':  Math.max(2,Math.ceil(48 / ((value - 2000) / 32))) + 'px 2px, 2px 4px, 50px 2px'}
  }
}
