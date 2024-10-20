from PyQt5 import QtGui, QtWidgets, uic, QtCore
import websocket # websocket-client
import pyqtgraph as pg
import numpy as np
import json

'''
Start mock_instrumentation.py from PDP-Monitoring-System repo
 > https://github.com/UVicRocketry/PDP-Monitoring-System
and you can uncomment this line (and comment the other out)
to simulate instrumentation data for testing
'''

# Mock
socket_name = "ws://localhost:8888/websocket"
# PDP
#socket_name = "ws://192.168.0.1:8888"

# All keys in the instrumentation data json string
keys = [ 'P_INJECTOR',
         'P_COMB_CHMBR',
         'P_N2O_FLOW',
         'P_N2_FLOW',
         'P_RUN_TANK',

         'T_RUN_TANK',
         'T_INJECTOR',
         'T_COMB_CHMBR',
         'T_POST_COMB',

         'L_RUN_TANK',
         'L_THRUST' ]

class WebSocketThread(QtCore.QThread):
    # Define a signal to send data from the thread to the main UI
    data_received = QtCore.pyqtSignal(dict)

    def run(self):
        ws = websocket.WebSocketApp(socket_name, on_message=self.on_message)
        ws.run_forever()

    def on_message(self, ws, message):
        # Decode JSON message and emit the signal to update the plots
        try:
            data = json.loads(message)

            # PDP quirk
            data = data['data']

            # Convert to more friendly units
            data['P_INJECTOR'] /= 6895 # psi
            data['P_COMB_CHMBR'] /= 6895
            data['P_N2O_FLOW'] /= 6895
            data['P_N2_FLOW'] /= 6895
            data['P_RUN_TANK'] /= 6895

            data['T_RUN_TANK'] += 273.15 # C
            data['T_INJECTOR'] += 273.15
            data['T_COMB_CHMBR'] += 273.15
            data['T_POST_COMB'] += 273.15

            data['L_RUN_TANK'] /= 9.81 # kg
            data['L_THRUST'] /= 1 # N

            self.data_received.emit(data)

        except json.JSONDecodeError as e:
            print("JSON Decode Error:", e)

