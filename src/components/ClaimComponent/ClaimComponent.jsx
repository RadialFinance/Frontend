import React,{useState, useEffect, useContext} from 'react';
import './ClaimComponent.css';
import HeaderComponent from '../HeaderComponent/HeaderComponent';
import FooterDarkComponent from '../FooterComponent/FooterDarkComponent';
import SolidPoolsComponent from './SolidPoolsComponent/SolidPoolsComponent';
import PoolVotingComponent from './PoolVotingComponent/PoolVotingComponent';
import PoolWhitelistingComponent from './PoolWhitelistingComponent/PoolWhitelistingComponent';
import lpPoolAbi from '../../artifacts/Token.json';
import ClaimContext from '../ClaimContext';
import AppContext from '../AppContext';
import depositorAbi from '../../artifacts/Depositor.json';
import VeDistAbi from '../../artifacts/Ve_Dist.json';
import configSC from '../../artifacts/smartcontractConfig.json';
import { ftmIncentivesBasedOnVotesCastedByUser, getAllPoolsHavingEarnings, getClaimsPageTokenUsdPrice, getWeeksForWhichIncentiveArePending } from '../../stores/apistore';
import { totalClaimableDataStore } from '../../stores/dataStore';
import BigNumber from 'bignumber.js';
import toast, { Toaster } from 'react-hot-toast';
import ReactTooltip from "react-tooltip";


