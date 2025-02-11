$.Msg("Hud panorama copy loaded");

function onRemnantRestart() {
  $.Msg(">>> remnant restart clicked")
  // $.Msg(CustomNetTables.GetAllTableValues("void_nettable_1"));

  // Find panel by id
  const copyPanel = $("#remnantResult");

  // Remove panel
  copyPanel.DeleteAsync(0);

  // Send event to server
  GameEvents.SendCustomGameEventToServer('ui_restart_remnant', {});
}

(() => {
  const score = CustomNetTables.GetTableValue('remnant_state', 'score')?.current;
  const scoreCell = $('#remnantResult__score') as LabelPanel;

  scoreCell.text = String((score || 0) * 100);
})()
