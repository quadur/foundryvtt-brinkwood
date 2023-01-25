
import { BladesSheet } from "./blades-sheet.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {BladesSheet}
 */
export class BladesClockSheet extends BladesSheet {

  /** @override */
	static get defaultOptions() {
	  return foundry.utils.mergeObject(super.defaultOptions, {
  	  classes: ["brinkwood", "sheet", "actor", "clock"],
  	  template: "systems/brinkwood/templates/actors/clock-sheet.html",
      width: 700,
      height: 970,
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData(options) {
    const superData = super.getData( options );
    const sheetData = superData.data;
    sheetData.owner = superData.owner;
    sheetData.editable = superData.editable;
    sheetData.isGM = game.user.isGM;

    return sheetData;
  }

    /* -------------------------------------------- */

  /** @override */
  async _updateObject(event, formData) {
    let image_path = `systems/brinkwood/styles/assets/progressclocks-svg/Progress Clock ${formData['data.type']}-${formData['data.value']}.svg`;
    formData['img'] = image_path;
    formData['prototypeToken.texture.src'] = image_path;
    let data = [];
    let update = {
      img: image_path,
      width: 1,
      height: 1,
      scale: 1,
      mirrorX: false,
      mirrorY: false,
      tint: "",
      displayName: 50
    };

    let tokens = this.actor.getActiveTokens();
    tokens.forEach( function( token ) {
      data.push(
        foundry.utils.mergeObject(
          { _id: token.id },
          update
        )
      );
    });
    await TokenDocument.updateDocuments( data, { parent: game.scenes.current } )

    // Update the Actor
    return this.object.update(formData);
  }

  /* -------------------------------------------- */

}
