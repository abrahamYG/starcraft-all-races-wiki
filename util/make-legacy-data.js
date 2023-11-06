import * as SCParser from "sc-parser"
import fs from 'fs'

// SCParser.SCGame.directories.mods = `C:\\Program Files (x86)\\StarCraft II\\mods\\all-races-mods`
SCParser.SCGame.directories.mods = `github:hometlt/starcraft-all-races-mods`


async function makeLegacyData() {
  let mod = await SCParser.createMod({
    mods: [
      '$mods/dependencies/Core',
      '$mods/dependencies/Base',
      '$mods/dependencies/Legacy'
    ]
  })
  mod.write("./legacy.json")
}

await makeLegacyData()
