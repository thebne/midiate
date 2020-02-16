from PyQt5.QtWidgets import QLabel, QMainWindow, QApplication, QWidget, QVBoxLayout
from PyQt5.QtGui import QPixmap
from threading import Thread

from .base import OutputBase
from .types import OutputType


class SimpleVisualOutput(OutputBase):
    output_type = OutputType.Visual

    def __init__(self):
        super().__init__()
        self._app = QApplication([])
        self._window = SimpleQtWindow()
        Thread(target=self._app.exec_).start()

    async def _render(self):
        self._window.draw(self._ui.get_frame())


class SimpleTextualOutput(OutputBase):
    output_type = OutputType.Textual

    def __init__(self):
        super().__init__()

        self._last_text = None

    async def _render(self):
        text = self._ui.get_text()
        if len(text) and text != self._last_text:
            print(text)
            self._last_text = text


class SimpleQtWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle('MIDIate')

        self.central_widget = QWidget()               
        self.setCentralWidget(self.central_widget)    
        lay = QVBoxLayout(self.central_widget)

        label = QLabel(self)
        pixmap = QPixmap('/home/operry/Downloads/Artboard 19.png')
        label.setPixmap(pixmap)
        self.resize(pixmap.width(), pixmap.height())

        lay.addWidget(label)
        self.show()

    def draw(self, frame):
        print('hi')
        pass
