/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {

  // Define template paths to load
  const templatePaths = [
    // Actor Sheet Partials
    "systems/brinkwood/templates/parts/attributes.html",
    "systems/brinkwood/templates/parts/mask-attributes.html",
    "systems/brinkwood/templates/parts/active-effects.html",
		"systems/brinkwood/templates/parts/actor/downtime.html",
		"systems/brinkwood/templates/parts/teeth-section.html",
		"systems/brinkwood/templates/rebelion-sheet/sedition-section.html",
		"systems/brinkwood/templates/rebelion-sheet/aspect-section.html"
  ];

  // Load the template parts
  return loadTemplates(templatePaths);
};
