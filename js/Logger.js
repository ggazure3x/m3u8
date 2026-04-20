var Logger = {
    containerId: "log-container",
    logs: [],
    maxLogs: 20,

    init: function() {
        var container = document.createElement("div");
        container.id = this.containerId;
        container.style.position = "absolute";
        container.style.top = "10px";
        container.style.left = "10px";
        container.style.right = "10px";
        container.style.maxHeight = "300px";
        container.style.overflow = "hidden";
        container.style.backgroundColor = "rgba(0, 0, 255, 0.5)";
        container.style.color = "white";
        container.style.fontSize = "18px";
        container.style.fontFamily = "monospace";
        container.style.zIndex = "9999";
        container.style.padding = "10px";
        container.style.border = "2px solid yellow";
        document.body.appendChild(container);
    },

    log: function(message) {
        console.log(message);
        var timestamp = new Date().toLocaleTimeString();
        this.logs.push("[" + timestamp + "] " + message);

        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        this.render();
    },

    render: function() {
        var container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = this.logs.join("<br>");
        }
    }
};
