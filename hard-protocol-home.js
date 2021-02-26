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
const BTC_DENOM = 'btcb';
const XRP_DENOM = 'xrpb';
const BUSD_DENOM = 'busd';

function formatNumbers(input, fixed = 2){
  return (Number(input).toFixed(fixed).toString()).replace(
    /^([-+]?)(0?)(\d+)(.?)(\d+)$/g, function(match, sign, zeros, before, decimal, after) {
      var reverseString = function(string) { return string.split('').reverse().join(''); };
      var insertCommas  = function(string) {
        var reversed           = reverseString(string);
        var reversedWithCommas = reversed.match(/.{1,3}/g).join(',');
        return reverseString(reversedWithCommas);
      };
      return sign + (decimal ? insertCommas(before) + decimal + after : insertCommas(before + after));
    }
  );
};

var getBalanceForDenom = (denom, balances) => {
  const balance =  balances.find(b => b.denom === denom);
  return balance ? Number(balance.amount) : 0.00
};

function rewardPeriodsPerYear(rewardsPerSecond) {
  const secondsPerYear = Number(31536000);
  return (secondsPerYear * Number(rewardsPerSecond)) / 10 ** 6
}

var formatPercentage = (value) => {
  return value +"%"
};

var convertToCoin = (balance) => {
  const coinDenom = balance.denom;
  const coinAmount = Number(balance.amount);
  let amount;
  switch(coinDenom) {
    case 'bnb':
      amount = coinAmount / (10 ** 8);
      break;
    case 'btcb':
      amount = coinAmount / (10 ** 8);
      break;
    case 'xrpb':
      amount = coinAmount / (10 ** 8);
      break;
    case 'busd':
      amount = coinAmount / (10 ** 8);
      break;
    default:
      amount = coinAmount / (10 ** 6);
  }
  return amount;
};

var getModuleBalances = async (hardAccounts) => {
  return hardAccounts.find(a => a.value.name === 'harvest').value.coins;
};

var getRewardPerYearByDenom = async (hardData) => {
  const arr = hardData.liquidity_provider_schedules.map((lp) => {
    const reward = lp.rewards_per_second.amount;

    // HARD per year by denom
    const rewardPerYear = rewardPeriodsPerYear(reward)
    return { denom: lp.deposit_denom, amount: rewardPerYear }
  })
  return arr
}

var setApyByDenom = (balances, prices, hardValuesPerSecondByDenom) => {
  return hardValuesPerSecondByDenom.map((d) => {
    const price = prices.find(p => p.name === d.denom);

    const balance = balances.find(b => b.denom === d.denom);
    const balanceAmount = convertToCoin(balance);

    const hardPerYear = hardValuesPerSecondByDenom.find(h => h.denom === d.denom);
    const hardPrice = prices.find(p => p.name === 'hard').price;

    const numerator = hardPerYear.amount * hardPrice;
    const denomentator = balanceAmount * price.price;
    const a = formatNumbers((numerator / denomentator) * 100);
    const apy = formatPercentage(formatNumbers((numerator / denomentator) * 100));

    return { denom: d.denom, apy };
  })
};

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