export default function ClaimComponent() {
    const appContext = useContext(AppContext);
    const [selectedPool,setSelectedPool] = useState([]);
    const [poolsList,setPoolsList] = useState([]);
    const [cryptoPrices,setCryptoPrices] = useState({});
    const totalClaimable = totalClaimableDataStore((state)=>state.totalClaimable);
    const resetTotalClaimable = totalClaimableDataStore((state)=>state.resetTotalClaimable);
    const [whiteListIncentives,setWhiteListIncentives] = useState([]);
    const [poolListIncentive,setPoolListIncentives] = useState([]);
    const [ClaimVeInflationStatus,setClaimVeInflationStatus] = useState(false);

    useEffect(()=>{
        resetTotalClaimable();
    },[appContext?.currentAccount]);

    //Fetching token price of [FTM,RDL,SOLID]
    useEffect(()=>{
        (async()=>{
            let tokenPrices = {}
            let ftmReserve = 0;
            let solidReserve = 0;
            let rdlReserve = 0;
            let tokenPriceData = await getClaimsPageTokenUsdPrice();
            tokenPriceData?.pairs.forEach((pair)=>{
                if(pair.token0.id==="0x04068da6c83afcfa0e13ba15a6696662335d5b75" && pair.token1.id === "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83"){
                    if(parseFloat(pair.reserveUSD) > ftmReserve){
                        ftmReserve = parseFloat(pair.reserveUSD);
                        tokenPrices["FTM"] = pair.token0Price
                    }
                }
                if(pair.token0.id==="0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83" && pair.token1.id === "0x888ef71766ca594ded1f0fa3ae64ed2941740a20"){
                    if(parseFloat(pair.reserveUSD) > solidReserve){
                        solidReserve = parseFloat(pair.reserveUSD);
                        tokenPrices["SOLID"] = pair.token0Price
                    }
                }
                if(pair.token0.id==="0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83" && pair.token1.id === "0x79360af49edd44f3000303ae212671ac94bb8ba7"){
                    if(parseFloat(pair.reserveUSD) > rdlReserve){
                        rdlReserve = parseFloat(pair.reserveUSD);
                        tokenPrices["RDL"] = pair.token0Price
                    }
                }
            })
            setCryptoPrices(tokenPrices);
        })();
    },[]);

    useEffect(()=>{
        (async()=>{
            if(appContext.web3!==null){
                const localVeDistContract = new appContext.web3.eth.Contract(VeDistAbi,configSC.Ve_Dist);;
                let ve_inflation_claim_data = await localVeDistContract.methods.claimable(configSC.NFT_ID).call();
                console.log(ve_inflation_claim_data);
                if(ve_inflation_claim_data>0){
                    setClaimVeInflationStatus(true)
                }
            }
        })();
    },[appContext?.web3])


    const claimRadialVeInf = () => {
        const localVeDistContract = new appContext.web3.eth.Contract(VeDistAbi,configSC.Ve_Dist);;
        const tx = localVeDistContract.methods.claim(configSC.NFT_ID).send({
            from: appContext.currentAccount
        });

        tx.on("transactionHash", () => {
            toast.loading("Transaction in progress",{position:'top-center'})
        });

        tx.on("confirmation", (confirmationNumber, receipt) => {
            if(confirmationNumber === 2){
                toast.remove()
                toast.success("Transaction successful",{position:'top-center'})
            }
        });

        tx.on("error", (error)=>{
            toast.remove();
            toast.error("Transaction failed",{position:'top-center'});
        });
    }


    useEffect(()=>{
        if(appContext?.currentAccount !== null){
            setWhiteListIncentives([]);
            setPoolListIncentives([]);
            const ftmIncentivesData = async() =>{
                let white_list_incentive = [];
                let pool_list_incentive = [];

                let weeksForWhichIncentiveArePendingData = await getWeeksForWhichIncentiveArePending(appContext?.currentAccount);
                console.log(weeksForWhichIncentiveArePendingData);
                for(const _data of weeksForWhichIncentiveArePendingData?.votes){
                    if(_data.effectiveVotes > 0){
                        let positiveUserVotes = BigNumber(_data.effectiveVotes);
                        let ftmIncentivesBasedOnVotesCastedByUserData = await ftmIncentivesBasedOnVotesCastedByUser(_data.week,_data.token);
                        console.log(ftmIncentivesBasedOnVotesCastedByUserData);
                        for(const _value of ftmIncentivesBasedOnVotesCastedByUserData?.data.incentives){
                            if(_value.type === "WHITELIST"){
                                let positivePoolVotes = BigNumber(_value.totalRewardWeight);
                                let _whitelist_incentive = BigNumber(_value.amount).multipliedBy(BigNumber(positiveUserVotes).div(BigNumber(positivePoolVotes)))
                                console.log(BigNumber(_whitelist_incentive).div(BigNumber(10).pow(18)).toFixed(18));
                                let white_list_data = {
                                    "amount":_value.amount,
                                    "token":_value.pool,
                                    "positiveUserVotes":positiveUserVotes,
                                    "positivePoolVotes":positivePoolVotes,
                                    "type":_value.type,
                                    "week":_value.week,
                                    "incentive":_whitelist_incentive
                                }
                                white_list_incentive.push(white_list_data);
                                
                            }
                            else if (_value.type === "POOL"){
                                let positivePoolVotes = BigNumber(_value.totalRewardWeight);
                                let _pool_incentive = BigNumber(_value.amount).multipliedBy(BigNumber(positiveUserVotes).div(BigNumber(positivePoolVotes)))
                                console.log(BigNumber(_pool_incentive).div(BigNumber(10).pow(18)).toFixed(18));
                                let pool_list_data = {
                                    "amount":_value.amount,
                                    "token":_value.pool,
                                    "positiveUserVotes":positiveUserVotes,
                                    "positivePoolVotes":positivePoolVotes,
                                    "type":_value.type,
                                    "week":_value.week,
                                    "incentive":_pool_incentive
                                }
                                pool_list_incentive.push(pool_list_data);
                            }
                        }
                    }
            }
            console.log(white_list_incentive,pool_list_incentive)
            return [white_list_incentive,pool_list_incentive];
        }

        ftmIncentivesData().then((data)=>{
            console.log(data);
            setWhiteListIncentives(old=>[...old,data[0]]);
            setPoolListIncentives(old=>[...old,data[1]]);
        })
        }
    },[appContext?.currentAccount]);


    useEffect(()=>{
        setPoolsList([]);
        if(appContext?.web3!==null){
            if(appContext?.currentAccount !== null){
                const localDepositorContract = new appContext.web3.eth.Contract(depositorAbi,configSC.depositorAddress);
                const poolsData = async() => {
                    let pools = []
                    let allPoolsHavingEarnings = await getAllPoolsHavingEarnings(appContext?.currentAccount);
                    if(allPoolsHavingEarnings?.data?.stakes.length>0){
                        for await(const data of allPoolsHavingEarnings?.data?.stakes){
                            const localLpPoolContract = new appContext.web3.eth.Contract(lpPoolAbi,data.token);
                            let poolname = await localLpPoolContract.methods.name().call();
                            let _amount = data.amount;
                            if(allPoolsHavingEarnings?.data?.locks.length>0 && data.token === "0x5ef8f0bd4f071b0199603a28ec9343f3651999c0"){
                                console.log("Here");
                                _amount = BigNumber(_amount).plus(BigNumber(allPoolsHavingEarnings?.data?.locks[0].locked)).toFixed(0);
                                console.log(_amount);
                            }
                            const pendingrewards = await localDepositorContract.methods.getPendingRewards(appContext?.currentAccount,[data.token]).call();
                            let _data ={
                                "pool":data.token,
                                "amount":_amount,
                                "poolname":poolname,
                                "solidearned":pendingrewards[0]
                            }
                            pools.push(_data);
                        }
                    }
                    if (pools.some(e => e.pool === '0x5ef8f0bd4f071b0199603a28ec9343f3651999c0') === false && allPoolsHavingEarnings?.data?.locks.length>0) {
                        const pendingrewards = await localDepositorContract.methods.getPendingRewards(appContext?.currentAccount,["0x5ef8f0bd4f071b0199603a28ec9343f3651999c0"]).call();
                        let _data ={
                            "pool":"0x5ef8f0bd4f071b0199603a28ec9343f3651999c0",
                            "amount":allPoolsHavingEarnings?.data?.locks[0].locked,
                            "poolname":"VolatileV1 AMM - WFTM/RDL",
                            "solidearned":pendingrewards[0]
                        }
                        pools.push(_data);
                    }
                    return pools;
                }
                poolsData().then((_data)=>{
                    setPoolsList(_poolList=>[..._poolList,_data])
                });
            }
        }
    },[appContext?.web3,appContext?.currentAccount])

    const claimSettings = {
        poolsList,
        cryptoPrices,
        whiteListIncentives,
        poolListIncentive
    }

    return (
    <div id='claimMainDiv'>
        <HeaderComponent/>
        <div id="stakeOverviewDiv" className='container mt-4'>
        <Toaster />
                <div className="row d-flex justify-content-center">
                    <div className="col-6">
                        <div className="overViewDataCard">
                            <h5 className='overViewCardMainHeader'>Total Claimable</h5>
                            <h3 className='overViewCardSubHeader'>{totalClaimable.length === 0 ?"$0.00": "$"+(totalClaimable.reduce((a, b) => a + b, 0)).toFixed(8)}</h3>
                        </div>
                    </div>
                </div>
                <div className="row d-flex justify-content-center">
                    {
                        ClaimVeInflationStatus && appContext?.currentAccount!==null ? 
                        <div style={{textAlign:'center'}}>
                            <button data-tip data-for="claimveinf" className='claimRdlveInflationBtn' onClick={()=>{claimRadialVeInf()}}>Claim Radial ve Inflation</button>
                            <ReactTooltip id="claimveinf" place="bottom" effect="solid">
                                Claims the veNFT inflation that Solidly gives to the Radial Protocol (not the user) <br/> every week in the form of SOLID to prevent the protocol from losing voting power over time.
                            </ReactTooltip>
                        </div> : null
                    }

                </div>
        </div>
        <div className="container mt-5" style={{width:'67%'}} >
            <h5 style={{fontWeight:'bold',color:'white',textShadow:'0px 0px 3px black'}}>Claim earnings</h5>
        </div>
        <ClaimContext.Provider value={claimSettings}>
            <SolidPoolsComponent/>
            <PoolVotingComponent/>
            <PoolWhitelistingComponent/>
        </ClaimContext.Provider>
        <FooterDarkComponent/>
    </div>
  )
}
