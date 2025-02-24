import { Alert, Button, ButtonGroup, Chip, FormControl, Paper, Snackbar, Stack, Tooltip } from '@mui/material';
import React, { useEffect, useState } from 'react';
import ValveControl from '../../../controls/valve-control/ValveControl';
import LoadingButton from '@mui/lab/LoadingButton';
import { Observer, observer } from 'mobx-react-lite';
import ControlsStore, { ControlsWebSocketStore } from '../../../../stores/websocket/ControlsWebSocketStore';
import settingStore from '../../../../stores/SettingStore';
import { ControlsCommandTypes, IControlsPacket, PacketType } from '../../../../lib/monitoring-system-types';

const ControlsPanelDock: React.FC = observer(() => {
    enum ConnectionDotColors {
        CONNECTED = 'success',
        INTERRUPTED = 'error',
        DISCONNECTED = 'default'
    }

    const [errorMessageToast, setErrorMessageToast] = useState<boolean>(false);

    useEffect(() => {
        if (ControlsStore.error) {
            setErrorMessageToast(true);
        }
    }, [ControlsStore.error])

    return (
        <Observer>{() =>
        <Paper
            elevation={2}
            sx={{ 
                padding: 2, 
                width: "100%", 
                height: "fit-content",
            }}
        >
            <FormControl component="fieldset" fullWidth>
                <Stack 
                    minWidth={'100%'}
                    direction={'row'} 
                    justifyContent={'space-between'}
                >
                    {settingStore.controlsList.map((control, index) => (
                        <ValveControl
                            disabled={!ControlsStore.isConnected}
                            key={index}
                            valveName={control}
                            feedbackAction={ControlsStore.feedbackAction}
                            feedbackValve={ControlsStore.feedbackValve}
                        />
                    ))}
                </Stack>
            </FormControl>
            <Stack direction={'row'} sx={{ marginTop: 1 }} spacing={2}>
                <Button 
                    fullWidth 
                    variant='contained' 
                    color="error" 
                    onClick={() => {
                        const payload : IControlsPacket = {
                            identifier : PacketType.CONTROLS,
                            command : ControlsCommandTypes.ABORT
                        };
                        console.log(payload);
                        ControlsStore.sendCommand(payload);
                    }}
                    sx={{ fontSize: 24, fontWeight: 600 }}
                >
                    Abort
                </Button>
                <ButtonGroup orientation='horizontal'>
                    <LoadingButton 
                        color='inherit'
                        variant='contained'
                        loading={ControlsStore.loading}
                        loadingPosition='start'
                        onClick={() => {
                            console.log(`isConnected state ${ControlsStore.isConnected}`)
                            if (ControlsStore.isConnected) {
                                console.log('disconnect UI')
                                ControlsStore.disconnect()
                            } else {
                                console.log('connect UI')
                                ControlsStore.connect()
                            }
                        }}
                        startIcon={
                            <Tooltip title='Controls WebSocket Status'>
                                <Chip 
                                    size='small' 
                                    color={ControlsStore.isConnected ? ConnectionDotColors.CONNECTED : ConnectionDotColors.DISCONNECTED} 
                                    sx={{ borderRadius: '50%', width: 25 }}
                                />
                            </Tooltip>
                        }
                    >
                        Controls
                    </LoadingButton>
                    <LoadingButton 
                        color='inherit'
                        variant='contained'
                        // loading={true}
                        loadingPosition='start'
                        startIcon={
                            <Tooltip title='Instrumentation WebSocket Status'>
                                <Chip 
                                    size='small' 
                                    color={false ? ConnectionDotColors.CONNECTED : ConnectionDotColors.DISCONNECTED}
                                    sx={{ borderRadius: '50%', width: 25 }}
                                />
                            </Tooltip>
                        }
                    >
                        Instrumentation
                    </LoadingButton>
                </ButtonGroup>
            </Stack>
            <Snackbar open={errorMessageToast} autoHideDuration={6000} onClose={
                () => setErrorMessageToast(false)
            }>
                <Alert
                    onClose={() => setErrorMessageToast(false)}
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {ControlsStore.errorMessage}
                </Alert>
            </Snackbar>
        </Paper>
        }</Observer>
    )
})

export default ControlsPanelDock;