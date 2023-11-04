import { NgModule } from '@angular/core';
import {RouterModule, Routes, UrlSegment} from '@angular/router';
import {RaceDataComponent} from "./race-data/race-data.component";
import {ModsListComponent} from "./mods-list/mods-list.component";

const routes: Routes = [
  { path: '', pathMatch: 'full', component: ModsListComponent },
  {
    matcher: (url: UrlSegment[]) => ({consumed: url, parameters: {}}),
    component: RaceDataComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
