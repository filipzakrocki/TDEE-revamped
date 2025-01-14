import React, { useEffect } from 'react';
import { fetchDataWithStates, CalcState } from '../stores/calc/calcSlice';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../stores/auth/authSlice';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../app/store';
import { User } from 'firebase/auth';
import { Button, Text, Container } from '@chakra-ui/react';
import { useCustomToast } from '../utils/useCustomToast';

const Calculator: React.FC = () => {
    const user: User | null = useSelector((state: RootState) => state.auth.user);
    const calculator: CalcState | null  = useSelector((state: RootState) => state.calc);

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const showToast = useCustomToast();

    const [fetchTrigger, setFetchTrigger] = React.useState(false);

    const logOut = () => {
        dispatch(signOut());
    };

    useEffect(() => {
        const uid = user?.uid;
        if (!uid) return;

        const fetchCalcData = async () => {
            try {
                const data = await dispatch(fetchDataWithStates(uid)).unwrap();
                if (data) {
                    showToast({ description: 'Calc Data Fetched', status: 'success' });
                }
            } catch (error) {
                console.error("Error fetching Calc Data: ", error);
                showToast({ description: 'Error fetching Calc Data', status: 'error' });
            }
        };

        fetchCalcData();

    }, [dispatch, user, showToast, fetchTrigger]);

    return (
        <Container bg='red.100' minW='100%'>
            <Text>Calculator</Text>
            <Button onClick={logOut}>Log Out</Button>
            <Button onClick={() => navigate('/faq')}>Navigate to Faq</Button>
        </Container>
    );
};

export default Calculator;

// https://tdee-fit.firebaseio.com/manualStates/LOMEOfOOrIPlaOZ0RSN1WdOcw233.json?auth=eyJhbGciOiJSUzI1NiIsImtpZCI6IjExYzhiMmRmNGM1NTlkMjhjOWRlNWQ0MTAxNDFiMzBkOWUyYmNlM2IiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vdGRlZS1maXQiLCJhdWQiOiJ0ZGVlLWZpdCIsImF1dGhfdGltZSI6MTcyNDQzNjQ3MiwidXNlcl9pZCI6IkxPTUVPZk9PcklQbGFPWjBSU04xV2RPY3cyMzMiLCJzdWIiOiJMT01FT2ZPT3JJUGxhT1owUlNOMVdkT2N3MjMzIiwiaWF0IjoxNzI0NDM2NDcyLCJleHAiOjE3MjQ0NDAwNzIsImVtYWlsIjoiZml0bmVzc0BmaXRuZXNzLnBsIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImZpdG5lc3NAZml0bmVzcy5wbCJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.SHgNmRsMdUGmtrfiAGr_OqVM2p_xa7MLR85RnAde8LWeCwVzCr4rHh3V2mIsUiSj1wjJ_gNsst_CdzZC3Mzy4Z2H5_e7UxJ8ByOvPb2AvFrhxF-8zK93LnsO0h3Nc7g7GifJWvhkbdgWaZRpy36hh6xD031KcdkfkM1owcvsz7ECsKpBvji_i7BbrGkasR4oxSSVFya_2qpmcfok6CuyukTnNGmdCD3Imy4ca2TlJhLWsF1atD99VnAESxCjvrjqae3C43k4YU1nmwLMOzf6ONKY6DjW5uOrgGPJzVGO84JOZRQjedQ5L_DyBBj9vwisNwARPyCkC5_9ZMOgCBkOBw&uid=LOMEOfOOrIPlaOZ0RSN1WdOcw233