import React,{useState,useContext, useEffect} from 'react'
import './StakeSolidListComponent.css';
import Compound from '../../../assets/images/smallLogo.png';
import StakeSolidCardComponent from './StakeSolidCardComponent/StakeSolidCardComponent';
import ExpandArrow from '../../../assets/images/ExpandArrow.svg';
import AppContext from '../../AppContext';
import { tokenAbi } from '../../../artifacts/tokens';
import configSC from '../../../artifacts/smartcontractConfig.json';
import lpManagerAbi from '../../../artifacts/LPManager.json';
import lpPoolAbi from '../../../artifacts/Token.json';
import lpPoolContractAbi from '../../../artifacts/LpPool.json';
import BigNumber from 'bignumber.js';
import { getAllTvlStaked, getStakedUserData, getTokenPrice } from '../../../stores/apistore';
import { totalDepositDataStore } from '../../../stores/dataStore';
import toast, { Toaster } from 'react-hot-toast';
import StakeContext from '../StakeContext';

export default function StakeSolidListComponent() {
    const [expandStates,setExpandStates] = useState({});
    const appContext = useContext(AppContext);
    const stakeContext = useContext(StakeContext);
    const [poolAddressValue,setPoolAddressValue] = useState('');
    const [stakeValue,setStakeValue] = useState('');
    const [addNewPoolCardVisible,setAddnewPoolCardVisible] = useState(false);
    const [poolsList,setPoolsList] = useState([]);
    const [updatedPoolList,setUpdatedPoolList] = useState([]);
    const [tokenContract,setTokenContract] = useState('');
    const [lpPoolContract,setLpPoolContract] = useState('');
    const [lpManagerContract,setLpManagerContract] = useState('');
    const [availableToken,setAvailableToken] = useState(0);
    const [poolname,setPoolName] = useState('');
    const [allowance,setAllowance] = useState(0);
    const setTotalDeposit = totalDepositDataStore((state)=>state.setTotalDeposit);

    let getTvlUsd = async (poolAddress,poolAmount,usersStakeValue,wFTMPrice) => {
        try {
            let amount = BigNumber(poolAmount).div(BigNumber(10).pow(18)).toFixed(5);
            let _useramount = BigNumber(usersStakeValue).div(BigNumber(10).pow(18)).toFixed(5);
            if(appContext?.web3 !== null){
                let lpPoolContract = new appContext.web3.eth.Contract(lpPoolContractAbi,poolAddress);
                let totalSupply = await lpPoolContract.methods.totalSupply().call();
                let token1 = await lpPoolContract.methods.token1().call();
                let token1wFTMvalue = await getTokenPrice(token1.toLowerCase());
                let token_1_value = 0;
                if(token1wFTMvalue?.pairs.length>0){
                    let pairs = token1wFTMvalue.pairs[0];
                    if(pairs.token0.id === "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83"){
                        token_1_value = pairs.token0Price;
                    }
                    else{
                        token_1_value = pairs.token1Price;
                    }
                }
                let token1UsdValue = token_1_value*wFTMPrice;
                let tokenReserve = await lpPoolContract.methods.getReserves().call();
                let _reserve1 = tokenReserve._reserve1;
                let value = amount*(2*_reserve1*token1UsdValue)/totalSupply;
                let usersStake = _useramount*(2*_reserve1*token1UsdValue)/totalSupply;
                return [value,usersStake];
            }
        } catch (error) {
            console.log(error);
        }
    }


    useEffect(() => {
        (async()=>{
            if(appContext?.currentAccount!==null){
                setPoolsList([]);
                setUpdatedPoolList([]);
                let stakeData = await getStakedUserData(appContext?.currentAccount); 
                console.log(stakeData);
                setPoolsList(stakeData);
            }
        })();
    }, [appContext?.currentAccount])


    useEffect(() => {
        if(appContext.web3 !== null){
            const localLpManagerContract = new appContext.web3.eth.Contract(lpManagerAbi,configSC.LPManagerAddress);
            setLpManagerContract(localLpManagerContract);
        }
    }, [appContext?.web3,appContext?.currentAccount]);


    useEffect(()=>{
        console.log("called");
        poolsList.forEach((data)=>{
            console.log(data);
            (async()=>{
                if(stakeContext?.wFtmUsdValue!==0){
                    const localLpPoolContract = new appContext.web3.eth.Contract(lpPoolAbi,data.token);
                    const tokenStaked = await getAllTvlStaked(data.token);
                    const usdValue = await getTvlUsd(data.token,tokenStaked,data.amount,stakeContext?.wFtmUsdValue);
                    console.log(usdValue);
                    if(usdValue){
                        setTotalDeposit(usdValue[1]);
                        localLpPoolContract.methods.name().call().then((poolname)=>{
                            let _data ={
                                "token":data.token,
                                "amount":data.amount,
                                "poolname":poolname,
                                "tvl":tokenStaked,
                                "tvlUsdValue":usdValue[0]
                            }
                            console.log(_data);
                            setUpdatedPoolList(updatedPoolList=>[...updatedPoolList,_data])
                        });
                    }
                }
            })();
        })
    },[poolsList,stakeContext?.wFtmUsdValue])

    
    const approveStake = () => {
        let _value = BigNumber(stakeValue).times(BigNumber(10).pow(18)).toFixed(0);
        const tx = tokenContract.methods.approve(configSC.LPManagerAddress,_value).send({
            from: appContext.currentAccount
        });

        tx.on("transactionHash", () => {
            toast.loading("Transaction in progress",{position:'top-center'})
        });

        tx.on("confirmation", (confirmationNumber, receipt) => {
            if(confirmationNumber === 2){
                setAllowance(parseFloat((BigNumber(_value)/BigNumber(10).pow(18)).toFixed(18))+parseFloat(allowance));
                toast.remove();
                toast.success("Transaction successful",{position:'top-center'})
            }
        });

        tx.on("error", (error)=>{
            toast.remove();
            toast.error("Transaction failed",{position:'top-center'});
        });
    }


    const stake = () => {
        let _value = BigNumber(stakeValue).times(BigNumber(10).pow(18)).toFixed(0);
        const tx = lpManagerContract.methods.stake(poolAddressValue,_value).send({
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

    const setMaxStake = () => {
        setStakeValue(availableToken);
    }


    const expandOnClick = (id) => {
        setExpandStates(
            (
                prevState => ({...prevState, [id]: !prevState[id]})
            )
        )
        console.log(expandStates);
    }



    const getPoolName = async (poolAddress) =>{
        setPoolAddressValue(poolAddress);
        if(poolAddress.length === 42){
            console.log(appContext);
                if(appContext?.web3 !== null){
                        const localLpPoolContract = new appContext.web3.eth.Contract(lpPoolAbi,poolAddress);
                        setLpPoolContract(localLpPoolContract);
                        localLpPoolContract.methods.name().call().then((poolname)=>{
                            setPoolName(poolname);
                        });
                        const localTokenContract = new appContext.web3.eth.Contract(tokenAbi,poolAddress);
                        setTokenContract(localTokenContract);
                        if(appContext?.currentAccount !== null){
                            localTokenContract.methods.balanceOf(appContext.currentAccount).call().then((allowance) => {
                                console.log(allowance);
                                let _balance = (parseFloat((BigNumber(allowance).div(BigNumber(10).pow(18)))));
                                console.log(_balance);
                                setAvailableToken(_balance);
                            });
                            localTokenContract.methods.allowance(appContext.currentAccount,configSC.LPManagerAddress).call().then((_value) => {
                                console.log(_value);
                                setAllowance(parseFloat((BigNumber(_value)/BigNumber(10).pow(18)).toFixed(18)));
                            });
                        }
                }
                else{
                    setPoolName("Please connect your wallet, and try again!")
                    setTimeout(() => {
                        setPoolAddressValue("");
                    }, 2000);
                }
        }
    }

    

    return (
        <div className='stakeSolidListDiv container mt-5'>
            <Toaster />
            <h5 id="converSolidHeading">Stake Solidly LP Tokens</h5>
            <div className="row poolRow poolRowHover" onClick={()=>setAddnewPoolCardVisible(addNewPoolCardVisible => !addNewPoolCardVisible)}>
                <div className="col-11 listCol">
                    <div className="row">
                        <div className="col-10" style={{fontWeight:'bold'}}>
                            Add a new pool
                        </div>
                    </div>
                </div>
                <div className="col-1 listCol d-flex justify-content-end">
                        {
                            addNewPoolCardVisible === true ? 
                            <img className='shrinkArrow' alt='expand' src={ExpandArrow}/> : 
                            <img className='expandArrow' alt='shrink' src={ExpandArrow}/>
                        }
                </div>
            </div>

            {
                addNewPoolCardVisible ?
                <div className="converSolidCardBody mb-3">
                    <div className="stakeRdlCard">
                            <div className="row">
                                <p className="convertMainText">
                                    Users who stake Solidly LP tokens earn boosted rewards in the form of SOLID. Staked LP tokens do not have a lock-in period.
                                </p>
                            </div>

                            <div className="row mt-2">
                                <div className="col-6">
                                    <h6>Enter Pool address : </h6>
                                </div>
                            </div>
                            <div className="row mt-1">
                                <div className="col-6">
                                    <input value={poolAddressValue} onChange={e => getPoolName(e.target.value)} type="text" placeholder='Paste address here'  className='inputFieldBox'/>
                                </div>
                            </div>

                            <div className="row mt-4">
                                <div className="col-2">
                                    <h6>Pool Name : </h6>
                                </div>
                            </div>
                            <div className="row mt-1">
                                <div className="col-6">
                                    <div>{poolname.length !== 0? poolname : "--"}</div>
                                </div>
                            </div>

                            <div className="row mt-3">
                                <div className="col-6">
                                    <h6>Amount of token to stake</h6>
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
                                    <input value={stakeValue} onChange={e => setStakeValue(e.target.value)} type="number" placeholder='0.00'  className='inputFieldBox'/>
                                </div>
                                {
                                    appContext?.currentAccount !== null ?
                                    parseFloat(stakeValue) > allowance && parseFloat(stakeValue) !== 0?
                                    <div className="col-2">
                                        <button onClick={() => approveStake()} className='convertButton'>
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
                                    parseFloat(stakeValue) <= allowance && parseFloat(stakeValue) !== 0?
                                    <div className="col-2">
                                        <button onClick={() => stake()} className='convertButton'>
                                            Stake
                                        </button>
                                    </div>:
                                    <div className="col-2">
                                        <button className='disabledConvertButton'>
                                            Stake
                                        </button>
                                    </div>
                                    :
                                    <div className="col-2">
                                        <button className='disabledConvertButton'>
                                            Stake
                                        </button>
                                    </div>
                                }
                            </div>
                            {
                                appContext?.currentAccount !== null ?
                                <div className='mt-2'>
                                    <button onClick={() => setMaxStake()} className='setToMax'>MAX</button> <span className='availableSupply'> | Available : {Math.trunc(availableToken*10000)/10000}</span>
                                </div> :
                                <div className='mt-2'>
                                    <button className='disabledSetToMax'>MAX</button> <span className='availableSupply'> | Available : 0</span>
                                </div>
                            }
                    </div>
                </div>
                :
                null
            }
     

            <div className="row">
                <div className="col-4">
                    <p className='tableHeader'>Pool name</p>
                </div>
                <div className="col">
                    <p className='tableHeader'>My Staked</p>
                </div>
                <div className="col">
                    <p className='tableHeader'>TVL</p>
                </div>
                <div className="col">
                    <p className='tableHeader'></p>
                </div>
            </div>

            {
                updatedPoolList?.map((pool,index)=>(
                        <div key={index}>
                        <div className="row poolRow poolRowHover" onClick={()=>expandOnClick(index)} >
                            <div className="col-4 listCol">
                                <div className="row">
                                    <div className="col-1">
                                        <img src={Compound} alt="logo" style={{width:'25px',height:'25px',borderRadius:'50px'}} />
                                    </div>
                                    <div className="col-10">
                                        <p className='listText'>{pool.poolname}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col listCol">
                                <div className="row">
                                    <p className='listText' style={{marginLeft:'7px'}}>{(BigNumber(pool.amount)/BigNumber(10).pow(18)).toPrecision(3)} LP</p>
                                </div>
                            </div>
                            <div className="col listCol">
                                <div className="row">
                                    <p className='listText' style={{marginLeft:'13px'}}>${pool.tvlUsdValue.toFixed(3)}</p>
                                </div>
                            </div>
                            <div className="col listCol">
                                <div className="d-flex justify-content-end">
                                
                                    {
                                        expandStates[index] === true ? 
                                        <img className='shrinkArrow' alt='expand' src={ExpandArrow}/> : 
                                        <img className='expandArrow' alt='shrink' src={ExpandArrow}/>
                                    }
                                </div>
                            </div>
                        </div>
                        {
                            expandStates[index] === true ?
                             <StakeSolidCardComponent poolData={pool} /> : 
                             <div></div>
                        }
                    </div>
                ))
            }
            {
                updatedPoolList.length === 0?
                <div className="row d-flex justify-content-center mt-5" style={{fontWeight:'bold'}}>No pools founds.</div>:
                null
            }


        </div>
    )
}
