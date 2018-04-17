from __future__ import print_function
import time
import sys


class ProgressBar():
    def __init__(self, size=40, refresh=0.3):
        self.size = size
        self.refresh = refresh
        self.starttime = time.time()
        self.counter = 0

    def _container(self):
        sys.stdout.write("[%s%s%s]\r" %(" " * self.counter,
                                        '>>',
                                        " " * (self.size - self.counter - 1)))
        sys.stdout.flush()

    def update(self):
        now = time.time()
        if now - self.starttime > self.refresh:
            self.starttime = now
            self.counter += 1
            self.counter = self.counter % self.size
            self._container()

    def complete(self):
        sys.stdout.write('\n')
        sys.stdout.flush()

if __name__ == '__main__':
    progressbar = ProgressBar(size=40, refresh=0.1)
    counter = 0
    while counter < 40:
        progressbar.update()
        time.sleep(0.2)
        counter += 1
