import {Component, OnInit} from '@angular/core';
import {SCDataService} from "../sc-data.service";
import {Observable} from "rxjs";

@Component({
  selector: 'races-list',
  templateUrl: './races-list.component.html',
  styleUrls: ['./races-list.component.less']
})
export class RacesListComponent implements OnInit{
  constructor(public scdata: SCDataService) {
  }
  ngOnInit() {
  }
}
