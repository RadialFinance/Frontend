import React, { useState,useContext,useEffect } from "react";
import './VotePopUpModal.css';
import AppContext from "../../AppContext";
import whiteListBribeManagerAbi from '../../../artifacts/WhitelistingBribeManager.json';
import configSC from '../../../artifacts/smartcontractConfig.json';
import BigNumber from "bignumber.js";
import toast, { Toaster } from 'react-hot-toast';

const VotePopUpModalWhiteListPage = (props) => {
    const appContext = useContext(AppContext);
    const [voteWeight, setVoteWeight] = useState('positive');
    const [votesValue,setVotesValue] = useState('');
    const [whiteListBribeManagerContract,setWhiteListBribeManagerContract] = useState(null);
    const [availableVotes,setAvailableVotes] = useState(null);


    useEffect(()=>{
      if(appContext?.web3 !== null){
        console.log(props?.modalData);
        const localWhitelistBribeManagerContract = new appContext.web3.eth.Contract(whiteListBribeManagerAbi,configSC.whitelistingBribeManagerAddress);
        setWhiteListBribeManagerContract(localWhitelistBribeManagerContract);
      }
    },[appContext?.web3])

    useEffect(()=>{
        let _votes = props?.userVotingPower-props?.modalData.usersVotesUsed;
        setAvailableVotes(_votes)
    },[props?.userVotingPower]);

    const handleChange = (e) => {
        setVoteWeight(e.target.value);
    };

    const setMaxIncentive = () => {
      setVotesValue(availableVotes);
    }

    const vote = () => {
        let _votesValue = votesValue; 
        if(voteWeight === "negative"){
          _votesValue = -Math.abs(_votesValue)
        }
        console.log(props?.modalData.pool,_votesValue.toString());
        const tx = whiteListBribeManagerContract.methods.vote(props?.modalData.pool,_votesValue.toString()).send({
            from: appContext.currentAccount
        });

        tx.on("transactionHash", () => {
          toast.loading("Transaction in progress",{position:'top-center'})
        });

        tx.on("confirmation", (confirmationNumber, receipt) => {
          if(confirmationNumber === 4){
            toast.remove();
            toast.success("Transaction successful",{position:'top-center'})
            props?.setIsOpen(false)
            props?.setUpdateData(Math.random())
          }
        });

        tx.on("error", (error)=>{
          toast.remove();
          toast.error("Transaction failed",{position:'top-center'});
        });
    }

  return (
    <>
      <div className="darkBG" onClick={() => props.setIsOpen(false)} />
      <div className="centered">
        <div className="modalPopUp">
            <p style={{fontWeight:'bold',textAlign:'center',fontSize:'0.9rem'}} className="mb-4">Voting to whitelist <span style={{color:'#BA7428'}}>{props.modalData.poolname}</span> token</p>
            <select onChange={handleChange} style={{paddingTop:"3px",paddingBottom:'3px', paddingLeft:'5px', paddingRight:'80px',outline:'disabled',borderRadius:'5px',border:'1px solid grey'}}>
                <option value="positive">Positive voting</option>
                <option value="negative">Negative voting</option>
            </select>
            <div className="d-flex justify-content-between align-items-center mt-4">
                <div>Votes : </div>
                <input type="number" value={votesValue} onChange={(e)=>{setVotesValue(e.target.value)}} name="" id="" placeholder='Enter the votes' style={{paddingTop:"3px",paddingBottom:'3px', paddingLeft:'5px', paddingRight:'33px',marginLeft:'3px',outline:'disabled',borderRadius:'5px',border:'1px solid grey',width:'195px'}} />
            </div>
            {
                appContext?.currentAccount !== null ?
                <div style={{marginRight:'-120px'}}>
                    <button onClick={()=> setMaxIncentive()} className='setToMax'>MAX</button> <span className='availableSupply'> | Available : {availableVotes}</span>
                </div>:
                <div style={{marginRight:'-130px'}}>
                    <button disabled className='disabledSetToMax'>MAX</button> <span className='availableSupply'> | Available : 0</span>
                </div> 
            }
            <div className="d-flex justify-content-center">
                {
                  votesValue?.length !== 0 && voteWeight.length !== 0 ?
                  availableVotes === "0"?<button className='voteOnCurveBtnDisabled' style={{width:'255px'}} disabled={true}>Vote</button>:
                  <button className='voteOnCurveBtn' style={{width:'255px'}} onClick={()=>{vote()}}>Vote</button>:
                  <button className='voteOnCurveBtnDisabled' style={{width:'255px'}} disabled={true}>Vote</button>
                }
            </div>
        </div>
      </div>
    </>
  );
};

export default VotePopUpModalWhiteListPage;