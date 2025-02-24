import { makeAutoObservable } from "mobx";
import { AutomationProfilesType, CONTROL_VALVES_SAFE_STATES, ControlValveType, DEFAULT_CONTROLS_CONFIG, DEFAULT_INSTRUMENTATION_CONFIG, InstrumentationSensorType } from "../lib/configs/configs";

interface ISettingStore {
    instrumentationConfig: InstrumentationSensorType[];
    controlsConfig: ControlValveType[];
    controlsList: string[];
    settingsPanel: 'instrumentation' | 'controls' | 'main' | string;
    currentView: 'DASHBOARD' | 'SETTINGS' | 'REPLAY' | string;
    uiConfiguration: {
        controls: {
            panel: boolean;
            dock: boolean;
        },
        instrumentation: {
            graphs: boolean;
        },
        feedSystem: {
            show: boolean;
            drawers: {
                helpDrawer: boolean;
                legendDrawer: boolean;
                nodeBuilderDrawer: boolean;
            }
        }
    }
}

class SettingStore implements ISettingStore {
    settingsPanel = 'main';
    controlsList: string[] = DEFAULT_CONTROLS_CONFIG;
    controlsConfig: ControlValveType[] = [];
    instrumentationConfig: InstrumentationSensorType[] = [];
    automationProfiles: AutomationProfilesType[] = [];
    uiConfiguration = {
        controls: {
            panel: false,
            igniter: false,
            dock: true
        },
        instrumentation: {
            graphs: false
        },
        feedSystem: {
            show: true,
            drawers: {
                helpDrawer: false,
                legendDrawer: false,
                nodeBuilderDrawer: false
            }
        }
    }
    currentView = 'DASHBOARD';

    constructor() {
        makeAutoObservable(this);
        this.setDefaultControlsConfig();
        this.setDefaultInstrumentationConfig();
    }

    updateView(view: 'DASHBOARD' | 'SETTINGS' | 'REPLAY') {
        this.currentView = view;
    }

    updateSettingsPanel(panel: 'instrumentation' | 'controls' | 'main' | 'automation') {
        this.settingsPanel = panel;
    }

    pushNewControl(control: string) {
        this.controlsList.push(control);
    }

    removeControl() {
        this.controlsList.pop();
    }

    updateControlsList(controls: string[]) {
        this.controlsList = controls;
    }

    updateInstrumentationConfig(config: InstrumentationSensorType[] | []) {
        this.instrumentationConfig = config;
    }

    updateAutomationProfiles(profiles: AutomationProfilesType[]) {
        this.automationProfiles = profiles;
    }

    setDefaultInstrumentationConfig() {
        this.instrumentationConfig = DEFAULT_INSTRUMENTATION_CONFIG;
    }

    setDefaultControlsConfig() {
        this.controlsConfig = CONTROL_VALVES_SAFE_STATES;
    }

    private get store() {
        return this;
    }
    
    get getInstrumentationConfig() {
        return this.store.instrumentationConfig;
    }

    get getControlsConfig() {
        return this.store.controlsConfig;
    }
}

const settingStore = new SettingStore();

export default settingStore