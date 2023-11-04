import {Component, Input} from '@angular/core';
import {environment} from "../../environments/environment";
@Component({
  selector: 'sc-icon',
  templateUrl: './sc-icon.component.html',
  styleUrls: ['./sc-icon.component.less']
})
export class SCIconComponent  {
  @Input() src: string
  @Input() title: string

  loaded: boolean = false
  root: string = environment.imagesRoot
  onload(){
    this.loaded = true
  }
}
