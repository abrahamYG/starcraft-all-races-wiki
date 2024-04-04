// import * as SCParser from "sc-parser"
import * as SCParser from "./../../parser/index.js"

SCParser.SCGame.directories.mods = `C:\\Program Files (x86)\\StarCraft II\\mods\\all-races-mods`
SCParser.SCGame.directories.git = `github:hometlt/starcraft-all-races-mods`


// let multi = await SCParser.createMod({
//   mods: [
//     '$mods/builtin/Core',
//     '$mods/dependencies/Base',
//     '$mods/bundles/Legacy'
//   ]
// })
// multi.write("./input/lotv.json")
//
//
// let coop = await SCParser.createMod({
//   mods: [
//     '$mods/builtin/Core',
//     '$mods/dependencies/Base',
//     '$mods/bundles/LegacyCoop'
//   ]
// })
// coop.write("./input/coop.json")
//
//
// let talon = await SCParser.createMod({
//   mods: [
//     '$mods/builtin/Core',
//     '$mods/dependencies/Base',
//     '$mods/coop/ProtossTalon'
//   ]
// })
// talon.write("./input/talon.json")
//
//
let nexus = await SCParser.createMod({
  mods: [
    '$mods/builtin/Core',
    '$mods/dependencies/Base',
    '$mods/bundles/VoidCoop',
    '$mods/factions-nexus/Nexus',
    '$mods/factions-nexus/NexusCerberus',
    '$mods/factions-nexus/NexusGestalt',
    '$mods/factions-nexus/NexusHanson',
    '$mods/factions-nexus/NexusJinara',
    '$mods/factions-nexus/NexusNiadra',
    '$mods/factions-nexus/NexusValerian',
  ]
})
nexus.write("./input/---.json")
