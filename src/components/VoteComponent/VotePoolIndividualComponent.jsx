import React,{useEffect,useState,useContext} from 'react'
import ReactTooltip from "react-tooltip";
import InfoIcon from '../../assets/images/info.svg';
import ProgressBar from '@ramonak/react-progress-bar';
import { getEffectiveVotes, getEffectiveVotesForUser } from '../../stores/apistore';
import BigNumber from 'bignumber.js';
import AppContext from '../AppContext';
import configSC from '../../artifacts/smartcontractConfig.json';
const starttime = configSC.starttime;
const ftmPrice = 0.3;

const getTime = () =>{
    return Math.floor( Date.now() / 1000 );
}

const getWeek = () =>{
    let time = getTime();
    return (time - starttime)/604800;
}

function VotePoolIndividualComponent(props) {
    let appContext = useContext(AppContext);
    let [rewardValueInUsd,setRewardValueInUsd] = useState(0);
    let [dollarVoteValue,setDollarVoteValue] = useState(0);
    let [userVoteWeight,setUserVoteWeight] = useState(0);
    let [voteRewards,setVoteRewards] = useState(0);

    let bigNumberConversion = (value) => {
        return BigNumber(value).div(BigNumber(10).pow(18));
    }

    useEffect(()=>{
        let _usdValue = (((bigNumberConversion(props?.poolData.amount)).toFixed(5))*props?.wFTMusdPrice).toFixed(6);
        setRewardValueInUsd(_usdValue);
        let _usdVote = _usdValue/props?.poolData.totalRewardWeight;
        setDollarVoteValue(_usdVote);
        let _userVoteWeight = props?.poolData.usersEffectiveVotes;
        setUserVoteWeight(_userVoteWeight);
        let _voteRewards = _usdVote*_userVoteWeight;
        setVoteRewards(_voteRewards);
    },[props?.poolData,appContext?.currentAccount,props?.wFTMusdPrice]);

    return (
    <div className="votePoolCard">
        <div className="votePoolCardHeader">
            <div className='incentiveName'>$FTM incentive</div>
            <div className='incentiveSubText'>for <span style={{fontWeight:'bold'}}>"{props?.poolData.poolname}"</span> pool</div>
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
                    isNaN(dollarVoteValue) || isFinite(dollarVoteValue) === false?
                    "0.00":
                    dollarVoteValue.toFixed(5)
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
                appContext?.currentAccount !== null && props?.weekCount === props?.ongoingWeekNumber?
                <button className='voteOnCurveBtn' onClick={()=>props?.openModal(props?.index)}>Vote</button>:
                <button className='voteOnCurveBtnDisabled' disabled>Vote</button>
            }
            
        </div>
    </div>
  )
}

export default VotePoolIndividualComponent