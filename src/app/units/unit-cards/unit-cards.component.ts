import {Component, Input} from '@angular/core';
import {SCDataService} from "../../sc-data.service";
@Component({
  selector: 'sc-unit-cards',
  templateUrl: './unit-cards.component.html',
  styleUrls: ['./unit-cards.component.less']
})
export class UnitCardsComponent  {
  _unit: any;
  get unit(): any { return this._unit }
  @Input() set unit(value: any) {
    this._unit = value
    this.activeCard = "Root"
    this.updateCard()
  }
  constructor(public scdata: SCDataService) {
  }

  cards: any;
  activeCard: string = "Root"

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

  updateCard(){
    let cards: any = {}
    if(this.unit.CardLayouts){
      let notEmpty = false
      for(let cardID in this.unit.CardLayouts){
        let layoutButtons = this.unit.CardLayouts[cardID]

        let layout = [
          [[],[],[],[],[]],
          [[],[],[],[],[]],
          [[],[],[],[],[]]
        ]
        for(let layoutButton of layoutButtons) {
          let row = layoutButton.Row || 0
          let column = layoutButton.Column || 0
          if(row < 3 && column < 5){
            // @ts-ignore
            layout[row][column].push(layoutButton)
            notEmpty = true
          }
        }
        if(notEmpty){
          cards[cardID] = layout
        }
      }
    }

    this.cards = cards
  }

  targetFilters(filter){
    return filter.replace(/\,(Dead|Hidden|Invulnerable)/g,"")
  }
  isInteractive(layoutSlot: any){

    if(layoutSlot.length){
      if(layoutSlot[0].Type === "CancelSubmenu"){
        return true
      }
      if(layoutSlot[0].Type === "Submenu"){
        return true
      }
      if(layoutSlot?.length > 1){
        return true
      }
    }
    return false
  }
  switchIcon(layoutSlot: any){
    if(!layoutSlot[0]){
      return;
    }
    if(layoutSlot[0].Type === "CancelSubmenu"){
      this.activeCard = "Root"
    }
    if(layoutSlot[0].Type === "Submenu"){
      this.activeCard = layoutSlot[0].SubmenuCardId
    }
    if(layoutSlot?.length > 1){
      layoutSlot.unshift(layoutSlot.pop())
    }
  }
}
