import React,{useState,useContext, useEffect} from 'react';
import './StakeSolidCardComponent.css';
import AppContext from '../../../AppContext';
import { tokenAbi } from '../../../../artifacts/tokens';
import configSC from '../../../../artifacts/smartcontractConfig.json';
import lpManagerAbi from '../../../../artifacts/LPManager.json';
import BigNumber from 'bignumber.js';
import toast, { Toaster } from 'react-hot-toast';


export default function StakeSolidCardComponent(props) {
    const appContext = useContext(AppContext);
    const [currentTab,setCurrentTab] = useState('deposit');
    const [solidCardExpanded,setsolidCardExpanded] = useState('convertCardMainDiv');
    const [withdrawCardExpanded,setWithdrawCardExpanded] = useState('withdrawCardMainDiv');
    const [stakeValue,setStakeValue] = useState('')
    const [unstakeValue,setUnStakeValue] = useState('');
    const [tokenContract,setTokenContract] = useState('');
    const [lpManagerContract,setLpManagerContract] = useState('');
    const [availableToken,setAvailableToken] = useState(0);
    const [allowance,setAllowance] = useState(0);
    const [availableUnstakeToken,setAvailableUnstakeToken] = useState(0);

    useEffect(() => {
        if(appContext.web3 !== null){
            const localLpManagerContract = new appContext.web3.eth.Contract(lpManagerAbi,configSC.LPManagerAddress);
            setLpManagerContract(localLpManagerContract);
        }
    }, [appContext?.web3,appContext?.currentAccount]);


    useEffect(()=>{
        if(appContext?.web3 !== null){
            const localTokenContract = new appContext.web3.eth.Contract(tokenAbi,props?.poolData.token);
            setTokenContract(localTokenContract);
            if(appContext?.currentAccount!==null){
                localTokenContract.methods.allowance(appContext.currentAccount,configSC.LPManagerAddress).call().then((_value) => {
                    console.log(_value);
                    setAllowance(BigNumber(_value).div(BigNumber(10).pow(18)));
                });
            }

            setAvailableUnstakeToken((BigNumber(props?.poolData.amount)/BigNumber(10).pow(18)))
            if(appContext?.currentAccount !== null){
                localTokenContract.methods.balanceOf(appContext.currentAccount).call().then((allowance) => {
                    console.log(allowance);
                    setAvailableToken((BigNumber(allowance).div(BigNumber(10).pow(18))));
                });
            }
        }
    },[props?.poolData,appContext?.currentAccount,appContext?.web3]);


    const approveToken = () => {
        let _value = BigNumber(stakeValue).times(BigNumber(10).pow(18)).toFixed(0);
        const tx = tokenContract.methods.approve(configSC.LPManagerAddress,_value).send({
            from: appContext.currentAccount
        });

        tx.on("transactionHash", () => {
            toast.loading("Transaction in progress",{position:'top-center'})
        });

        tx.on("confirmation", (confirmationNumber, receipt) => {
            if(confirmationNumber === 2){
                setAllowance(parseFloat((BigNumber(_value).div(BigNumber(10).pow(18))).toFixed(18))+parseFloat(allowance));
                toast.remove();
                toast.success("Transaction successful",{position:'top-center'})
            }
        });

        tx.on("error", (error)=>{
            toast.remove();
            toast.error("Transaction failed",{position:'top-center'});
        });
    }

    const stakeToken = () => {
        let _value = BigNumber(stakeValue).times(BigNumber(10).pow(18)).toFixed(0);
        const tx = lpManagerContract.methods.stake(props?.poolData.token,_value).send({
            from: appContext.currentAccount
        });

        tx.on("transactionHash", () => {
            toast.loading("Transaction in progress",{position:'top-center'})
        });

        tx.on("confirmation", (confirmationNumber, receipt) => {
            if(confirmationNumber === 10){
                toast.remove();
                toast.success("Transaction successful",{position:'top-center'})
                setStakeValue('');
                tokenContract.methods.balanceOf(appContext.currentAccount).call().then((allowance) => {
                    setAvailableToken((BigNumber(allowance).div(BigNumber(10).pow(18))));
                });
                tokenContract.methods.allowance(appContext.currentAccount,configSC.LPManagerAddress).call().then((_value) => {
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

    const maxStake = () => {
        setStakeValue(availableToken);
    }

    const unstakeToken = () => {
        let _value = BigNumber(unstakeValue).times(BigNumber(10).pow(18)).toFixed(0);
        console.log(props?.poolData.token,_value);
        const tx = lpManagerContract.methods.unStake(props?.poolData.token,_value).send({
            from: appContext.currentAccount
        });

        tx.on("transactionHash", () => {
            toast.loading("Transaction in progress",{position:'top-center'})
        });

        tx.on("confirmation", (confirmationNumber, receipt) => {
            if(confirmationNumber === 10){
                toast.remove();
                toast.success("Transaction successful",{position:'top-center'})
            }
        });

        tx.on("error", (error)=>{
            toast.remove();
            toast.error("Transaction failed",{position:'top-center'});
        });
    }


    const maxUnstakeToken = () => {
        setUnStakeValue(availableUnstakeToken);
    }


    return (
        <div id="stakeSolidCardDiv">
        <div >
        <Toaster />
            <div className="converSolidCardBody">
                <div className="row converSolidCardNav g-0">
                    <div className="col-1">
                        <p className={currentTab === 'deposit' ? 'converSolidCardNavLinkActive' : 'converSolidCardNavLink '} onClick={()=>{
                            setCurrentTab('deposit');
                        }}>STAKE</p>
                    </div>
                    <div className="col-1">
                        <p className={currentTab === 'withdraw' ? 'converSolidCardNavLinkActive' : 'converSolidCardNavLink '} onClick={()=>{
                            setCurrentTab('withdraw')
                            setsolidCardExpanded('convertCardMainDiv');
                            setWithdrawCardExpanded('withdrawCardMainDiv');
                        }}>UNSTAKE</p>
                    </div>
                </div>
                {
                    {
                        'deposit': 
                        <div className={solidCardExpanded}>
                            <div className="row">
                                <div className="col-10">
                                    <p className="convertMainText">
                                        Users who stake Solidly LP tokens earn boosted rewards in the form of SOLID. Staked LP tokens do not have a lock-in period.
                                    </p>
                                </div>

                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <h6>Amount of {props?.poolData.poolname} tokens to stake</h6>
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
                                    <input value={stakeValue} onChange={e=>setStakeValue(e.target.value)} type="number" placeholder='0.00'  className='inputFieldBox'/>
                                </div>
                                {
                                    appContext?.currentAccount !== null ?
                                    parseFloat(stakeValue) > allowance && parseFloat(stakeValue) !== 0?
                                        <div className="col-2">
                                            <button onClick={()=> approveToken()} className='convertButton'>
                                                Approve
                                            </button>
                                        </div>:
                                        <div className="col-2">
                                            <button disabled className='disabledConvertButton'>
                                                Approve
                                            </button>
                                        </div>
                                        :
                                        <div className="col-2">
                                            <button disabled className='disabledConvertButton'>
                                                Approve
                                            </button>
                                        </div>
                                }
                                {
                                    appContext?.currentAccount !== null ?
                                    parseFloat(stakeValue) <= allowance && parseFloat(stakeValue) !== 0?
                                    <div className="col-2">
                                        <button onClick={()=> stakeToken()} className='convertButton'>
                                            Stake
                                        </button>
                                    </div>:
                                    <div className="col-2">
                                        <button disabled className='disabledConvertButton'>
                                            Stake
                                        </button>
                                    </div>
                                    :
                                    <div className="col-2">
                                        <button disabled className='disabledConvertButton'>
                                            Stake
                                        </button>
                                    </div>
                                }

                            </div>
                            {
                                appContext?.currentAccount !== null ?
                                <div className='mt-1'>
                                    <button onClick={()=>maxStake()} className='setToMax'>MAX</button> <span className='availableSupply'> | Available : {Math.trunc(availableToken*10000)/10000}</span>
                                </div> :
                                <div className='mt-1'>
                                    <button disabled className='disabledSetToMax'>MAX</button> <span className='availableSupply'> | Available : 0</span>
                                </div>
                            }

                        </div>,
                        'withdraw': 
                        <div className={withdrawCardExpanded}>
                            <p className="convertMainText">
                                Users can unstake LP tokens immediately. Visit the claim page to claim boosted rewards
                            </p>
                            <div className="row mt-2">
                                <div className="col-6">
                                    <h6>Amount of {props?.poolData.poolname} to unstake</h6>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <input value={unstakeValue} onChange={e=>setUnStakeValue(e.target.value)} type="number" placeholder='0.00'  className='inputFieldBox'/>
                                </div>
                                {
                                    appContext?.currentAccount !== null ?
                                    unstakeValue.length !== 0?
                                        <div className="col-2">
                                            <button onClick={()=> unstakeToken()} className='convertButton'>
                                                Unstake
                                            </button>
                                        </div>:
                                        <div className="col-2">
                                            <button disabled className='disabledConvertButton'>
                                                Unstake
                                            </button>
                                        </div>
                                        :
                                        <div className="col-2">
                                            <button disabled className='disabledConvertButton'>
                                                Unstake
                                            </button>
                                        </div>
                                }
                            </div>
                            {
                                appContext?.currentAccount !== null ?
                                <div className='mt-1'>
                                    <button onClick={()=> maxUnstakeToken()} className='setToMax'>MAX</button> <span className='availableSupply'> | Available : { Math.trunc(availableUnstakeToken*10000)/10000}</span>
                                </div> :
                                <div className='mt-1'>
                                    <button disabled className='disabledSetToMax'>MAX</button> <span className='availableSupply'> | Available : 0</span>
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
