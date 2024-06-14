const APP = {
    init: () => {
        APP.registerSW();
    },

    registerSW: () => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("./sw.js");
        }
    },
}

window.addEventListener("DOMContentLoaded", APP.init);
