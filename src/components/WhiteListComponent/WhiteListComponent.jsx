import React, { useState,useContext, useEffect } from 'react';
import './WhiteListComponent.css';
import HeaderComponent from '../HeaderComponent/HeaderComponent';
import FooterComponentDark from '../FooterComponent/FooterDarkComponent';
import ArrowDown from '../../assets/images/arrowdown.svg';
import { Link } from 'react-router-dom';
import AppContext from '../AppContext';

import CountDownTimer from '../VoteComponent/CountDownTimer';

import lpPoolContractAbi from '../../artifacts/LpPool.json';
import whiteListBribeManagerAbi from '../../artifacts/WhitelistingBribeManager.json';
import radialVotingAbi from '../../artifacts/RadialVoting.json';
import configSC from '../../artifacts/smartcontractConfig.json';
import lpPoolAbi from '../../artifacts/Token.json';
import solidlyVoterAbi from '../../artifacts/SolidlyVoter.json';
import toast, { Toaster } from 'react-hot-toast';

//STORES
import { fetchLockedTokenData, getEffectiveVotesForUser, getTokenPriceInUSD, getwFTMusdValue, getWithrawableIncentives, listofTokens, rdlLockDataStore, totalIncentiveForAllPoolsThisWeek } from '../../stores/apistore';
import { rdlFtmLockedDataStore } from '../../stores/apistore';
import { rdlAndLpTokenLockedStore } from '../../stores/apistore';
import WithdrawModal from './WithdrawModal/WithdrawModal';
import BigNumber from 'bignumber.js';
import WhiteListIndividualComponent from './WhiteListIndividualComponent';
import VotePopUpModalWhiteListPage from './VotePopUpModalWhiteListPage/VotePopUpModalWhiteListPage';

const starttime = configSC.starttime;

let monthNames = ["January", "February", "March", "April", "May","June","July", "August", "September", "October", "November","December"];


