import React,{useState,useContext, useEffect} from 'react';
import './LockRdlFtmComponent.css';
import RadialLogo from '../../../assets/images/smallLogo.png';
import AppContext from '../../AppContext';
import StakeContext from '../StakeContext';
import configSC from '../../../artifacts/smartcontractConfig.json'
import { tokenAbi } from '../../../artifacts/tokens';
import lpManagerAbi from '../../../artifacts/LPManager.json';
import rdlManagerAbi from '../../../artifacts/RDLManager.json';
import BigNumber from 'bignumber.js';
import lpPoolContractAbi from '../../../artifacts/LpPool.json';
import { rdlFtmLockedDataStore } from '../../../stores/apistore';
import { totalDepositDataStore } from '../../../stores/dataStore';
import toast, { Toaster } from 'react-hot-toast';

export default function LockRdlFtmComponent() {
    const appContext = useContext(AppContext);
    const stakeContext = useContext(StakeContext);
    const [currentTab,setCurrentTab] = useState('stake');
    const [lockRdlFtmValue,setLockRdlFtmValue] = useState('');
    const [unlockRdlFtmValue,setUnlockRdlFtmValue] = useState('');
    const [rdlFtmContract,setRdlFtmContract] = useState(null);
    const [lpManagerContract,setLpManagerContract] = useState(null);
    const [rdlManagerContract,setRdlManagerContract] = useState(null);
    const [rdlFtmAvailbale,setRdlFtmAvailable] = useState(0);
    const [unlockableRdlFtm,setUnlockableRdlFtm] = useState(0);
    const [allowance,setAllowance] = useState(0);
    const refreshRdlFtmLockData = rdlFtmLockedDataStore((state)=>state.refreshRdlFtmLockData);
    const setTotalDeposit = totalDepositDataStore((state)=>state.setTotalDeposit);
    const [tvlUsdValue,setTvlUsdValue] = useState(0);


    let getTvlUsd = async (poolAddress,poolAmount,wFTMUsdPrice) => {
        try {
            let amount = (BigNumber(poolAmount)/BigNumber(10).pow(18)).toFixed(5);
            if(appContext?.web3 !== null){
                let lpPoolContract = new appContext.web3.eth.Contract(lpPoolContractAbi,poolAddress);
                let totalSupply = await lpPoolContract.methods.totalSupply().call();
                let tokenReserve = await lpPoolContract.methods.getReserves().call();
                let _reserve0 = tokenReserve._reserve0;
                let convertedtotalSupply = (BigNumber(totalSupply)/BigNumber(10).pow(18)).toFixed(5);
                let convertedTokenReserve0 = (BigNumber(_reserve0)/BigNumber(10).pow(18)).toFixed(5);
                let value = parseFloat(amount)*(2*parseFloat(convertedTokenReserve0)*parseFloat(wFTMUsdPrice))/parseFloat(convertedtotalSupply);
                return value;
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if(appContext.web3 !== null){
            const localRdlFtmContract = new appContext.web3.eth.Contract(tokenAbi,configSC.RDL_FTM_POOL);
            setRdlFtmContract(localRdlFtmContract);
            if(appContext?.currentAccount!==null){
                localRdlFtmContract.methods.allowance(appContext.currentAccount,configSC.LPManagerAddress).call().then((_value) => {
                    console.log(BigNumber(_value).div(BigNumber(10).pow(18)).toFixed(18));
                    setAllowance(BigNumber(_value).div(BigNumber(10).pow(18)).toFixed(18));
                });
            }


            const localLpManagerContract = new appContext.web3.eth.Contract(lpManagerAbi,configSC.LPManagerAddress);
            setLpManagerContract(localLpManagerContract);
            const localRdlManagerContract = new appContext.web3.eth.Contract(rdlManagerAbi,configSC.RDLManagerAddress);
            setRdlManagerContract(localRdlManagerContract);
            if(appContext?.currentAccount !== null){
                localRdlFtmContract.methods.balanceOf(appContext.currentAccount).call().then((allowance) => {
                    let _balance = (BigNumber(allowance).div(BigNumber(10).pow(18)))
                    setRdlFtmAvailable(_balance);
                });
                localLpManagerContract.methods.unlockableBalance(appContext.currentAccount).call().then((value) => {
                    let _balance = (BigNumber(value).div(BigNumber(10).pow(18)));
                    setUnlockableRdlFtm(_balance);
                });
            }

        }
    }, [appContext?.web3,appContext?.currentAccount]);


    useEffect(()=>{
        (async()=>{
            console.log(stakeContext?.lockedRdlFtmTvl);
            let _value = await getTvlUsd('0x5ef8f0bd4F071B0199603a28ec9343F3651999c0',stakeContext?.lockedRdlFtmTvl,stakeContext?.wFtmUsdValue);
            setTvlUsdValue(_value);
            console.log(_value);
        })();
    },[stakeContext?.lockedRdlFtmTvl,stakeContext?.wFtmUsdValue]);

    useEffect(()=>{
        (async()=>{
            let _value = await getTvlUsd('0x5ef8f0bd4F071B0199603a28ec9343F3651999c0',stakeContext?.lockedRdlFtmValue,stakeContext?.wFtmUsdValue);
            if(_value>0){
                setTotalDeposit(_value);
            }
        })();
    },[stakeContext?.lockedRdlFtmValue,stakeContext?.wFtmUsdValue]);




    const approveRdlFtmLock = () => {
        let _value = BigNumber(lockRdlFtmValue).times(BigNumber(10).pow(18)).toFixed(0);
        const tx = rdlFtmContract.methods.approve(configSC.LPManagerAddress,_value).send({
            from: appContext.currentAccount
        });

        tx.on("transactionHash", () => {
            toast.loading("Transaction in progress",{position:'top-center'})
        });

        tx.on("confirmation", (confirmationNumber, receipt) => {
            if(confirmationNumber === 2){
                toast.remove()
                setAllowance(parseFloat((BigNumber(_value)/BigNumber(10).pow(18)).toFixed(18))+parseFloat(allowance));
                toast.success("Transaction successful",{position:'top-center'})
            }
        });

        tx.on("error", (error)=>{
            toast.remove();
            toast.error("Transaction failed",{position:'top-center'});
        });
    }

    const lockRdlFtm = () => {
        let _value = BigNumber(lockRdlFtmValue).times(BigNumber(10).pow(18)).toFixed(0);
        console.log(_value);
        const tx = lpManagerContract.methods.lock(_value).send({
            from: appContext.currentAccount
        });

        tx.on("transactionHash", (_txhash) => {
            console.log(_txhash);
            toast.loading("Transaction in progress",{position:'top-center'})
        });


        tx.on("confirmation", (confirmationNumber, receipt) => {
            if(confirmationNumber === 10){
                toast.remove()
                toast.success("Transaction successful",{position:'top-center'})
                setLockRdlFtmValue('');
                refreshRdlFtmLockData(appContext?.currentAccount);
                rdlFtmContract.methods.balanceOf(appContext?.currentAccount).call().then((allowance) => {
                    let _balance = (BigNumber(allowance).div(BigNumber(10).pow(18)))
                    console.log(_balance);
                    setRdlFtmAvailable(_balance);
                });
                rdlFtmContract.methods.allowance(appContext.currentAccount,configSC.LPManagerAddress).call().then((_value) => {
                    console.log(_value);
                    setAllowance(BigNumber(_value).div(BigNumber(10).pow(18)).toFixed(18));
                });
            }

        });

        tx.on("error", (error)=>{
            toast.remove();
            toast.error("Transaction failed",{position:'top-center'});
        });
    }

    const unlockRdlFtm = () => {
        let _value = BigNumber(unlockRdlFtmValue).times(BigNumber(10).pow(18)).toFixed(0);
        const tx = rdlManagerContract.methods.unlock(_value).send({
            from: appContext.currentAccount
        });

        tx.on("transactionHash", () => {
            toast.loading("Transaction in progress",{position:'top-center'})
        });

        tx.on("confirmation", (confirmationNumber, receipt) => {
            if(confirmationNumber === 10){
                toast.remove();
                toast.success("Transaction successful",{position:'top-center'})
                refreshRdlFtmLockData(appContext?.currentAccount);
            }
        });

        tx.on("error", (error)=>{
            toast.remove();
            toast.error("Transaction failed",{position:'top-center'});
        });
    }

    const setMaxRdlFtmLock = () => {
        setLockRdlFtmValue(rdlFtmAvailbale);
    }

    const setMaxRdlFtmUnlock = () => {
        setUnlockRdlFtmValue(unlockableRdlFtm);
    }


    return (
        <div id="converSolidDiv" className='container mt-5'>
        <h5 id="converSolidHeading">Lock RDL/wFTM LP</h5>
        <div>
        <Toaster />
            <div className="row converSolidCardHeader">
                <div className="col convertLogoHolder">
                    <div className="row">
                        <div className="col-2">
                            <img src={RadialLogo} alt="RadialLogo" style={{width:'30px',height:'30px',borderRadius:'50px'}} />
                        </div>
                        <div className="col-10">
                            <div id="logoName">Lock RDL/wFTM</div>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <h6 className='convertSolidCardMainHeader'>My locked RDL/wFTM</h6>
                    <h5 className='convertSolidCardSubHeader'>{stakeContext?.lockedRdlFtmValue === null || stakeContext?.lockedRdlFtmValue === undefined  ?"0" : (BigNumber(stakeContext?.lockedRdlFtmValue)/BigNumber(10).pow(18)).toPrecision(2)}</h5>
                </div>
                <div className="col">
                    <h6 className='convertSolidCardMainHeader'>TVL</h6>
                    <h5 className='convertSolidCardSubHeader'>{tvlUsdValue === 0 || isNaN(tvlUsdValue) ? "$0.00" : "$"+tvlUsdValue?.toFixed(5)}</h5>
                </div>
                <div className="col"></div>
                <div className="col"></div>
            </div>
            <div className="converSolidCardBody">
                <div className="row converSolidCardNav g-0">
                    <div className="col-1">
                        <p className={currentTab === 'stake' ? 'converSolidCardNavLinkActive' : 'converSolidCardNavLink '} onClick={()=>{
                            setCurrentTab('stake');
                        }}>LOCK</p>
                    </div>
                    <div className="col-1">
                        <p className={currentTab === 'unstake' ? 'converSolidCardNavLinkActive' : 'converSolidCardNavLink '} onClick={()=>{
                            setCurrentTab('unstake')
                        }}>UNLOCK</p>
                    </div>
                </div>
                {
                    {
                        'stake': 
                        <div className="stakeRdlCard">
                            <div className="row">
                                <p className="convertMainText">
                                    Locking RDL/wFTM LP tokens gives users voting rights for pool voting and whitelisting voting. Users also earn boosted SOLID for locking RDL/wFTM LP tokens. Once locked, the RDL/wFTM LP tokens cannot be unlocked for 16 weeks.
                                </p>
                                <p id="convertSubText">
                                    Note : Locking RDL/wFTM LP tokens gives voting power from the next epoch which begins every week on Thursday at 12am UTC.   
                                </p>
                            </div>
                            <div className="row mt-2">
                                <div className="col-6">
                                    <h6>Amount of RDL/wFTM to stake</h6>
                                </div>
                                <div className="col-2" style={{textAlign:'center'}}>
                                    <h6>Step 1</h6>
                                </div>
                                <div className="col-2" style={{textAlign:'center'}}>
                                    <h6>Step 2</h6>
                                </div>
                            </div>
                            <div className="row mt-1">
                                <div className="col-6">
                                    <input value={lockRdlFtmValue} onChange={e => setLockRdlFtmValue(e.target.value)} type="number" placeholder='0.00'  className='inputFieldBox'/>
                                </div>
                                {
                                    appContext?.currentAccount !== null ?
                                    parseFloat(lockRdlFtmValue) > allowance && parseFloat(lockRdlFtmValue) !== 0?
                                    <div className="col-2">
                                        <button onClick={() => approveRdlFtmLock()} className='convertButton'>
                                            Approve
                                        </button>
                                    </div>:
                                    <div className="col-2">
                                        <button className='disabledConvertButton'>
                                            Approve
                                        </button>
                                    </div>
                                    :
                                    <div className="col-2">
                                        <button className='disabledConvertButton'>
                                            Approve
                                        </button>
                                    </div>
                                }
                                {
                                    appContext?.currentAccount !== null ?
                                    parseFloat(lockRdlFtmValue) <= allowance && parseFloat(lockRdlFtmValue) !== 0?
                                    <div className="col-2">
                                        <button onClick={() => lockRdlFtm()} className='convertButton'>
                                            Lock
                                        </button>
                                    </div>:
                                    <div className="col-2">
                                        <button className='disabledConvertButton'>
                                            Lock
                                        </button>
                                    </div>
                                    :
                                    <div className="col-2">
                                        <button className='disabledConvertButton'>
                                            Lock
                                        </button>
                                    </div>
                                }
                            </div>
                            {
                                appContext?.currentAccount !== null ?
                                <div className='mt-2'>
                                    <button onClick={() => setMaxRdlFtmLock()} className='setToMax'>MAX</button> <span className='availableSupply'> | Available : {Math.trunc(rdlFtmAvailbale*10000)/10000} </span>
                                </div> :
                                <div className='mt-2'>
                                    <button className='disabledSetToMax'>MAX</button> <span className='availableSupply'> | Available : 0</span>
                                </div>
                            }
                        </div>,
                        'unstake': 
                        <div className="unstakeRdlCardMainDiv">
                            <div className="row">
                                <p className="convertMainText">
                                Locked RDL/wFTM LP tokens that has completed the 16 week lock period is eligible for unlocking. The amount mentioned under available is currently eligible for unlocking.
                                </p>
                            </div>
                            <div className="d-flex toggleHolderDiv justify-content-start mt-2">
                                <div>
                                    Amount of RDL/wFTM to unlock
                                </div>
                            </div>
                            <div className="row mt-2">
                                <div className="col-7">
                                    <input value={unlockRdlFtmValue} onChange={e => setUnlockRdlFtmValue(e.target.value)} type="text" placeholder='0.00'  className='inputFieldBox'/>
                                </div>
                                {
                                    appContext?.currentAccount !== null ? 
                                    unlockRdlFtmValue.length !== 0?
                                    <div className="col-2">
                                        <button onClick={() => unlockRdlFtm() } className='convertButton'>
                                            Unlock RDL/wFTM
                                        </button>
                                    </div>:
                                    <div className="col-2">
                                        <button className='disabledConvertButton'>
                                            Unlock RDL/wFTM
                                        </button>
                                    </div>
                                    : 
                                    <div className="col-2">
                                        <button className='disabledConvertButton'>
                                            Unlock RDL/wFTM
                                        </button>
                                    </div>
                                }
                            </div>
                            {
                                appContext?.currentAccount !== null ?
                                <div className='mt-2'>
                                    <button onClick={()=> setMaxRdlFtmUnlock()} className='setToMax'>MAX</button> <span className='availableSupply'> | Available : {Math.trunc(unlockableRdlFtm*10000)/10000} </span>
                                </div> :
                                <div className='mt-2'>
                                    <button className='disabledSetToMax'>MAX</button> <span className='availableSupply'> | Available : 0</span>
                                </div>
                            }
                        </div>
                    }[currentTab]
                }
            </div>
        </div>
    </div>
    )
}
