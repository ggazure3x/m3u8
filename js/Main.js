var Main = {
    widgetAPI: null,
    tvKey: null,
    channels: [],
    currentChannelIndex: 0,
    m3u8Url: "https://raw.githubusercontent.com/ggazure3x/M3U8/refs/heads/main/test%2Cm3u8",

    onLoad: function() {
        Logger.log("Main.onLoad() - J5290 pure Orsay mode START");

        try {
            this.widgetAPI = new Common.API.Widget();
            this.tvKey = new Common.API.TVKeyValue();

            // Register keys and tell TV we are ready
            this.widgetAPI.sendReadyEvent();
            Logger.log("Main.onLoad() - J5290 Widget API Ready (ReadyEvent Sent)");
        } catch (e) {
            Logger.log("Main.onLoad() - J5290 Widget API ERROR: " + e.message);
            // Browser dev mode mocks
            this.widgetAPI = { sendReadyEvent: function(){}, sendReturnEvent: function(){} };
            this.tvKey = { KEY_CH_UP: 33, KEY_UP: 38, KEY_CH_DOWN: 34, KEY_DOWN: 40, KEY_RETURN: 8, KEY_EXIT: 27 };
        }

        var self = this;
        // J5290 Orsay delay for plugin stability
        setTimeout(function() {
            if (Player.init()) {
                Logger.log("Main.onLoad() - J5290 Player OK after delay");
                self.fetchChannels();
            } else {
                Logger.log("Main.onLoad() - J5290 Player Init FAILED after delay");
                self.fetchChannels();
            }
        }, 1500);

        this.setupEventListeners();
        Logger.log("Main.onLoad() - J5290 pure Orsay LOAD COMPLETE");
    },

    onUnload: function() {
        Logger.log("Main.onUnload()");
        Player.deinit();
    },

    fetchChannels: function() {
        Logger.log("Main.fetchChannels() - Starting HTTP GET...");
        var self = this;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", this.m3u8Url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    Logger.log("Main.fetchChannels() - 200 OK");
                    self.parseM3U8(xhr.responseText);
                    if (self.channels.length > 0) {
                        self.playChannel(0);
                    } else {
                        Logger.log("Main.fetchChannels() - NO CHANNELS FOUND");
                    }
                } else {
                    Logger.log("Main.fetchChannels() - ERROR CODE: " + xhr.status);
                }
            }
        };
        xhr.send();
    },

    parseM3U8: function(data) {
        var lines = data.split("\n");
        var currentName = "Desconhecido";

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (line.indexOf("#EXTINF") === 0) {
                var nameMatch = line.match(/,(.*)$/);
                if (nameMatch && nameMatch[1]) {
                    currentName = nameMatch[1].trim();
                }
            } else if (line.indexOf("http") === 0) {
                this.channels.push({
                    name: currentName,
                    url: line
                });
                currentName = "Desconhecido";
            }
        }
        Logger.log("Main.parseM3U8() - " + this.channels.length + " CHANNELS");
    },

    playChannel: function(index) {
        if (index >= 0 && index < this.channels.length) {
            this.currentChannelIndex = index;
            var channel = this.channels[index];
            Logger.log("Main.playChannel(" + index + ") -> " + channel.name);

            document.getElementById("channel-name").innerHTML = channel.name;
            Player.play(channel.url);

            var overlay = document.getElementById("ui-overlay");
            overlay.style.display = "block";
            if (this.overlayTimeout) clearTimeout(this.overlayTimeout);
            this.overlayTimeout = setTimeout(function() {
                overlay.style.display = "none";
            }, 10000);
        }
    },

    nextChannel: function() {
        Logger.log("Main.nextChannel()");
        var nextIndex = (this.currentChannelIndex + 1) % this.channels.length;
        this.playChannel(nextIndex);
    },

    previousChannel: function() {
        Logger.log("Main.previousChannel()");
        var prevIndex = (this.currentChannelIndex - 1 + this.channels.length) % this.channels.length;
        this.playChannel(prevIndex);
    },

    setupEventListeners: function() {
        Logger.log("Main.setupEventListeners()");
        var self = this;
        document.onkeydown = function(event) {
            var keyCode = event.keyCode;
            Logger.log("J5290 KEY PRESS: " + keyCode);

            switch (keyCode) {
                case self.tvKey.KEY_CH_UP:
                case self.tvKey.KEY_UP:
                    self.nextChannel();
                    break;
                case self.tvKey.KEY_CH_DOWN:
                case self.tvKey.KEY_DOWN:
                    self.previousChannel();
                    break;
                case self.tvKey.KEY_RETURN:
                case self.tvKey.KEY_EXIT:
                    Logger.log("Exiting application by user request.");
                    self.widgetAPI.sendReturnEvent();
                    break;
            }
        };
    }
};
