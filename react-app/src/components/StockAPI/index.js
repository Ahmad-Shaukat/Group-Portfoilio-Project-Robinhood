import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import Graph from "../Graph"
import { addStock, getStock } from "../../store/stocks";

export default function StockApi () {
    const dispatch = useDispatch()
    const [symbol, setSymbol] = useState("")

    let fav = useSelector(state => state.stocks[symbol]) || []

    const [initialData, setInitialData] = useState([
            { time: '2018-12-22', value: 32.51 },
            { time: '2018-12-23', value: 31.11 },
            { time: '2018-12-24', value: 27.02 },
            { time: '2018-12-25', value: 27.32 },
            { time: '2018-12-26', value: 25.17 },
            { time: '2018-12-27', value: 28.89 },
            { time: '2018-12-28', value: 25.46 },
            { time: '2018-12-29', value: 23.92 },
            { time: '2018-12-30', value: 22.68 },
            { time: '2018-12-31', value: 22.67 },
        ])

    const getIt = async () => {
        let it = await dispatch(getStock(symbol))

        return it
    }
    useEffect(() => {
        console.log(fav)
        if(fav && fav.length > 0)setInitialData(fav)
    }, [fav])

    const onSubmit = async (e) => {
        e.preventDefault()
        let them = await getIt()
        console.log("them", them)
        // dispatch(addStock(them))
        // setInitialData(fav)
    //     setInitialData(them.historical)
    //     console.log(initialData)
    }

    return (
    <div>
         <div>
            <form method="GET" onSubmit={onSubmit}>
                <div>
                    <input
                    type="text"
                    name="symbol"
                    onChange={e => setSymbol(e.target.value)}
                    value={symbol}
                    />
                </div>
                <div>
                    <button type="submit"> submit </button>
                </div>
            </form>
        </div>

            <Graph data={initialData}/>

            {/* {fav?.map(ele => {
                let thing = Object.values(ele)
                let ping = `|${thing[0]} at ${thing[1]}|`
                return ping
            })} */}
    </div>
    )
}
