import fs from "fs-extra";
import * as SCParser from "sc-parser"
//import * as SCParser from "./../../parser/index.js"


async function wiki (config) {
  fs.mkdirSync(config.output + 'ww/ww'.replace('\\','/').substring('ww/ww'.toLowerCase(), 'ww/ww'.lastIndexOf("/")), {recursive: true})

  let mod = await SCParser.createMod({
    mods: config.mods
  })

  function textValue(id){
    if(!id){
      return null
    }
    if(!mod.text[id]){
      return "-"
    }
    return mod.text[id].Value
  }
  function getNestedCardLayouts(cardLayouts,cardLayout, result) {
    if(!cardLayouts){
      return []
    }
    if(!cardLayout){
      cardLayout = cardLayouts[0]?.LayoutButtons

      if(!cardLayout){
        return []
      }
    }

    if(!result) result = [cardLayout]

    let nested = cardLayout
        .filter(cl => cl.Type === 'Submenu')
        .map(cl => cardLayouts.find(cls => cls.CardId === cl.SubmenuCardId))
        .map(cl => cl.LayoutButtons)
    for(let ncl of nested){
      if(!result.includes(ncl)){
        result.push(ncl)
        getNestedCardLayouts(cardLayouts,ncl,result)
      }
    }
    return result;
  }
  function flagArray(property){
    return property && Object.entries(property).filter(([key,value]) => value).map(([key,value]) => key)
  }
  function weaponInfo (entity){
    let data = entity.getResolvedData()
    let effect = data.DisplayEffect && mod.cache.effect[data.DisplayEffect]?.getResolvedData()
    return {
      ...shortInfo(entity),
      Amount: effect?.Amount?.value,
      AttributeBonus: effect?.AttributeBonus,
      Kind: effect?.Kind,
      DisplayAttackCount: data.DisplayAttackCount,
      TargetFilters: data.TargetFilters?.split(";")[0].replace(",Visible","").replace("Visible",""),
      Range: data.Range || data.MinScanRange,
      Period: data.Period,
    }
  }
  function shortInfo(entity){

    // let strings = entity.$mod.locales.enUS.GameStrings
    // let strings = entity.$mod.text

    let data = entity.getResolvedData()
    let result = {
      id: entity.id,
      Icon: mod.checkImage(entity.Icon || entity.InfoIcon,[entity.class,entity.id]),
      Name:  textValue(data.Name)
    }

    if(data.Tooltip){
      result.Tooltip = textValue(data.Tooltip)
    }
    if(data.Description){
      result.Description = textValue(data.Description)
    }
    return result
  }
  function getCardData(entity) {
    // if(entity.id === "SCV"){
    //     entity
    // }
    let commands = []
    let layouts = {}
    let data = entity.getResolvedData()
    if (!data.CardLayouts) {
      return {layouts,commands}
    }
    for (let cl of data.CardLayouts) {
      let LayoutButtons = []
      if (cl.LayoutButtons) {
        cl.LayoutButtons = cl.LayoutButtons.filter(lb => lb.Face && lb.Type && lb.Type !== 'Undefined' && (!lb.Row || lb.Row < 3) && (!lb.Column || lb.Column < 5))
        for (let lb of cl.LayoutButtons) {

          let btn = mod.cache.button[lb.Face]

          if (!btn) {
            console.warn(`Entity not found: button.${lb.Face}`)
            continue;
          }

          if(lb.AbilCmd){
            commands.push({
              ...pick(lb,["AbilCmd"]),
              ...shortInfo(btn)
            })
          }

          let buttonData = btn.getResolvedData()

          //todo ignore restricted
          // if(buttonData.State === "Restricted"){
          //   continue;
          // }

          let hotkey = mod.locales.enUS.GameHotkeys[buttonData.Hotkey];

          if (SCParser.SCGame.specialHotkeys[hotkey]) {
            hotkey = SCParser.SCGame.specialHotkeys[hotkey]
          }

          let cost = {
            Minerals: 0,
            Vespene: 0,
            Terazine: 0,
            Custom: 0,
            Energy: 0,
            Life: 0,
            Shields: 0,
            Food: 0
          }


          let info;
          let abilData;
          if(lb.Type === 'AbilCmd'){
            if(!lb.AbilCmd){
              continue;
            }
            let [abilID,cmd]= lb.AbilCmd.split(",")
            let abil = mod.cache.abil[abilID]
            if(!abil){
              continue;
            }

            abilData = abil.data()
            info = abilData.InfoArray?.[cmd] || abilData.InfoArray?.[0] || abilData.Info || abilData;

            let costData = abilData.InfoArray?.[cmd] || abilData.InfoArray?.[0] || abilData.Info ||  abilData.Cost?.[0] || abilData.Cost || abilData;

            if(costData.Vital) {
              for (let property in costData.Vital) {
                cost[property] += costData.Vital[property]
              }
            }
            if(costData.Resource){
              for(let property in costData.Resource){
                cost[property] += costData.Resource[property]
              }
            }
            // if(abilData.Cost?.Vital){
            //     for(let property in abilData.Cost.Vital){
            //         cost[property] += abilData.Cost.Vital[property]
            //     }
            // }
            // if(abilData.Cost?.Resource){
            //     for(let property in abilData.Cost.Resource){
            //         cost[property] += abilData.Cost.Resource[property]
            //     }
            // }
            if(info?.Unit){
              let units = info.Unit
              if(units.constructor === String){
                units = [units]
              }
              for(let unit of units){
                if(mod.cache.unit[unit]){
                  let unitData = mod.cache.unit[unit].data()
                  for(let property in unitData.CostResource){
                    cost[property] += unitData.CostResource[property]
                  }
                  if(unitData.Food)cost.Food = unitData.Food
                }
              }
            }
          }
          // <Vital index="Energy" value="50"/>
          // <Charge>
          //     <CountMax value="1"/>
          //     <CountStart value="1"/>
          //     <CountUse value="1"/>
          //     <Location value="Player"/>
          //     <TimeUse value="0.0625"/>
          //     <Flags index="RestoreAllChargesOnCooldown" value="1"/>
          // </Charge>
          // <Cooldown TimeUse="15"/>



          LayoutButtons.push({
            Upgrade: info?.Upgrade,
            // Ability: abilData,
            Info: info,
            Unit: info?.Unit,
            Time: info?.Time,
            Cost: cost,
            ...pick(lb,["Row","Column","Type","AbilCmd","SubmenuCardId"]),
            // ...buttonData,
            ...shortInfo(btn),
            Hotkey: hotkey
          })

        }
      }

      layouts[cl.CardId || "Root"] = LayoutButtons
    }
    return {layouts,commands}
  }
  // function getProduction (commands){
  //   let units =[], upgrades = []
  //
  //   for(let abilcmd of commands){
  //     let [abilId, cmdIndex] = abilcmd.split(",");
  //     let abil = mod.cache.abil[abilId]?.getResolvedData();
  //     if(!abil)continue;
  //     if(cmdIndex === 'Execute') cmdIndex = 0;
  //     let unitinfo = abil.InfoArray?.[cmdIndex]?.Unit;
  //     if(unitinfo){
  //       if(unitinfo?.constructor === Array ){
  //         for(let unit of unitinfo) if(!units.includes(unit))units.push(unitinfo)
  //       }
  //       else{
  //         if(!units.includes(unitinfo)) units.push(unitinfo)
  //       }
  //     }
  //     let upgradeinfo = abil.InfoArray?.[cmdIndex]?.Upgrade;
  //     if(upgradeinfo){
  //       if(upgradeinfo?.constructor === Array ){
  //         for(let upgrade of upgradeinfo) if(!upgrades.includes(upgrade))upgrades.push(upgradeinfo)
  //       }
  //       else{
  //         if(!upgrades.includes(upgradeinfo)) upgrades.push(upgradeinfo)
  //       }
  //     }
  //   }
  //   return {
  //     producedUnits: units,
  //     producedUpgrades: upgrades
  //   }
  // }
  function filterLinks(unitID,array,type){
    return array?.filter(w => {
      if(!w.Link){
        return false
      }
      if(!mod.cache[type][w.Link]){
        console.warn(`${type}#${w.Link} not found (${unitID})`)
        return false
      }
      return true
    }) || []
  }
  function pick(val,fields){
    let result = {}
    for (let field of fields){
      if( val[field] !== undefined){
        result[field] = val[field]
      }
    }
    return result
  }
  function getUnitBehaviors(unitID){
    let unitData = mod.cache.unit[unitID].getResolvedData()
    return unitData.BehaviorArray?.map(bh => mod.cache.behavior[bh.Link]).filter(e => e) || []
  }
  function getUnitCardCommands(unitID){
    if(!mod.cache.unit[unitID]){
      console.log(`unit ${unitID} not exists`)
      return null
    }

    let unitData = mod.cache.unit[unitID].getResolvedData()

    let layouts = getNestedCardLayouts(unitData.CardLayouts)

    // CmdButtonArray = Object {Execute: Object}
    // Execute = Object {DefaultButtonFace: "HunterSeekerMissile",
    //     Requirements: "",
    //     State: "Restricted"}
    // State = "Restricted"


    let commands =  layouts.flat()
        .filter(btn => btn.Type === "AbilCmd")
        // .filter(btn => btn.State !== "Restricted") todo filter restricted abilities
        .map(btn => btn.AbilCmd)
        .map(abilcmd => abilcmd.split(","))
        .map(abilcmd => ({abil: mod.cache.abil[abilcmd[0]] , cmd: abilcmd[1]}))
        .filter(abilcmd => abilcmd.abil)

    return commands.filter(({abil,cmd}) => {
      let a = abil.data();
      let btn = a.CmdButtonArray && a.CmdButtonArray?.[cmd] || a.InfoArray && a.InfoArray[cmd]?.Button;
      return btn
      //todo ignore restricted
      // return btn && btn.State !== "Restricted"
    } )
  }
  function filterCommands(abilcmds,...classes){

    let classesfull = classes.map(c => "CAbil" + c)
    return abilcmds.filter(ac => [...classesfull].includes(ac.abil.class) && ac.cmd !== 'Cancel')
  }
  function getCommandInfoEntities(abilcmds){
    let es = abilcmds.map(ac => {
      let acd = ac.abil.data()
      if(acd.InfoArray){
        if(acd.InfoArray[ac.cmd] ){
          return acd.InfoArray[ac.cmd].Unit || acd.InfoArray[ac.cmd].Upgrade
        }
        else{
          return acd.InfoArray.map(ia => ia.Unit)
        }

      }
      else{
        return acd.Info?.Unit
      }

      // let ia = acd.InfoArray && (acd.InfoArray[ac.cmd] || acd.InfoArray[0]) || acd.Info
      // return ia.Unit || ia.Upgrade
    }).flat()

    return [...new Set(es)]
  }
  function relsEffectsDeep(entity,effects = []){
    let rels = entity.rels().filter(r => r.type === 'effect').map(r => mod.cache.effect[r.link])
    for(let rel of rels){
      if(rel && !effects.includes(rel)){
        effects.push(rel)
        relsEffectsDeep(rel,effects)
      }
    }
    return effects
  }
  function getUnitProduction(unitID){

    let abilcmds = getUnitCardCommands(unitID)
    let abilBehavior = filterCommands(abilcmds,'Behavior')
    let abilResearch = filterCommands(abilcmds,'Research')
    let abilProduction = filterCommands(abilcmds,'Train','WarpTrain','Build','ArmMagazine')
    let abilMorph = filterCommands(abilcmds,'Morph','MorphPlacement','Merge')
    let abilEffect = filterCommands(abilcmds,'EffectInstant','EffectTarget')

    let behaviors = getUnitBehaviors(unitID)
    for(let beh of abilBehavior){
      let abilBehaviors = [...new Set(abilBehavior.map(ab => ab.abil.data().BehaviorArray).flat())]
      for(let abilBehavior of abilBehaviors){
        if(mod.cache.behavior[abilBehavior] && !behaviors.includes(mod.cache.behavior[abilBehavior])){
          behaviors.push(mod.cache.behavior[abilBehavior])
        }
      }
    }

    let researchUpgrades = getCommandInfoEntities(abilResearch)
    let productionUnits = getCommandInfoEntities(abilProduction)
    let morphUnits = getCommandInfoEntities(abilMorph)

    for(let ac of abilProduction){
      let acd = ac.abil.data()
      if(acd.MorphUnit){
        morphUnits.push(acd.MorphUnit)
      }
    }


    for(let abilcmd of abilEffect){
      let abilRels = relsEffectsDeep(abilcmd.abil).map(e => e.data())

      let abilcmdSpawnUnits = abilRels.filter(e => e.class === "CEffectCreateUnit" && !e.CreateFlags?.Precursor).map(e => e.SpawnUnit).flat()
      let abilcmdBehaviors = abilRels.filter(e => e.class === "CEffectApplyBehavior").map(e => e.Behavior).flat()
      let abilcmdMorph = abilRels.filter(e => e.class === "CEffectMorph").map(e => e.MorphUnit).flat()


      for(let abilcmdBehavior of abilcmdBehaviors){
        if(mod.cache.behavior[abilcmdBehavior] && !behaviors.includes(mod.cache.behavior[abilcmdBehavior])){
          behaviors.push(mod.cache.behavior[abilcmdBehavior])
        }
      }
      for(let abilcmdSpawnUnit of abilcmdSpawnUnits){
        if(abilcmdSpawnUnit && !productionUnits.includes(abilcmdSpawnUnit)){
          productionUnits.push(abilcmdSpawnUnit)
        }
      }
      for(let abilcmdMorphUnit of abilcmdMorph){
        if(abilcmdMorphUnit && !morphUnits.includes(abilcmdMorphUnit)){
          morphUnits.push(abilcmdMorphUnit)
        }
      }
    }

    let behaviorUnits = behaviors.filter(bh => bh.data().class === "CBehaviorSpawn").map(bh => bh.data().InfoArray.map(ia => ia.Unit) ).flat()

    let behaviorBuffs = behaviors.filter(bh => bh.data().class === "CBehaviorBuff")

    let relatedEffects = []
    function addRelatedEffects(entity){
      let rels = entity.$$relations.filter(r => r.type === "effect").map(r => r.link)
      for(let rel of rels){
        if(!relatedEffects.includes(rel)){
          if(mod.cache.effect[rel]){
            relatedEffects.push(rel)
            addRelatedEffects(mod.cache.effect[rel])
          }
          else{
            console.log(`entity not exist ` + rel)
          }
        }
      }
    }
    for(let behaviorBuff of behaviorBuffs){
      addRelatedEffects(behaviorBuff)
    }

    for(let behaviorUnit of behaviorUnits){
      if(!productionUnits.includes(behaviorUnit)){
        productionUnits.push(behaviorUnit)
      }
    }

    let effectSpawnUnits = [...new Set(relatedEffects.map(relID => mod.cache.effect[relID]).filter(relEntity => relEntity?.data().SpawnUnit).map(rel => rel.data().SpawnUnit).flat())]
    productionUnits.push(...effectSpawnUnits)


    return {
      morphUnits:  [...new Set(morphUnits)],
      researchUpgrades,
      productionUnits
    }
  }
  function analyzeUpgrades(upgrades,raceData,raceUnits = [],raceUpgrades = [],path = []) {
    for (let upgradeID of upgrades) {
      if (!upgradeID || raceUpgrades.includes(upgradeID)) {
        continue;
      }
      raceUpgrades.push(upgradeID)
    }
  }
  function analyzeUnits(units, raceData, raceUnits = [],raceUpgrades = [],path = []){

    if(units) {
      for (let unitID of units) {
        if(unitID === "DroneSCBW"){
          unitID
        }
        if(!unitID){
          console.warn(`undefined reference ${path.join(".")}`)
          continue;
        }
        if (raceData?.exclude?.unit?.includes(unitID)) {
          continue;
        }
        if (raceUnits.includes(unitID)) {
          continue;
        }

        let unit = mod.cache.unit[unitID]
        if(!unit){
          console.warn(`invalid reference: unit ${unitID} not exists ${path.join(".")}`)
          continue;
        }

        let unitData = unit.data()


        if(!raceData?.include?.unit?.includes(unitID)){
          //skip units from dependency mods and ignored units, without required fields
          if (unitData.ignore || /* || !unitData.GlossaryPriority ||  */ unitData.FlagArray.Unselectable || unitData.EditorFlags?.NoPalettes || unitData.EditorFlags?.NoPlacement) {
            continue;
          }
        }
        raceUnits.push(unitID)

        let prod = getUnitProduction(unitID)
        unit._production = prod.productionUnits
        unit._research = prod.researchUpgrades
        unit._morph = prod.morphUnits
        unit._upgrades = unit.getReferences(ref => ref.class === 'CUpgrade').map(entity => entity.id)
        unit._requirements = unit.getRequirements()
        unit._actor = unit.getActor()
        let {layouts, commands} = getCardData(unit)
        unit._layouts = layouts
        unit._commands = commands
        unit._phase = []
        // let {producedUnits, producedUpgrades} = getProduction(commands.map(cmd => cmd.AbilCmd))

        let categories = unitData.EditorCategories?.split(",").map(cat => cat.split(':')).reduce((acc, [category, value]) => ({
          ...acc,
          [category]: value
        }), {})
        unit._category = categories?.ObjectType === 'Structure' ? 'structure' : 'army'
        unit._icon = unit._actor?.UnitIcon || unit._actor?.Wireframe?.Image?.[0]

        analyzeUnits(unit._morph, raceData, raceUnits, raceUpgrades,[...path,unit.id])
        analyzeUnits(unit._production, raceData, raceUnits, raceUpgrades,[...path,unit.id])
        analyzeUpgrades(unit._research, raceData, raceUnits, raceUpgrades,[...path,unit.id])

      }
    }

    return {units: raceUnits,upgrades: raceUpgrades}
  }

  // mod.cache.unit.ProbeSCBW.resolveButtons()
  // mod.cache.unit.CommandCenterSCBW.resolveButtons()
  // mod.resolveDataTextValues()
  mod.resolveButtons()

  mod.makeAbilCmds()
//do not add the following entities and its children to the output data
  mod.ignoreEntities({
    unit: [
      "DESTRUCTIBLE",
      "POWERUP",
      "STARMAP",
      "SS_Plane",
      "SS_BackgroundSpace",
      "Shape",
      "MISSILE_INVULNERABLE",
      "MISSILE",
      "MISSILE_HALFLIFE",
      "PLACEHOLDER",
      "PLACEHOLDER_AIR",
      "PATHINGBLOCKER",
      "BEACON",
      "SMCHARACTER",
      "SMCAMERA",
      "SMSET",
      "ITEM",
    ]
  })
//pick specific races
// mod.pick({race: ["Terr","Zerg","Prot"]})
  mod.index()

  let locales = mod.components?.filter(entity => entity.Type.toLowerCase() === "text").map(entity => entity.Locale)
  for(let textKey in mod.text){
    let textEntity = mod.text[textKey]

    let uniqueTargets = []
    let relationsPerLocale = {}
    for(let locale of locales){
      relationsPerLocale[locale] = textEntity.$$relations.filter(rel => rel.path.endsWith("." + locale))
      if(!textEntity.Value[locale]){
        if(textEntity.$category === "GameStrings" && textEntity.$modname === "SCEvo"){
          console.log(`Text Value ${textEntity.$category} ${textKey}  is not defined in locale ${locale}`)
        }
      }

      for(let relation of relationsPerLocale[locale] ){
        if(!uniqueTargets.includes(relation.target)){
          uniqueTargets.push(relation.target)
        }
      }
    }
    for(let target of uniqueTargets){
      let count = {}
      for(let locale of locales){
        if(textEntity.Value[locale]){
          count[locale] = relationsPerLocale[locale].filter(rel => rel.target === target).length
        }
      }
      // let uniqueValues = [...new Set(Object.values(count))].length;
      if(Object.values(count).includes(0)){
        if(textEntity.$category === "GameStrings" && textEntity.$modname === "SCEvo") {
          console.log(`GameString ${textKey} might be not relevant. Reference ${target.id} usages: ${Object.entries(count).map(el => el.join(":")).join(",")}`)
        }
      }

      // if(uniqueValues > 1){
      //   console.log(`Relations are different ${Object.entries({"enUS": 2, "ruRU": 2}).map(el => el.join(":")).join(",")}`)
      // }
    }
  }
//replace text strings expressions with data values
  mod.resolveTextValues()
//load the list of available icons
  mod.readImages('./../starcraft-all-races-web-assets/icons')
//check entities icons and use the available ones
  mod.checkImages()
//add actor data to units
  mod.resolveUnitActors()

 // let strings = mod.locales.enUS.GameStrings

  let output = {}

  // Object.assign(mod.cache.race.Terr, {
  //   include: {unit: ["Reactor"]},
  //   exclude: {unit: ["BarracksReactor", "FactoryReactor", "StarportReactor"]}
  // })
  // Object.assign(mod.cache.race.Zerg, {
  //   include: {unit: ["LocustMPFlying", "Broodling"]}
  // })
  // Object.assign(mod.cache.race.Prot, {
  //   include: {unit: ["Interceptor"]},
  //   exclude: {unit: ["AdeptPhaseShift", "DisruptorPhased"]},
  // })
// Object.assign(mod.cache.race.Xayi,{
//     include: {unit: []},
//     exclude: {unit: ["AcidNest"]},
// })

  let racesData = mod.catalogs.race
    .map(race => ({
      ...race.getResolvedData(),
      ...pick(race, ["include", "exclude"])
    }))
  if(!config.allunits){
    //racesData = racesData.filter(race => race.Flags?.Selectable === 1)
    racesData = racesData.filter(race => ["Prot","Terr","Zerg","BWPr","BWTe","BWZe"].includes(race.id))
  }

  output["index"] = {
    discord: config.discord,
    id: config.id,
    races: racesData.map(race => ({
      id: race.id,
      Name: textValue(race.Name),
      Icon: race.Icon?.toLowerCase().replace(/\\/g, '/').replace(/.*\//, '').replace('.dds', ''),
    }))
  }

  for (let raceData of racesData) {

    let outputRaceData = output[`race/${raceData.id}`] = {
      id: raceData.id,
      Name: textValue(raceData.Name),
      Icon: raceData.Icon?.toLowerCase().replace(/\\/g, '/').replace(/.*\//, '').replace('.dds', ''),
      cache: {
        upgrades: {},
        units: {},
      },
      StartingUnitArray: raceData.StartingUnitArray?.map(su => pick(su, ["Unit", "Count"])) || []
    }

    let startUnits
    if(config.allunits) {
      startUnits = mod.catalogs.unit.filter(u => u.Race === raceData.id).map((a) => a.id)//raceData.StartingUnitArray.filter(su => su.Unit && su.Count !== 0 && su.Flags?.ResourceSetRally).map(su => su.Unit)
    } else {
      startUnits = raceData.StartingUnitArray.filter(su => su.Unit && su.Count !== 0 && su.Flags?.ResourceSetRally).map(su => su.Unit)
    }
    let {units, upgrades} = analyzeUnits(startUnits, raceData)

    if (raceData.include?.unit) {
      analyzeUnits(raceData.include.unit, raceData, units, upgrades)
    }

    for (let unitID of units) {
      let unit = mod.cache.unit[unitID]

      if (unit._morph) {
        for (let i = unit._morph.length; i--;) {
          let morphID = unit._morph[i]
          let morph = mod.cache.unit[morphID]
          if (!morph) {
            continue;
          }
          if(unit.data().Race === "BWZe"){
              continue
          }
          if (morph._morph?.includes(unit.id)) {
            morph._phased = unit.id
            unit._phase.push(morphID)
            unit._morph.splice(i, 1)
            if (unit._phased) {
              let phased = mod.cache.unit[unit._phased]
              phased._phase.push(morphID)
            }
          }
        }
      }
    }

    let sortedUnits = units.sort((a, b) => {
      return mod.cache.unit[a].data().GlossaryPriority || 9999 > mod.cache.unit[b].data().GlossaryPriority || 9999 ? 1 : -1
    })

    outputRaceData.army = sortedUnits.filter((a) => mod.cache.unit[a]._category === 'army')

    outputRaceData.structures = sortedUnits.filter((a) => mod.cache.unit[a]._category === 'structure')

    for (let upgradeID of upgrades) {
      let upgrade = mod.cache.upgrade[upgradeID]
      if(!upgrade){
        console.warn(`invalid upgrade reference ${upgradeID}`)
        continue;
      }
      let num = /([@_\w]+?)([0-9]+)$/.exec(upgradeID)
      if (num) {
        if (num[2] !== "1") {
          upgrade._phased = num[1] + "1"
          let phasedUpgrade = mod.cache.upgrade[upgrade._phased]
          if (!phasedUpgrade) {
            continue;
          }
          if (!phasedUpgrade._phase) {
            phasedUpgrade._phase = []
          }
          phasedUpgrade._phase.push(upgradeID)
        }
      }
    }
    for (let upgradeID of upgrades) {
      let upgrade = mod.cache.upgrade[upgradeID]
      if(!upgrade){
        console.warn(`invalid upgrade reference ${upgradeID}`)
        continue;
      }
      let upgradeData = upgrade.data()
      let shortUpgradeData = shortInfo(upgrade)

      output[`upgrade/${upgradeID}`] = {
        ...shortUpgradeData,
        ...upgradeData,
      }

      outputRaceData.cache.upgrades[upgradeID] = {
        ...upgradeData,
        ...shortUpgradeData,
        Icon: upgradeData.Icon,
        $Phase: upgrade._phase && [...upgrade._phase],
        $Phased: upgrade._phased
      }
    }
    outputRaceData.upgrades = upgrades

    for (let unitID of sortedUnits) {
      let unit = mod.cache.unit[unitID]
      let unitData = unit.data()
      let shortUnitData = shortInfo(unit)

      output[`unit/${unit.id}`] = {
        ...unitData,
        ...shortUnitData,
        Icon: unit._icon,
        LifeArmorIcon: unit._actor?.LifeArmorIcon,
        ShieldArmorIcon: unit._actor?.ShieldArmorIcon,
        LifeArmorName: textValue(unitData.LifeArmorName),
        ShieldArmorName: textValue(unitData.ShieldArmorName),
        class: null,
        BehaviorArray: null,
        WeaponArray: null,
        AbilArray: null,
        CardLayouts: unit._layouts,
        Weapons: filterLinks(unit.id, unitData.WeaponArray, "weapon").map(w => ({Turret: w.Turret, ...weaponInfo(mod.cache.weapon[w.Link])})),
        Behaviors: filterLinks(unit.id, unitData.BehaviorArray, "behavior").map(b => shortInfo(mod.cache.behavior[b.Link])),
        Abilities: filterLinks(unit.id, unitData.AbilArray, "abil").map(a => shortInfo(mod.cache.abil[a.Link])),
        $Upgrades: unit._upgrades,
        $Requirements: [...unit._requirements.units, ...unit._requirements.upgrades],
        $Production: [...unit._production],
        $Research: [...unit._research],
        $Morph: [...unit._morph],
        $Phase: [...unit._phase],
        $Phased: unit._phased,
        $Producers: unit._requirements.producers,
        $Commands: unit._commands,
        EditorFlags: flagArray(unitData.EditorFlags),
        FlagArray: flagArray(unitData.FlagArray),
        PlaneArray: flagArray(unitData.PlaneArray),
        Collide: flagArray(unitData.Collide),
        Attributes: flagArray(unitData.Attributes),
      }

      outputRaceData.cache.units[unitData.id] = {
        ...shortUnitData,
        ...pick(unitData, ['LifeMax', 'LifeArmor', 'ShieldsMax', 'ShieldArmor', 'Food', 'CostResource']),
        Production: [...unit._production],
        Research: [...unit._research],
        Morph: [...unit._morph],
        Icon: unit._icon,
        $Phase: unit._phase && [...unit._phase],
        $Phased: unit._phased,
        LifeArmorIcon: unit._actor?.LifeArmorIcon,
        ShieldArmorIcon: unit._actor?.ShieldArmorIcon,
        LifeArmorName: textValue(unitData.LifeArmorName),
        ShieldArmorName: textValue(unitData.ShieldArmorName),
        priority: unitData.GlossaryPriority
      }
    }
  }

  fs.removeSync(config.output)

  for (let file in output) {
    fs.mkdirSync(config.output + file.replace('\\','/').substring(file.toLowerCase(), file.lastIndexOf("/")), {recursive: true});

    fs.writeFileSync(config.output + file.toLowerCase() + '.json', SCParser.formatData(output[file], 'json'), 'utf-8')
  }

}

//SCParser.SCGame.directories.mods = `C:\\Program Files (x86)\\StarCraft II\\mods\\all-races-mods`
//SCParser.SCGame.directories.dependencies = 'C:\\Program Files (x86)\\StarCraft II\\MODS\\all-races-mods\\dependencies'
SCParser.SCGame.directories.builtin = 'C:\\Users\\ayunes\\sc2\\SC2GameData\\mods'
SCParser.SCGame.directories.factions = 'C:\\Users\\ayunes\\sc2\\SCEvoComplete\\SC Evo Complete'

// let localPath = './../../../mods/all-races-mods/factions/'
// let arcGitPath = 'github:hometlt/starcraft-all-races-mods/'
// let scionGitPath = 'github:Solstice245/scion-keiron-dev/'

// await wiki( {
//   discord:"https://discord.gg/Xx9xurbb4u",
//   id:"voidMulti",
//   mods: [
//     '$builtin/Core.SC2Mod',
//     '$builtin/Liberty.sc2mod',
//     '$builtin/Swarm.sc2mod',
//     '$builtin/Void.sc2mod',
//     '$builtin/VoidMulti5011.sc2mod',
//     // '$dependencies/Base.SC2Mod',
//     // '$dependencies/VoidMulti.SC2Mod',
//     // '$factions/Scion.SC2Mod',
//     // '$factions/Dragons.SC2Mod',
//     // '$factions/UED.SC2Mod',
//     // '$factions/UPL.SC2Mod',
//     // '$factions/Hybrids.SC2Mod',
//     // '$factions/Synoid.SC2Mod',
//     // '$factions/Umojan.SC2Mod'
//   ],
//   output: './../src/data/lotv5011/'
// })

await wiki( {
  discord:"https://discord.gg/Xx9xurbb4u",
  id:"scevo",
  mods: [
    '$builtin/Core.SC2Mod',
    '$builtin/Liberty.sc2mod',
    '$builtin/Swarm.sc2mod',
    '$builtin/Void.sc2mod',
    '$builtin/VoidMulti.SC2Mod',
    '$factions/SCEvo_Core.SC2Mod',
    '$factions/SCEvo_Extension.SC2Mod',
    // '$factions/Scion.SC2Mod',
    // '$factions/Dragons.SC2Mod',
    // '$factions/UED.SC2Mod',
    // '$factions/UPL.SC2Mod',
    // '$factions/Hybrids.SC2Mod',
    // '$factions/Synoid.SC2Mod',
    // '$factions/Umojan.SC2Mod'
  ],
  output: './src/data/scevo/'
})

// await wiki( {
//   discord:"https://discord.gg/Xx9xurbb4u",
//   id:"scion",
//   mods: [
//     './input/legacy.json',
//     // './input/scion.json',
//     // localPath + 'ScionMod.SC2Mod',
//     // localPath + 'Dragons.SC2Mod',
//     // localPath + 'UED.SC2Mod',
//     // localPath + 'UPL.SC2Mod',
//     // localPath + 'Hybrids.SC2Mod',
//     // localPath + 'Synoid.SC2Mod',
//     // localPath + 'Umojan.SC2Mod',
//   ],
//   output: './../data/scion2/'
// })

//
// await wiki( {
//   discord:"https://discord.gg/Xx9xurbb4u",
//   id:"scion",
//   allunits: true,
//   mods: [
//     './input/nexus.json',
//     // './input/talon.json',
//     // './input/scion.json',
//     // localPath + 'ScionMod.SC2Mod',
//     // localPath + 'Dragons.SC2Mod',
//     // localPath + 'UED.SC2Mod',
//     // localPath + 'UPL.SC2Mod',
//     // localPath + 'Hybrids.SC2Mod',
//     // localPath + 'Synoid.SC2Mod',
//     // localPath + 'Umojan.SC2Mod',
//   ],
//   output: './../data/nexus/'
// })
