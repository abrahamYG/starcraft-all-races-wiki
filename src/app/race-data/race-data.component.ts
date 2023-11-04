import {Component, ElementRef, OnInit} from '@angular/core';
import {SCDataService} from "../sc-data.service";

@Component({
  templateUrl: './race-data.component.html',
  styleUrls: ['./race-data.component.less']
})
export class RaceDataComponent implements OnInit{
  title = 'app-sc';
  unitsListStyle: string = 'grid'
  structuresListStyle: string = 'grid'
  constructor(public scdata: SCDataService ) {}

  setUnitsListStyle(style: string){
    this.unitsListStyle = style
  }
  setStructuresListStyle(style: string){
    this.structuresListStyle = style
  }
  ngOnInit() {
  }
  techTree: any = {}
  hasProduction(unit : SCUnit){
    return unit.$Production?.filter((u) => this.scdata.raceData.cache?.units[u])?.length
  }
  showUnitDetails(unit : SCUnit,el: any){
    if(!this.techTree[unit.id]){
      this.techTree[unit.id] = el
    }
    return this.techTree[unit.id] === el
  }

  code(){
    let code: any = {}
    for(let i in this.scdata.unitData){
      if(i[0] !== "$"){
        code[i] = this.scdata.unitData[i]
      }
    }

    return JSON.stringify(code, undefined, 4).replace(/"(\w+)":/g,(a,b) => {return b + ":"})
  }
}