function WhiteListComponent() {

    const [expandDepositForm,setExpandDepositForm] = useState(false);
    const [currentWeek,setCurrentWeek] = useState(null);
    const appContext = useContext(AppContext);
    const [showModal, setShowModal] = useState(false);
    const [modalIndex, setModalIndex] = useState(null);
    const [showWithdrawModal,setShowWithdrawModal] = useState(false);
    const [votingWeekDate,setVotingWeekDate] = useState(null);
    const [votingWeekMonth,setVotingWeekMonth] = useState(null);
    const [votingWeekYear,setVotingWeekYear] = useState(null);
    const [timer,setTimer] = useState(null);
    const lockedRdlValue = rdlLockDataStore((state)=>state.rdlLock);
    const setRdlLockedData = rdlLockDataStore((state)=>state.setRdlLockData);
    const lockedRdlFtmValue = rdlFtmLockedDataStore((state)=>state.rdlFtmLock);
    const setRdlFtmLockData = rdlFtmLockedDataStore((state)=>state.setRdlFtmLockData);
    const rdlAndLpTokenLocked = rdlAndLpTokenLockedStore((state)=>state.rdlAndLpTokenLocked);
    const setRdlAndLpTokenLocked = rdlAndLpTokenLockedStore((state)=>state.setRdlAndLpTokenLocked);
    const [lpPoolContract,setLpPoolContract] = useState(null);
    const [whiteListBribeManagerContract,setWhiteListBribeManagerContract] = useState(null);
    const [tokenName,setTokenName] = useState('');
    const [tokenAddress,setTokenAddress] = useState('');
    const [availableFtm,setAvailableFtm] = useState(0);
    const [incentive,setIncentiveValue] = useState('');
    const [localeTimezone,setLocaleTimezone] = useState(null);
    const [poolList,setPoolList] = useState([]);
    const [showWithdrawIncentiveBtn,setShowWithdrawIncentiveBtn] = useState(false);
    const [incentivesList,setIncentivesList] = useState([]);
    const [totalIncentives,setTotalIncentives] = useState(0);
    const [userVotingPower,setUserVotingPower] = useState(0);
    const [updateData,setUpdateData] = useState(null);
    const [wFTMusdPrice,setwFTMusdPrice] = useState(0);

    const getTime = () =>{
        return Math.floor( Date.now() / 1000 );
    }

    const getWeek = () =>{
        let time = getTime();
        return (time - starttime)/604800;
    }

    let getLpTokenRdlLocked = async (poolAmount) => {
        try {
            if(appContext?.web3 !== null){
                let lpPoolContract = new appContext.web3.eth.Contract(lpPoolContractAbi,configSC.RDL_FTM_POOL);
                let totalSupply = await lpPoolContract.methods.totalSupply().call();
                let tokenReserve = await lpPoolContract.methods.getReserves().call()
                let _reserve0 = tokenReserve._reserve0;
                // let value = poolAmount*(_reserve0)/totalSupply
                let _value = (BigNumber(poolAmount).multipliedBy(BigNumber(_reserve0))).div(BigNumber(totalSupply));
                return _value;
            }
        } catch (error) {
            console.log(error);
        }
    }


    useEffect(() => {
        console.log("called");
        let currentWeek = Math.floor(getWeek());
        setCurrentWeek(currentWeek);
        let startTimeDate = new Date(starttime*1000);
        setLocaleTimezone(startTimeDate.toLocaleString('en-US', { hour: 'numeric', hour12: true })+" "+startTimeDate.toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2])
        let currentOngoingWeek = new Date(startTimeDate.getUTCFullYear(),startTimeDate.getUTCMonth(), startTimeDate.getUTCDate()+(7*(currentWeek)));
        let votingWeek = new Date(currentOngoingWeek.getFullYear(),currentOngoingWeek.getMonth(), currentOngoingWeek.getDate()+7);
        setVotingWeekDate(currentOngoingWeek.getDate());
        setVotingWeekMonth(monthNames[currentOngoingWeek.getMonth()]);
        setVotingWeekYear(currentOngoingWeek.getFullYear());
        setTimer(`${votingWeek.getDate()} ${monthNames[votingWeek.getMonth()]}, ${votingWeek.getFullYear()} 00:00:00 UTC`);
        setPoolList([]);

        //Total RDL and total LP tokens locked
        setRdlAndLpTokenLocked();
    }, [])


    useEffect(()=>{
        setPoolList([]);
        let _currentWeek = Math.floor(getWeek());

        if(appContext?.web3 !== null){
            console.log(appContext?.web3.currentProvider.selectedAddress);
            (async()=>{
                console.log("data");
                //Total incentives for all pools this week
                let totalIncentiveForAllPoolsThisWeekData = await totalIncentiveForAllPoolsThisWeek(_currentWeek);

                console.log(totalIncentiveForAllPoolsThisWeekData);
                if(totalIncentiveForAllPoolsThisWeekData.data.incentives.length > 0) {
                    console.log("API");
                    let total_incentives = 0;
                    totalIncentiveForAllPoolsThisWeekData.data.incentives.forEach((data)=>{
                        if(data.type === "WHITELIST"){
                            (async()=>{
                                if(data.type === "WHITELIST" && data.amount>0){ 
                                    total_incentives = BigNumber(total_incentives).plus(BigNumber(data.amount));
                                }

                                let usersEffectiveVotesData = 0;
                                let usersVotesUsed = 0;

                                if(appContext?.web3.currentProvider.selectedAddress !== undefined){
                                    // Fetching users effective votes
                                    let usersEffectiveVotes = await getEffectiveVotesForUser(_currentWeek,data.pool,appContext?.web3.currentProvider.selectedAddress,true);
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
                                }

                            
                                if(data.type === "WHITELIST" && data.amount>0){     
                                        const localLpPoolContract = new appContext.web3.eth.Contract(lpPoolAbi,data.pool);
                                        localLpPoolContract.methods.name().call().then((poolname)=>{
                                            let _data ={
                                                "pool":data.pool,
                                                "amount":data.amount,
                                                "poolname":poolname,
                                                "totalRewardWeight":data.totalRewardWeight,
                                                "usersEffectiveVotes":usersEffectiveVotesData,
                                                "effectiveVotes":data.effectiveVotes,
                                                "usersVotesUsed":usersVotesUsed,
                                                "passed":data.passed
                                            }
                                            setPoolList(_poolList=>[..._poolList,_data])
                                        });
                                }
                            })();
                        }
                    })
                    setTotalIncentives(total_incentives);
                }
            })();
        }
    },[appContext?.web3,updateData])



    useEffect(()=>{
        (async()=>{
            if(appContext?.currentAccount!==null){
                // Fetch lockedRdlValue & lockedRdlFtmValue
                setRdlLockedData(appContext?.currentAccount);
                setRdlFtmLockData(appContext?.currentAccount);
                if(appContext?.web3 !== null){
                    let radialVotingContract = new appContext.web3.eth.Contract(radialVotingAbi,configSC.radialVotingAddress);
                    if(lockedRdlValue!==null || lockedRdlFtmValue!==null){
                        radialVotingContract.methods.getVotingPower(appContext?.currentAccount).call().then((_value)=>{
                            console.log(_value);
                            setUserVotingPower(_value);
                        })
                    }
                }
            }
        })();
    },[appContext?.currentAccount,lockedRdlValue,appContext?.web3])


    useEffect(()=>{
        (async()=>{
            if(appContext?.web3 !== null){
                let currentWeek = Math.floor(getWeek());
                //Setting up contracts
                const localWhiteListBribeManagerContract = new appContext.web3.eth.Contract(whiteListBribeManagerAbi,configSC.whitelistingBribeManagerAddress);
                setWhiteListBribeManagerContract(localWhiteListBribeManagerContract);
                if(appContext?.currentAccount!==null){
                    let balance = await appContext.web3.eth.getBalance(appContext.currentAccount);
                    let convertedBalance = await appContext.web3.utils.fromWei(balance, 'ether');
                    setAvailableFtm(convertedBalance);
                    let withrawableIncentivesData = await getWithrawableIncentives(currentWeek,appContext?.currentAccount);
                    if(withrawableIncentivesData.length>0){
                        withrawableIncentivesData.forEach((data)=>{
                            localWhiteListBribeManagerContract.methods.bribes(appContext?.currentAccount,data.pool,data.week).call().then((incentive)=>{
                                if(incentive>0 && data.type==="WHITELIST"){
                                    setShowWithdrawIncentiveBtn(true);
                                    setIncentivesList(incentivesList => [...incentivesList,data])
                                }
                            });
                        })
                    }
                }

            }
        })();
    },[appContext?.web3])


    useEffect(()=>{
        (async()=>{
            let _wftmUsd = await getwFTMusdValue();
            setwFTMusdPrice(_wftmUsd);
        })();
    },[]);


    const getPoolName = async (tokenAddress) =>{
        setTokenAddress(tokenAddress);
        if(tokenAddress.length === 42){
                if(appContext?.web3 !== null){
                    const localLpPoolContract = new appContext.web3.eth.Contract(lpPoolAbi,tokenAddress);
                    setLpPoolContract(localLpPoolContract);
                    const whitelistingBribeManager = new appContext.web3.eth.Contract(whiteListBribeManagerAbi,configSC.whitelistingBribeManagerAddress);
                    whitelistingBribeManager.methods.isWhitelisted(tokenAddress).call().then((isWhitelist)=>{
                        if (isWhitelist == false){
                            localLpPoolContract.methods.name().call().then((tokenname)=>{
                                setTokenName(tokenname);
                            });
                        }
                        else{
                            toast.error("Already Whitelisted",{position:'top-center'})
                        }
                    })
                }
                else{
                    setTokenName("Please connect your wallet, and try again!")
                    setTimeout(() => {
                        setTokenAddress("");
                    }, 2000);
                }
        }
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

    const setMaxIncentive = () =>{
        setIncentiveValue(availableFtm);
    }

    const deposit = () => {
        let _value = BigNumber(incentive).times(BigNumber(10).pow(18)).toFixed(0);
        const tx = whiteListBribeManagerContract.methods.deposit(tokenAddress,_value).send({
            from: appContext.currentAccount,
            value: _value
        });

        tx.on("transactionHash", () => {
            toast.loading("Transaction in progress",{position:'top-center'})
        });

        tx.on("confirmation", (confirmationNumber, receipt) => {
            if(confirmationNumber === 4){
                toast.remove();
                toast.success("Transaction successful",{position:'top-center'})
            }
        });

        tx.on("error", (error)=>{
            toast.remove();
            toast.error("Transaction failed",{position:'top-center'});
        });
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
                                showWithdrawIncentiveBtn?
                                <button id="withdrawIncentivePopUpBtn" onClick={()=>setWithdrawModalIsOpen(true)}>Withdraw Incentives</button>:
                                null
                            }
                        </div>
                    </div>
                    <div className="col-4 claimButtonHolder">
                            <Link className='votePageClaimRewardsBtn' to="/claim"><span>Claim<br/>Rewards</span></Link>
                    </div>
                    <div className="col-4">
                        <div className="votePoolHeaderBlocks mt-2">
                            <h4 className='votePoolHeaderMainHeader'>Your Total Voting Power</h4>
                            <h5 className='votePoolHeaderSubHeader'>{ lockedRdlValue === null || isNaN(lockedRdlValue) ? "0": userVotingPower}</h5>
                        </div>
                    </div>
                </div>
        </div>

        <div className="voteMainInfoDiv">
            <div className="voteMainInfoCard">
                <p style={{textAlign:'center'}} className="mt-2">Solidly Gauge rewards for the week of <span style={{fontWeight:'bold'}}>{votingWeekDate}th {votingWeekMonth}</span> {votingWeekYear}, {localeTimezone}</p>
                <div className="row mt-4" style={{borderTop:'1px solid gainsboro',paddingTop:'20px'}}>
                    <div className='col-6' >Time Remaining</div>
                    <div className='col-6' style={{textAlign:'right'}}><CountDownTimer countDownDate={timer}/></div>
                </div>
            </div>
        </div>

        <div className="voteDepositDiv">
        <div className="voteDepositCard">
            <div className="d-flex justify-content-between align-items-center depositDiv" onClick={()=>setExpandDepositForm(!expandDepositForm)}>
                <div style={{fontWeight:'bold'}}>Deposit a new incentive</div>
                {
                    !expandDepositForm?
                    <img src={ArrowDown} onClick={()=>setExpandDepositForm(!expandDepositForm)} style={{cursor:'pointer'}} width="15" height="15" alt="arrowdown"/>:
                    <img src={ArrowDown} onClick={()=>setExpandDepositForm(!expandDepositForm)} style={{transform:"rotate(180deg)",cursor:'pointer'}} width="15" height="15" alt="arrowdown"/>
                }
            </div>
            <div className={expandDepositForm?"voteDepositCardMainBodyExpanded":"voteDepositCardMainBodySmall"}>
                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <div>Select token to whitelist : </div>
                        <input type="text" name="" id="" value={tokenAddress} onChange={(e)=>getPoolName(e.target.value)} placeholder='Enter token address' style={{width:'270px',paddingTop:"3px",paddingBottom:'3px', paddingLeft:'5px', paddingRight:'5px',outline:'disabled',borderRadius:'5px',border:'1px solid grey'}} />
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <div>Token name : </div>
                        <input type="text" name="" id="" value={tokenName} disabled placeholder='--' style={{width:'270px',paddingTop:"3px",paddingBottom:'3px', paddingLeft:'5px', paddingRight:'5px',outline:'disabled',borderRadius:'5px',border:'1px solid grey'}} />
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <div>Incentive provided : </div>
                        <input type="number" name="" id="" value={incentive} onChange={(e)=>{setIncentiveValue(e.target.value)}} placeholder='Incentive amount' style={{width:'270px',paddingTop:"3px",paddingBottom:'3px', paddingLeft:'5px', paddingRight:'5px',outline:'disabled',borderRadius:'5px',border:'1px solid grey'}} />
                    </div>
                    <div className='d-flex justify-content-end'>
                        {
                            appContext?.currentAccount !== null ?
                            <div>
                                <button onClick={()=> setMaxIncentive()} className='setToMax'>MAX</button> <span className='availableSupply'> | Available : {Math.trunc(availableFtm*10000)/10000}</span>
                            </div>:
                            <div>
                                <button disabled className='disabledSetToMax'>MAX</button> <span className='availableSupply'> | Available : 0</span>
                            </div> 
                        }
                    </div>
                    <div className="d-flex justify-content-center mt-4">
                        {
                            tokenName.length !== 0 && appContext.currentAccount!== null?
                            <button className='voteAproveButton' onClick={()=>{deposit()}}>Deposit</button>:
                            <button className='voteAproveButtonDisabled'>Deposit</button>
                        }
                    </div>
            </div>
        </div>
        </div>
        <div className="votePoolCardsDiv container-fluid">
            {
                poolList.length === 0?
                <div className='mt-5 pt-5' style={{fontWeight:'bold',textAlign:'center'}}>There are currently no incentives for this week.</div>:
                null
            }
            <div className="row justify-content-center">
                {
                    poolList.map((pool,index)=>{
                        return (
                            <div className="col-md-4 mb-4" key={index}>
                                <WhiteListIndividualComponent wFTMusdPrice={wFTMusdPrice}  openModal={openModal} index={index} poolData={pool} />
                            </div>
                        )
                    })
                }
            </div>
        </div>
        </div>
        {showModal ? <VotePopUpModalWhiteListPage setUpdateData={setUpdateData} currentWeek={currentWeek} userVotingPower={userVotingPower} setIsOpen={setIsOpen} modalData={poolList[modalIndex]}  /> : null}
        {showWithdrawModal ? <WithdrawModal incentivesList={incentivesList} setWithdrawModalIsOpen={setWithdrawModalIsOpen} pageType={"whitelist"} /> : null }
        <FooterComponentDark/>
    </div>
    )
}

export default WhiteListComponent