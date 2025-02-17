import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { fetchDataWithStates } from '../stores/calc/calcSlice';
import { AppDispatch } from '../app/store';
import { useCustomToast } from '../utils/useCustomToast';

const useFetchCalcData = (uid: string | undefined) => {
    const dispatch = useDispatch<AppDispatch>();
    const showToast = useCustomToast();

    const handleFetchData = useCallback(async () => {
        if (!uid) return;
        try {
            const data = await dispatch(fetchDataWithStates(uid)).unwrap();
            if (data) {
                showToast({ description: 'Data Fetched!', status: 'success' });
            }
        } catch (error) {
            console.error("Error fetching Calc Data: ", error);
            showToast({ description: 'Error fetching Calc Data', status: 'error' });
        }
    }, [ uid, dispatch, showToast ]);

    return { handleFetchData };
};

export default useFetchCalcData;