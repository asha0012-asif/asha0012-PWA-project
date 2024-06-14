const APP = {
    init: () => {
        document.getElementById("date").innerText = new Date().toDateString();

        APP.registerSW();
    },

    registerSW: () => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("./sw.js");
        }
    },
}

window.addEventListener("DOMContentLoaded", APP.init);
