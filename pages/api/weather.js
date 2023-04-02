export default async function handler(req, res) {
    const { query } = req;

    const lat = query.lat
    const long = query.long
    const startdate = query.startdate
    const enddate = query.enddate
    const precipitation = query.precipitation

    // find days between startdate and enddate
    const date1 = new Date(startdate)
    const date2 = new Date(enddate)
    const diffTime = Math.abs(date2 - date1);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const requestUrl = `https://my.meteoblue.com/packages/historybasic-1h?lat=${lat}&lon=${long}&startdate=${startdate}&enddate=${enddate}&format=json&apikey=${process.env.NEXT_PUBLIC_METEOBLUE_API_KEY}`
    const response = await fetch(requestUrl)
    const data = await response.json()

    const historyArray = data["history_1h"]
    const precipitationArray = historyArray["precipitation"]
    const precipitationSum = precipitationArray.reduce((a, b) => a + b, 0)
    const precipitationAvg = precipitationSum / days
    console.log(`precipitationAvg: ${precipitationAvg}`)

    res.status(200).json(precipitationAvg > precipitation)
}