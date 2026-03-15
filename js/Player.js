var Player = {
    state: "IDLE",

    init: function() {
        console.log("Player.init()");
        try {
            if (typeof webapis === "undefined") {
                console.log("webapis not found");
                return false;
            }
            return true;
        } catch (e) {
            console.log("Player init error: " + e.message);
            return false;
        }
    },

    play: function(url) {
        console.log("Player.play(" + url + ")");
        var self = this;

        try {
            this.stop();

            webapis.avplay.open(url);
            this.state = "OPENED";

            var rect = {
                left: 0,
                top: 0,
                width: 1280,
                height: 720
            };
            webapis.avplay.setDisplayRect(rect.left, rect.top, rect.width, rect.height);

            var listener = {
                onbufferingstart: function() { console.log("Buffering started"); },
                onbufferingcomplete: function() { console.log("Buffering complete"); },
                onstreamcompleted: function() { console.log("Stream completed"); self.stop(); },
                onerror: function(error) { console.log("Error: " + error.name); }
            };
            webapis.avplay.setListener(listener);

            webapis.avplay.prepare();
            webapis.avplay.play();
            this.state = "PLAYING";
            console.log("AVPlay started");

        } catch (e) {
            console.log("AVPlay error: " + e.name + " - " + e.message);
        }
    },

    stop: function() {
        console.log("Player.stop()");
        try {
            if (this.state !== "IDLE") {
                webapis.avplay.stop();
                webapis.avplay.close();
                this.state = "IDLE";
            }
        } catch (e) {
            console.log("Stop error: " + e.message);
        }
    },

    pause: function() {
        if (this.state === "PLAYING") {
            webapis.avplay.pause();
            this.state = "PAUSED";
        }
    },

    resume: function() {
        if (this.state === "PAUSED") {
            webapis.avplay.play();
            this.state = "PLAYING";
        }
    },

    deinit: function() {
        this.stop();
    }
};
