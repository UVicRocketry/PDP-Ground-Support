import { Button, Container, IconButton, Paper, Stack, Switch, Typography } from "@mui/material"
import { useContext, useState } from "react";
import { JsonData, JsonEditor, ThemeInput } from 'json-edit-react'
import { AutomationProfilesType, InstrumentationSensorType } from "../../../../lib/configs/configs";
import { observer } from "mobx-react-lite";
import SettingStore from "../../../../stores/SettingStore";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { InstrumentationReadingType } from "../../../instrumentation/instrumentation-module/Instrumentation-module-types";
import ControlsStore, { ControlsWebSocketStore } from '../../../../stores/websocket/ControlsWebSocketStore';
import { ControlsCommandTypes, IControlsPacket, PacketType } from '../../../../lib/monitoring-system-types';



export const SettingPanel = observer(() => {
    return (
        <Container>
            <Paper
                sx={{
                    flexGrow: 1,
                    height: '100%', 
                    width: '100%',
                    display: 'flex',
                    maxHeight: '80vh',
                    overflow: 'scroll',
                }}
            >
                <Stack 
                    direction={'column'}
                    spacing={2}
                    sx={{
                        width: '100%',
                        padding: 2,
                    }}
                >
                    {SettingStore.settingsPanel === 'main' && <SettingsMainContent />}
                    {SettingStore.settingsPanel === 'instrumentation' && <InstrumentationSettings />}
                    {SettingStore.settingsPanel === 'controls' && <ControlsSettings  />}
                    {SettingStore.settingsPanel === 'automation' && <AutomationSettings />}
                </Stack>
            </Paper>
        </Container>
    )
})


const SettingsMainContent = observer(() => {
    return (
        <>
            <Stack
                spacing={1}
                width={'100%'}
            >
                <Stack justifyContent={'space-between'} direction={'row'} width={'100%'}>
                    <Typography variant='h4'>Settings</Typography>
                    <Button
                        size="small"
                        variant="contained"
                        sx={{
                            width: 'fit-content',
                            backgroundColor: 'black',
                            color: 'white'
                        }}
                        onClick={() => SettingStore.updateView('DASHBOARD')}
                        startIcon={<ChevronLeft />}
                    >
                        back
                    </Button>
                </Stack>
                <Stack spacing={1} width={'100%'}>
                    <Typography variant='h6'>Automation</Typography>
                    <SettingsOption 
                        option={'Automation Profiles'}
                        onClick={() => {
                            console.log('clicked')
                            SettingStore.updateSettingsPanel('automation')
                        }}
                    />
                </Stack>
                <Stack spacing={1} width={'100%'}>
                    <Typography variant='h6'>Instrumentation</Typography>
                    <SettingsOption 
                        option={'Instrumentation Configuration'}
                        onClick={() => {
                            console.log('clicked')
                            SettingStore.updateSettingsPanel('instrumentation')
                        }}
                    />
                    <SettingsOption 
                        option={'Instrumentation Visualization'}
                        toggle
                        toggleInitValue={SettingStore.uiConfiguration.instrumentation.graphs}
                        updateToggleValue={(value: boolean) => SettingStore.uiConfiguration.instrumentation.graphs = value}
                    />
                </Stack>
            </Stack>
            <Stack
                spacing={1}
            >
                <Typography variant='h6'>Controls</Typography>
                <SettingsOption 
                    onClick={() => {
                        console.log('clicked')
                        SettingStore.updateSettingsPanel('controls')
                    }}
                    option={'Controls Configuration'}
                />
                <SettingsOption
                    option={'Controls Dock'}
                    toggle
                    toggleInitValue={SettingStore.uiConfiguration.controls.dock}
                    updateToggleValue={(value: boolean) => SettingStore.uiConfiguration.controls.dock = value}
                />
                <SettingsOption
                    option={'Controls Panel'}
                    toggle
                    toggleInitValue={SettingStore.uiConfiguration.controls.panel}
                    updateToggleValue={(value: boolean) => SettingStore.uiConfiguration.controls.panel = value}
                />
                <SettingsOption
                    option={'Igniter Controls'}
                    toggle
                    toggleInitValue={SettingStore.uiConfiguration.controls.igniter}
                    updateToggleValue={(value: boolean) => {
                        value ? SettingStore.pushNewControl('IGNITER') : SettingStore.removeControl();
                        SettingStore.uiConfiguration.controls.igniter = value;
                    }}  
                />
                <SettingsOption 
                    onClick={() => {
                        const payload : IControlsPacket = {
                            identifier : PacketType.CONTROLS,
                            command : ControlsCommandTypes.UNABORT
                        };
                        console.log(payload);
                        ControlsStore.sendCommand(payload);
                    }}
                    option={'Controls Unabort'}
                />
            </Stack>
            <Stack
                spacing={1}
            >
                <Typography variant='h6'>Feed System</Typography>
                <SettingsOption
                    option={'Feed System Panel'}
                    toggle
                    toggleInitValue={SettingStore.uiConfiguration.feedSystem.show}
                    updateToggleValue={(value: boolean) => SettingStore.uiConfiguration.feedSystem.show = value}
                />
            </Stack>
        </>
    )
})

