const fs = require("fs");
const path = require("path");
const FSDB = require("file-system-db");
const express = require('express')
const { exec } = require('child_process');
const app = express()
const port = 6969

const db = new FSDB("./db.json", true);
const mappings = new FSDB("./mappings.json", true);

function syncFromMinecraft() {
  exec("./main");
  setTimeout(()=>{
    const jsonsInDir = fs
        .readdirSync(".")
        .filter((file) => path.extname(file) === ".minecraft");

    jsonsInDir.forEach((file) => {
      const fileData = fs.readFileSync(path.join(".", file));
      let jsonData = JSON.parse(fileData.toString());
      let costMapping = {
        "netherite_armor":15000,
        "diamond_armor_full":10000,
        "gold_armor_full":10000,
        "iron_armor_full":10000,
        "leather_armor_full":10000,
        "naked_armor_stand":10000,
        "enchant_level":10000,
        "trim_base":15000,
        "trim_diamond":20000,
        "wooden_tool":7500,
        "stone_tool": 7500,
        "iron_tool":7500,
        "gold_tool":7500,
        "diamond_tool":7500,
        "netherite_tool":15000,
        "tool_enchant":7500
      }
      for (const entity of jsonData.Entities) {
        if (entity.CustomNameVisible === 1) {
          let cost = 0
          switch (entity.ArmorItems[0].id) {
            case "minecraft:netherite_boots":
              cost += costMapping["netherite_armor"]
              break
            case "minecraft:diamond_boots":
              cost += costMapping["diamond_armor_full"]
              break
            case "minecraft:gold_boots":
              cost += costMapping["gold_armor_full"]
              break

          }
          db.set(entity.ArmorItems[3].tag.SkullOwner.Name, {Armor: entity.ArmorItems, Hands: entity.HandItems})
          mappings.set(entity.ArmorItems[3].tag.SkullOwner.Name, entity.ArmorItems[3].tag.SkullOwner.Name)
        }
      }
    });
  }, 150)

}

setInterval(()=>{
  syncFromMinecraft()
},500);

app.get('/user/:username', (req, res) => {
  res.send(db.get(mappings.get(req.params.username)) == null ? {Error: "No User Exists"} : db.get(mappings.get(req.params.username)));
});

app.get("/map/:from/:to",(req,res)=>{
  mappings.set(req.params.from, req.params.to)
  res.send("Minecraft Username Successfully Mapped")
});

app.get("/map/user/:username",(req,res)=>{
  res.send(mappings.get(req.params.username) == null ? {Error: "Mapping Doesnt Exist"} : mappings.get(req.params.username))
});

app.listen(port, () => {
  console.log(`Statue API listening on port ${port}`)
});