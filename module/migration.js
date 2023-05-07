/**
 * Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
 * @return {Promise}      A Promise which resolves once the migration is completed
 */
export const migrateWorld = async function() {
  ui.notifications.info(`Applying Brinkwood Actors migration for version ${game.data.version}. Please be patient and do not close your game or shut down your server.`, {permanent: true});

	let current_version = game.settings.get("brinkwood", "systemMigrationVersion").toString();

	if (current_version < '0.5.4') {
    // remove old bonus action point system
		game.actors.forEach(async actor => {
			let backup = await actor.system.attributes;
			let old_class = actor.getEmbeddedCollection("Item").filter(i => i.type == 'class')[0];
			let old_profession = actor.getEmbeddedCollection("Item").filter(i => i.type == 'profession')[0];
			actor.getEmbeddedCollection("ActiveEffect").forEach(async eff => await eff.delete());
			if (old_class) {
				let new_class = await game.packs.get("brinkwood.class").index.find(x => x.name == old_class.name)
				await old_class.delete();
				await actor.createEmbeddedDocuments('Item', [new_class])
			}
		
			if (old_profession) {
				let new_profession = await game.packs.get("brinkwood.profession").index.find(x => x.name == old_profession.name)
				await old_profession.delete();
				await actor.createEmbeddedDocuments('Item', [new_profession])
			}
			await actor.update({'system.attributes': backup});
		});	
	}

	game.settings.set("brinkwood", "systemMigrationVersion", game.system.version);
  ui.notifications.info(`Brinkwood System Migration to version ${game.system.version} completed!`, {permanent: true});

}

/* -------------------------------------------- */
