const FACTOR_SIX = Number(10 ** 6);
const FACTOR_EIGHT = Number(10 ** 8);
const BASE_URL = "https://api.kava.io";

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
  return hardAccounts.find(a => a.value.name === 'hard').value.coins;
};

var getRewardPerYearByDenom = async (hardData) => {
  const arr = hardData.map((rp) => {
    let amount = 0;
    const reward = rp.rewards_per_second.find(a => a.denom === 'hard')
    if(reward) {
      amount = reward.amount;
    }

    // HARD per year by denom
    const rewardPerYear = rewardPeriodsPerYear(amount)
    return { denom: rp.collateral_type, amount: rewardPerYear }
  })
  return arr
}

var setApyByDenom = (balances, prices, hardSupplyRewardsPerYearByDenom) => {
  return hardSupplyRewardsPerYearByDenom.map((d) => {
    const price = prices.find(p => p.name === d.denom);

    const balance = balances.find(b => b.denom === d.denom);
    const balanceAmount = convertToCoin(balance);

    const hardPerYear = hardSupplyRewardsPerYearByDenom.find(h => h.denom === d.denom);
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

var getTotalValues = async (prices, coins) => {
  var conversionMap = new Map();
  conversionMap.set(USDX_DENOM, 10 ** 6);
  conversionMap.set(KAVA_DENOM, 10 ** 6);
  conversionMap.set(HARD_DENOM, 10 ** 6);
  conversionMap.set(BNB_DENOM, 10 ** 8);
  conversionMap.set(BTC_DENOM, 10 ** 8);
  conversionMap.set(XRP_DENOM, 10 ** 8);
  conversionMap.set(BUSD_DENOM, 10 ** 8);

  var totalValues = [];
  if(coins && coins.length > 0) {
    for(coin of coins) {
      const supply = Number(coin.amount)/conversionMap.get(coin.denom);
      const price = prices.find((item) => item.name === coin.denom).price;
      const value = supply * Number(price);
      totalValues.push({denom: coin.denom, totalValue: value});
    }
  }
  return totalValues
}

var setTotalValue = async (denom, cssId, totalValues) => {
  let denomValue = 0;

  const denomData = totalValues.find((item) => item.denom === denom);
  if (denomData) {
    denomValue = denomData.totalValue;
  }
  document.getElementById(cssId).innerHTML = usdFormatter.format(denomValue);

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
    hardAccountResponse,
    hardTotalSuppliedResponse,
    hardTotalBorrowedResponse,
    incentiveParametersResponse
  ] = await Promise.all([
    fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=HARDUSDT"),
    fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=KAVAUSDT"),
    fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BNBUSDT"),
    fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"),
    fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=XRPUSDT"),
    fetch(`${BASE_URL}/hard/accounts`),
    fetch(`${BASE_URL}/hard/total-deposited`),
    fetch(`${BASE_URL}/hard/total-borrowed`),
    fetch(`${BASE_URL}/incentive/parameters`)
  ]);

  const hardPriceJson = await hardMarketResponse.json()
  const kavaPriceJson = await kavaMarketResponse.json()
  const bnbPriceJson = await bnbMarketResponse.json()
  const btcPriceJson = await btcMarketResponse.json()
  const xrpPriceJson = await xrpMarketResponse.json()
  const hardAccountJson = await hardAccountResponse.json()
  const hardTotalSuppliedJson = await hardTotalSuppliedResponse.json()
  const hardTotalBorrowedJson = await hardTotalBorrowedResponse.json()
  const incentiveParamsJson = await incentiveParametersResponse.json()

  const hardAccounts = await hardAccountJson.result;
  const hardTotalSupplied = await hardTotalSuppliedJson.result;
  const hardTotalBorrowed = await hardTotalBorrowedJson.result;
  const incentiveParams = await incentiveParamsJson.result;

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
    { name: USDX_DENOM, price: usdxPrice }
  ]

  const hardTokenPrice = prices.find(p => p.name === 'hard').price;

  const rawTotalHardSupplyDist = await getTotalHardAvailable(incentiveParams.hard_supply_reward_periods);
  const rawTotalHardBorrowDist = await getTotalHardAvailable(incentiveParams.hard_borrow_reward_periods);
  const rawTotalHardDist = rawTotalHardSupplyDist + rawTotalHardBorrowDist;

  const displayTotalHardDist = usdFormatter.format(rawTotalHardDist * hardTokenPrice);
  const totalHardDistUSDValue = displayTotalHardDist.slice(0, displayTotalHardDist.length);
  document.getElementById("total-hard-dist").innerHTML = totalHardDistUSDValue;

  const totalSuppliedValues = await getTotalValues(prices, hardTotalSupplied);
  const bnbSuppliedValue = await setTotalValue(BNB_DENOM, 'TL-BNB', totalSuppliedValues);
  const kavaSuppliedValue = await setTotalValue(KAVA_DENOM, 'TL-KAVA', totalSuppliedValues);
  const usdxSuppliedValue = await setTotalValue(USDX_DENOM, 'TL-USDX', totalSuppliedValues);
  const hardSuppliedValue = await setTotalValue(HARD_DENOM, 'TL-HARD', totalSuppliedValues);
  const btcSuppliedValue = await setTotalValue(BTC_DENOM, 'TL-BTC', totalSuppliedValues);
  const busdVSuppliedalue = await setTotalValue(BUSD_DENOM, 'TL-BUSD', totalSuppliedValues);
  const xrpSuppliedValue = await setTotalValue(XRP_DENOM, 'TL-XRP', totalSuppliedValues);

  const totalBorrowedValues = await getTotalValues(prices, hardTotalBorrowed);
  const busdBorrowedValue = await setTotalValue(BUSD_DENOM, 'TB-BUSD', totalBorrowedValues);

  const balances = await getModuleBalances(hardAccounts)

  const totalBalancesUsd = await getTotalValues(prices, balances);
  const totalAssetValue = totalBalancesUsd.reduce((acc, val) => acc + val.totalValue, 0)
  document.getElementById("TAV").innerHTML = usdFormatter.format(totalAssetValue);


  const bnbTotalBalance = getBalanceForDenom('bnb', balances);
  const hardSupplyRewardsPerYearByDenom = await getRewardPerYearByDenom(incentiveParams.hard_supply_reward_periods);

  const supplyApyByDenom = setApyByDenom(balances, prices, hardSupplyRewardsPerYearByDenom);
  setApyValue('bnb', 'APY-BNB', supplyApyByDenom);
  setApyValue('hard', 'APY-HARD', supplyApyByDenom);
  setApyValue('ukava', 'APY-KAVA', supplyApyByDenom);
  setApyValue('usdx', 'APY-USDX', supplyApyByDenom);
  setApyValue('btcb', 'APY-BTC', supplyApyByDenom);
  setApyValue('xrpb', 'APY-XRP', supplyApyByDenom);
  setApyValue('busd', 'APY-BUSD', supplyApyByDenom);

  $(".metric-blur").css("background-color", "transparent")
  $(".metric-blur").addClass('without-after');
  $(".api-metric").css({"display": "block", "text-align": "center"})
}

var getTotalHardAvailable = async (hardData) => {
  let totalHardDist = 0;
  if(hardData) {
    for(rp of hardData) {
      const startTime = Date.parse(rp.start);
      const currentTime = Date.now();
      const msDuration = currentTime - startTime;
      const secDuration = msDuration/1000;
      const hardReward = rp.rewards_per_second.find(d => d.denom === 'hard')
      let rewardsDistToDate = 0;
      if(hardReward) {
        rewardsDistToDate = secDuration * Number(hardReward.amount);
      }

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

var sleep = (ms = 10000) => { return new Promise(resolve => setTimeout(resolve, ms)); }

main();
