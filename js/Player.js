var Player = {
    plugin: null,
    audioPlugin: null,
    tvmwPlugin: null,
    state: -1,
    STOPPED: 0,
    PLAYING: 1,
    PAUSED: 2,

    init: function() {
        var success = true;
        this.plugin = document.getElementById("pluginPlayer");
        this.audioPlugin = document.getElementById("pluginAudio");
        this.tvmwPlugin = document.getElementById("pluginTVMW");

        if (!this.plugin) {
            console.log("Player plugin not found");
            success = false;
        }

        return success;
    },

    play: function(url) {
        console.log("Playing URL: " + url);
        if (!this.plugin) return;

        this.stop();

        // Samsung Legacy Player API
        // For HLS/M3U8 on legacy Orsay, sometimes the URL needs a suffix |COMPONENT=HLS
        var playUrl = url;
        if (playUrl.indexOf(".m3u8") !== -1 && playUrl.indexOf("|COMPONENT=HLS") === -1) {
            playUrl += "|COMPONENT=HLS";
        }

        this.plugin.SetVideoDest(0, 0, 1280, 720);
        this.plugin.InitPlayer(playUrl);

        // Set display area again just in case
        this.plugin.SetDisplayArea(0, 0, 1280, 720);

        this.plugin.StartPlayback();

        this.state = this.PLAYING;
    },

    stop: function() {
        if (this.plugin && this.state !== this.STOPPED) {
            this.plugin.Stop();
            this.state = this.STOPPED;
        }
    },

    pause: function() {
        if (this.plugin && this.state === this.PLAYING) {
            this.plugin.Pause();
            this.state = this.PAUSED;
        }
    },

    resume: function() {
        if (this.plugin && this.state === this.PAUSED) {
            this.plugin.Resume();
            this.state = this.PLAYING;
        }
    },

    deinit: function() {
        this.stop();
    }
};
