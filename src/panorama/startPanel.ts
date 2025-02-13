$.Msg('startPanel loaded');

function OnCloseButtonClicked() {
    $.Msg("Example close button clicked");

    // Find panel by id
    const examplePanel = $("#startPanel");

    // Remove panel
    examplePanel.DeleteAsync(0);

    // Send event to server
    GameEvents.SendCustomGameEventToServer('ui_restart_remnant', {});
}

/**
 * Turn a table object into an array.
 * @param obj The object to transform to an array.
 * @returns An array with items of the value type of the original object.
 */
function toArray<T>(obj: Record<number, T>): T[] {
    const result = [];
    
    let key = 1;
    while (obj[key]) {
        result.push(obj[key]);
        key++;
    }

    return result;
}
