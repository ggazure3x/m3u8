var Player = {
    plugin: null,
    audioPlugin: null,
    tvmwPlugin: null,
    state: -1,
    STOPPED: 0,
    PLAYING: 1,
    PAUSED: 2,

    init: function() {
        console.log("Player.init()");
        this.plugin = document.getElementById("pluginPlayer");
        this.audioPlugin = document.getElementById("pluginAudio");
        this.tvmwPlugin = document.getElementById("pluginTVMW");

        if (!this.plugin) {
            console.log("Player plugin not found");
            return false;
        }

        // Some Orsay versions need this initial set
        if (this.plugin.SetDisplayArea) {
            this.plugin.SetDisplayArea(0, 0, 1280, 720);
        }

        return true;
    },

    play: function(url) {
        console.log("Player.play(" + url + ")");
        if (!this.plugin) return;

        this.stop();

        // HLS Support flag for legacy player
        var playUrl = url;
        if (playUrl.indexOf(".m3u8") !== -1 && playUrl.indexOf("|COMPONENT=HLS") === -1) {
            playUrl += "|COMPONENT=HLS";
        }

        try {
            // Set video destination/area
            if (this.plugin.SetVideoDest) {
                this.plugin.SetVideoDest(0, 0, 1280, 720);
            }

            // Standard InitPlayer
            this.plugin.InitPlayer(playUrl);

            // Start
            this.plugin.StartPlayback();
            this.state = this.PLAYING;
            console.log("Playback started");
        } catch (e) {
            console.log("Playback failed: " + e.message);
        }
    },

    stop: function() {
        if (this.plugin && (this.state === this.PLAYING || this.state === this.PAUSED)) {
            try {
                this.plugin.Stop();
            } catch (e) {
                console.log("Stop failed: " + e.message);
            }
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
