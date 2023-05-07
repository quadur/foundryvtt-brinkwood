# This is a WIP for a Brinkwood games system for Foundry VTT

## v0.5 - first "public" release
This a barebones implementation of Brinkwood its still heavily based on megastrukturs Blades in The Dark and has *waaay* too much leftover/unused logic.
Be warned, this is not stable and is susceptible to massive overhauls, I will try to implement all changes in a non-game-breaking manner but YOU HAVE BEEN WARNED.

### v0.5.4
- [BUG] Mask sheet is now accessible without assigning a character to a player.
- [x] The biggest annoyance right now are the bonus action scores from the professions/classes - this has to have a new system.
- - [x] Migrate the old system to the new one
- [ ] Rebellion record sheet.
- - [x] Tyranny & Sedition
- - [x] Aspects 
- - [ ] Moot decisions

### v0.5.3
- Tooltips changed to the "proper" foundry format, all of the actions (char & Mask), exp triggers and other char traits should have a proper tooltip right now. 
- Rolls have been prtialy refactored and Essence roll (for doning of the Mask) is now possible form the Mask sheet using the players assigned character oath Score.
- Other fixes: spelling mistakes, missing langs etc.

### v0.5.2
- Fixed clock actors
- Added selectable Pacts to the PC sheet
- Rework of tooltips and most of the basic ones added

### v0.5.1 
- Bonus action scores form classes and professions should work properly now.
- Downtime action descriptions added to a tab on character sheets.

### So, what works?
The basics: working sheets for characters and masks. With rollable actions and resistance rolls, all of the upbringings, professions, and mask types should have correct traits/special abilities selectable on the list. Character sheets have additionally a selectable list of all basic items with a proper load calculation.


#### Screenshots

![image](./images/brinkwood_sheets.png)

### What doesn't?
Bonus action scores at character creation and Blood Alchemy types - and everything else ;)

### What's next?

#### After-session priorities
- [x] ! Fix clock actors.
- [x] Pact selection for characters.
- [x] Better tooltips
- - [x] Upbringings, Professions, Classes, Pacts
- - [x] Action descriptions
- - [x] Exp triggers
- - [x] Stress usage
- - [x] Ban usage
- - [x] Mask actions
- - [x] Mask XP Triggers
- [x] Lang for attributes
- [x] Lang for rolls 
- [x] Fix typo for Terror.Frighten in langfile
- [x] Remove labels from template.json
- [x] Re-organize abilities: move selected to the top, colapse unused on characters (but not on masks).
- [x] Reimplement the rolling system to use dataset values
- - [x] Add values to rollable datasets
- - - [x] Count values for attributes & add them to the sheets
- - - [x] Add action values to sheets
- - [x] Update roll function
- [x] Rollable Essence score.
- - [x] Backend for rolling with selected character Oath score.
- - [x] Proper Essence roll chat message.

#### TODO (later)

- [ ] Blood alchemy
- [ ] Make tab selection more pretty/usable.
- [ ] Two-point mask abilities: Drink Deep and Multifaceted (along with crossmask ability selection).
- [ ] Fay dossier sheet.
- [ ] Overhauling sheet design.
- [ ] Custom clocks on sheets.
- [ ] ???


## How to get in touch?
Make an issue or contact me on the official Brinkwood or Foundry (in forged-in-the-dark) discord (quad#8681).

# Credits & Licence

This is based on megastruktur's Blades in the Dark system, that you can find [here](https://github.com/megastruktur/foundryvtt-blades-in-the-dark)

This is not an official Brinkwood system and is *not* accociated with Far Horizons Co-op or any of the authors (but I hope someday it will!) 

This software contains characters, places and names that are sourced form the Brinkwood table top game by Eric Bernhardt et all. 
Those parts are *NOT FREE TO USE* and belong to their respecitve authors, for more details checkout https://brinkwood.net and contact the Far Horizons Co-Op.

The code is licenced with GPL3.
