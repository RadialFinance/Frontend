import create from 'zustand';

export const totalDepositDataStore = create((set) => ({
    totalDeposit: [0],
    setTotalDeposit: async (value) =>{
        try {
            if(value !== 0 && value !== null){
                set((state)=>({totalDeposit:[...state.totalDeposit,value]}));
            }
        } catch (error) {
            console.log(error);
        }
    },
    resetTotalDeposit: () => {
        set({totalDeposit: []})
    }
}));

export const totalClaimableDataStore = create((set) => ({
    totalClaimable: [0],
    setTotalClaimable: async (value) =>{
        try {
            if(value !== 0 && value !== null){
                set((state)=>({totalClaimable:[...state.totalClaimable,value]}));
            }
        } catch (error) {
            console.log(error);
        }
    },
    resetTotalClaimable: () => {
        set({totalClaimable: []})
    }
}));