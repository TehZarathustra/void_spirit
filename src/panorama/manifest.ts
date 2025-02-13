$.Msg('ui manifest loaded');

GameEvents.Subscribe('remnant_training_started', () => {
  const parentPanel = $.GetContextPanel();

  // first panel rendering always collapsed for some reason
  parentPanel.style.visibility = 'visible';
  parentPanel.style.width = '100%';
  parentPanel.style.height = '100%';

  const newChildPanel = $.CreatePanel('Panel', parentPanel, 'remnant_start');

  newChildPanel.BLoadLayout('file://{resources}/layout/custom_game/remnant_start.xml', false, false);
});

GameEvents.Subscribe('remnant_training_finished', () => {
  const parentPanel = $.GetContextPanel();
  const newChildPanel = $.CreatePanel('Panel', parentPanel, 'remnant_result');

  newChildPanel.BLoadLayout('file://{resources}/layout/custom_game/remnant_result.xml', false, false);
});

// GameEvents.Subscribe('combo_training_started', () => {
//   const parentPanel = $.GetContextPanel();
//   const newChildPanel = $.CreatePanel('Panel', parentPanel, 'remnant_result');

//   newChildPanel.BLoadLayout('file://{resources}/layout/custom_game/remnant_result.xml', false, false);
// });

// GameEvents.Subscribe('combo_training_finised', () => {
//   const parentPanel = $.GetContextPanel();
//   const newChildPanel = $.CreatePanel('Panel', parentPanel, 'remnant_result');

//   newChildPanel.BLoadLayout('file://{resources}/layout/custom_game/remnant_result.xml', false, false);
// });