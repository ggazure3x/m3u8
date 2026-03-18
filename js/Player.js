var Player = {
    plugin: null,
    audioPlugin: null,
    tvmwPlugin: null,
    state: "STOPPED",

    init: function() {
        Logger.log("Player.init() - pure Orsay mode");
        this.plugin = document.getElementById("pluginPlayer");
        this.audioPlugin = document.getElementById("pluginAudio");
        this.tvmwPlugin = document.getElementById("pluginTVMW");

        if (!this.plugin) {
            Logger.log("Player.init() - pluginPlayer NOT FOUND");
            return false;
        }

        this.setMediaSource();
        this.setDisplayArea(0, 0, 1280, 720);
        return true;
    },

    setDisplayArea: function(x, y, w, h) {
        Logger.log("Player.setDisplayArea(" + x + ", " + y + ", " + w + ", " + h + ")");
        try {
            if (this.plugin.SetDisplayArea) {
                this.plugin.SetDisplayArea(x, y, w, h);
                Logger.log("Player.setDisplayArea() - OK");
            } else if (this.plugin.Execute) {
                this.plugin.Execute("SetDisplayArea", x, y, w, h);
            }

            if (this.plugin.SetVideoDest) {
                this.plugin.SetVideoDest(x, y, w, h);
                Logger.log("Player.setVideoDest() - OK");
            } else if (this.plugin.Execute) {
                this.plugin.Execute("SetVideoDest", x, y, w, h);
            }
        } catch (e) {
            Logger.log("Player.setDisplayArea() - ERROR: " + e.message);
        }
    },

    setMediaSource: function() {
        Logger.log("Player.setMediaSource() - Switching to Media Source");
        try {
            if (this.tvmwPlugin) {
                if (typeof this.tvmwPlugin.SetSource === "function") {
                    this.tvmwPlugin.SetSource(0);
                    Logger.log("Player.setMediaSource() - TVMW SetSource(0) OK");
                }
            }

            if (this.audioPlugin) {
                if (typeof this.audioPlugin.SetUserMute === "function") {
                    this.audioPlugin.SetUserMute(1);
                    Logger.log("Player.setMediaSource() - Audio Muted OK");
                }
            }
        } catch (e) {
            Logger.log("Player.setMediaSource() - ERROR: " + e.message);
        }
    },

    play: function(url) {
        Logger.log("Player.play(" + url + ")");
        if (!this.plugin) return;

        try {
            this.stop();

            if (this.audioPlugin && typeof this.audioPlugin.SetUserMute === "function") {
                this.audioPlugin.SetUserMute(0);
            }

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

            this.setDisplayArea(0, 0, 1280, 720);

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
            } catch (e) {
                Logger.log("Player.stop() - ERROR: " + e.message);
            }
        }
    },

    deinit: function() {
        this.stop();
        if (this.audioPlugin && typeof this.audioPlugin.SetUserMute === "function") {
            this.audioPlugin.SetUserMute(0);
        }
    }
};
