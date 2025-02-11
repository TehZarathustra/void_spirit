import {STATE_TABLE} from '../consts';

export const actions = {
  increment: () => {
    const {current} = CustomNetTables.GetTableValue(STATE_TABLE, 'score');

    CustomNetTables.SetTableValue(STATE_TABLE, 'score', {current: current + 1});
  },
  getScore: () => {
    return CustomNetTables.GetTableValue(STATE_TABLE, 'score').current;
  },
  reset: () => CustomNetTables.SetTableValue(STATE_TABLE, 'score', {current: 0}),
  start: () => CustomNetTables.SetTableValue(STATE_TABLE, 'game', {running: 1}),
  stop: () => CustomNetTables.SetTableValue(STATE_TABLE, 'game', {running: 0}),
  isRunning: () => CustomNetTables.GetTableValue(STATE_TABLE, 'game')?.running === 1,
  addTimer: (id: string) => {
    const {running, timers = {}} = CustomNetTables.GetTableValue(STATE_TABLE, 'game');

    print('prev timers >>>', Object.values(timers));
    print('new timers >>>', [...Object.values(timers), id]);

    CustomNetTables.SetTableValue(STATE_TABLE, 'game', {timers: [...Object.values(timers), id], running})
  },
  removeTimers: () => {
    const {running, timers = {}} = CustomNetTables.GetTableValue(STATE_TABLE, 'game');

    print('LDL >>>', timers);

    Object.values(timers).forEach((t) => {
      print('LEL >>>', t)
    })
  }
}