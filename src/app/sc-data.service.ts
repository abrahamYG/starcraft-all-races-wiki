import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {BehaviorSubject, catchError, filter, Observable, of, retry, Subject, throwError} from "rxjs";
import {ActivatedRoute, NavigationEnd, Router, UrlSegment} from "@angular/router";
import {Inject, Injectable, InjectionToken, Optional} from '@angular/core';
import {switchMap} from "rxjs/operators";
export const ENVIRONMENT = new InjectionToken<{ [key: string]: any }>('environment');
import {Title} from "@angular/platform-browser";
import { Meta } from '@angular/platform-browser';



@Injectable({
  providedIn: 'root'
})
export class SCDataService {

  private readonly environment: any;

  imagesRoot: string
  modID: string
  raceID: string
  entityCatalog: string
  entityID: string


  modsData: any | null
  modData: SC2Data  | null
  unitData: SCUnit | null
  upgradeData: SCUpgrade  | null
  raceData: any | null
  modLoading: boolean
  developer: boolean = false
  locales: any = [
    {locale: "enUS", title: "EN"},
    {locale: "ruRU", title: "RU"},
    {locale: "koKR", title: "KR"},
    {locale: "zhCN", title: "CN"},
  ]
  locale: any

  setLocale(locale){
    this.locale = locale
  }
  filteredWeapons(weapons){
    return weapons?.filter(Boolean).filter(item => item.id) || []
  }
  filteredUnits(units){
    return units?.map(u => u && this.raceData?.cache?.units?.[u]).filter(Boolean) || []
  }
  text(textValue){
    if(!textValue){
      return ""
    }
    if(textValue.constructor === String){
      return textValue
    }
    return textValue[this.locale.locales] || textValue["enUS"] || Object.values(textValue)[0]
  }
  filteredUpgrades(upgrades){
    return upgrades?.map(u => u && this.raceData?.cache?.upgrades?.[u.id]).filter(Boolean) || []
  }
  constructor(private http: HttpClient,
              private router: Router,
              private title: Title,
              private meta: Meta,
              @Optional() @Inject(ENVIRONMENT) environment: any
  ) {
    this.environment = environment !== null ? environment : {};
    this.locale = this.locales[0]

    this.http.get(`data/mods.json`).subscribe(data => this.modsData = data)

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(e => {
      let [mod,race,catalog,entity] = this.router.url.substring(1).split("/")

      mod = mod?.toLowerCase()
      race = race?.toLowerCase()
      entity = entity?.toLowerCase()
      catalog = catalog?.toLowerCase()

      if(this.modID !== mod){
        this.modID = mod
        if(mod){
          this.modLoading = true
          this.http.get(`data/${mod}/index.json`).subscribe((data: SC2Data) => {
            this.modData = data
            this.modLoading = false
          },()=>{
            this.modData = null
            this.modLoading = false
          })
        }
        else{
          this.modData = null
        }
      }
      if(this.raceID !== race){
        this.raceID = race
        if(race){
          this.http.get(`data/${this.modID}/race/${race}.json`).subscribe(data => {
            this.raceData = data
          },()=>{
            this.raceData = null
          })
        }
        else{
          this.raceData = null
        }
      }
      if(this.entityID !== entity || this.entityCatalog !== catalog) {
        this.entityID = entity
        this.entityCatalog = catalog

        if(entity && catalog){
          this.http.get(`data/${this.modID}/${catalog}/${entity}.json`).subscribe(data => {

            let favIcon: HTMLLinkElement = document.querySelector('#favicon');

            switch(catalog){
              case "unit":
                let unitData = data as SCUnit
                this.unitData = unitData
                this.upgradeData = null

                let title = data ? 'ARC Wiki - ' + unitData.Race + ' ' + unitData.Name : 'ARC'
                let icon =  unitData ? 'http://arc.hometlt.ru' + this.imagesRoot + unitData.Icon + '.png' : 'favioon.png'
                let url =   `http://arc.hometlt.ru/datas/${this.modID}/${unitData.Race}/${unitData.id}`

                this.title.setTitle(title);
                // this.meta.updateTag({property: 'og:title', content: title});
                // this.meta.updateTag({property: 'og:image', content: icon});
                // this.meta.updateTag({property: 'og:type', content: 'website'});
                // this.meta.updateTag({property: 'og:url', content: url})



                favIcon.href = icon;

                break;
              case "upgrade":
                this.unitData = null
                this.upgradeData = data as SCUpgrade
                break;
              default:
                this.unitData = null
                this.upgradeData = null

                favIcon.href = 'favicon.ico';
            }


          },()=>{
            this.unitData = null
            this.upgradeData = null
          })
        }
        else{
          this.unitData = null
          this.upgradeData = null

          let title = 'ARC'
          let icon =  'favioon.png'
          let url =   `http://arc.hometlt.ru/datas/${this.modID}/`

          this.title.setTitle(title);
          this.meta.updateTag({property: 'og:title', content: title});
          this.meta.updateTag({property: 'og:image', content: icon});
          this.meta.updateTag({property: 'og:type', content: 'website'});
          this.meta.updateTag({property: 'og:url', content: url})
        }
      }
    })


    this.imagesRoot = this.environment.imagesRoot

  }
  modRoute( mod: any){
    return ['/', mod.id.toLowerCase()]
  }
  raceRoute( entity: any){
    return ['/', this.modID.toLowerCase(), entity.id.toLowerCase()]
  }
  upgradeRoute( entity: any){
    return ['/', this.modID.toLowerCase(), this.raceID.toLowerCase(), 'upgrade' , entity.id.toLowerCase()]
  }
  unitRoute( entity: any){
    return ['/', this.modID.toLowerCase(), this.raceID.toLowerCase(), 'unit' , entity.id.toLowerCase()]
  }
  isSelected(catalog: string, entity : string){
    return  this.entityID === entity && this.entityCatalog === catalog
  }
  unitURL(unit: any){
    return this.environment.dataRoot + this.modID.toLowerCase()  + '/unit/' + unit.id.toLowerCase() + '.json'
  }
  upgradeURL(upgrade: any){
    return this.environment.dataRoot + this.modID.toLowerCase()  + '/upgrade/' + upgrade.id.toLowerCase() + '.json'
  }
  getValue(key: string, defaultValue?: any): any {
    return this.environment[key] || defaultValue;
  }
}
