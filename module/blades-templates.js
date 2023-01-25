/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {

  // Define template paths to load
  const templatePaths = [

    // Actor Sheet Partials
    "systems/brinkwood/templates/parts/coins.html",
    "systems/brinkwood/templates/parts/attributes.html",
    "systems/brinkwood/templates/parts/mask-attributes.html",
    "systems/brinkwood/templates/parts/turf-list.html",
    "systems/brinkwood/templates/parts/cohort-block.html",
    "systems/brinkwood/templates/parts/factions.html",
    "systems/brinkwood/templates/parts/active-effects.html",
  ];

  // Load the template parts
  return loadTemplates(templatePaths);
};
