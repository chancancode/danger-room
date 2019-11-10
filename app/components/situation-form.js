import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import shuffle from 'lodash.shuffle';
import ModularEncounterSets from 'danger-room/data/modular-encounter-sets';
import Villains from 'danger-room/data/villains';

const DIFFICULTY_MODES = ['standard', 'expert'];
const CHOSEN_DIFFICULTY_MODES = ['random', 'standard', 'expert'];

export default class SituationForm extends Component {
  @tracked result = null;
  @tracked modularRadioIndex = 0;
  numModularEncounterSets = [1, 2, 3];
  villains = Villains;

  constructor(owner, args) {
    super(owner, args);
    let villain = null;
    let modularEncounterSets = [];
    let difficultyMode = null;

    this.parameters = args.state.parameters;
    if (!CHOSEN_DIFFICULTY_MODES.includes(this.parameters.difficultyMode)) {
      this.parameters.difficultyMode = "random";
    }
    if (!this.numModularEncounterSets.includes(this.parameters.numModularEncounterSets)) {
      this.parameters.numModularEncounterSets = 1;
    }

    if (args.state.result.villain.length > 0) {
      villain = Villains.find(element => element.slug === args.state.result.villain);
    }
    if (args.state.result.difficultyMode.length > 0) {
      if (DIFFICULTY_MODES.includes(args.state.result.difficultyMode)) {
        difficultyMode = args.state.result.difficultyMode;
      }
    }
    args.state.result.modularEncounterSets.forEach(inputSet => {
      let foundSet = ModularEncounterSets.find(dataSet => dataSet.slug === inputSet);
      if (foundSet) {
        modularEncounterSets.push(foundSet);
      }
    });
    if (args.state.result.players) {
      players = args.state.result.players.map(player => {
        let id = Identities.find(i => i.id === player.identity);
        if (id) {
          return {
            identity: id,
            aspect: player.aspect,
          };
        }
      });
    }

    if (villain && difficultyMode && modularEncounterSets.length > 0) {
      this.result = {
        villain,
        difficultyMode,
        modularEncounterSets,
        players,
      };
    }
    this.submit = args.submit;
  }

  @action
  generate() {
    let modulars = shuffle(ModularEncounterSets);
    let sets = [];
    for (let i = 0; i < this.parameters.numModularEncounterSets; i++) {
      sets.push(modulars.pop());
    }
    let difficultyMode = this.parameters.difficultyMode;
    if (difficultyMode === "random") {
      difficultyMode = shuffle(DIFFICULTY_MODES).pop();
    }
    let villain = Villains.find(v => v.id == this.parameters.villain);
    if (!villain) {
      villain = shuffle(Villains)[0];
    }

    this.result = {
      villain,
      difficultyMode,
      modularEncounterSets: sets,
    };

    let resultState = {
      parameters: {
        difficultyMode: this.parameters.difficultyMode,
        numModularEncounterSets: this.parameters.numModularEncounterSets,
        villain: this.parameters.villain,
      },
      results: {
        villain: this.result.villain.slug,
        difficultyMode: this.result.difficultyMode,
        modularEncounterSets: this.result.modularEncounterSets.map(set => set.slug),
      },
    };
    this.submit(resultState);
  }
}
