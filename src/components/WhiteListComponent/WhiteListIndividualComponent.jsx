import React,{useEffect,useState,useContext} from 'react'
import ReactTooltip from "react-tooltip";
import InfoIcon from '../../assets/images/info.svg';
import ProgressBar from '@ramonak/react-progress-bar';
import { getEffectiveVotes, getEffectiveVotesForUser } from '../../stores/apistore';
import BigNumber from 'bignumber.js';
import AppContext from '../AppContext';
import configSC from '../../artifacts/smartcontractConfig.json';
import whiteListBribeManagerAbi from '../../artifacts/WhitelistingBribeManager.json';
import toast, { Toaster } from 'react-hot-toast';
const starttime = configSC.starttime;


const getTime = () =>{
    return Math.floor( Date.now() / 1000 );
}

const getWeek = () =>{
    let time = getTime();
    return (time - starttime)/604800;
}

function WhiteListIndividualComponent(props) {
    let currentWeek = Math.ceil(getWeek());
    let appContext = useContext(AppContext);
    let [votesPercentage,setVotesPercentage] = useState(0);
    let [totalVotesReceived,setTotalVotesReceived] = useState(0);
    let [rewardValueInUsd,setRewardValueInUsd] = useState(0);
    let [dollarVoteValue,setDollarVoteValue] = useState(0);
    let [userVoteWeight,setUserVoteWeight] = useState(0);
    let [voteRewards,setVoteRewards] = useState(0);

    let bigNumberConversion = (value) => {
        return BigNumber(value).div(BigNumber(10).pow(18));
    }

    useEffect(()=>{
        let votes_received = props?.poolData.effectiveVotes;
        setTotalVotesReceived(votes_received);
        let _percentage = (votes_received/500000)*100;
        if(_percentage>0.1){
            setVotesPercentage(_percentage.toFixed(0));
        }
        let _usdValue = (((bigNumberConversion(props?.poolData.amount)).toFixed(5))*props?.wFTMusdPrice).toFixed(6);
        setRewardValueInUsd(_usdValue);
        let _usdVote = _usdValue/props?.poolData.totalRewardWeight;
        setDollarVoteValue(_usdVote);
        let _userVoteWeight = props?.poolData.usersEffectiveVotes;
        setUserVoteWeight(_userVoteWeight);
        let _voteRewards = _userVoteWeight*_usdVote;
        setVoteRewards(_voteRewards);
    },[props?.poolData,appContext?.currentAccount,props?.wFTMusdPrice]);

    const whiteListPool = (pool_addy) => {
        const localWhiteListBribeManagerContract = new appContext.web3.eth.Contract(whiteListBribeManagerAbi,configSC.whitelistingBribeManagerAddress);
        const tx = localWhiteListBribeManagerContract.methods.whitelist(pool_addy).send({
            from: appContext.currentAccount
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
    <div className="votePoolCard">
        <div className="votePoolCardHeader">
            <div className='incentiveName'>$FTM incentive</div>
            <div className='incentiveSubText'>for <span style={{fontWeight:'bold'}}>"{props?.poolData.poolname}"</span> pool</div>
        </div>
        <div className='d-flex justify-content-center' style={{width:'100%'}}>
            <div className='mt-2 mb-3' style={{textAlign:'center',color:'#646965',fontSize:'0.9rem',width:'270px'}}>
                <span>Votes Received</span>
                <ProgressBar 
                    completed={votesPercentage}
                    bgColor="limegreen"
                    labelColor="black"
                    labelSize="12px"
                    labelAlignment='outside'
                    maxCompleted={100}
                />
                <span>Total votes received: {totalVotesReceived} RDL </span>
            </div>
        </div>

        <div className="d-flex justify-content-center" style={{marginTop:'-20px',marginBottom:'10px'}}>
        {
            (votesPercentage >= 100 && appContext.currentAccount !== null) && props?.poolData.passed === false?
            <button className='voteOnCurveBtn' onClick={()=>whiteListPool(props?.poolData.pool)}>Whitelist Token</button>:null
            
        }
        </div>
        <div>
        </div>
        <div className="d-flex justify-content-between votePoolCardRow">
            <div className='poolcardRowTitle'>Total rewards</div>
            <div>{ (BigNumber(props?.poolData.amount)/BigNumber(10).pow(18)).toFixed(3)  } FTM </div>
        </div>
        <div className="d-flex justify-content-between votePoolCardRow">
            <div className='poolcardRowTitle'>In $USD</div>
            <div>$ { rewardValueInUsd } </div>
        </div>
        <div className="d-flex justify-content-between votePoolCardRow">
            <div className='poolcardRowTitle'>$/vote 
            <img src={InfoIcon} alt="Info" style={{marginLeft:'5px'}} width={20} height={20} data-tip data-for="dollarvote" />
            <ReactTooltip id="dollarvote" place="right" effect="solid">
                The $/vote is subject to change as more votes are received.
            </ReactTooltip>
            </div>
            <div>
                {
                    dollarVoteValue !== Infinity && isNaN(dollarVoteValue) === false?
                    dollarVoteValue.toFixed(5):
                    "0.00"
                }
                </div>
        </div>
        <div className="d-flex justify-content-between votePoolCardRow">
            <div className='poolcardRowTitle'>Your vote weight</div>
            <div>{userVoteWeight}</div>
        </div>
        <div className="d-flex justify-content-between votePoolCardRow">
            <div className='poolcardRowTitle'>Your vote reward
            <img src={InfoIcon} alt="Info" style={{marginLeft:'5px'}} width={20} height={20} data-tip data-for="votereward" />
            <ReactTooltip id="votereward" place="right" effect="solid">
                Vote rewards is subject to change as more votes are received.
            </ReactTooltip>
            </div>
            <div>
                $ {
                    isNaN(voteRewards) || isFinite(voteRewards) === false || voteRewards < 0 ?
                    "0":
                    parseFloat(voteRewards).toFixed(3)
                }
        </div>
        </div>
        <div className="d-flex justify-content-center">
            {
                props?.poolData.passed === false && votesPercentage < 100?
                appContext?.currentAccount ?
                <button className='voteOnCurveBtn' onClick={()=>props?.openModal(props?.index)}>Vote</button>:
                <button className='voteOnCurveBtnDisabled' disabled>Vote</button>:
                <div style={{marginTop:"35px",marginBottom:"8px",fontWeight:'bold'}}>Token Whitelisted</div>
            }
            
        </div>
    </div>
  )
}

export default WhiteListIndividualComponent