import { InstrumentationType } from "../../components/instrumentation/instrumentation-module/Instrumentation-module-types";
import { ControlsValveTypes } from "../monitoring-system-types";

export type AutomationProfilesType = {
    label: string;
    key: string;
    automation: boolean;
    controls: ControlsValveTypes[];
    instrumentation: InstrumentationSensorType[];
    description: string;
}

export type InstrumentationSensorType = {
    label: string;
    key: string;
    type: InstrumentationType;
    display: boolean;
    visualizationType?: 'graph' | 'value' | 'both';
    size: 9 | 3;
}

export type ControlValveType = {
    valve: ControlsValveTypes.N2OVent | ControlsValveTypes.N2Flow | ControlsValveTypes.ERV | ControlsValveTypes.RTV | ControlsValveTypes.NCV | ControlsValveTypes.MEV;
    state: 'CLOSED' | 'OPEN' | 'FILLING' | 'VENTING' | 'UNKNOWN';
}

export const DEFAULT_INSTRUMENTATION_CONFIG: InstrumentationSensorType[]  = [
    {
        label: 'Run Tank',
        type: InstrumentationType.TEMPERATURE,
        key: 'T_RUN_TANK',
        display: true,
        visualizationType: 'value',
        size: 3
    },
    {
        label: 'Injector',
        key: 'T_INJECTOR',
        type: InstrumentationType.TEMPERATURE,
        display: true,
        visualizationType: 'value',
        size: 3
    },
    {
        label: 'N2O Flow',
        key: 'P_N2O_FLOW',
        type: InstrumentationType.PRESSURE,
        display: true,
        visualizationType: 'value',
        size: 3
    },
    {
        label: 'N2 Flow',
        key: 'P_N2_FLOW',
        type: InstrumentationType.PRESSURE,
        display: true,
        visualizationType: 'value',
        size: 3
    },
    {
        label: "Run Tank",
        key: "P_RUN_TANK",
        type: InstrumentationType.PRESSURE,
        display: true,
        visualizationType: 'graph',
        size: 9
    },
    {
        label: "Run Tank",
        key: "L_RUN_TANK",
        type: InstrumentationType.MASS,
        display: true,
        visualizationType: 'graph',
        size: 9
    },
    {
        label: "Thrust",
        key: "L_THRUST",
        type: InstrumentationType.LOAD,
        display: true,
        visualizationType: 'graph',
        size: 9
    }
]

// TODO: Update to match the actual configuration
export const CONTROL_VALVES_SAFE_STATES: ControlValveType[] = [
    {
        valve: ControlsValveTypes.N2OVent,
        state: 'CLOSED'
    },
    {
        valve: ControlsValveTypes.N2Flow,
        state: 'CLOSED'
    },
    {
        valve: ControlsValveTypes.ERV,
        state: 'CLOSED'
    },
    {
        valve: ControlsValveTypes.RTV,
        state: 'CLOSED'
    },
    {
        valve: ControlsValveTypes.NCV,
        state: 'CLOSED'
    },
    {
        valve: ControlsValveTypes.MEV,
        state: 'CLOSED'
    }
]


export const DEFAULT_CONTROLS_CONFIG = [
    ControlsValveTypes.N2Flow,
    ControlsValveTypes.RTV,
    ControlsValveTypes.NCV,
    ControlsValveTypes.MEV,
    ControlsValveTypes.N2OFlow
]