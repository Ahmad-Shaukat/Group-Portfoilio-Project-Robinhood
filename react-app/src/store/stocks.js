const ADD_STOCK = "/stocks/ADD_STOCK";
const GET_STOCK = "/stocks/GET_STOCK";

export const getStock = (symbol) => async dispatch => {
    const response = await fetch(`/api/stocks/historical_daily/${symbol}`);
    if(response.ok){
        const details = await response.json();
        console.log("FLAG", details)
        await dispatch(addStock(details));
        return details;
    }
}
export const addStock = (data) => {
    return {
        type: ADD_STOCK,
        payload: data
    }
}
export default function stockReducer(state = {}, action) {
    let newState = {};
    switch (action.type) {
        case ADD_STOCK:
            newState = {...state}
            newState[action.payload.symbol] = action.payload.historical.map(ele => {
                let thing = {
                    time: ele.date,
                    value: ele.close
                }
                return thing
            }).reverse();
            return newState
        default:
            return state
    }
}
