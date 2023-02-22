/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */

export class BladesSheet extends ActorSheet {

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".item-add-popup").click(this._onItemAddClick.bind(this));
    html.find(".update-box").click(this._onUpdateBoxClick.bind(this));

    // This is a workaround until is being fixed in FoundryVTT.
    if ( this.options.submitOnChange ) {
      html.on("change", "textarea", this._onChangeInput.bind(this));  // Use delegated listener on the form
    }

    html.find(".roll-die-attribute").click(this._onRollAttributeDieClick.bind(this));

    html.find('.item-select').click( async e => {
      const dataset = e.currentTarget.dataset;
      const item_id = dataset.itemId;
      let item = this.actor.getEmbeddedDocument("Item", item_id);
      let update_data = {};
      switch (item.type) {
        case "trait":
          update_data = {"system.purchased": !item.system.purchased};
	break;
        case "item":
          update_data = {"system.equipped": !item.system.equipped};
        break;
      }
      await item.update(update_data);
    });

  }

  /* -------------------------------------------- */

  async _onItemAddClick(event) {
    event.preventDefault();
    const item_type = $(event.currentTarget).data("itemType")
    const distinct = $(event.currentTarget).data("distinct")
    let input_type = "checkbox";

    if (typeof distinct !== "undefined") {
      input_type = "radio";
    }

    let items = await BladesHelpers.getAllItemsByType(item_type, game);

    let html = `<div class="items-to-add">`;

    items.forEach(e => {
      let addition_price_load = ``;

      if (typeof e.system.load !== "undefined") {
        addition_price_load += `(${e.system.load})`
      } else if (typeof e.system.price !== "undefined") {
        addition_price_load += `(${e.system.price})`
      }
      html += `<div>`
      html += `<input id="select-item-${e._id}" type="${input_type}" name="select_items" value="${e._id}">`;
      html += `<label class="flex-horizontal" for="select-item-${e._id}">`;
      html += `${game.i18n.localize(e.name)} ${addition_price_load} <i class="tooltip fas fa-question-circle"></i>`;
      html += `</label>`;
			html += `</div>`
    });

    html += `</div>`;

    let options = {
      // width: "500"
    }

    let dialog = new Dialog({
      title: `${game.i18n.localize('Add')} ${item_type}`,
      content: html,
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize('Add'),
          callback: async (html) => await this.addItemsToSheet(item_type, $(html).find('.items-to-add'))
        },
        two: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('Cancel'),
          callback: () => false
        }
      },
      default: "two"
    }, options);

    dialog.render(true);
  }

  /* -------------------------------------------- */

  async addItemsToSheet(item_type, el) {

    let items = await BladesHelpers.getAllItemsByType(item_type, game);
    let items_to_add = [];

    el.find("input:checked").each(function() {
      items_to_add.push(items.find(e => e._id === $(this).val()));
    });

    await Item.create(items_to_add, {parent: this.document});
  }
  /* -------------------------------------------- */

  /**
   * Roll an Attribute die.
   * @param {*} event
   */
  async _onRollAttributeDieClick(event) {

		const target = event.currentTarget;
		
    const attribute_name = target.dataset.rollAttribute;
    const attribute_label = target.dataset.rollAttributeLabel;
		const attribute_value = parseInt(target.dataset.rollValue);
		

    this.actor.rollAttributePopup(attribute_name, attribute_label, attribute_value);

  }

  /* -------------------------------------------- */

  async _onUpdateBoxClick(event) {
    event.preventDefault();
    const item_id = $(event.currentTarget).data("item");
    var update_value = $(event.currentTarget).data("value");
      const update_type = $(event.currentTarget).data("utype");
      if ( update_value === undefined) {
      update_value = document.getElementById('fac-' + update_type + '-' + item_id).value;
    };
    var update;
    if ( update_type === "status" ) {
      update = {_id: item_id, system:{status:{value: update_value}}};
    }
    else if (update_type == "hold") {
      update = {_id: item_id, system:{hold:{value: update_value}}};
    } else {
      console.log("update attempted for type undefined in blades-sheet.js onUpdateBoxClick function");
      return;
    };

    await this.actor.updateEmbeddedDocuments("Item", [update]);


    }

  /* -------------------------------------------- */
  
	setAttrLabels(attrs, type="Actor") {
		for (const attr in attrs) {
		  let attr_name = attr[0].toUpperCase() + attr.slice(1);	
			attrs[attr]['label'] = `${type}.Actions.${attr_name}.Name`;
			attrs[attr]['desc'] = `${type}.Actions.${attr_name}.Description`;
		
			for (const skill in attrs[attr].skills) {
   		  let skill_name = skill[0].toUpperCase() + skill.slice(1);	
  			attrs[attr].skills[skill]['label'] = `${type}.Actions.${skill_name}.Name`;
     		attrs[attr].skills[skill]['desc'] = `${type}.Actions.${skill_name}.Description`;
			}
    }
	}


  /* -------------------------------------------- */
  
}
