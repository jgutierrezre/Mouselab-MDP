(function () {
  var proto = MouselabMDPSetup.MouselabMDP.prototype;

  proto.endTrial = function () {
    if (this.keyListener) {
      jsPsych.pluginAPI.cancelKeyboardResponse(this.keyListener);
      this.keyListener = null;
    }
    if (this._onComplete) {
      this._onComplete(this.data);
    }
  };

  proto.checkFinished = function () {
    if (this.complete) {
      this.endTrial();
    }
  };
})();
