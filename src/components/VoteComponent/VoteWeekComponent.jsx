import React,{useState,useEffect, useContext} from 'react';
import ArrowIcon from '../../assets/images/arrowleft.svg';
import ArrowDown from '../../assets/images/arrowdown.svg'
import CountDownTimer from './CountDownTimer';
import poolBribeManagerAbi from '../../artifacts/PoolBribeManager.json';
import AppContext from '../AppContext';
import BigNumber from 'bignumber.js';
import Swal from 'sweetalert2';
import lpPoolAbi from '../../artifacts/Token.json';
import configSC from '../../artifacts/smartcontractConfig.json';
import toast, { Toaster } from 'react-hot-toast';
import solidlyVoterAbi from '../../artifacts/SolidlyVoter.json';
const starttime = configSC.starttime;
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May","Jun","Jul", "Aug", "Sep", "Oct", "Nov","Dec"];

const pool = [
    { label: 'cvxeth', value: 'cvxeth' },
    { label: 'f-cvxcrv', value: 'f-cvxcrv' },
    { label: 'f-cvxfxs', value: 'f-cvxfxs' },
];

function VoteWeekComponent(props) {
    let appContext = useContext(AppContext);
    let [expandDepositForm,setExpandDepositForm] = useState(false);
    let [currentWeekDate,setCurrentWeekDate] = useState(null);
    let [currentWeekMonth,setCurrentWeekMonth] = useState(null);
    let [currentWeekYear,setCurrentWeekYear] = useState(null);
    let [nextWeekDate,setNextWeekDate] = useState(null);
    let [nextWeekMonth,setNextWeekMonth] = useState(null);
    let [prevWeekDate,setPrevWeekDate] = useState(null);
    let [prevWeekMonth,setPrevWeekMonth] = useState(null);
    let [voteTimer,setVoteTimer] = useState(null);
    let [depositTimer,setDepositTimer] = useState(null);
    const [localeTimezone,setLocaleTimezone] = useState(null);
    const [poolBribeManagerContract,setPoolBribeManagerContract] = useState(null);
    const [lpPoolContract,setLpPoolContract] = useState(null);
    const [tokenName,setTokenName] = useState('');
    const [tokenAddress,setTokenAddress] = useState('');
    const [availableFtm,setAvailableFtm] = useState(0);
    const [incentive,setIncentiveValue] = useState('');

    const getTime = () =>{
        return Math.floor( Date.now() / 1000 );
    }

    const getWeek = () =>{
        let time = getTime();
        return (time - starttime)/604800;
    }

    function getNextWeek(today){
        let nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate()+7);
        return nextweek
    }

    function getPreviousWeek(today){
        let prevweek = new Date(today.getFullYear(), today.getMonth(), today.getDate()-7);
        return prevweek
    }

    useEffect(() => {
        let startTimeDate = new Date(starttime*1000);
        console.log("Current week:"+props?.weekCount);
        setLocaleTimezone(startTimeDate.toLocaleString('en-US', { hour: 'numeric', hour12: true })+" "+startTimeDate.toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2])
        let currentOngoingWeek = new Date(startTimeDate.getUTCFullYear(),startTimeDate.getUTCMonth(), startTimeDate.getUTCDate()+(7*(props?.weekCount+1)));
        console.log(currentOngoingWeek);
        let votingWeek = new Date(currentOngoingWeek.getFullYear(),currentOngoingWeek.getMonth(), currentOngoingWeek.getDate()+7);
        setCurrentWeekDate(currentOngoingWeek.getDate());
        setCurrentWeekMonth(monthNames[currentOngoingWeek.getMonth()]);
        setCurrentWeekYear(currentOngoingWeek.getFullYear());
        props?.setWeek(`${currentOngoingWeek.getDate()} ${monthNames[currentOngoingWeek.getMonth()]}, ${currentOngoingWeek.getFullYear()} 00:00:00 UTC`);
        props?.setOngoingWeek(`${currentOngoingWeek.getDate()} ${monthNames[currentOngoingWeek.getMonth()]}, ${currentOngoingWeek.getFullYear()} 00:00:00 UTC`);
        let nextWeek = getNextWeek(currentOngoingWeek);
        setNextWeekDate(nextWeek.getDate());
        setNextWeekMonth(monthNames[nextWeek.getMonth()]);
        setVoteTimer(`${currentOngoingWeek.getDate()} ${monthNames[currentOngoingWeek.getMonth()]}, ${currentOngoingWeek.getFullYear()} 00:00:00 UTC`)
        let prevWeek = getPreviousWeek(currentOngoingWeek);
        setPrevWeekDate(prevWeek.getDate());
        setPrevWeekMonth(monthNames[prevWeek.getMonth()]);
    }, [props?.weekCount])


    let nextWeek = () => {
        let _weekCount = props?.weekCount+1
        props?.setWeekCount(props?.weekCount+1);
        let _week = new Date(props?.week);
        console.log(_week);
        let nextWeek = getNextWeek(_week);
        props?.setWeek(`${nextWeek.getDate()} ${monthNames[nextWeek.getMonth()]}, ${nextWeek.getFullYear()} 00:00:00 UTC`);
        setCurrentWeekDate(nextWeek.getDate());
        setCurrentWeekMonth(monthNames[nextWeek.getMonth()]);
        setCurrentWeekYear(nextWeek.getFullYear());
        let nextWeekSign = getNextWeek(nextWeek);
        setNextWeekDate(nextWeekSign.getDate());
        setNextWeekMonth(monthNames[nextWeekSign.getMonth()]);
        let prevWeekSign = getPreviousWeek(nextWeek);
        setPrevWeekDate(prevWeekSign.getDate());
        setPrevWeekMonth(monthNames[prevWeekSign.getMonth()]);
        setDepositTimer(`${_week.getDate()} ${monthNames[_week.getMonth()]}, ${_week.getFullYear()} 00:00:00 UTC`);
    }

    let previousWeek = () => {
        props?.setWeekCount(props?.weekCount-1);
        let _week = new Date(props?.week);
        let prevWeek = getPreviousWeek(_week);
        props?.setWeek(`${prevWeek.getDate()} ${monthNames[prevWeek.getMonth()]}, ${prevWeek.getFullYear()} 00:00:00 UTC`);
        setCurrentWeekDate(prevWeek.getDate());
        setCurrentWeekMonth(monthNames[prevWeek.getMonth()]);
        setCurrentWeekYear(prevWeek.getFullYear());
        let nextWeekSign = getNextWeek(prevWeek);
        setNextWeekDate(nextWeekSign.getDate());
        setNextWeekMonth(monthNames[nextWeekSign.getMonth()]);
        let prevWeekSign = getPreviousWeek(prevWeek);
        setPrevWeekDate(prevWeekSign.getDate());
        setPrevWeekMonth(monthNames[prevWeekSign.getMonth()]);
        setDepositTimer(`${prevWeekSign.getDate()} ${monthNames[prevWeekSign.getMonth()]}, ${prevWeekSign.getFullYear()} 00:00:00 UTC`);
    }

    useEffect(()=>{
        (async()=>{
            if(appContext?.web3 !== null){
                //Setting up contracts
                const localPoolBribeManagerContract = new appContext.web3.eth.Contract(poolBribeManagerAbi,configSC.poolBribeManagerAddress);
                setPoolBribeManagerContract(localPoolBribeManagerContract);
                if(appContext?.currentAccount !== null){
                    let balance = await appContext.web3.eth.getBalance(appContext.currentAccount);
                    let convertedBalance = await appContext.web3.utils.fromWei(balance, 'ether');
                    setAvailableFtm(convertedBalance);
                }
            }
        })();
    },[appContext?.web3])

    const getPoolName = async (tokenAddress) =>{
        setTokenAddress(tokenAddress);
        if(tokenAddress.length === 42){
            console.log(appContext);
                if(appContext?.web3 !== null){
                        const localLpPoolContract = new appContext.web3.eth.Contract(lpPoolAbi,tokenAddress);
                        setLpPoolContract(localLpPoolContract);
                        const solidlyVoterContract = new appContext.web3.eth.Contract(solidlyVoterAbi,configSC.SolidlyVoter);
                        solidlyVoterContract.methods.gauges(tokenAddress).call().then((gauges)=>{
                            if (gauges !== "0x0000000000000000000000000000000000000000"){
                                localLpPoolContract.methods.name().call().then((tokenname)=>{
                                    setTokenName(tokenname);
                                });
                            }
                            else{
                                toast.error("Needs to be a pool.",{position:'top-center'})
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

    const deposit = () => {
        let _value = BigNumber(incentive).times(BigNumber(10).pow(18)).toFixed(0);
        console.log(tokenAddress,props?.weekCount,_value);
        const tx = poolBribeManagerContract.methods.deposit(tokenAddress,props?.weekCount,_value).send({
            from: appContext.currentAccount,
            value:_value
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

    let setMaxIncentive = () => {
        setIncentiveValue(availableFtm);
    } 

    return (
    <>
        <div className="voteWeekSwitcherDiv">
        
            <div className='row' style={{width:'42vw',textAlign:'center'}}>
                <div className='col-6'> 
                {
                    props?.ongoingWeekNumber !== props?.weekCount ? 
                    <div onClick={previousWeek} className="weekNavHolder">
                        Week of {prevWeekDate}th {prevWeekMonth}
                        <img src={ArrowIcon} className="arrowIcons" alt='arrow' style={{height:'20px',marginLeft:'10px'}}  />
                    </div> :
                    null
                }
                </div>
                <div className='col-6'>
                    {
                        props?.weekCount-props?.ongoingWeekNumber < 5 ?
                        <div onClick={nextWeek} className="weekNavHolder">
                            <img src={ArrowIcon} className="arrowIcons" alt='arrow' style={{height:'20px',marginRight:'10px',transform:"rotate(180deg)"}} />
                            Week of {nextWeekDate}th {nextWeekMonth}
                        </div>:null
                    }
                </div>
            </div>
        </div>
        <div className="voteMainInfoDiv">
            <div className="voteMainInfoCard">
                <p style={{textAlign:'center'}} className="mt-2">Solidly Gauge rewards for the week of <span style={{fontWeight:'bold'}}>{currentWeekDate}th {currentWeekMonth} </span>{currentWeekYear}, {localeTimezone}</p>
                <div className="row mt-4">

                    {
                        props?.ongoingWeekNumber === props?.weekCount ?
                        <div className='col-6'>Depositing period completed</div>:
                        <div className='col-6'>Time remaining to deposit incentives</div>
                    }
                    {
                        props?.ongoingWeekNumber === props?.weekCount ? 
                        <div className='col-6' style={{textAlign:'right'}}>00:00:00:00</div>
                         :
                        <div className='col-6' style={{textAlign:'right'}}><CountDownTimer countDownDate={depositTimer}/></div>
                    }
                </div>
                {
                    props?.ongoingWeekNumber === props?.weekCount?
                    <div className="row mt-4" style={{borderTop:'1px solid gainsboro',paddingTop:'20px'}}>
                        <div className='col-6' >Time Remaining to Vote</div>
                        <div className='col-6' style={{textAlign:'right'}}><CountDownTimer countDownDate={voteTimer}  /></div>
                    </div>:null
                }

            </div>
        </div>
        {
            props?.ongoingWeekNumber === props?.weekCount?
            null:
            <div className="voteDepositDiv">
            <div className="voteDepositCard">
                <div className="d-flex justify-content-between align-items-center depositDiv" onClick={()=>setExpandDepositForm(!expandDepositForm)}>
                    <div style={{fontWeight:'bold'}}>Deposit a new incentive</div>
                    {
                        !expandDepositForm?
                        <img src={ArrowDown}  style={{cursor:'pointer'}} width="15" height="15" alt="arrowdown"/>:
                        <img src={ArrowDown}  style={{transform:"rotate(180deg)",cursor:'pointer'}} width="15" height="15" alt="arrowdown"/>
                    }
                </div>
                <div className={expandDepositForm?"voteDepositCardMainBodyExpanded":"voteDepositCardMainBodySmall"}>
                <div className="d-flex justify-content-between align-items-center mt-4">
                        <div>Token address : </div>
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
                                <button onClick={()=> setMaxIncentive()} className='setToMax'>MAX</button> <span className='availableSupply'> | Available : {parseFloat(availableFtm).toFixed(4)}</span>
                            </div>:
                            <div>
                                <button disabled className='disabledSetToMax'>MAX</button> <span className='availableSupply'> | Available : 0</span>
                            </div> 
                        }
                    </div>
                    <div className="d-flex justify-content-center mt-4">
                        {
                            tokenName.length !== 0 && appContext?.currentAccount !== null ?
                            <button className='voteAproveButton' onClick={()=>{deposit()}}>Deposit</button>:
                            <button className='voteAproveButtonDisabled'>Deposit</button>
                        }
                    </div>
                </div>
            </div>
            </div>
        }
    </>

  )
}

export default VoteWeekComponent