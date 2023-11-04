import {Component} from '@angular/core';
import {SCDataService} from "../sc-data.service";

@Component({
  selector: 'mods-list',
  templateUrl: './mods-list.component.html',
  styleUrls: ['./mods-list.component.less']
})
export class ModsListComponent {
  constructor(public scdata: SCDataService) {}

}
