const FACTOR_SIX = Number(10 ** 6);
const FACTOR_EIGHT = Number(10 ** 8);
const BASE_URL = "https://kava4.data.kava.io";

var usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const KAVA_DENOM = "ukava";
const HARD_DENOM = "hard";
const USDX_DENOM = "usdx";
const BNB_DENOM = "bnb";

var getKavaPrice = async () => {
  const priceURL = "https://api.binance.com/api/v3/ticker/24hr?symbol=KAVAUSDT";
  const priceResponse = await fetch(priceURL);
  const priceData = await priceResponse.json();
  return {
    price: priceData.lastPrice,
    percentChange: priceData.priceChangePercent
  }
}

var getValueRewardsDistributed = async (kavaPrice) => {
  const rewardPeriodsURL = BASE_URL + "/incentive/rewardperiods";
  const rewardPeriodsRepsonse = await fetch(rewardPeriodsURL);
  const rewardPeriodsData = await rewardPeriodsRepsonse.json();

  const rewardsStartTime = new Date("2020-07-29T14:00:14.333506701Z");
  const millisecondsRewardActive = Date.now() - rewardsStartTime.getTime();
  const secondsRewardActive = millisecondsRewardActive / 1000;

  let kavaDistributed = 0;
  if(rewardPeriodsData.result) {
    let bnbRewardPeriod = rewardPeriodsData.result.find(
      (item) => item.collateral_type === "bnb-a"
    )
    const ukavaRewardsPerSecond = bnbRewardPeriod.reward.amount;
    const ukavaDistributed = Number(ukavaRewardsPerSecond) * Number(secondsRewardActive);
    kavaDistributed = ukavaDistributed / FACTOR_SIX;
  }

  const totalRewardValue = Number(kavaDistributed) * Number(kavaPrice)
  return totalRewardValue;
}

var getPrices = async () => {
  var prices = [];

  const usdxPrice = {name: USDX_DENOM, price: 1};
  prices.push(usdxPrice);

  const hardMarketResponse = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=HARDUSDT");
  const hardMarketData = await hardMarketResponse.json();
  const hardPrice = {name: HARD_DENOM, price: Number(hardMarketData.lastPrice)};
  prices.push(hardPrice);

  const kavaMarketResponse = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=KAVAUSDT");
  const kavaMarketData = await kavaMarketResponse.json();
  const kavaPrice = {name: KAVA_DENOM, price: Number(kavaMarketData.lastPrice)};
  prices.push(kavaPrice);

  const bnbMarketResponse = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BNBUSDT");
  const bnbMarketData = await bnbMarketResponse.json();
  const bnbPrice = {name: BNB_DENOM, price: Number(bnbMarketData.lastPrice)};
  prices.push(bnbPrice);

  return prices;
}

var getTotalValues = async (prices) => {
  var conversionMap = new Map();
  conversionMap.set(USDX_DENOM, 10 ** 6);
  conversionMap.set(KAVA_DENOM, 10 ** 6);
  conversionMap.set(HARD_DENOM, 10 ** 6);
  conversionMap.set(BNB_DENOM, 10 ** 8);

  const response = await fetch("https://kava4.data.kava.io/harvest/accounts");
  const data = await response.json();
  const results = data && data.result;

  var totalValues = [];
  if(results && results.length > 0) {
    const harvestAccAddress = "kava16zr7aqvk473073s6a5jgaxus6hx2vn5laum9s3"
    const harvestAcc =  results.find((item) => item.value.address === harvestAccAddress);
    const coins = harvestAcc.value.coins;
    for(coin of coins) {
      const supply = Number(coin.amount)/conversionMap.get(coin.denom);
      const price = prices.find((item) => item.name === coin.denom).price;
      const value = supply * Number(price);
      totalValues.push({denom: coin.denom, total_value: value});
    }
  }
  return totalValues
}

