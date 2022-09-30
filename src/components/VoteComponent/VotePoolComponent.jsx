import React, { useState,useContext, useEffect } from 'react'
import './VotePoolComponent.css'
import HeaderComponent from '../HeaderComponent/HeaderComponent';
import FooterComponentDark from '../FooterComponent/FooterDarkComponent';
import { Link } from 'react-router-dom';
import AppContext from '../AppContext';
import VotePopUpModal from '../WhiteListComponent/VotePopUpModalWhiteListPage/VotePopUpModalWhiteListPage';
import VoteWeekComponent from './VoteWeekComponent';
import lpPoolAbi from '../../artifacts/Token.json';
import { rdlFtmLockedDataStore, rdlLockDataStore, rdlAndLpTokenLockedStore, getWithrawableIncentives, totalIncentiveForAllPoolsThisWeek, getEffectiveVotesForUser, usersUsedVotingPower, getwFTMusdValue } from '../../stores/apistore';
import WithdrawModal from '../WhiteListComponent/WithdrawModal/WithdrawModal';
import poolBribeManagerAbi from '../../artifacts/PoolBribeManager.json';
import configSC from '../../artifacts/smartcontractConfig.json';
import VotePoolIndividualComponent from './VotePoolIndividualComponent';
import BigNumber from 'bignumber.js';
import lpPoolContractAbi from '../../artifacts/LpPool.json';
import radialVotingAbi from '../../artifacts/RadialVoting.json';
import VotePopUpModalPoolsPage from './VotePopUpModalPoolsPage/VotesPopUpModalPoolsPage';
import PoolVotingAbi from '../../artifacts/PoolVoting.json';
import toast, { Toaster } from 'react-hot-toast';
import ReactTooltip from "react-tooltip";
const starttime = configSC.starttime;


const getTime = () =>{
    return Math.floor( Date.now() / 1000 );
}

const getWeek = () =>{
    let time = getTime();
    return (time - starttime)/604800;
}

