import create from 'zustand';
import axios from 'axios';


let getLockDataStore = async(addy) =>{
    let data = JSON.stringify({
        query: `{
            locks(where: {
            user:"${addy}",
            lockType:RDL,
            locked_not: 0
            }) {
            locked
            }
            }`,
            variables: {}
        });
            
        var config = {
            method: 'post',
            url: 'https://api.thegraph.com/subgraphs/name/radialfinance/radial',
            headers: { 
                'Content-Type': 'application/json'
            },
            data : data
        };

        try {
            let response = await axios(config);
            return response;
        } catch (error) {
            console.log(error)
        }
        
}

export const rdlLockDataStore = create((set,get) => ({
    rdlLock: null,
    address:null,
    setRdlLockData: async (addy) =>{
        try {
            if(get().address !== addy){
                let _data = await getLockDataStore(addy);
                if(_data.data.data.locks.length>0){
                    set({address:addy});
                    set({rdlLock:_data.data.data.locks[0].locked})
                }
            }
        } catch (error) {
            console.log(error);
        }

    },
    refreshRdlLockData: async (addy) =>{
        try {
            let _data = await getLockDataStore(addy);
            if(_data.data.data.locks.length>0){
                set({address:addy});
                set({rdlLock:_data.data.data.locks[0].locked});
            }
        } catch (error) {
            console.log(error)
        }
    }
}));


let getRdlFtmLockedData = async(addy) =>{
    let data = JSON.stringify({
        query: `{
            locks(where: {
            user:"${addy}",
            lockType:RDL_FTM_LP,
            locked_not: 0
            }) {
            locked
            }
            }`,
            variables: {}
        });
            
        var config = {
            method: 'post',
            url: 'https://api.thegraph.com/subgraphs/name/radialfinance/radial',
            headers: { 
                'Content-Type': 'application/json'
            },
            data : data
        };
            
        try {
            let response = await axios(config);
            return response;
        } catch (error) {
            console.log(error)
        }
}


export const rdlFtmLockedDataStore = create((set,get) => ({
    rdlFtmLock: null,
    address:null,
    setRdlFtmLockData: async(addy) =>{
        if(get().address !== addy){
            try {
                let _data = await getRdlFtmLockedData(addy);
                if(_data.data.data.locks.length>0){
                    set({address:addy});
                    set({rdlFtmLock:_data.data.data.locks[0].locked});
                }
            } catch (error) {
                console.log(error);
            }
        }
    },
    refreshRdlFtmLockData: async (addy) =>{
        try {
            let _data = await getRdlFtmLockedData(addy);
            if(_data.data.data.locks.length>0){
                set({address:addy});
                set({rdlFtmLock:_data.data.data.locks[0].locked});
            }
        } catch (error) {
            console.log(error)
        }
    }
}));


//Total RDL and total LP tokens locked
export const rdlAndLpTokenLockedStore = create((set,get)=>({
    rdlAndLpTokenLocked:null,
    setRdlAndLpTokenLocked: ()=>{
        if(get().rdlAndLpTokenLocked===null){
            let data = JSON.stringify({
                query: `{
                      tvls(where:{
                          token_in:["0x79360aF49edd44F3000303ae212671ac94bB8ba7", "0x5ef8f0bd4F071B0199603a28ec9343F3651999c0"]
                      }) {
                          amount
                          depositType
                      }
                  }`,
                variables: {}
            });
              
            let config = {
                method: 'post',
                url: 'https://api.thegraph.com/subgraphs/name/radialfinance/radial',
                headers: { 
                  'Content-Type': 'application/json'
                },
                data : data
            };
              
            axios(config)
            .then(function (response) {
                set(({rdlAndLpTokenLocked:JSON.stringify(response.data)}))
            })
            .catch(function (error) {
                console.log(error);
            });
        }

    }
}));

//Total incentives for all pools this week

export const totalIncentiveForAllPoolsThisWeek = async(week) =>{
    let data = JSON.stringify({
        query: `{
        incentives(where:{
            week: ${week}
        }){
            amount
            pool
            totalRewardWeight
            type
            effectiveVotes
            passed
        }
        }`,
        variables: {}
        });

        let config = {
        method: 'post',
        url: 'https://api.thegraph.com/subgraphs/name/radialfinance/radial',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : data
        };

        try {
            let response = await axios(config);
            return response.data;
        } catch (error) {
            console.log(error);
        }
}


