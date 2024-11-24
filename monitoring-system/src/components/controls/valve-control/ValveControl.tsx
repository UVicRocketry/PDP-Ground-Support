import React, { useEffect, useState } from 'react';
import { ControlsActionTypes, ControlsCommandTypes, ControlsValveTypes, IControlsPacket, PacketType } from '../../../lib/monitoring-system-types';
import { Chip, FormControlLabel, Stack, Switch, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Observer, observer } from 'mobx-react-lite';
import ControlsStore from '../../../stores/websocket/ControlsWebSocketStore'; 

interface IValveControlProps {
    valveName: string;
    disabled?: boolean;
    feedbackAction?: string;
    feedbackValve?: string;
}

const ValveControl = observer((props: IValveControlProps) => {
    const { valveName, disabled, feedbackAction, feedbackValve } = props;
    const [feedBackColor, setFeedBackColor] = valveName == "RTV" ? useState<string>("success") : useState<string>("default");
    const [feedBackLabel, setFeedBackLabel] = valveName == "RTV" ? useState<string>("OPEN") : useState<string>("CLOSED");
    const theme = useTheme();
    const [isSwitchChecked, setIsSwitchChecked] = useState<boolean>(false);
    const [name, setName] = useState<string>(valveName);

    useEffect(() => {
        setName(valveName);
    }, [valveName]);

    useEffect(() => {
        if (feedbackValve !== valveName) return;
        if (feedbackAction == "OPEN") {
            setFeedBackColor("success");
            setFeedBackLabel("OPEN");
        } else if (feedbackAction == "TRANSIT") {
            setFeedBackColor("primary");
            setFeedBackLabel("IN TRANSIT");
        } else if (feedbackAction == "CLOSE") {
            setFeedBackColor("default");
            setFeedBackLabel("CLOSED");
        }
    }, [feedbackAction, feedbackValve, valveName])

    const sendCommand = (event: React.ChangeEvent<HTMLInputElement>) => {
        // default closed
        const payload: IControlsPacket = {
            identifier: PacketType.CONTROLS,
            command: ControlsCommandTypes.CONTROL,
            valve: name == ControlsValveTypes.IGNITER ? "IGPRIME" : name,
            action: ControlsActionTypes.CLOSE
        };

        setIsSwitchChecked(event.target.checked);
        if (event.target.checked) {
            payload.action = ControlsActionTypes.OPEN;
        } 

        if(valveName == 'RTV'){
            isSwitchChecked ? setFeedBackColor("success") : setFeedBackColor("default");
            isSwitchChecked ? setFeedBackLabel("OPEN") : setFeedBackLabel("CLOSED");
        }
        
        console.log('send controls packet')
        console.log(payload)

        ControlsStore.sendCommand(payload);
    }

    const ComputerView = observer((props: { valveName: string }) => {
        const { valveName } = props;
        return (
            <Observer>{() => (
                <Stack direction="column" spacing={0} alignItems={'center'} minWidth={140} marginY={0.5}>
                    <FormControlLabel 
                        sx={{ width: "fit-content" }} 
                        control={<Switch 
                            onChange={sendCommand}
                            disabled={disabled}
                            checked={isSwitchChecked}
                        />} 
                        label={<Typography variant='button'>{valveName}</Typography>} 
                        labelPlacement='end' 
                    />
                    <Chip 
                        color={feedBackColor}
                        size="small" 
                        label={feedBackLabel}
                        sx={{ width: "90%", borderRadius: 1 }}
                    />
                </Stack>
            )}</Observer>
        );
    })

    return (
        <Observer>
            {() => (
                <ComputerView valveName={name} />
            )}
        </Observer>
    );
})


ValveControl.PhoneView = (props: { valveName: string }) => {
    const { valveName } = props;
    return (
        <Stack direction="column" spacing={0} alignItems={'center'} minWidth={140} marginY={0.5}>
            <Typography>{valveName}</Typography>
            <Chip 
                color="default"
                size="small" 
                label="CLOSED" 
                sx={{ width: "90%", borderRadius: 1 }}
            />
        </Stack>
    );
}

export default ValveControl;