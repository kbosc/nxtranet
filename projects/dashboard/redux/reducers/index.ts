import { combineReducers } from 'redux';

import MeReducer from './me';
import NginxReducer from './nginx';
import ProjectReducer from './project';

const reducers = combineReducers({
  me: MeReducer,
  nginx: NginxReducer,
  project: ProjectReducer,
});

export type Store = typeof reducers;
export type State = ReturnType<typeof reducers>;

export default reducers;
