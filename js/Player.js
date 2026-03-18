var Player = {
    plugin: null,
    audioPlugin: null,
    state: "STOPPED",

    init: function() {
        Logger.log("Player.init() - pure Orsay mode");
        this.plugin = document.getElementById("pluginPlayer");
        this.audioPlugin = document.getElementById("pluginAudio");

        if (!this.plugin) {
            Logger.log("Player.init() - pluginPlayer NOT FOUND in DOM");
            return false;
        }

        Logger.log("Player.init() - OK");
        return true;
    },

    play: function(url) {
        Logger.log("Player.play(" + url + ")");
        if (!this.plugin) return;

        try {
            this.stop();

            // Suffix for HLS on Orsay legacy player
            var playUrl = url;
            if (playUrl.indexOf(".m3u8") !== -1 && playUrl.indexOf("|COMPONENT=HLS") === -1) {
                playUrl += "|COMPONENT=HLS";
            }

            Logger.log("Player.play() - Calling InitPlayer");
            if (typeof this.plugin.InitPlayer === "function") {
                this.plugin.InitPlayer(playUrl);
            } else if (this.plugin.Execute) {
                this.plugin.Execute("InitPlayer", playUrl);
            } else {
                Logger.log("Player.play() - InitPlayer/Execute NOT FOUND on plugin");
            }

            Logger.log("Player.play() - Calling SetDisplayArea");
            if (this.plugin.SetDisplayArea) {
                this.plugin.SetDisplayArea(0, 0, 1280, 720);
            }

            Logger.log("Player.play() - Calling StartPlayback");
            if (typeof this.plugin.StartPlayback === "function") {
                this.plugin.StartPlayback();
            } else if (this.plugin.Execute) {
                this.plugin.Execute("StartPlayback");
            }

            this.state = "PLAYING";
            Logger.log("Player.play() - Playback attempt completed");
        } catch (e) {
            Logger.log("Player.play() - FATAL ERROR: " + e.message);
        }
    },

    stop: function() {
        Logger.log("Player.stop()");
        if (this.plugin && this.state !== "STOPPED") {
            try {
                if (typeof this.plugin.Stop === "function") {
                    this.plugin.Stop();
                } else if (this.plugin.Execute) {
                    this.plugin.Execute("Stop");
                }
                this.state = "STOPPED";
                Logger.log("Player.stop() - OK");
            } catch (e) {
                Logger.log("Player.stop() - ERROR: " + e.message);
            }
        }
    },

    pause: function() {
        if (this.plugin && this.state === "PLAYING") {
            if (typeof this.plugin.Pause === "function") {
                this.plugin.Pause();
            } else if (this.plugin.Execute) {
                this.plugin.Execute("Pause");
            }
            this.state = "PAUSED";
            Logger.log("Player.pause() - OK");
        }
    },

    resume: function() {
        if (this.plugin && this.state === "PAUSED") {
            if (typeof this.plugin.Resume === "function") {
                this.plugin.Resume();
            } else if (this.plugin.Execute) {
                this.plugin.Execute("Resume");
            }
            this.state = "PLAYING";
            Logger.log("Player.resume() - OK");
        }
    },

    deinit: function() {
        this.stop();
    }
};
