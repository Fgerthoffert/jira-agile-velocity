import { Models } from '@rematch/core';

import { global } from './global';
import { teams } from './teams';
import { initiatives } from './initiatives';
import { versions } from './versions';

export interface RootModel extends Models<RootModel> {
  global: typeof global;
  teams: typeof teams;
  initiatives: typeof initiatives;
  versions: typeof versions;
}

export const models: RootModel = {
  global,
  teams,
  initiatives,
  versions,
};
