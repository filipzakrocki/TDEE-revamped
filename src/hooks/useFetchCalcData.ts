import { useCallback } from 'react';
import { useCalcStore } from '../stores/calc/calcStore';

const useFetchCalcData = (uid: string | undefined) => {
    const fetchData = useCalcStore(state => state.fetchData);

    const handleFetchData = useCallback(async () => {
        console.log('Fetching data...');
        if (!uid) return;
        try {
            await fetchData(uid);
        } catch (error) {
            console.error("Error fetching Calc Data: ", error);
        }
    }, [uid, fetchData]);

    return { handleFetchData };
};

export default useFetchCalcData;