/**
 * A simple and flexible system for world-building using an arbitrary collection of character and item attributes
 * Author: Atropos
 * Software License: GNU GPLv3
 */

// Import Modules
import { registerSystemSettings } from "./settings.js";
import { preloadHandlebarsTemplates } from "./blades-templates.js";
import { bladesRoll, simpleRollPopup } from "./blades-roll.js";
import { BladesHelpers } from "./blades-helpers.js";
import { BladesActor } from "./blades-actor.js";
import { BladesItem } from "./blades-item.js";
import { BladesItemSheet } from "./blades-item-sheet.js";
import { BladesActorSheet } from "./blades-actor-sheet.js";
import { BladesActiveEffect } from "./blades-active-effect.js";
import { BladesClockSheet } from "./blades-clock-sheet.js";
import { BladesNPCSheet } from "./blades-npc-sheet.js";
import { BladesMaskSheet } from "./blades-mask-sheet.js";
import { BladesRebelionSheet } from "./blades-rebelion-sheet.js";


import * as migrations from "./migration.js";

window.BladesHelpers = BladesHelpers;

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
Hooks.once("init", async function() {
  console.log(`Initializing Blades In the Dark System`);

  game.blades = {
    dice: bladesRoll
  };
  game.system.bladesClocks = {
    sizes: [ 4, 6, 8 ]
  };

  CONFIG.Item.documentClass = BladesItem;
  CONFIG.Actor.documentClass = BladesActor;
  CONFIG.ActiveEffect.documentClass = BladesActiveEffect;

  // Register System Settings
  registerSystemSettings();

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("blades", BladesActorSheet, { types: ["character"], makeDefault: true });
  Actors.registerSheet("blades", BladesClockSheet, { types: ["\uD83D\uDD5B clock"], makeDefault: true });
  Actors.registerSheet("blades", BladesNPCSheet, { types: ["npc"], makeDefault: true });
  Actors.registerSheet("blades", BladesMaskSheet, { types: ["mask"], makeDefault: true });
  Actors.registerSheet("blades", BladesRebelionSheet, { types: ["rebelion"], makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("blades", BladesItemSheet, {makeDefault: true});
  await preloadHandlebarsTemplates();

  Actors.registeredSheets.forEach(element => console.log(element.Actor.name));


  // Multiboxes.
  Handlebars.registerHelper('multiboxes', function(selected, options) {

    
    let html = $( options.fn(this) );
    let query = `input[type='radio'][value='${selected}']`;

    html.find(query).attr("checked", true);
 

    return html.prop('outerHTML');
  });


  // Enrich the HTML replace /n with <br>
  Handlebars.registerHelper('html', (options) => {

    let text = options.hash['text'].replace(/\n/g, "<br />");

    return new Handlebars.SafeString(text);
  });

  // "N Times" loop for handlebars.
  //  Block is executed N times starting from n=1.
  //
  // Usage:
  // {{#times_from_1 10}}
  //   <span>{{this}}</span>
  // {{/times_from_1}}
  Handlebars.registerHelper('times_from_1', function(n, block) {
    var accum = '';
    for (var i = 1; i <= n; ++i) {
      accum += block.fn(i);
    }
    return accum;
  });

  // "N Times" loop for handlebars.
  //  Block is executed N times starting from n=0.
  //
  // Usage:
  // {{#times_from_0 10}}
  //   <span>{{this}}</span>
  // {{/times_from_0}}
  Handlebars.registerHelper('times_from_0', function(n, block) {

    var accum = '';
    for (var i = 0; i <= n; ++i) {
      accum += block.fn(i);
    }
    return accum;
  });

  Handlebars.registerHelper('contains', function(elem, list, options) {
    if(list.indexOf(elem) > -1) {
      return options.fn(this);
    }
      return options.inverse(this);
  });

	Handlebars.registerHelper("math", function(lvalue, operator, rvalue, options) {
			lvalue = parseFloat(lvalue);
			rvalue = parseFloat(rvalue);
					
			return {
					"+": lvalue + rvalue,
					"-": lvalue - rvalue,
					"*": lvalue * rvalue,
					"/": lvalue / rvalue,
					"%": lvalue % rvalue
			}[operator];
	});

  // Concat helper
  // https://gist.github.com/adg29/f312d6fab93652944a8a1026142491b1
  // Usage: (concat 'first 'second')
  Handlebars.registerHelper('concat', function() {
    var outStr = '';
    for(var arg in arguments){
        if(typeof arguments[arg]!='object'){
            outStr += arguments[arg];
        }
    }
    return outStr;
  });


  /**
   * @inheritDoc
   * Takes label from Selected option instead of just plain value.
   */

  Handlebars.registerHelper('selectOptionsWithLabel', function(choices, options) {

    const localize = options.hash['localize'] ?? false;
    let selected = options.hash['selected'] ?? null;
    let blank = options.hash['blank'] || null;
    selected = selected instanceof Array ? selected.map(String) : [String(selected)];

    // Create an option
    const option = (key, object) => {
      if ( localize ) object.label = game.i18n.localize(object.label);
      let isSelected = selected.includes(key);
      html += `<option value="${key}" ${isSelected ? "selected" : ""}>${object.label}</option>`
    };

    // Create the options
    let html = "";
    if ( blank ) option("", blank);
    Object.entries(choices).forEach(e => option(...e));

    return new Handlebars.SafeString(html);
  });


  /**
   * Create appropriate Blades clock
   */

  Handlebars.registerHelper('blades-clock', function(parameter_name, type, current_value, uniq_id, label=null) {
    let html = '';
  
    if (current_value === null || current_value === 'null') {
      current_value = 0;
    }

    if (parseInt(current_value) > parseInt(type)) {
      current_value = type;
    }

    // Label for 0
    html += `<label class="clock-zero-label" for="clock-0-${uniq_id}-${label}"><i class="fab fa-creative-commons-zero nullifier"></i>${label}</label>`;
    html += `<div id="blades-clock-${uniq_id}-${label}" class="blades-clock clock-${type} clock-${type}-${current_value}" style="background-image:url('systems/brinkwood/styles/assets/progressclocks-svg/Progress Clock ${type}-${current_value}.svg');">`;

    let zero_checked = (parseInt(current_value) === 0) ? 'checked' : '';
    html += `<input type="radio" value="0" id="clock-0-${uniq_id}-${label}" data-dType="Number" name="${parameter_name}" ${zero_checked}>`;

    for (let i = 1; i <= parseInt(type); i++) {
      let checked = (parseInt(current_value) === i) ? 'checked' : '';
      html += `
        <input type="radio" value="${i}" id="clock-${i}-${uniq_id}-${label}" data-dType="Number" name="${parameter_name}" ${checked}>
        <label for="clock-${i}-${uniq_id}-${label}"></label>
      `;
    }

    html += `</div>`;
    return html;
  });
});

/**
 * Once the entire VTT framework is initialized, check to see if we should perform a data migration
 */
Hooks.once("ready", function() {

  // Determine whether a system migration is required
  const currentVersion = game.settings.get("brinkwood", "systemMigrationVersion").toString();
  const NEEDS_MIGRATION_VERSION = "0.5.4";

  let needMigration = (currentVersion < NEEDS_MIGRATION_VERSION) || (currentVersion === null);

  // Perform the migration
  if ( needMigration && game.user.isGM ) {
    migrations.migrateWorld();
  }
});

/*
 * Hooks
 */

// getSceneControlButtons
Hooks.on("renderSceneControls", async (app, html) => {
  let dice_roller = $('<li class="scene-control" title="Dice Roll"><i class="fas fa-dice"></i></li>');
  dice_roller.click( async function() {
    await simpleRollPopup();
  });
  html.children().first().append( dice_roller );

});

Hooks.on('init', () => {
  class BrinkwoodTooltipManager extends TooltipManager { 
		activate(element, {text, direction, cssClass}={}) {
  		cssClass = element.dataset.cssClass || cssClass;
			super.activate(element, {text, direction, cssClass});
		}
	}
  game.tooltip = new BrinkwoodTooltipManager();
})

/*
 * Functions
 */