class MainWindow(QtWidgets.QMainWindow):

    def __init__(self, *args, **kwargs):

        # Load external ui file. Edit this ui file in 'Qt Designer'
        super(MainWindow, self).__init__(*args, **kwargs)
        uic.loadUi('ui.ui', self)

        # Reduce plotting update by a given factor
        self.update_divider = self.update_divider_slider.value()
        self.update_counter = 0

        # Rolling plot parameters
        self.sample_rate = 1000 # Incoming json packet freq
        self.plot_len = 10000
        self.buff_size = 30*60*self.sample_rate # 30min of data
        self.buff_idx = 0 # New data points are added at this idx

        # Instrumentation plots
        self.plots = {}
        self.lines = {}
        
        # Data lists are stored in a dict
        self.plot_data = {}
        for key in keys:
            self.plot_data[key] = np.zeros(self.buff_size)

        self.connect_signals()
        
        # Graph setup
        self.setup_graphs()
        self.set_plot_window(self.plot_len)
        self.set_downsampling()

        # Start the WebSocket thread for receiving instrumentation data
        self.ws_thread = WebSocketThread()
        self.ws_thread.data_received.connect(self.plotInstrumentation)
        self.ws_thread.start()

    def plotInstrumentation(self, data):

        for key in keys:
            self.plot_data[key][self.buff_idx]= data[key]

        # If the buffer has run out, wrap 
        # Wrap the buffer index around if needed
        self.buff_idx += 1

        if self.buff_idx == self.buff_size:
            self.buff_idx = 0

        # Reduce update frequency by factor of update_divider
        if self.update_counter > self.update_divider:
            self.update_counter = 0

            start = max(self.buff_idx - self.plot_len, 0)
            stop  = self.buff_idx

            for key in keys:
                self.lines[key].setData( \
                        self.plot_data[key][start:stop])

        self.update_counter += 1

    def setup_graphs(self):

        # Create a grid of plots. Plots are manually spaced
        self.gridLayout = pg.GraphicsLayout()
        self.plotWidget.setCentralItem(self.gridLayout)

        self.plots['P_RUN_TANK'] = \
                self.gridLayout.addPlot(0,0, colspan=3,
                                        title='Runtank Pressure',
                                        bottom='Sample',
                                        left='Pressure [psi]')
        self.plots['P_RUN_TANK'].setLimits(minYRange=10)

        self.plots['P_COMB_CHMBR'] = \
                self.gridLayout.addPlot(1, 0,
                                        title='Comb Chmbr. Pressure',
                                        left='Pressure (psi)')
        self.plots['P_COMB_CHMBR'].setLimits(minYRange=10)

        self.plots['P_N2O_FLOW'] = \
                self.gridLayout.addPlot(1, 1,
                                        title='N2O Flow Pressure',
                                        left='Pressure (psi)')
        self.plots['P_N2O_FLOW'].setLimits(minYRange=10)

        self.plots['P_N2_FLOW'] = \
                self.gridLayout.addPlot(1, 2,
                                        title='N2 Flow Pressure',
                                        left='Pressure (psi)')
        self.plots['P_N2_FLOW'].setLimits(minYRange=10)

        self.plots['P_INJECTOR'] = \
                self.gridLayout.addPlot(2, 0,
                                        title='Injector Pressure',
                                        left='Pressure (psi)')
        self.plots['P_INJECTOR'].setLimits(minYRange=10)

        self.plots['T_RUN_TANK'] = \
                self.gridLayout.addPlot(2, 1,
                                        title='Runtank Temp',
                                        left='Temperature [C]')
        self.plots['T_RUN_TANK'].setLimits(minYRange=10)

        self.plots['T_INJECTOR'] = \
                self.gridLayout.addPlot(2, 2,
                                        title='Injector Temp',
                                        left='Temperature [C]')
        self.plots['T_INJECTOR'].setLimits(minYRange=10)

        self.plots['T_COMB_CHMBR'] = \
                self.gridLayout.addPlot(3, 0,
                                        title='Comb Chmbr. Temp',
                                        left='Temperature [C]')
        self.plots['T_COMB_CHMBR'].setLimits(minYRange=10)

        self.plots['T_POST_COMB'] = \
                self.gridLayout.addPlot(3, 1,
                                        title='Post Comb Chmbr. Temp',
                                        left='Temperature [C]')
        self.plots['T_POST_COMB'].setLimits(minYRange=10)

        self.plots['L_THRUST'] = \
                self.gridLayout.addPlot(3, 2,
                                        title='Thrust',
                                        left='N')
        self.plots['L_THRUST'].setLimits(minYRange=10)

        self.plots['L_RUN_TANK'] = \
                self.gridLayout.addPlot(4, 0, colspan=3,
                                        title='Runtank Mass',
                                        left='kg')
        self.plots['L_RUN_TANK'].setLimits(minYRange=10)

        # Create line objects for each plot that are updated later
        for key in keys:
            self.plots[key].setMouseEnabled(x=True, y=False)
            self.lines[key] = self.plots[key].plot([0])

    def set_plot_window(self, sample_len):
        self.plot_len = sample_len
        self.set_downsampling()

    def set_downsampling(self):

        # Adjust downsampling for different window sizes
        for key in keys:

            # Graph width in pixels
            width = self.plots[key].vb.screenGeometry().width()

            # Samples. Can't use plot_len due to transients
            samples = self.lines[keys[0]].xData.size

            # Additional user adjustable factor
            n = self.ds_slider.value()/10

            # Reduce number of data points plotted
            downsample = int(n*(samples/(2*width)))

            self.lines[key].setDownsampling(ds=downsample, method='mean')

    def set_update_divider(self):
        self.update_divider = self.update_divider_slider.value()

    def connect_signals(self):

        # Graph controls
        self.graph_10s.clicked.connect(
                lambda: self.set_plot_window(10*self.sample_rate))
        self.graph_3m.clicked.connect(
                lambda: self.set_plot_window(60*3*self.sample_rate))
        self.graph_10m.clicked.connect(
                lambda: self.set_plot_window(60*10*self.sample_rate))
        self.graph_full.clicked.connect(
                lambda: self.set_plot_window(0))
        self.ds_slider.valueChanged.connect(self.set_downsampling)
        self.update_divider_slider.valueChanged.connect(self.set_update_divider)

if __name__ == "__main__":

    app = QtWidgets.QApplication([])
    main = MainWindow()
    main.show()
    app.exec()
