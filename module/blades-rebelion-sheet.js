
import { BladesSheet } from "./blades-sheet.js";

/**
 * Extend the basic MaskSheet with some very simple modifications
 * @extends {BladesSheet}
 */
export class BladesRebelionSheet extends BladesSheet {

  /** @override */
   static get defaultOptions() {
	  return foundry.utils.mergeObject(super.defaultOptions, {
  	  classes: ["brinkwood", "sheet", "actor", "pc", "rebelion"],
  	  template: "systems/brinkwood/templates/rebelion-sheet.html",
      width: 500,
      height: 870,
      tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "overview"}]
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
    html.find(".dot-value").click(this._onDotChange.bind(this)); 
  }

  async _onDotChange(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    const actor_data = duplicate(this.actor);
   
    let new_value = parseInt(dataset.value);
    let max_value = parseInt(dataset.max_value);

    let old_value = foundry.utils.getProperty(actor_data, dataset.path);

    if (new_value == old_value && new_value == 1) {
      new_value = 0;
    }
    
    if (new_value > max_value) { new_value = max_value }

    foundry.utils.setProperty(actor_data, dataset.path, new_value);

    await this.actor.update(actor_data);
    this.render();
  }

  /* -------------------------------------------- */


}
