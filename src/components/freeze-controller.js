import { paths } from "../systems/userinput/paths";

/**
 * Toggles freezing of network traffic on the given event.
 * @namespace network
 * @component freeze-controller
 */
AFRAME.registerComponent("freeze-controller", {
  schema: {
    toggleEvent: { type: "string" }
  },

  init: function() {
    this.onToggle = this.onToggle.bind(this);
  },

  play: function() {
    this.el.addEventListener(this.data.toggleEvent, this.onToggle);
  },

  pause: function() {
    this.el.removeEventListener(this.data.toggleEvent, this.onToggle);
  },

  tick: function() {
    const userinput = AFRAME.scenes[0].systems.userinput;
    const ensureFrozen = userinput.get(paths.actions.ensureFrozen);
    const thaw = userinput.get(paths.actions.thaw);
    const toggleFreeze = userinput.get(paths.actions.toggleFreeze);

    const toggleFreezeDueToInput =
      (this.el.is("frozen") && thaw) || (!this.el.is("frozen") && ensureFrozen) || toggleFreeze;

    if (toggleFreezeDueToInput) {
      this.onToggle();
    }
  },

  onToggle: function() {
    window.APP.store.update({ activity: { hasFoundFreeze: true } });
    if (!NAF.connection.adapter) return;
    NAF.connection.adapter.toggleFreeze();
    if (NAF.connection.adapter.frozen) {
      this.el.emit("play_freeze_sound");
      this.el.addState("frozen");
    } else {
      this.el.emit("play_thaw_sound");
      this.el.removeState("frozen");
    }
  }
});
