import React, { useEffect } from 'react';
import { fetchData } from '../features/calc/calcSlice';
import { signOut } from '../features/auth/authSlice';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../app/store';
import { User } from 'firebase/auth';
import { Button } from '@chakra-ui/react';

const Calculator: React.FC = () => {

    const user: User | null = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch<AppDispatch>();

    const logOut = () => {
        dispatch(signOut());
    };


    useEffect(() => {
        const fetchDataWithToken = async () => {
            try {
                const uid = user?.uid;
                fetchData(`/states/${uid}`);
            } catch (error) {
                console.error("Error fetching token:", error);
            }
        };

        fetchDataWithToken();
    }, [user]);


    return (
        <div>
            Calculator
            <Button colorScheme='red' variant='solid' mt={4} onClick={logOut}>
                Log Out
            </Button>
        </div>
    );
};

export default Calculator;

// https://tdee-fit.firebaseio.com/manualStates/LOMEOfOOrIPlaOZ0RSN1WdOcw233.json?auth=eyJhbGciOiJSUzI1NiIsImtpZCI6IjExYzhiMmRmNGM1NTlkMjhjOWRlNWQ0MTAxNDFiMzBkOWUyYmNlM2IiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vdGRlZS1maXQiLCJhdWQiOiJ0ZGVlLWZpdCIsImF1dGhfdGltZSI6MTcyNDQzNjQ3MiwidXNlcl9pZCI6IkxPTUVPZk9PcklQbGFPWjBSU04xV2RPY3cyMzMiLCJzdWIiOiJMT01FT2ZPT3JJUGxhT1owUlNOMVdkT2N3MjMzIiwiaWF0IjoxNzI0NDM2NDcyLCJleHAiOjE3MjQ0NDAwNzIsImVtYWlsIjoiZml0bmVzc0BmaXRuZXNzLnBsIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImZpdG5lc3NAZml0bmVzcy5wbCJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.SHgNmRsMdUGmtrfiAGr_OqVM2p_xa7MLR85RnAde8LWeCwVzCr4rHh3V2mIsUiSj1wjJ_gNsst_CdzZC3Mzy4Z2H5_e7UxJ8ByOvPb2AvFrhxF-8zK93LnsO0h3Nc7g7GifJWvhkbdgWaZRpy36hh6xD031KcdkfkM1owcvsz7ECsKpBvji_i7BbrGkasR4oxSSVFya_2qpmcfok6CuyukTnNGmdCD3Imy4ca2TlJhLWsF1atD99VnAESxCjvrjqae3C43k4YU1nmwLMOzf6ONKY6DjW5uOrgGPJzVGO84JOZRQjedQ5L_DyBBj9vwisNwARPyCkC5_9ZMOgCBkOBw&uid=LOMEOfOOrIPlaOZ0RSN1WdOcw233