//list of the tokens
export const listofTokens = async(week) =>{
    
    let data = JSON.stringify({
    query: `{
        incentives(where:{
            week: ${week}
        }){
            amount
            pool
            totalRewardWeight
        }
        }`,
        variables: {}
    });

    let config = {
        method: 'post',
        url: 'https://api.thegraph.com/subgraphs/name/radialfinance/radial',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : data
    };

    try {
        let response = await axios(config);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}


export const fetchLockedTokenData = async(token_list) =>{
    // Fetch TVL
    let data = JSON.stringify({
    query: `{
        tvls(where:{
        token_in:${token_list}
        depositType:LOCKED
        }) {
        amount
        token
        }
    }`,
    variables: {}
    });

    
    let config = {
        method: 'post',
        url: 'https://api.thegraph.com/subgraphs/name/radialfinance/radial',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : data
    };
    
    try {
        let response = await axios(config);
        console.log(response);
        return response.data.data;
    } catch (error) {
        console.log(error);
    }
}

export const getStakedUserData = async(addy) => {
        let data = JSON.stringify({
        query: `{
            stakes(where: {
            amount_not:0,
            user:"${addy}"
            }) {
            token
            amount
            }
        }`,
        variables: {}
        });

        let config = {
        method: 'post',
        url: 'https://api.thegraph.com/subgraphs/name/radialfinance/radial',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : data
        };

        try {
            let response = await axios(config);
            return response.data.data.stakes;
        } catch (error) {
            console.log(error);
        }
}

export const getAllTvlStaked = async(tokenAddress) =>{
    //Get all tvls
        let data = JSON.stringify({
        query: `{
        tvls(where:{
            token_in:["${tokenAddress}"]
            depositType:STAKED
        }) {
            amount
        }
        }`,
        variables: {}
        });

        let config = {
        method: 'post',
        url: 'https://api.thegraph.com/subgraphs/name/radialfinance/radial',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : data
        };

        try {
            let response = await axios(config);
            return response.data.data.tvls[0].amount;
        } catch (error) {
            console.log(error);
        }
}


export const getAllPoolsHavingEarnings = async(addy)=>{
    let data = JSON.stringify({
        query: `{
        stakes(
            where:{
            user: "${addy}"
            amount_not: 0
            isClaimed: false
            }
        ) {
            token
                amount
        }
            locks(
            where:{
            user: "${addy}"
            lockType: RDL_FTM_LP
            }
        ) {
            locked
        }
        }`,
        variables: {}
        });

        let config = {
        method: 'post',
        url: 'https://api.thegraph.com/subgraphs/name/radialfinance/radial',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : data
        };

        try {
            let response = await axios(config);
            return response.data;
        } catch (error) {
            console.log(error);
        }
}


export const getTotalIncentivesForAllPoolsThisWeek = async(week) =>{
    let data = JSON.stringify({
    query: `{
    incentives(where:{
        week: ${week}
    }){
        amount
        pool
        totalRewardWeight
    }
    }`,
    variables: {}
    });

    let config = {
    method: 'post',
    url: 'https://api.thegraph.com/subgraphs/name/radialfinance/radial',
    headers: { 
        'Content-Type': 'application/json'
    },
    data : data
    };

    try {
        let response = await axios(config);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}


export const getEffectiveVotes = async(week,pool) => {
    let apiQuery = JSON.stringify({
    query: `{
        votes(where:{
        week:${week},
        token:"${pool}"
        }) {
        effectiveVotes
        }
    }`,
        variables: {}
    });
    
    let config = {
        method: 'post',
        url: 'https://api.thegraph.com/subgraphs/name/radialfinance/radial',
        headers: { 
        'Content-Type': 'application/json'
        },
        data : apiQuery
    };

    try {
        let response = await axios(config);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export const getEffectiveVotesForUser = async(week,pool,useraddy,isWhitelist) => {
    let type = "POOL";
    if(isWhitelist) {
        type = "WHITELIST";
    }
    let apiQuery = JSON.stringify({
    query: `{
        votes(where:{
        week:${week},
        token:"${pool}"
        user:"${useraddy}",
        type:"${type}"
        }) {
            effectiveVotes
            weightUsed
        }
    }`,
        variables: {}
    });
    
    let config = {
        method: 'post',
        url: 'https://api.thegraph.com/subgraphs/name/radialfinance/radial',
        headers: { 
        'Content-Type': 'application/json'
        },
        data : apiQuery
    };

    try {
        let response = await axios(config);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export const getWithrawableIncentives = async(currentWeek,addy) => {
    let data = JSON.stringify({
    query: `{
    incentives(where:{
        week_lt:${currentWeek},
        providedBy_contains: ["${addy}"],
        passed: false
    }) {
        week
        pool
        type
    }
    }`,
    variables: {}
    });
    
    let config = {
    method: 'post',
    url: 'https://api.thegraph.com/subgraphs/name/radialfinance/radial',
    headers: { 
        'Content-Type': 'application/json'
    },
    data : data
    };
    try {
        let response = await axios(config);
        return response.data.data.incentives;
    } catch (error) {
        console.log(error);
    }
}



//Query to get latest week user claimed in
export const rdlLatestWeekClaimed = async(user_addy) => {
    let data = JSON.stringify({
        query: `{
            rdlrewards(
              first: 1,
              orderBy: week,
              orderDirection: desc,
              where:{
                  user:"${user_addy}"
              }
            ) {
              week
            }
          }`,
        variables: {}
    });
    
    let config = {
        method: 'post',
        url: 'https://api.thegraph.com/subgraphs/name/radialfinance/radial',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : data
    };
      
    try {
        let response = await axios(config);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}


//Query to find all weeks in which user voted past the week we found is
export const allWeekWhichUserVoted = async(week,current_week,addy) =>{
    let data = JSON.stringify({
        query: `{
        votes(where:{
          week_gt: ${week},
          week_lt:${current_week},
          user: "${addy}"
        }) {
          week
        }
      }`,
        variables: {}
    });
      
    let config = {
        method: 'post',
        url: 'https://api.thegraph.com/subgraphs/name/radialfinance/radial',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : data
    };
      
    try {
        let response = await axios(config);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export const ftmIncentivesBasedOnVotesCastedByUser = async(weeks_number,pool_addy) =>{
    let data = JSON.stringify({
    query: `{
        incentives(where:{
            week:${weeks_number}
            pool:"${pool_addy}"
            passed:true
        }) {
            amount
            pool
            totalRewardWeight
            effectiveVotes
            type
            week
        }
    }`,
    variables: {}
    });

    let config = {
        method: 'post',
        url: 'https://api.thegraph.com/subgraphs/name/radialfinance/radial',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : data
    };

    try {
        let response = await axios(config);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export const usersUsedVotingPower = async(week,user_addy) => {
    let data = JSON.stringify({
        query: `{
          votes(where:{
          week:${week},
          user: "${user_addy}",
          type: "POOL"
        }) {
          token
          weightUsed
          type
        }
      }`,
        variables: {}
    });
      
    let config = {
        method: 'post',
        url: 'https://api.thegraph.com/subgraphs/name/radialfinance/radial',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
    };
      
    try {
        let response = await axios(config);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export const getwFTMusdValue = async() => {
    let data = JSON.stringify({
      query: `{
      pairs(where:{
        token0_in: [
          "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
          "0x04068da6c83afcfa0e13ba15a6696662335d5b75"
        ],
        token1_in:[
          "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
          "0x04068da6c83afcfa0e13ba15a6696662335d5b75"
        ]
      },
      orderBy: reserveUSD,
      orderDirection: desc,
      first: 1) {
        token0 {
          id
        }
        token1 {
          id
        }
        token0Price
        token1Price
      }
    }`,
      variables: {}
    });
    
    let config = {
      method: 'post',
      url: 'https://api.thegraph.com/subgraphs/name/deusfinance/solidly',
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data
    };
    
    try {
        let response = await axios(config);
        return response.data.data.pairs[0].token0Price;
    } catch (error) {
        console.log(error);
    }
}

export const getTokenPrice = async(tokenAddress) => {
    let data = JSON.stringify({
        query: `{
        pairs(where:{
            token0_in: [
                "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
                "${tokenAddress.toLowerCase()}"
            ],
            token1_in:[
                "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
                "${tokenAddress.toLowerCase()}"
            ]
        },
        orderBy: reserveUSD,
        orderDirection: desc,
        first: 1) {
          token0 {
            id
          }
          token1 {
            id
          }
          token0Price
          token1Price
        }
      }`,
        variables: {}
      });
      
      let config = {
        method: 'post',
        url: 'https://api.thegraph.com/subgraphs/name/deusfinance/solidly',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };
      
      try {
          let response = await axios(config);
          return response.data.data;
      } catch (error) {
          console.log(error);
      }
}

export const getClaimsPageTokenUsdPrice = async() => {
    let data = JSON.stringify({
    query: `{
        pairs(where:{
            token0_in: [
            "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
            "0x888ef71766ca594ded1f0fa3ae64ed2941740a20",
            "0x79360af49edd44f3000303ae212671ac94bb8ba7",
            "0x04068da6c83afcfa0e13ba15a6696662335d5b75"
            ],
            token1_in:[
            "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
            "0x888ef71766ca594ded1f0fa3ae64ed2941740a20",
            "0x79360af49edd44f3000303ae212671ac94bb8ba7",
            "0x04068da6c83afcfa0e13ba15a6696662335d5b75"
            ]
        }) {
            token0 {
            id
            }
            token1 {
            id
            }
            token0Price
            token1Price
            reserveUSD
        }
    }`,
    variables: {}
    });

    let config = {
    method: 'post',
    url: 'https://api.thegraph.com/subgraphs/name/deusfinance/solidly',
    headers: { 
        'Content-Type': 'application/json'
    },
    data : data
    };

    try {
        let response = await axios(config);
        return response.data.data;
    } catch (error) {
        console.log(error);
    }

}

export const getWeeksForWhichIncentiveArePending = async(user_addy)=>{
    let data = JSON.stringify({
        query: `{
        votes(
        where:{
            bribeClaimed: false,
            user: "${user_addy}"
        },
            orderBy: week
            orderDirection: desc
        ) {
            week
            token
            effectiveVotes
            weightUsed
        }
        }`,
        variables: {}
    });

    let config = {
        method: 'post',
        url: 'https://api.thegraph.com/subgraphs/name/radialfinance/radial',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : data
    };

    try {
        let response = await axios(config);
        return response.data.data;
    } catch (error) {
        console.log(error);
    }
}


export const getTokenPriceInUSD = async(tokenAddress) =>{
    return 1;
}

