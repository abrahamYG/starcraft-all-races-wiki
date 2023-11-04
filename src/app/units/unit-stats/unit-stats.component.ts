import {Component, Input} from '@angular/core';

@Component({
  selector: 'sc-unit-stats',
  templateUrl: './unit-stats.component.html',
  styleUrls: ['./unit-stats.component.less']
})
export class UnitStatsComponent {
  _unit: any;
  get unit(): any { return this._unit }
  @Input() set unit(value: any) { this._unit = value }

  fields = [
    // {title: "ObjectFamily", get: (entity: any) => entity.EditorCategories?.ObjectFamily},
    // {title: "ObjectType", get: (entity: any) => entity.EditorCategories?.ObjectType},
    // {title: "Race", field: "Race"},
    // {title: "LifeMax", field: "LifeMax"},
    // {title: "LifeRegenRate", field: "LifeRegenRate"},
    {title: "Radius", field: "Radius"},
    {title: "LifeRegenDelay", field: "LifeRegenDelay"},

    // {title: "ShieldsMax", field: "ShieldsMax"},
    // {title: "ShieldRegenRate", field: "ShieldRegenRate"},
    {title: "ShieldRegenDelay", field: "ShieldRegenDelay"},
    // {title: "EnergyStart", field: "EnergyStart"},
    // {title: "EnergyMax", field: "EnergyMax"},
    // {title: "EnergyRegenRate", field: "EnergyRegenRate"},
    {title: "Speed", field: "Speed"},
    {title: "Acceleration", field: "Acceleration"},
    {title: "SpeedMultiplierCreep", field: "SpeedMultiplierCreep"},
    {title: "CargoSize", field: "CargoSize"},
    {title: "Sight", field: "Sight"},
    {title: "Plane", get: (entity: any) => entity.PlaneArray.join(",")},
    // {title: "Footprint", field: "Footprint"},
    {title: "Footprint", field: "PlacementFootprint"},
    // {title: "Attributes", get: (entity: any)=> entity.Attributes?.join(' - ')},
  ]
}
