var Player = {
    plugin: null,
    audioPlugin: null,
    tvmwPlugin: null,
    sefPlugin: null,
    state: "STOPPED",

    init: function() {
        Logger.log("Player.init() - J5290 pure Orsay mode");
        this.plugin = document.getElementById("pluginPlayer");
        this.audioPlugin = document.getElementById("pluginAudio");
        this.tvmwPlugin = document.getElementById("pluginTVMW");
        this.sefPlugin = document.getElementById("pluginSef");

        if (!this.plugin) {
            Logger.log("Player.init() - pluginPlayer NOT FOUND");
            return false;
        }

        this.setMediaSource();
        this.setDisplayArea(0, 0, 1280, 720);
        return true;
    },

    setMediaSource: function() {
        Logger.log("Player.setMediaSource() - Claiming Video/Audio Layer");
        try {
            // Use common API plugin if available to set source
            var commonPlugin = new Common.API.Plugin();
            if (commonPlugin && commonPlugin.SetSource) {
                commonPlugin.SetSource(0); // 0 is MEDIA
                Logger.log("Player.setMediaSource() - Common Plugin SetSource(0) OK");
            }

            // Fallback to direct TVMW call
            if (this.tvmwPlugin && typeof this.tvmwPlugin.SetSource === "function") {
                this.tvmwPlugin.SetSource(0);
                Logger.log("Player.setMediaSource() - TVMW SetSource(0) OK");
            }

            // Force Mute background audio
            if (this.audioPlugin && typeof this.audioPlugin.SetUserMute === "function") {
                this.audioPlugin.SetUserMute(1);
                Logger.log("Player.setMediaSource() - Audio Muted OK");
            }
        } catch (e) {
            Logger.log("Player.setMediaSource() - ERROR: " + e.message);
        }
    },

    setDisplayArea: function(x, y, w, h) {
        Logger.log("Player.setDisplayArea(" + x + ", " + y + ", " + w + ", " + h + ")");
        try {
            if (this.plugin.SetDisplayArea) {
                this.plugin.SetDisplayArea(x, y, w, h);
            }
            if (this.plugin.SetVideoDest) {
                this.plugin.SetVideoDest(x, y, w, h);
            }

            // SEF Layer if available
            if (this.sefPlugin && typeof this.sefPlugin.Execute === "function") {
                this.sefPlugin.Execute("SetDisplayArea", x, y, w, h);
            }
        } catch (e) {
            Logger.log("Player.setDisplayArea() - ERROR: " + e.message);
        }
    },

    play: function(url) {
        Logger.log("Player.play(" + url + ")");
        if (!this.plugin) return;

        try {
            this.stop();

            // Re-claim layer just in case
            this.setMediaSource();
            this.setDisplayArea(0, 0, 1280, 720);

            // Unmute for media playback
            if (this.audioPlugin && typeof this.audioPlugin.SetUserMute === "function") {
                this.audioPlugin.SetUserMute(0);
            }

            // HLS Suffix for J5290 Orsay
            var playUrl = url;
            if (playUrl.indexOf(".m3u8") !== -1 && playUrl.indexOf("|COMPONENT=HLS") === -1) {
                playUrl += "|COMPONENT=HLS";
            }

            Logger.log("Player.play() - Calling InitPlayer");
            if (typeof this.plugin.InitPlayer === "function") {
                this.plugin.InitPlayer(playUrl);
            } else if (this.plugin.Execute) {
                this.plugin.Execute("InitPlayer", playUrl);
            }

            Logger.log("Player.play() - Calling StartPlayback");
            if (typeof this.plugin.StartPlayback === "function") {
                this.plugin.StartPlayback();
            } else if (this.plugin.Execute) {
                this.plugin.Execute("StartPlayback");
            }

            this.state = "PLAYING";
        } catch (e) {
            Logger.log("Player.play() - ERROR: " + e.message);
        }
    },

    stop: function() {
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

    deinit: function() {
        this.stop();
        // Restore TV audio on exit
        if (this.audioPlugin && typeof this.audioPlugin.SetUserMute === "function") {
            this.audioPlugin.SetUserMute(0);
        }
    }
};
