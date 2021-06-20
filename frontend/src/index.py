import os
import webview


class Api():
    def toggleFullscreen(self):
        webview.windows[0].toggle_fullscreen()

    def init(self, num):
        return '1212'


if __name__ == '__main__':
    api = Api()
    url = 'http://127.0.0.1:3000/'
    webview.create_window('YANUS Antidetect', url, js_api=api, width=1080, height=760, min_size=(600, 450))
    webview.start(debug=True)
