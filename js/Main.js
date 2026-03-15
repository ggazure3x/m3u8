var Main = {
    widgetAPI: null,
    tvKey: null,
    channels: [],
    currentChannelIndex: 0,
    m3u8Url: "https://raw.githubusercontent.com/ggazure3x/M3U8/refs/heads/main/test%2Cm3u8",

    onLoad: function() {
        console.log("Main.onLoad()");

        try {
            this.widgetAPI = new Common.API.Widget();
            this.tvKey = new Common.API.TVKeyValue();
        } catch (e) {
            console.log("Common API not found, using mocks for development");
            this.widgetAPI = { sendReadyEvent: function(){}, sendReturnEvent: function(){} };
            this.tvKey = { KEY_CH_UP: 33, KEY_UP: 38, KEY_CH_DOWN: 34, KEY_DOWN: 40, KEY_RETURN: 8, KEY_EXIT: 27 };
        }

        if (Player.init()) {
            this.fetchChannels();
        }

        this.widgetAPI.sendReadyEvent();
        this.setupEventListeners();
    },

    onUnload: function() {
        console.log("Main.onUnload()");
        Player.deinit();
    },

    fetchChannels: function() {
        var self = this;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", this.m3u8Url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                self.parseM3U8(xhr.responseText);
                if (self.channels.length > 0) {
                    self.playChannel(0);
                }
            }
        };
        xhr.send();
    },

    parseM3U8: function(data) {
        var lines = data.split("\n");
        var currentName = "Unknown Channel";

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
                currentName = "Unknown Channel";
            }
        }
        console.log("Parsed " + this.channels.length + " channels");
    },

    playChannel: function(index) {
        if (index >= 0 && index < this.channels.length) {
            this.currentChannelIndex = index;
            var channel = this.channels[index];
            document.getElementById("channel-name").innerHTML = channel.name;
            Player.play(channel.url);

            // Show overlay temporarily
            var overlay = document.getElementById("ui-overlay");
            overlay.style.display = "block";
            if (this.overlayTimeout) clearTimeout(this.overlayTimeout);
            this.overlayTimeout = setTimeout(function() {
                overlay.style.display = "none";
            }, 5000);
        }
    },

    nextChannel: function() {
        var nextIndex = (this.currentChannelIndex + 1) % this.channels.length;
        this.playChannel(nextIndex);
    },

    previousChannel: function() {
        var prevIndex = (this.currentChannelIndex - 1 + this.channels.length) % this.channels.length;
        this.playChannel(prevIndex);
    },

    setupEventListeners: function() {
        var self = this;
        document.onkeydown = function(event) {
            var keyCode = event.keyCode;
            console.log("Key pressed: " + keyCode);

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
                    self.widgetAPI.sendReturnEvent();
                    break;
            }
        };
    }
};
