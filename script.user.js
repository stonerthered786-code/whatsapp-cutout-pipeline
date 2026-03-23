// ==UserScript==
// @name         WhatsApp → Cutout Pipeline
// @namespace    https://github.com/yourname/whatsapp-cutout-pipeline
// @version      1.0
// @description  Click → copy image → paste into Cutout Pro
// @match        https://web.whatsapp.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function addButton(img) {
        if (img.dataset.copyReady) return;
        img.dataset.copyReady = "1";

        if (!img.complete || img.naturalWidth < 150) return;

        if (img.parentElement && img.parentElement.dataset.wrapper) return;

        const wrapper = document.createElement("div");
        wrapper.dataset.wrapper = "true";
        wrapper.style.position = "relative";
        wrapper.style.display = "inline-block";

        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);

        const btn = document.createElement("div");

        btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"/>
        </svg>
        `;

        btn.title = "Copy → Paste into Cutout";

        Object.assign(btn.style, {
            position: "absolute",
            top: "8px",
            left: "8px",
            width: "22px",
            height: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
            borderRadius: "6px",
            zIndex: "9999",
            cursor: "pointer",
            opacity: "0",
            transition: "0.2s"
        });

        wrapper.appendChild(btn);

        wrapper.onmouseenter = () => btn.style.opacity = "1";
        wrapper.onmouseleave = () => btn.style.opacity = "0";

        btn.onclick = async () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                canvas.toBlob(async (blob) => {
                    await navigator.clipboard.write([
                        new ClipboardItem({ "image/png": blob })
                    ]);

                    // open/reuse cutout tab
                    const win = window.open(
                        "https://www.cutout.pro/photo-enhancer-sharpener-upscaler/upload",
                        "cutoutTab"
                    );

                    if (win) win.focus();

                }, "image/png");

            } catch (err) {
                console.error("Copy failed:", err);
            }
        };
    }

    function scan() {
        document.querySelectorAll("img").forEach(img => {
            if (img.complete) addButton(img);
            else img.onload = () => addButton(img);
        });
    }

    scan();

    new MutationObserver(scan).observe(document.body, {
        childList: true,
        subtree: true
    });

})();
