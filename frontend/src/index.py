import os
import webview
import subprocess
import threading

CHROME_ARG = [
    '--no-default-browser-check',
    '--disable-notifications',
    '--use-mock-keychain',
    '--app=desired_address_without_brackets'
]

CHROME_ENV = {
    'GOOGLE_API_KEY': 'no',
    'GOOGLE_DEFAULT_CLIENT_ID': 'no',
    'GOOGLE_DEFAULT_CLIENT_SECRET': 'no'
}


def get_chrome_path():
    return os.path.join(os.getcwd(), 'bin/Chromium.app/Contents/MacOS/Chromium')


def run_chrome(profile_id, on_exit=None):
    data_dir = os.path.join(os.getcwd(), 'bin/profiles/%s' % profile_id)
    cmd = [get_chrome_path()] + CHROME_ARG + ['--user-data-dir=%s' % data_dir]
    env = CHROME_ENV

    PIPE = subprocess.PIPE
    proc = subprocess.Popen(cmd, env=env, stdout=PIPE, stderr=PIPE)
    print('chrome [%d] started' % proc.pid)

    def _executor():
        proc.wait()
        print('chrome [%d] stopped' % proc.pid)
        if on_exit is not None:
            on_exit()

    thread = threading.Thread(target=_executor, args=())
    thread.start()
    return proc


def api_error(code):
    return {'success': False, 'error': 'native_%s' % code}


def api_ok(data=None):
    return {'success': True, 'data': data}


class Api():
    def __init__(self):
        self._started = {}

    @property
    def window(self) -> webview.Window:
        return webview.windows[0]

    def toggleFullscreen(self):
        self.window.toggle_fullscreen()

    def chrome_start(self, profile_id):
        if profile_id in self._started:
            return api_error('already_started')

        def on_exit():
            self.window.evaluate_js(r'console.log("from python")')

        proc = run_chrome(profile_id, on_exit)
        self._started[profile_id] = proc.pid
        return api_ok()

    def chrome_stop(self, profile_id):
        if not profile_id in self._started:
            return api_error('profile_not_started')

        os.kill(self._started[profile_id], 9)
        del self._started[profile_id]


def main():
    api = Api()
    url = 'http://127.0.0.1:3000/'
    webview.create_window('YANUS Antidetect', url, js_api=api, width=1080, height=760, min_size=(600, 450))
    webview.start(debug=True)


if __name__ == '__main__':
    main()
