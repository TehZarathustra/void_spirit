$.Msg("Hud panorama copy loaded");

(() => {
  const SCORE_SELECTOR = "#score";

  function onChange(_: any, key: any, data: any) {
    $.Msg(key, data);

    if (key !== 'score') return;

	  const scorePanel = $(SCORE_SELECTOR) as LabelPanel;

    scorePanel.text = String((data?.current || 0) * 100);
  }

  CustomNetTables.SubscribeNetTableListener('remnant_state', onChange);
})()