function VotePoolComponent() {

    const [currentWeek,setCurrentWeek] = useState(0);
    const appContext = useContext(AppContext);
    const [showModal, setShowModal] = useState(false);
    const [showWithdrawModal,setShowWithdrawModal] = useState(false);
    const [modalIndex, setModalIndex] = useState(null);
    const [week,setWeek] = useState(null);
    const [ongoingWeek,setOngoingWeek] = useState(null);
    const [ongoingWeekNumber,setOngoingWeekNumber] = useState(null);
    const lockedRdlValue = rdlLockDataStore((state)=>state.rdlLock);
    const setRdlLockedData = rdlLockDataStore((state)=>state.setRdlLockData);
    const lockedRdlFtmValue = rdlFtmLockedDataStore((state)=>state.rdlFtmLock);
    const setRdlFtmLockData = rdlFtmLockedDataStore((state)=>state.setRdlFtmLockData);
    const rdlAndLpTokenLocked = rdlAndLpTokenLockedStore((state)=>state.rdlAndLpTokenLocked);
    const setRdlAndLpTokenLocked = rdlAndLpTokenLockedStore((state)=>state.setRdlAndLpTokenLocked);
    const [showWithdrawIncentiveBtn,setShowWithdrawIncentiveBtn] = useState(false);
    const [incentivesList,setIncentivesList] = useState([]);
    const [weekCount,setWeekCount] = useState(null);
    const [availableFtm,setAvailableFtm] = useState(0);
    const [poolList,setPoolList] = useState([]);
    const [totalIncentives,setTotalIncentives] = useState(0);
    const [userVotingPower,setUserVotingPower] = useState(0);
    const [remainingVotingPower,setRemainingVotingPower] = useState(0);
    const [wFTMusdPrice,setwFTMusdPrice] = useState(0);


    let getLpTokenRdlLocked = async (poolAmount) => {
        try {
            if(appContext?.web3 !== null){
                let lpPoolContract = new appContext.web3.eth.Contract(lpPoolContractAbi,configSC.RDL_FTM_POOL);
                let totalSupply = await lpPoolContract.methods.totalSupply().call();
                let tokenReserve = await lpPoolContract.methods.getReserves().call()
                let _reserve0 = tokenReserve._reserve0;
                let value = poolAmount*(_reserve0)/totalSupply
                return value;
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        let _currentWeek = Math.floor(getWeek());
        setWeekCount(_currentWeek);
    },[]);

    useEffect(()=>{
        (async()=>{
            let _wftmUsd = await getwFTMusdValue();
            setwFTMusdPrice(_wftmUsd);
        })();
    },[]);



    useEffect(()=>{
        //Total RDL and total LP tokens locked
        setRdlAndLpTokenLocked();
        if(appContext?.web3 !== null){
            setPoolList([]);
            (async()=>{
                //Total incentives for all pools this week
                console.log(weekCount);
                let totalIncentiveForAllPoolsThisWeekData = await totalIncentiveForAllPoolsThisWeek(weekCount);
                if(totalIncentiveForAllPoolsThisWeekData !== null) {
                    let total_incentives = 0;
                    if(!totalIncentiveForAllPoolsThisWeekData?.data?.incentives) return;
                    totalIncentiveForAllPoolsThisWeekData.data.incentives.forEach((data)=>{
                        (async()=>{
                            if(data.type === "POOL" && data.amount>0){ 
                                total_incentives = BigNumber(total_incentives).plus(BigNumber(data.amount));
                            }
                    
                            let usersEffectiveVotesData = 0;
                            let usersVotesUsed = 0;

                            // Fetching users effective votes
                            let usersEffectiveVotes = await getEffectiveVotesForUser(weekCount,data.pool,appContext?.currentAccount, false);
                            console.log(usersEffectiveVotes);
                            if(usersEffectiveVotes.data?.votes[0]?.effectiveVotes === undefined){
                              usersEffectiveVotesData = 0;
                            }
                            if(usersEffectiveVotes.data?.votes[0]?.weightUsed === undefined){
                                usersVotesUsed = 0;
                            }
                            else{
                              usersEffectiveVotesData = usersEffectiveVotes.data.votes[0].effectiveVotes;
                              usersVotesUsed = usersEffectiveVotes.data.votes[0].weightUsed;
                            }

                        
                            if(data.type === "POOL" && data.amount>0){     
                                const localLpPoolContract = new appContext.web3.eth.Contract(lpPoolAbi,data.pool);
                                localLpPoolContract.methods.name().call().then((poolname)=>{
                                    let _data ={
                                        "pool":data.pool,
                                        "amount":data.amount,
                                        "poolname":poolname,
                                        "totalRewardWeight":data.totalRewardWeight,
                                        "usersEffectiveVotes":usersEffectiveVotesData,
                                        "effectiveVotes":data.effectiveVotes,
                                        "usersVotesUsed":usersVotesUsed
                                    }
                                    setPoolList(poolList=>[...poolList,_data])
                                });
                            }
                        })();
                    });
                    setTotalIncentives(total_incentives);
                }
            })();
        }              
    },[appContext?.web3,weekCount]);


    useEffect(()=>{
        (async()=>{
            if(appContext?.web3 !== null){
                let _currentWeek = Math.floor(getWeek());
                setOngoingWeekNumber(_currentWeek);
                //Setting up contracts
                const localPoolBribeManagerContract = new appContext.web3.eth.Contract(poolBribeManagerAbi,configSC.poolBribeManagerAddress);
                if(appContext?.currentAccount!==null){
                    let balance = await appContext.web3.eth.getBalance(appContext.currentAccount);
                    let convertedBalance = await appContext.web3.utils.fromWei(balance, 'ether');
                    setAvailableFtm(convertedBalance);
                    console.log(_currentWeek);
                    let withrawableIncentivesData = await getWithrawableIncentives(_currentWeek,appContext?.currentAccount);
                    console.log(withrawableIncentivesData);
                    if(withrawableIncentivesData?.length>0){
                        withrawableIncentivesData.forEach((data)=>{
                            console.log(appContext?.currentAccount,data.pool,data.week);
                            localPoolBribeManagerContract.methods.bribes(appContext?.currentAccount,data.pool,data.week).call().then((incentive)=>{
                                console.log(incentive);
                                if(incentive>0 && data.type==="POOL"){
                                    setShowWithdrawIncentiveBtn(true);
                                    setIncentivesList(_incentivesList => [..._incentivesList,data])
                                }
                            });
                        })
                    }
                }

            }
        })();
    },[appContext?.web3,appContext?.currentAccount]);


    useEffect(()=>{
        (async()=>{
            if(appContext?.currentAccount!==null){
                // Fetch lockedRdlValue & lockedRdlFtmValue
                setRdlLockedData(appContext?.currentAccount);
                setRdlFtmLockData(appContext?.currentAccount);
                let _usersVotingPower = null;
                if(appContext?.web3 !== null){
                    let radialVotingContract = new appContext.web3.eth.Contract(radialVotingAbi,configSC.radialVotingAddress);
                    radialVotingContract.methods.getVotingPower(appContext?.currentAccount).call().then((_value)=>{
                        _usersVotingPower = _value;
                        setUserVotingPower(_value);
                    })
                }
                // Fetch users usedVotes
                let usersUsedVotingPowerData = await usersUsedVotingPower(weekCount,appContext?.currentAccount);
                console.log(usersUsedVotingPowerData);
                let _votesUsed = 0;
                if(!usersUsedVotingPowerData?.data) return;
                if(usersUsedVotingPowerData.data.votes.length>0){
                    usersUsedVotingPowerData.data.votes.forEach((_data)=>{
                        if(_data.type==="POOL"){
                            _votesUsed = parseFloat(_votesUsed) + parseFloat(_data.weightUsed);
                        }
                    })
                    setRemainingVotingPower(parseFloat(_usersVotingPower) - parseFloat(_votesUsed));
                }
                else{
                    setRemainingVotingPower(_usersVotingPower);
                }
            }
        })();
    },[appContext?.currentAccount,lockedRdlValue,weekCount,userVotingPower])

    const voteOnSolidly = () => {
        let _localPoolVotingContract = new appContext.web3.eth.Contract(PoolVotingAbi,configSC.poolVotingAddress);
        const tx = _localPoolVotingContract.methods.submitVotes().send({
            from: appContext.currentAccount
        });

        tx.on("transactionHash", () => {
            toast.loading("Transaction in progress",{position:'top-center'})
        });

        tx.on("confirmation", (confirmationNumber, receipt) => {
            if(confirmationNumber === 4){
                toast.remove();
                toast.success("Transaction successful",{position:'top-center'});
            }
        });

        tx.on("error", (error)=>{
            toast.remove();
            toast.error("Transaction failed",{position:'top-center'});
        });
    }

    const setIsOpen = (value) => {
        setShowModal(value);
    };

    const setWithdrawModalIsOpen = (value) => {
        setShowWithdrawModal(value);
    };

    const openModal = (index) => {
        setModalIndex(index);
        setShowModal(true);
    }

    return (
    <div className='votePoolMainDiv'>
        <HeaderComponent/>
        <Toaster/>
        <div className="votePoolInnerDiv">
        <div className='votePoolHeader container mt-4'>
                <div className="row">
                    <div className="col-4">
                        <div className="votePoolHeaderBlocks">
                            <h4 className='votePoolHeaderMainHeader'>Incentives</h4>
                            <h5 className='votePoolHeaderSubHeader'>{totalIncentives === null ? 0 : (BigNumber(totalIncentives).div(BigNumber(10).pow(18))).toFixed(3)} FTM</h5>
                            {
                                showWithdrawIncentiveBtn ?
                                <button id="withdrawIncentivePopUpBtn" onClick={()=>setWithdrawModalIsOpen(true)}>Withdraw Incentives</button>:
                                null
                            }
                            
                        </div>
                    </div>
                    <div className="col-4 claimButtonHolder">
                            <Link className='votePageClaimRewardsBtn' to="/claim"><span>Claim<br/>Rewards</span></Link>
                    </div>
                    <div className="col-4">
                        <div className="votePoolHeaderBlocks">
                            <h4 className='votePoolHeaderMainHeader'>Remaining Voting Power</h4>
                            <h5 className='votePoolHeaderSubHeader'>{isNaN(remainingVotingPower) ? "0" : remainingVotingPower}</h5>
                            <h5 className='votePoolHeaderSubHeader'>Your Total Voting Power: { lockedRdlValue === null ? "0": userVotingPower }</h5>
                            {
                                weekCount === ongoingWeekNumber ?
                                <div>
                                    <button id="withdrawIncentivePopUpBtn" onClick={()=>voteOnSolidly()} data-tip data-for="voteonsolidly">Vote on Solidly</button>
                                    <ReactTooltip id="voteonsolidly" place="bottom" effect="solid">
                                        Submit votes to Solidly before the current <br/> epoch  ends to be eligible for incentives.<br/> Vote submission to Solidly can be executed by anyone.
                                    </ReactTooltip>
                                </div>
                                :null
                            }
                        </div>
                    </div>
                </div>
        </div>

        <VoteWeekComponent 
        week={week} 
        weekCount={weekCount}
        setWeekCount={setWeekCount}
        setWeek={setWeek} 
        ongoingWeek={ongoingWeek} 
        setOngoingWeek={setOngoingWeek} 
        ongoingWeekNumber={ongoingWeekNumber}
        currentWeek={currentWeek} 
        setCurrentWeek={setCurrentWeek}/>

        <div className="votePoolCardsDiv container-fluid">
            {
                poolList.length === 0?
                <div className='mt-5 pt-5' style={{fontWeight:'bold',textAlign:'center'}}>There are currently no incentives for this week.</div>:null
            }
                
            <div className="row justify-content-center">
            {
                poolList.map((pool,index)=>{
                    return (
                        <div className="col-4 mb-4" key={index}>
                            <VotePoolIndividualComponent weekCount={weekCount} ongoingWeekNumber={ongoingWeekNumber} wFTMusdPrice={wFTMusdPrice} openModal={openModal} index={index} poolData={pool} />
                        </div>
                    )
                })
            }
            </div>
        </div>
        </div>
        {showModal ? <VotePopUpModalPoolsPage remainingVotingPower={remainingVotingPower} currentWeek={weekCount} userVotingPower={userVotingPower} setIsOpen={setIsOpen} modalData={poolList[modalIndex]}  /> : null}
        {showWithdrawModal ? <WithdrawModal incentivesList={incentivesList} setWithdrawModalIsOpen={setWithdrawModalIsOpen} pageType={"poolvoting"} /> : null }
        <FooterComponentDark/>
    </div>
    )
}

export default VotePoolComponent