var updateDisplayValues = async() => {
  const hardTokenPrice = 0.85;
  const rawTotalHardDist = await getTotalHardAvailable();
  const displayTotalHardDist = usdFormatter.format(rawTotalHardDist*hardTokenPrice);
  const totalHardDistUSDValue = displayTotalHardDist.slice(0, displayTotalHardDist.length);
  document.getElementById("total-hard-dist").innerHTML = totalHardDistUSDValue;

  const prices = await getPrices();
  const totalValues = await getTotalValues(prices);
  const bnbValue = totalValues.find((item) => item.denom === BNB_DENOM).total_value;
  document.getElementById("TL-BNB").innerHTML = usdFormatter.format(bnbValue);

  const kavaValue = totalValues.find((item) => item.denom === KAVA_DENOM).total_value;
  document.getElementById("TL-KAVA").innerHTML = usdFormatter.format(kavaValue);

  const usdxValue = totalValues.find((item) => item.denom === USDX_DENOM).total_value;
  document.getElementById("TL-USDX").innerHTML = usdFormatter.format(usdxValue);

  const hardValue = totalValues.find((item) => item.denom === HARD_DENOM);
  if(hardValue) {
    document.getElementById("TL-HARD").innerHTML = usdFormatter.format(hardValue.total_value);
  }

  const totalValue = bnbValue + kavaValue + usdxValue;
  document.getElementById("TAV").innerHTML = usdFormatter.format(totalValue);
}

var getTotalHardClaimed = async () => {
  let modAccBalances = 0;
  const baseUrl = "https://kava4.data.kava.io/auth/accounts/";
  const harvestLPDistModAcc = "kava1nzenvfcapyjr9qe3cr3c5k2aucssg6wnknlvll";
  const harvestDelegatorDistModAcc = "kava1e3qvdzau5ww0m43d00gqj0ncgy8j03ndge6c2c";
  const harvestModAccs = [harvestLPDistModAcc, harvestDelegatorDistModAcc]
  for(modAcc of harvestModAccs) {
    const response = await fetch(baseUrl + modAcc);
    const data = await response.json();
    const result = data && data.result;
    const hardCoin = result.value.coins.find((item) => item.denom.toUpperCase() === "HARD");
    modAccBalances += Number(hardCoin.amount);
  }

  const totalAvailableHard = 120000000; // 120 million
  const undistributedHard = modAccBalances / 10 ** 6;
  return totalAvailableHard  - undistributedHard;
}

var getTotalHardAvailable = async () => {
  const harvestParamsUrl = "https://kava4.data.kava.io/harvest/parameters";
  const harvestParamsResponse = await fetch(harvestParamsUrl);
  const harvestData = await harvestParamsResponse.json();

  let totalHardDist = 0;
  if(harvestData.result) {
    for(lps of harvestData.result.liquidity_provider_schedules) {
      const startTime = Date.parse(lps.start);
      const currentTime = Date.now();
      const msDuration = currentTime - startTime;
      const secDuration = msDuration/1000;
      const rewardsDistToDate = secDuration * Number(lps.rewards_per_second.amount);

      totalHardDist += rewardsDistToDate;
    }
  }
  return totalHardDist / 10 ** 6;
}

var main = async () => {
  await updateDisplayValues();
  await sleep(60000);
  main()
}

var sleep = (ms = 10000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main();

setTimeout(async function(){
  const priceData = await getKavaPrice();
  await getValueRewardsDistributed(Number(priceData.price));
  // const show = 630550.20123;
  odometer.innerHTML = usdRewardsDistributed;
}, 2000);

window.odometerOptions = {
  auto: false, // Don't automatically initialize everything with class 'odometer'
  selector: '.my-numbers', // Change the selector used to automatically find things to be animated
  format: '(,ddd).dd', // Change how digit groups are formatted, and how many digits are shown after the decimal point
  duration: 3000, // Change how long the javascript expects the CSS animation to take
};