var getTotalValues = async (prices, hardAccounts) => {
  var conversionMap = new Map();
  conversionMap.set(USDX_DENOM, 10 ** 6);
  conversionMap.set(KAVA_DENOM, 10 ** 6);
  conversionMap.set(HARD_DENOM, 10 ** 6);
  conversionMap.set(BNB_DENOM, 10 ** 8);
  conversionMap.set(BTC_DENOM, 10 ** 8);
  conversionMap.set(XRP_DENOM, 10 ** 8);
  conversionMap.set(BUSD_DENOM, 10 ** 8);

  var totalValues = [];
  if(hardAccounts && hardAccounts.length > 0) {
    const harvestAccAddress = "kava16zr7aqvk473073s6a5jgaxus6hx2vn5laum9s3"
    const harvestAcc =  hardAccounts.find((item) => item.value.address === harvestAccAddress);
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

var setTotalValue = async (denom, cssId, totalValues) => {
  const denomValue = totalValues.find((item) => item.denom === denom).total_value;
  if (denomValue) {
    document.getElementById(cssId).innerHTML = usdFormatter.format(denomValue);
  }
  return denomValue
};

var setApyValue = (denom, cssId, apyByDenom) => {
  const denomApy = apyByDenom.find(a => a.denom === denom);
  document.getElementById(cssId).innerHTML = denomApy.apy;
};

var updateDisplayValues = async() => {
  const [
    hardMarketResponse,
    kavaMarketResponse,
    bnbMarketResponse,
    btcMarketResponse,
    xrpMarketResponse,
    hardParametersResponse,
    hardAccountResponse
  ] = await Promise.all([
    fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=HARDUSDT"),
    fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=KAVAUSDT"),
    fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BNBUSDT"),
    fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"),
    fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=XRPUSDT"),
    fetch('https://kava4.data.kava.io/harvest/parameters'),
    fetch(`${BASE_URL}/harvest/accounts`)
  ]);

  const hardPriceJson = await hardMarketResponse.json()
  const kavaPriceJson = await kavaMarketResponse.json()
  const bnbPriceJson = await bnbMarketResponse.json()
  const btcPriceJson = await btcMarketResponse.json()
  const xrpPriceJson = await xrpMarketResponse.json()
  const hardParamsJson = await hardParametersResponse.json()
  const hardAccountJson = await hardAccountResponse.json()

  const hardParams = await hardParamsJson.result;
  const hardAccounts = await hardAccountJson.result;

  const hardPrice = await hardPriceJson.lastPrice
  const kavaPrice = await kavaPriceJson.lastPrice
  const bnbPrice = await bnbPriceJson.lastPrice
  const btcPrice = await btcPriceJson.lastPrice
  const busdPrice = 1;
  const xrpPrice = await xrpPriceJson.lastPrice
  const usdxPrice = 1;

  const prices = [
    { name: HARD_DENOM, price: hardPrice },
    { name: KAVA_DENOM, price: kavaPrice },
    { name: BNB_DENOM, price: bnbPrice },
    { name: BTC_DENOM, price: btcPrice },
    { name: BUSD_DENOM, price: busdPrice },
    { name: XRP_DENOM, price: xrpPrice },
    { name: USDX_DENOM, price: usdxPrice },
  ]

  const hardTokenPrice = prices.find(p => p.name === 'hard').price;
  const rawTotalHardDist = await getTotalHardAvailable(hardParams);
  const displayTotalHardDist = usdFormatter.format(rawTotalHardDist*hardTokenPrice);
  const totalHardDistUSDValue = displayTotalHardDist.slice(0, displayTotalHardDist.length);
  document.getElementById("total-hard-dist").innerHTML = totalHardDistUSDValue;

  const totalValues = await getTotalValues(prices, hardAccounts);
  const bnbValue = await setTotalValue(BNB_DENOM, 'TL-BNB', totalValues);
  const kavaValue = await setTotalValue(KAVA_DENOM, 'TL-KAVA', totalValues);
  const usdxValue = await setTotalValue(USDX_DENOM, 'TL-USDX', totalValues);
  const hardValue = await setTotalValue(HARD_DENOM, 'TL-HARD', totalValues);
  const btcValue = await setTotalValue(BTC_DENOM, 'TL-BTC', totalValues);
  const busdValue = await setTotalValue(BUSD_DENOM, 'TL-BUSD', totalValues);
  const xrpValue = await setTotalValue(XRP_DENOM, 'TL-XRP', totalValues);

  const totalValue = bnbValue + kavaValue + usdxValue + hardValue + btcValue + busdValue + xrpValue;
  document.getElementById("TAV").innerHTML = usdFormatter.format(totalValue);

  const balances = await getModuleBalances(hardAccounts)
  const bnbTotalBalance = getBalanceForDenom('bnb', balances);

  const hardValuesPerSecondByDenom = await getRewardPerYearByDenom(hardParams);

  const apyByDenom = setApyByDenom(balances, prices, hardValuesPerSecondByDenom);
  setApyValue('bnb', 'APY-BNB', apyByDenom);
  setApyValue('hard', 'APY-HARD', apyByDenom);
  setApyValue('ukava', 'APY-KAVA', apyByDenom);
  setApyValue('usdx', 'APY-USDX', apyByDenom);
  setApyValue('btcb', 'APY-BTC', apyByDenom);
  setApyValue('xrpb', 'APY-XRP', apyByDenom);
  setApyValue('busd', 'APY-BUSD', apyByDenom);

  $(".metric-blur").css("background-color", "transparent")
  $(".metric-blur").addClass('without-after');
  $(".api-metric").css({"display": "block", "text-align": "center"})
}

// var getTotalHardClaimed = async () => {
//   let modAccBalances = 0;
//   const baseUrl = "https://kava4.data.kava.io/auth/accounts/";
//   const harvestLPDistModAcc = "kava1nzenvfcapyjr9qe3cr3c5k2aucssg6wnknlvll";
//   const harvestDelegatorDistModAcc = "kava1e3qvdzau5ww0m43d00gqj0ncgy8j03ndge6c2c";
//   const harvestModAccs = [harvestLPDistModAcc, harvestDelegatorDistModAcc]
//   for(modAcc of harvestModAccs) {
//     const response = await fetch(baseUrl + modAcc);
//     const data = await response.json();
//     const result = data && data.result;
//     const hardCoin = result.value.coins.find((item) => item.denom.toUpperCase() === "HARD");
//     modAccBalances += Number(hardCoin.amount);
//   }

//   const totalAvailableHard = 120000000; // 120 million
//   const undistributedHard = modAccBalances / 10 ** 6;
//   return totalAvailableHard  - undistributedHard;
// }

var getTotalHardAvailable = async (hardData) => {
  let totalHardDist = 0;
  if(hardData) {
    for(lps of hardData.liquidity_provider_schedules) {
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
  // odometer.innerHTML = usdRewardsDistributed;
}, 2000);

// window.odometerOptions = {
//   auto: false, // Don't automatically initialize everything with class 'odometer'
//   selector: '.my-numbers', // Change the selector used to automatically find things to be animated
//   format: '(,ddd).dd', // Change how digit groups are formatted, and how many digits are shown after the decimal point
//   duration: 3000, // Change how long the javascript expects the CSS animation to take
// };
