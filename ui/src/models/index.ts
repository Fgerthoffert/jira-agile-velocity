import { global } from './global';
// import { roadmap } from './roadmap';
// import { velocity } from './velocity';
import { teams } from './teams';
// import { assignees } from './assignees';
// import { control } from './control';
// export { global, velocity, teams, assignees, roadmap, control };

export interface RootModel {
  global: typeof global;
  teams: typeof teams;
}

export const models: RootModel = {
  global,
  teams,
};
