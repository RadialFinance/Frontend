import React,{useState,useContext, useEffect} from 'react';
import './LockRdlComponent.css';
import RadialLogo from '../../../assets/images/smallLogo.png';
import AppContext from '../../AppContext';
import StakeContext from '../StakeContext';
import configSC from '../../../artifacts/smartcontractConfig.json';
import { tokenAbi } from '../../../artifacts/tokens';
import rdlManagerAbi from '../../../artifacts/RDLManager.json';
import BigNumber from "bignumber.js";
import { getTokenPrice, rdlLockDataStore } from '../../../stores/apistore';
import { totalDepositDataStore } from '../../../stores/dataStore';
import toast, { Toaster } from 'react-hot-toast';


export default function LockRdlComponent() {
    const appContext = useContext(AppContext);
    const stakeContext = useContext(StakeContext);
    const [currentTab,setCurrentTab] = useState('convert');
    const [solidCardExpanded,setsolidCardExpanded] = useState('convertCardMainDiv');
    const [rdlLockValue,setRdlLockValue] = useState('');
    const [unlockValue,setUnlockValue] = useState('');
    const [rdlContract,setRdlContract] = useState(null);
    const [rdlManagerContract,setRdlManagerContract] = useState(null);
    const [rdlAvailable,setRdlAvailable] = useState(0);
    const [unlockableRdl,setUnlockableRdl] = useState(0);
    const [rdlTvlUsdValue,setRdlTvlUsdValue] = useState(null);
    const [allowance,setAllowance] = useState(0);
    const refreshRdlLockData = rdlLockDataStore((state)=>state.refreshRdlLockData);
    const setTotalDeposit = totalDepositDataStore((state)=>state.setTotalDeposit);
    const resetTotalDeposit = totalDepositDataStore((state)=>state.resetTotalDeposit);
    const [rdlFtmValue,setRdlFtmValue] = useState(0);
    const [rdlUsdValue,setRdlUsdValue] = useState(0);

    useEffect(()=>{
        (async()=>{
            let tokenData = await getTokenPrice('0x79360aF49edd44F3000303ae212671ac94bB8ba7');
            if(tokenData?.pairs.length>0){
                let pairs = tokenData.pairs[0];
                let token_value = 0;
                if(pairs.token0.id === "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83"){
                    token_value = pairs.token0Price;
                }
                else{
                    token_value = pairs.token1Price;
                }
                setRdlFtmValue(token_value);
            }
        })();
    },[]);

    useEffect(()=>{
        let _rdlUsdValue = rdlFtmValue*stakeContext?.wFtmUsdValue;
        setRdlUsdValue(_rdlUsdValue);
    },[rdlFtmValue,stakeContext?.wFtmUsdValue]);


    useEffect(() => {
        if(appContext?.web3 !== null){

            const localRdlContract = new appContext.web3.eth.Contract(tokenAbi,configSC.RDL);
            setRdlContract(localRdlContract);
            if(appContext?.currentAccount!== null){
                localRdlContract.methods.allowance(appContext.currentAccount,configSC.RDLManagerAddress).call().then((_value) => {
                    setAllowance(BigNumber(_value).div(BigNumber(10).pow(18)).toFixed(18));
                });
            }


            const localRdlManagerContract = new appContext.web3.eth.Contract(rdlManagerAbi,configSC.RDLManagerAddress);
            setRdlManagerContract(localRdlManagerContract);

            if(appContext?.currentAccount !== null){
                localRdlContract.methods.balanceOf(appContext.currentAccount).call().then((allowance) => {
                    let _balance = (BigNumber(allowance).div(BigNumber(10).pow(18)))
                    console.log(_balance);
                    setRdlAvailable(_balance);
                });
                localRdlManagerContract.methods.unlockableBalance(appContext.currentAccount).call().then((value) => {
                    let _balance = (BigNumber(value).div(BigNumber(10).pow(18)))
                    setUnlockableRdl(_balance);
                });
            }

        }
    }, [appContext?.web3,appContext?.currentAccount])

    useEffect(()=>{
        (async()=>{
            console.log((BigNumber(stakeContext?.lockedRdlTvl)/BigNumber(10).pow(18)).toFixed(3));
            console.log(rdlUsdValue);
            let _value = ((BigNumber(stakeContext?.lockedRdlTvl)/BigNumber(10).pow(18)).toFixed(3)) * rdlUsdValue;
            setRdlTvlUsdValue(_value);

        })();
    },[stakeContext?.lockedRdlTvl,rdlUsdValue])


    useEffect(()=>{
        if(appContext?.currentAccount!==null){
            let _value = ((BigNumber(stakeContext?.lockedRdlValue)/BigNumber(10).pow(18)).toFixed(3)) * rdlUsdValue;
            if(_value>0){
                setTotalDeposit(_value);
            }
        }
    },[stakeContext?.lockedRdlValue,rdlUsdValue,appContext?.currentAccount]);
    

    const approveLock = () =>{
        let _value = BigNumber(rdlLockValue).times(BigNumber(10).pow(18)).toFixed(0);
        console.log(_value);
        const tx = rdlContract.methods.approve(configSC.RDLManagerAddress,_value).send({
            from: appContext.currentAccount
        });

        tx.on("transactionHash", () => {
            toast.loading("Transaction in progress",{position:'top-center'})
        });

        tx.on("confirmation", (confirmationNumber, receipt) => {
            if(confirmationNumber === 2){
                toast.remove();
                setAllowance(parseFloat((BigNumber(_value)/BigNumber(10).pow(18)).toFixed(18))+parseFloat(allowance));
                toast.success("Transaction successful",{position:'top-center'})
            }
        });

        tx.on("error", (error)=>{
            toast.remove();
            toast.error("Transaction failed",{position:'top-center'});
        });
    }

    const lock = () => {
        let _value = BigNumber(rdlLockValue).times(BigNumber(10).pow(18)).toFixed(0);
        const tx = rdlManagerContract.methods.lock(_value).send({
            from: appContext.currentAccount
        });

        tx.on("transactionHash", () => {
            toast.loading("Transaction in progress",{position:'top-center'})
        });

        tx.on("confirmation", (confirmationNumber, receipt) => {
            if(confirmationNumber === 10){
                toast.remove();
                toast.success("Transaction successful",{position:'top-center'})
                setRdlLockValue('');
                resetTotalDeposit();
                refreshRdlLockData(appContext?.currentAccount);
                rdlContract.methods.balanceOf(appContext?.currentAccount).call().then((allowance) => {
                    let _balance = (BigNumber(allowance).div(BigNumber(10).pow(18)))
                    console.log(_balance);
                    setRdlAvailable(_balance);
                });
                rdlContract.methods.allowance(appContext.currentAccount,configSC.RDLManagerAddress).call().then((_value) => {
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

    const unlockRdl = () =>{
        let _value = BigNumber(unlockValue).times(BigNumber(10).pow(18)).toFixed(0);
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
                refreshRdlLockData(appContext?.currentAccount);
            }
        });

        tx.on("error", (error)=>{
            toast.remove();
            toast.error("Transaction failed",{position:'top-center'});
        });
    }

    const checkForApproved = () => {

    }

    const setMaxRdl = () => {
        setRdlLockValue(rdlAvailable);
    }

    const setMaxUnlock = () => {
        setUnlockValue(unlockableRdl);
    }


    return (
        <div id="converSolidDiv" className='container'>
        <h5 id="converSolidHeading">Lock RDL</h5>
        <div>
        <Toaster />
            <div className="row converSolidCardHeader">
                <div className="col convertLogoHolder">
                    <div className="row">
                        <div className="col-2">
                            <img src={RadialLogo} alt="RadialLogo" style={{width:'30px',height:'30px',borderRadius:'50px'}} />
                        </div>
                        <div className="col-4">
                            <div id="logoName">RDL</div>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <h6 className='convertSolidCardMainHeader'>My locked RDL</h6>
                    <h5 className='convertSolidCardSubHeader'>{stakeContext?.lockedRdlValue === null || stakeContext?.lockedRdlValue === undefined ? "0" : (BigNumber(stakeContext?.lockedRdlValue)/BigNumber(10).pow(18)).toPrecision(2)} RDL</h5>
                </div>
                <div className="col">
                    <h6 className='convertSolidCardMainHeader'>TVL</h6>
                    <h5 className='convertSolidCardSubHeader'>{rdlTvlUsdValue === null || isNaN(rdlTvlUsdValue)  ? "$0.00" : "$"+rdlTvlUsdValue.toFixed(3)}</h5>
                </div>
                <div className="col"></div>
                <div className="col"></div>

            </div>
            <div className="converSolidCardBody">
                <div className="row converSolidCardNav g-0">
                    <div className="col-1">
                        <p className={currentTab === 'convert' ? 'converSolidCardNavLinkActive' : 'converSolidCardNavLink '} onClick={()=>{
                            setCurrentTab('convert');
                        }}>LOCK</p>
                    </div>
                    <div className="col-1">
                        <p className={currentTab === 'unstake' ? 'converSolidCardNavLinkActive' : 'converSolidCardNavLink '} onClick={()=>{
                            setCurrentTab('unstake')
                            setsolidCardExpanded('convertCardMainDiv');
                        }}>UNLOCK</p>
                    </div>
                </div>
                {
                    {
                        'convert': 
                        <div className={solidCardExpanded}>
                            <div className="row">
                                    <p className="convertMainText">
                                        Locking RDL gives users voting rights for pool voting and whitelisting voting. Once locked, RDL cannot be unlocked for 16 weeks.
                                    </p>

                                        
                                    <p id="convertSubText">
                                    Note: Locking RDL gives voting power from the next epoch which begins every week on Thursday at 12am UTC.   
                                    </p>

                            </div>
                            <div className="d-flex toggleHolderDiv justify-content-end mt-2">
                                
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <h6>Amount of RDL to lock</h6>
                                </div>
                                <div className="col-2" style={{textAlign:'center'}}>
                                    <h6>Step 1</h6>
                                </div>
                                <div className="col-2" style={{textAlign:'center'}}>
                                    <h6>Step 2</h6>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <input value={rdlLockValue} required onChange={e=> {setRdlLockValue(e.target.value);checkForApproved()}} type="number" placeholder='0.00'  className='inputFieldBox'/>
                                </div>
                                <div className="col-2">
                                    {
                                        appContext?.currentAccount !== null ?  
                                        parseFloat(rdlLockValue) > allowance && parseFloat(rdlLockValue) !== 0?                                   
                                        <button onClick={()=> approveLock()} className='convertButton'>
                                            Approve
                                        </button>:
                                        <button disabled className='disabledConvertButton'>
                                            Approve
                                        </button>
                                        :
                                        <button disabled className='disabledConvertButton'>
                                            Approve
                                        </button>
                                    }
                                </div>
                                <div className="col-2">
                                    {
                                        appContext?.currentAccount !== null ?
                                        parseFloat(rdlLockValue) <= allowance && parseFloat(rdlLockValue) !== 0?
                                        <button onClick={() => lock()} className='convertButton'>
                                            Lock
                                        </button>:
                                        <button disabled className='disabledConvertButton'>
                                            Lock
                                        </button>
                                        :
                                        <button disabled className='disabledConvertButton'>
                                            Lock
                                        </button>
                                    }
                                </div>
                            </div>
                            <div className='mt-1'>
                                {
                                    appContext?.currentAccount !== null ?
                                    <div>
                                        <button onClick={()=> setMaxRdl()} className='setToMax'>MAX</button> <span className='availableSupply'> | Available : {Math.trunc(rdlAvailable*10000)/10000}</span>
                                    </div>:
                                    <div>
                                        <button disabled className='disabledSetToMax'>MAX</button> <span className='availableSupply'> | Available : 0</span>
                                    </div> 
                                }
                            </div>
                        </div>,
                        'unstake': 
                        <div className="unStakeCardMainDiv">
                            <div className="row">
                                <p className="convertMainText">
                                    RDL that has crossed the 16 week lock period is eligible for unlocking. The amount mentioned under available is currently eligible for unlocking. For the current testnet, RDL will be locked for 1 week.
                                </p>
                            </div>
                            <div className="d-flex toggleHolderDiv justify-content-start mt-2">
                                <div>
                                    Amount of RDL to unlock
                                </div>
                            </div>
                            <div className="row mt-2">
                                <div className="col-7">
                                    <input value={unlockValue} onChange={e=> setUnlockValue(e.target.value)} type="text" placeholder='0.00'  className='inputFieldBox'/>
                                </div>
                                <div className="col-2">
                                    {
                                        appContext?.currentAccount !== null ?
                                        unlockValue.length !== 0?                                    
                                        <button onClick={()=>unlockRdl()} className='convertButton'>
                                            Unlock RDL
                                        </button>:
                                        <button disabled className='disabledConvertButton'>
                                            Unlock RDL
                                        </button>
                                        :
                                        <button disabled className='disabledConvertButton'>
                                            Unlock RDL
                                        </button>
                                    }
                                </div>
                            </div>
                            <div className='mt-1'>
                                {
                                    appContext?.currentAccount !== null ?
                                    <div>
                                        <button onClick={()=> setMaxUnlock()} className='setToMax'>MAX</button> <span className='availableSupply'> | Available : {Math.trunc(unlockableRdl*10000)/10000}</span>
                                    </div>:
                                    <div>
                                        <button disabled className='disabledSetToMax'>MAX</button> <span className='availableSupply'> | Available : 0</span>
                                    </div> 
                                }
                            </div>
                        </div>
                    }[currentTab]
                }
            </div>
        </div>
    </div>
    )
}
