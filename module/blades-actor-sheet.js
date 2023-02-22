
import { BladesSheet } from "./blades-sheet.js";
import { BladesActiveEffect } from "./blades-active-effect.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {BladesSheet}
 */
export class BladesActorSheet extends BladesSheet {

  /** @override */
   static get defaultOptions() {
	  return foundry.utils.mergeObject(super.defaultOptions, {
  	  classes: ["brinkwood", "sheet", "actor", "pc"],
  	  template: "systems/brinkwood/templates/actor-sheet.html",
      width: 700,
      height: 970,
      tabs: [{navSelector: ".tabs", contentSelector: ".tab-content", initial: "abilities"}]
    });
  }

  /* -------------------------------------------- */
  /* -------------------------------------------- */

  /** @override */
  async getData(options) {
    const superData = super.getData( options );
    const sheetData = superData.data;
    sheetData.owner = superData.owner;
    sheetData.editable = superData.editable;
    sheetData.isGM = game.user.isGM;

    // Prepare active effects
    sheetData.effects = BladesActiveEffect.prepareActiveEffectCategories(this.actor.effects);

		this.setAttrLabels(sheetData.system.attributes);

		sheetData.traits = sheetData.items.filter(i => i.type == "trait").sort((a, b) => {
			if (a.system.purchased > b.system.purchased) {
				return -1;
			} else {
				return 1;
			}
    });

		Object.entries(sheetData.system.attributes).forEach(([name, attr]) => { sheetData.system.attributes[name].value = Object.values(attr.skills).filter(s => s.value > 0).length } )


    // Calculate Load
    let loadout = 0;
    sheetData.items.forEach(i => {loadout += (i.type === "item" && i.system.equipped) ? parseInt(i.system.load) : 0});

    //Sanity Check
    if (loadout < 0) {
      loadout = 0;
    }
    if (loadout > 10) {
      loadout = 10;
    }

    sheetData.system.loadout = loadout;

    // Encumbrance Levels
    let load_level=["BITD.Light","BITD.Light","BITD.Light","BITD.Light","BITD.Normal","BITD.Normal","BITD.Heavy","BITD.Encumbered",
			"BITD.Encumbered","BITD.Encumbered","BITD.OverMax"];
    let mule_level=["BITD.Light","BITD.Light","BITD.Light","BITD.Light","BITD.Light","BITD.Light","BITD.Normal","BITD.Normal",
			"BITD.Heavy","BITD.Encumbered","BITD.OverMax"];
    let mule_present=0;


    //look for Mule ability
    // @todo - fix translation.
    sheetData.items.forEach(i => {
      if (i.type === "ability" && i.name === "(C) Mule") {
        mule_present = 1;
      }
    });

    //set encumbrance level
    if (mule_present) {
      sheetData.system.load_level=mule_level[loadout];
    } else {
      sheetData.system.load_level=load_level[loadout];
    }

    sheetData.system.load_levels = {"BITD.Light":"BITD.Light", "BITD.Normal":"BITD.Normal", "BITD.Heavy":"BITD.Heavy"};

    sheetData.system.description = await TextEditor.enrichHTML(sheetData.system.description, {secrets: sheetData.owner, async: true});

    return sheetData;
  }

  /* -------------------------------------------- */

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Update Inventory Item
    html.find('.item-body').click(ev => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
      item.sheet.render(true);
    });


    // Delete Inventory Item
    html.find('.item-delete').click( async ev => {
      const element = $(ev.currentTarget).parents(".item");
      await this.actor.deleteEmbeddedDocuments("Item", [element.data("itemId")]);
      element.slideUp(200, () => this.render(false));
    });

    html.find(".dot-value").click(this._onDotChange.bind(this)); 

    // manage active effects
    html.find(".effect-control").click(ev => BladesActiveEffect.onManageActiveEffect(ev, this.actor));
  }

  async _onDotChange(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    let new_value = parseInt(dataset.value);
    let max_value = parseInt(dataset.max_value);

    let old_value = foundry.utils.getProperty(this.actor, dataset.path);

    if (new_value == old_value && new_value == 1) {
      new_value = 0;
    }
    
    if (new_value > max_value) { new_value = max_value }

    await this.actor.update({ [dataset.path]: new_value });
    this.render();
  }

  /* -------------------------------------------- */


}