const JsonEditorDefaultProps = {
    rootFontSize: 12,
    theme: 'githubDark' as ThemeInput,
    collapse: 0,
    rootName: 'Config',
    collapseAnimationTime: 100
}

const InstrumentationSettings = observer(() => {
    return (
        <Stack
            direction={'column'}
            spacing={1}
            sx={{
                alignContent: 'center',
                justifyContent: 'center'
            }}
            width={'100%'}
        >
            <Typography variant='subtitle1'>Instrumentation Configuration</Typography>
            <JsonEditor
                data={SettingStore.instrumentationConfig}
                setData={(data: JsonData) => SettingStore.updateInstrumentationConfig(data as InstrumentationSensorType[])}
                {...JsonEditorDefaultProps}
                defaultValue={{
                    label:"Default Label",
                    key:"{TYPE}_{LABEL}",
                    type:"{TYPE}",
                    display:true,
                    visualizationType:"graph",
                    size:9
                }}
            />
            <Button 
                size="small"
                variant="contained"
                sx={{
                    backgroundColor: 'black',
                    color: 'white'
                }}
                onClick={() => SettingStore.updateSettingsPanel('main')}
                startIcon={<ChevronLeft />}
            >
                back
            </Button>
        </Stack>
    )
})

const ControlsSettings = observer(() => {
    return (
        <Stack
            spacing={1}
        >
            <Typography variant='h6'>Controls Configuration</Typography>
            <JsonEditor
                 data={SettingStore.controlsList}
                 setData={(data: JsonData) => SettingStore.updateControlsList(data as string[])}
                 {...JsonEditorDefaultProps}
            />
            <Button 
                    size="small"
                    variant="contained"
                    sx={{
                        backgroundColor: 'black',
                        color: 'white'
                    }}
                    onClick={() => SettingStore.updateSettingsPanel('main')}
                    startIcon={<ChevronLeft />}
                >
                    back
                </Button>
        </Stack>
    )
})

const AutomationSettings = observer(() => {
    return (
        <Stack
            spacing={1}
        >
            <Typography variant='h6'>Automation Profiles</Typography>
            <JsonEditor
                 data={SettingStore.automationProfiles}
                 setData={(data: JsonData) => SettingStore.updateAutomationProfiles(data as AutomationProfilesType[])}
                 {...JsonEditorDefaultProps}
            />
            <Button 
                    size="small"
                    variant="contained"
                    sx={{
                        backgroundColor: 'black',
                        color: 'white'
                    }}
                    onClick={() => SettingStore.updateSettingsPanel('main')}
                    startIcon={<ChevronLeft />}
                >
                    back
                </Button>
        </Stack>
    )
})


interface SettingsOptionProps {
    option: string;
    toggle?: boolean;
    onClick?: () => void;
    toggleInitValue?: boolean;
    updateToggleValue?: (value: boolean) => void;
}

const SettingsOption = observer((props: SettingsOptionProps) => {
    const { option, toggle, toggleInitValue, updateToggleValue, onClick } = props;
    
    const [hoverElevation, setHoverElevation] = useState<number>(0);
    
    const [toggleState, setToggleState] = useState<boolean>(toggleInitValue || false);
    const changeToggleState = () => {
        if (!updateToggleValue) return;
        const newToggleState = !toggleState;
        setToggleState(newToggleState);
        updateToggleValue(newToggleState);
    }

    return (
        <Paper
            sx={{
                padding: 1.5,
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'black'
            }}
            elevation={hoverElevation}
            onClick={() => !toggle && onClick && onClick()}
            onMouseEnter={() => setHoverElevation(1)}
            onMouseLeave={() => setHoverElevation(0)}
        >
            <Typography variant='subtitle2'>{option}</Typography>
            { toggle 
                ? <Switch size="small" checked={toggleState} onChange={changeToggleState} /> 
                : <IconButton size="small"><ChevronRight /></IconButton> 
            }
        </Paper>
    )
})