import { useCallback } from 'react';
import { useCalc } from '../stores/calc/calcStore';

const useFetchCalcData = (uid: string | undefined) => {
    const { fetchData } = useCalc();

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