import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {environment} from "../environments/environment";
import {SafePipe} from "./safe.pipe";
import {SCIconComponent} from "./sc-icon/sc-icon.component";
import {TooltipModule} from "./tooltip";
import {HttpClientModule} from "@angular/common/http";
import {UnitWeaponsComponent} from "./units/unit-weapons/unit-weapons.component";
import {UnitStatsComponent} from "./units/unit-stats/unit-stats.component";
import {UnitStatusbarComponent} from "./units/unit-statusbar/unit-statusbar.component";
import {UnitReferencesComponent} from "./units/unit-references/unit-references.component";
import {UnitCardsComponent} from "./units/unit-cards/unit-cards.component";
import {RaceDataComponent} from "./race-data/race-data.component";
import {ModsListComponent} from "./mods-list/mods-list.component";
import {ENVIRONMENT} from "./sc-data.service";
import {RacesListComponent} from "./races-list/races-list.component";

@NgModule({
  declarations: [
    RacesListComponent,
    ModsListComponent,
    RaceDataComponent,
    UnitWeaponsComponent,
    UnitStatsComponent,
    UnitStatusbarComponent,
    UnitReferencesComponent,
    UnitCardsComponent,
    SafePipe,
    SCIconComponent,
    AppComponent
  ],
  imports: [
    HttpClientModule,
    TooltipModule,
    BrowserModule,
    AppRoutingModule
  ],
  providers: [{provide: ENVIRONMENT, useValue: environment}],
  exports: [
    SafePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
