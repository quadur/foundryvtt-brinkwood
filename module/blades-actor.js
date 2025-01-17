import { bladesRoll } from "./blades-roll.js";
import { BladesHelpers } from "./blades-helpers.js";

/**
 * Extend the basic Actor
 * @extends {Actor}
 */
export class BladesActor extends Actor {

  /** @override */
  static async create(data, options={}) {

    data.prototypeToken = data.prototypeToken || {};

    // For Crew and Character set the Token to sync with charsheet.
    if ( ['character', '\uD83D\uDD5B clock'].includes(data.type) ) {
      data.prototypeToken.actorLink = true;
    }
    return super.create(data, options);
  }

  async _onCreate( data, options, userId ) {
    super._onCreate( data, options, userId );
    
    //load basic items for characters
    if ( data.type == "character" ) {
      await this._loadBasicItems();
    }

  }

  /** @override */

  /* -------------------------------------------- */

  rollAttributePopup(attribute_name, attribute_label, attribute_value) {

    let content = `
        <h2>${game.i18n.localize('BITD.Roll')} ${game.i18n.localize(attribute_label)}</h2>
        <form>
          <div class="form-group">
            <label>${game.i18n.localize('BITD.Modifier')}:</label>
            <select id="mod" name="mod">
              ${this.createListOfDiceMods(-3,+3,0)}
            </select>
          </div>`;
    if (BladesHelpers.isAttributeAction(attribute_label)) {
      content += `
            <div class="form-group">
              <label>${game.i18n.localize('BITD.Position')}:</label>
              <select id="pos" name="pos">
                <option value="controlled">${game.i18n.localize('BITD.PositionControlled')}</option>
                <option value="risky" selected>${game.i18n.localize('BITD.PositionRisky')}</option>
                <option value="desperate">${game.i18n.localize('BITD.PositionDesperate')}</option>
              </select>
            </div>
            <div class="form-group">
              <label>${game.i18n.localize('BITD.Effect')}:</label>
              <select id="fx" name="fx">
                <option value="limited">${game.i18n.localize('BITD.EffectLimited')}</option>
                <option value="standard" selected>${game.i18n.localize('BITD.EffectStandard')}</option>
                <option value="great">${game.i18n.localize('BITD.EffectGreat')}</option>
              </select>
            </div>`;
    } else {
        content += `
            <input  id="pos" name="pos" type="hidden" value="">
            <input id="fx" name="fx" type="hidden" value="">`;
    }
    content += `
        <div className="form-group">
          <label>${game.i18n.localize('BITD.Notes')}:</label>
          <input id="note" name="note" type="text" value="">
        </div><br/>
        </form>
      `;

    new Dialog({
      title: `${game.i18n.localize('BITD.Roll')} ${game.i18n.localize(attribute_label)}`,
      content: content,
      buttons: {
        yes: {
          icon: "<i class='fas fa-check'></i>",
          label: game.i18n.localize('BITD.Roll'),
          callback: async (html) => {
            let modifier = parseInt(html.find('[name="mod"]')[0].value);
            let position = html.find('[name="pos"]')[0].value;
            let effect = html.find('[name="fx"]')[0].value;
            let note = html.find('[name="note"]')[0].value;
            await this.rollAttribute(attribute_label, modifier, attribute_value, position, effect, note);
          }
        },
        no: {
          icon: "<i class='fas fa-times'></i>",
          label: game.i18n.localize('Close'),
        },
      },
      default: "yes",
    }).render(true);

  }

  /* -------------------------------------------- */

  async rollAttribute(attribute_label = "", additional_dice_amount = 0, attribute_value = 0, position, effect, note) {
    let dice_amount = 0;
    if (attribute_label !== "") {
			dice_amount = attribute_value;
    }
    else {
      dice_amount = 1;
    }

    dice_amount += additional_dice_amount;

    await bladesRoll(dice_amount, attribute_label, position, effect, note);
  }

  /* -------------------------------------------- */

  /**
   * Create <options> for available actions
   *  which can be performed.
   */
  createListOfActions() {

    let text, attribute, skill;
    let attributes = this.system.attributes;

    for ( attribute in attributes ) {

      const skills = attributes[attribute].skills;

      text += `<optgroup label="${attribute} Actions">`;
      text += `<option value="${attribute}">${attribute} (Resist)</option>`;

      for ( skill in skills ) {
        text += `<option value="${skill}">${skill}</option>`;
      }

      text += `</optgroup>`;

    }

    return text;

  }

  /* -------------------------------------------- */

  /**
   * Creates <options> modifiers for dice roll.
   *
   * @param {int} rs
   *  Min die modifier
   * @param {int} re
   *  Max die modifier
   * @param {int} s
   *  Selected die
   */
  createListOfDiceMods(rs, re, s) {

    var text = ``;
    var i = 0;

    if ( s == "" ) {
      s = 0;
    }

    for ( i  = rs; i <= re; i++ ) {
      var plus = "";
      if ( i >= 0 ) { plus = "+" };
      text += `<option value="${i}"`;
      if ( i == s ) {
        text += ` selected`;
      }

      text += `>${plus}${i}d</option>`;
    }

    return text;

  }

  /* -------------------------------------------- */

  async _onCreateEmbeddedDocuments( name, ...args ) {
     super._onCreateEmbeddedDocuments ( name, ...args );
     const newItem = args[0][0];

     switch ( newItem.type ) {
      case "profession":
      case "upbringing":
      case "mask":
			case "class":
        await this._addTraits( newItem );
				await this._modActionPoints( newItem );
      break;
    }
      
  }

  async _onDeleteEmbeddedDocuments( name, ...args ) {
    super._onDeleteEmbeddedDocuments (name, ...args);
    const removedItem = args[0][0];

    switch ( removedItem.type ){
      case "profession":
      case "upbringing":
      case "mask":
			case "class":
	      this._deleteTraits(removedItem, removedItem.type);
				await this._modActionPoints( removedItem, true );
      break;
    }
  }

  async _modActionPoints(data, remove=false) {
		const bonus_points = data.system?.logic.replaceAll(' ','').split("\n").map(bonus => bonus.split('='));
    const max_value = 4;
		const mod = remove ? -1 : 1;
		let system = {};
		bonus_points.forEach(bonus => {
			const key = bonus[0];
			const bonus_value = parseInt(bonus[1]);
			let value = parseInt(foundry.utils.getProperty(this, key)) + mod*bonus_value;
      value = (value > max_value) ? max_value : value;
			value = (value < 0 ? 0 : value);
			console.log(value);
      foundry.utils.setProperty(system, key, value);
   	});
		console.log(system);
		await this.update(system);
		this.render();
	}

  async _addTraits(data) {
    const traits = await game.packs.get("brinkwood.trait").getDocuments({'system.class': data.name});
    this.createEmbeddedDocuments( "Item", traits );
  }

  _deleteTraits(data) {
    const charTraits = this.items.filter(i => i.type == "trait" && i.system.class == data.name).map(i => i._id)
    this.deleteEmbeddedDocuments( "Item", charTraits );
  }

  async _loadBasicItems() {
    // Load and create basic items from compendium
    const basicItems = await game.packs.get("brinkwood.item").getDocuments({'system.class': ""});
    this.createEmbeddedDocuments( "Item", basicItems);
    
    // Load and create custom basic items
    const customBasicItems = await game.items.filter(i => i.type == "item" && i.system.class == "");
    this.createEmbeddedDocuments( "Item", customBasicItems );
  }
}
