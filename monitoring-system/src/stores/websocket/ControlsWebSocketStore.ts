import { action, makeAutoObservable, makeObservable, observable, onBecomeObserved, onBecomeUnobserved } from "mobx";
import LocalStorageCache from "../../lib/cashe";
import { DEFAULT_CONTROLS_CONFIG, CONTROL_VALVES_SAFE_STATES } from "../../lib/configs/configs";
import { IControlsPacket } from "../../lib/monitoring-system-types";

const VALVE_NAME_KEYS = DEFAULT_CONTROLS_CONFIG
const VALVE_DEFAULT_STATES = CONTROL_VALVES_SAFE_STATES

const WSS_PORT = 8080
const WSS_IP_LOCAL = 'ws://localhost'
const WSS_IP_NETWORK = 'ws://192.168.0.1'

const WSS_URL = `${WSS_IP_NETWORK}:${WSS_PORT}`

interface IControlsStore {
  valveStates:object;
  logCache: LocalStorageCache<string[]>;
  isConnected: boolean;
  loading: boolean;
  error: boolean;
  errorMessage: string | undefined;
  connect(): void;
  sendCommand(payload: IControlsPacket): void;
  clearLog(): void;
}

export class ControlsWebSocketStore implements IControlsStore {
  ws: WebSocket | undefined;
  error: boolean = false;
  errorMessage: string | undefined;
  loading: boolean = false;
  valveStates = VALVE_DEFAULT_STATES;
  logCache: LocalStorageCache<string[]> = new LocalStorageCache<string[]>('ControlsLogCache');
  isConnected: boolean = false;
  feedbackValve: string | undefined;
  feedbackAction: string | undefined = 'CLOSE';
  
  constructor() {
    makeAutoObservable(this)
    onBecomeObserved(this, 'isConnected', this.connect);
    onBecomeUnobserved(this, 'isConnected', this.disconnect);

    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onOpen = this.onOpen.bind(this);
    this.onError = this.onError.bind(this);
    this.updateFeedbackValve = this.updateFeedbackValve.bind(this);
    this.updateFeedbackAction = this.updateFeedbackAction.bind(this);
    this.onMessage = this.onMessage.bind(this);
  }

  disconnect() {
    console.log('close')
    try {
      if (this.ws) {
        this.ws.close();
      }
    } finally {
      this.isConnected = false
    }
  }

  connect() {
    // connect to the websocket
    this.loading = true;
    this.error = false;
    try {
      this.ws = new WebSocket(WSS_URL)
    } finally {
      this.ws?.addEventListener('message', this.onMessage)
      this.ws?.addEventListener('close', this.onClose)
      this.ws?.addEventListener('open', this.onOpen)
      this.ws?.addEventListener('error', this.onError)
      
      setTimeout(() => {
        this.onOpen()
      }, 2300)
    }  
  }

  onClose() {
    this.loading = true;
    try {
      if (this.ws) {
        this.ws.close();
      }
    } finally {
      this.loading = false;
      this.isConnected = false
    }
  }

  onError(error: Event) {
    console.log('error', error)
    this.error = true;
    this.errorMessage = `Websocket Error: try restarting your server` 
    this.isConnected = false;
  }

  onOpen() {
    this.loading = false;
    this.isConnected = true;
  }
  
  updateFeedbackValve(valve: string) {
    this.feedbackValve = valve
    console.log(`Feedback Valve: ${valve}`)
  }

  updateFeedbackAction(action: string) {
    this.feedbackAction = action
    console.log(`Feedback Action: ${action}`)
  }

  onMessage(message: MessageEvent): void {
    const data = JSON.parse(message.data as string);
    console.log(data)
    const identifier = data.identifier;
   
    switch (identifier) {
      case 'FEEDBACK':
        this.updateFeedbackAction(data.data.action)
        this.updateFeedbackValve(data.data.valve)
        break;
      case 'STATUS':
        console.log(data.data)
        break;
    }
  }

  sendCommand(payload: IControlsPacket) {
    // send command to the websocket
    if (!this.ws) {
      console.log('no websocket connection')
      return
    }
    this.ws.send(JSON.stringify(payload))
  }

  private log() {
    // log a command
  }

  clearLog() {
    // clear the log
  }
}

const controlsWSStore = new ControlsWebSocketStore()

export default controlsWSStore