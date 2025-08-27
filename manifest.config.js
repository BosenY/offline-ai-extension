export default {
    "manifest_version": 3,
    "name": "offline-ai-extension",
    "description": "offline-ai-extension",
    "options_ui": {
        "page": "src/pages/options/index.html"
    },
    "chrome_url_overrides": {
        "newtab": "src/pages/newtab/index.html"
    },
    "icons": {
        "128": "icon-128.png"
    },
    "permissions": [
        "activeTab"
    ],
    "content_scripts": [
        {
            "matches": [
                "http://*/*",
                "https://*/*",
                "<all_urls>"
            ],
            // "js": [
            //     "src/pages/content/index.tsx"
            // ],
            // "css": [
            //     "contentStyle.css"
            // ]
        }
    ],
    "devtools_page": "src/pages/devtools/index.html",
    "web_accessible_resources": [
        {
            "resources": [
                "contentStyle.css",
                "icon-128.png",
                "icon-32.png"
            ],
            "matches": []
        }
    ]
}
