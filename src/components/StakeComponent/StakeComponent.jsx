import React, { useContext, useEffect, useState } from 'react';
import './StakeComponent.css';
import FooterDarkComponent from '../FooterComponent/FooterDarkComponent';
import HeaderComponent from '../HeaderComponent/HeaderComponent';
import StakeSolidListComponent from './StakeSolidListComponent/StakeSolidListComponent';
import LockRdlComponent from './LockRdlComponent/LockRdlComponent';
import LockRdlFtmComponent from './LockRdlFtmComponent/LockRdlFtmComponent';
import AppContext from '../AppContext';
import StakeContext from './StakeContext';
import { fetchLockedTokenData, getwFTMusdValue, rdlLockDataStore } from '../../stores/apistore';
import { rdlFtmLockedDataStore } from '../../stores/apistore';
import { totalDepositDataStore } from '../../stores/dataStore';


export default function StakeComponent() {
    const appContext = useContext(AppContext);
    const [lockedRdlTvl,setLockedRdlTvl] = useState(0)
    const [lockedRdlFtmTvl,setLockedRdlFtmTvl] = useState(0);
    const lockedRdlValue = rdlLockDataStore((state)=>state.rdlLock);
    const setRdlLockedData = rdlLockDataStore((state)=>state.setRdlLockData);
    const lockedRdlFtmValue = rdlFtmLockedDataStore((state)=>state.rdlFtmLock);
    const setRdlFtmLockData = rdlFtmLockedDataStore((state)=>state.setRdlFtmLockData);
    const totalDeposit = totalDepositDataStore((state)=>state.totalDeposit);
    const resetTotalDeposit = totalDepositDataStore((state)=>state.resetTotalDeposit);
    const [wFtmUsdValue,setwFtmUsdValue] = useState(0);

    useEffect(() => {
        (async() => {
            resetTotalDeposit();
            let lockedTokenData = await fetchLockedTokenData(`["0x79360aF49edd44F3000303ae212671ac94bB8ba7", "0x5ef8f0bd4F071B0199603a28ec9343F3651999c0"]`);
            console.log(lockedTokenData);
            if(lockedTokenData?.tvls?.length>0){
                if(lockedTokenData.tvls[0]?.token === "0x79360af49edd44f3000303ae212671ac94bb8ba7"){
                    setLockedRdlTvl(lockedTokenData.tvls[0]?.amount);
                    setLockedRdlFtmTvl(lockedTokenData.tvls[1]?.amount);
                }
                else{
                    setLockedRdlTvl(lockedTokenData.tvls[1]?.amount);
                    setLockedRdlFtmTvl(lockedTokenData.tvls[0]?.amount);
                }
            }
            let _wFtmUsdValue = await getwFTMusdValue();
            setwFtmUsdValue(_wFtmUsdValue);
        })();
        // eslint-disable-next-line
    }, []);

    useEffect(()=>{
        if(appContext?.currentAccount !== null){
            // Fetch lockedRdlValue & lockedRdlFtmValue
            setRdlLockedData(appContext?.currentAccount);
            setRdlFtmLockData(appContext?.currentAccount);
        }
    },[appContext?.currentAccount])

    let stakeContextData = {
        lockedRdlValue,
        lockedRdlFtmValue,
        lockedRdlTvl,
        lockedRdlFtmTvl,
        wFtmUsdValue
    }
    
    return (
        <div id="stakeDiv">
            <HeaderComponent/>
            <div id="stakeOverviewDiv" className='container mt-4'>
                <div className="row d-flex justify-content-center">
                    <div className="col-6">
                        <div className="overViewDataCard">
                            <h5 className='overViewCardMainHeader'>Total Deposits</h5>
                            <h3 className='overViewCardSubHeader'>{totalDeposit.length === 0 ?"$0.00": "$"+(totalDeposit.reduce((a, b) => a + b, 0)).toFixed(3)}</h3>
                        </div>
                    </div>
                </div>
            </div>
            <StakeContext.Provider value={stakeContextData} >
                <LockRdlComponent/>
                <LockRdlFtmComponent/>
                <StakeSolidListComponent/>
                <FooterDarkComponent/>
            </StakeContext.Provider>
        </div>
    )
}
