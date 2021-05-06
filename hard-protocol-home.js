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

const denomConversions = {
  usdx: FACTOR_SIX,
  ukava: FACTOR_SIX,
  hard: FACTOR_SIX,
  bnb: FACTOR_EIGHT,
  btcb: FACTOR_EIGHT,
  xrpb: FACTOR_EIGHT,
  busd: FACTOR_EIGHT
};

function isEmpty(obj) {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object
}

function formatCoins(coins) {
  let formattedCoins = {};
  for (const coin of coins) {
    formattedCoins[coin.denom] = { denom: coin.denom, amount: coin.amount }
  }
  return formattedCoins
}

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

var formatPercentage = (value) => {
  return value +"%"
};

var formatPrices = async (pricefeedResult) => {
  // for now drop any of the usd:30 prices returned
  const nonThirtyPrices = pricefeedResult.filter(p => !p.market_id.includes('30'))

  let prices = {};
  for (const price of nonThirtyPrices) {
    const priceName = price.market_id.split(":")[0]

    let name;
    switch (priceName) {
      case 'btc':
        name = 'btcb';
        break;
      case 'kava':
        name = 'ukava';
        break;
      case 'xrp':
        name = 'xrpb';
        break;
      default:
        name = priceName;
        break;
    }
    prices[name] = { price: Number(price.price)}
  }
  return prices;
};

var getModuleBalances = async (hardAccounts) => {
  const hardAccountCoins = hardAccounts.find(a => a.value.name === 'hard').value.coins;
  const coins = {};
  for (const coin of hardAccountCoins) {
    coins[coin.denom] = { denom: coin.denom, amount: coin.amount }
  }
  return coins;
};

var getRewardPerYearByDenom = async (hardData) => {
  let tokensDistributedBySuppliedAssetPerYear = {};
   for (const period of hardData) {
      const coins = {};
      for (const reward of period.rewards_per_second) {
        // 31536000 = seconds in a year
        const coinPerYear = Number(reward.amount) * 31536000 / denomConversions[reward.denom];

        const coinRewardPerYear = { denom: reward.denom, amount: String(coinPerYear) }

        coins[reward.denom] = coinRewardPerYear
      }
      tokensDistributedBySuppliedAssetPerYear[period.collateral_type] =  coins;
    }
  return tokensDistributedBySuppliedAssetPerYear;
}

var setApyByDenom = (balances, prices, hardSupplyRewardsPerYearByDenom) => {
  const apyValues = {};
  for (const collatDenom in hardSupplyRewardsPerYearByDenom) {
    const collatDenomPrice = prices[collatDenom].price;
    const balanceAmount = Number(balances[collatDenom].amount)/denomConversions[collatDenom];
    const reward = hardSupplyRewardsPerYearByDenom[collatDenom];

    let numerator = 0;
    for (const rewardDenom in reward) {
      const denomPrice = prices[rewardDenom].price;
      numerator += Number(reward[rewardDenom].amount) * denomPrice;
    }

    const denomentator = balanceAmount * collatDenomPrice;
    const a = formatNumbers((numerator / denomentator) * 100);
    const apy = formatPercentage(formatNumbers((numerator / denomentator) * 100));

    apyValues[collatDenom] = { apy }
  }
  return apyValues;
};

var getTotalValues = (prices, coins) => {
  let totalValues = {};

  if(!isEmpty(coins)) {
    for(const coin in coins) {
      const supply = Number(coins[coin].amount)/denomConversions[coin];
      const price = prices[coin].price;
      totalValues[coin] = {denom: coin, amount: supply * Number(price) }
    }
  }
  return totalValues;
}

var setTotalValue = async (denom, cssId, totalValues) => {
  const denomValue = totalValues[denom] ? totalValues[denom].amount : 0;
  document.getElementById(cssId).innerHTML = usdFormatter.format(denomValue);

  return denomValue;
};

var setApyValue = (denom, cssId, apyByDenom) => {
  const denomApy = apyByDenom[denom] ? apyByDenom[denom].apy : formatPercentage(0);
  document.getElementById(cssId).innerHTML = denomApy;
};

var setTotalAssetValue = (totalBalancesUsd) => {
  let totalAssetValue = 0;
  for (const coin in totalBalancesUsd) {
    totalAssetValue += Number(totalBalancesUsd[coin].amount)
  }
  document.getElementById("TAV").innerHTML = usdFormatter.format(totalAssetValue);
}

var getTotalHardAvailable = async (hardData) => {
  let totalHardDist = 0;
  if(hardData) {
    for(const rp of hardData) {
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
  return totalHardDist / denomConversions['hard'];
}

var updateDisplayValues = async() => {
  const [
    pricefeedResponse,
    hardAccountResponse,
    hardTotalSuppliedResponse,
    hardTotalBorrowedResponse,
    incentiveParametersResponse
  ] = await Promise.all([
    fetch(`${BASE_URL}/pricefeed/prices`),
    fetch(`${BASE_URL}/hard/accounts`),
    fetch(`${BASE_URL}/hard/total-deposited`),
    fetch(`${BASE_URL}/hard/total-borrowed`),
    fetch(`${BASE_URL}/incentive/parameters`)
  ]);
  const pricefeedPrices = await pricefeedResponse.json()
  const hardAccountJson = await hardAccountResponse.json()
  const hardTotalSuppliedJson = await hardTotalSuppliedResponse.json()
  const hardTotalBorrowedJson = await hardTotalBorrowedResponse.json()
  const incentiveParamsJson = await incentiveParametersResponse.json()

  const prices = await formatPrices(pricefeedPrices.result);
  const hardAccounts = await hardAccountJson.result;
  const hardTotalSupplied = await hardTotalSuppliedJson.result;
  const hardTotalBorrowed = await hardTotalBorrowedJson.result;
  const incentiveParams = await incentiveParamsJson.result;

  const rawTotalHardSupplyDist = await getTotalHardAvailable(incentiveParams.hard_supply_reward_periods);
  const rawTotalHardBorrowDist = await getTotalHardAvailable(incentiveParams.hard_borrow_reward_periods);
  const rawTotalHardDist = rawTotalHardSupplyDist + rawTotalHardBorrowDist;

  const displayTotalHardDist = usdFormatter.format(rawTotalHardDist * prices['hard'].price);
  const totalHardDistUSDValue = displayTotalHardDist.slice(0, displayTotalHardDist.length);
  document.getElementById("total-hard-dist").innerHTML = totalHardDistUSDValue;

  const totalSuppliedValues = await getTotalValues(prices, formatCoins(hardTotalSupplied));
  await setTotalValue(BNB_DENOM, 'TL-BNB', totalSuppliedValues);
  await setTotalValue(KAVA_DENOM, 'TL-KAVA', totalSuppliedValues);
  await setTotalValue(USDX_DENOM, 'TL-USDX', totalSuppliedValues);
  await setTotalValue(HARD_DENOM, 'TL-HARD', totalSuppliedValues);
  await setTotalValue(BTC_DENOM, 'TL-BTC', totalSuppliedValues);
  await setTotalValue(BUSD_DENOM, 'TL-BUSD', totalSuppliedValues);
  await setTotalValue(XRP_DENOM, 'TL-XRP', totalSuppliedValues);

  const totalBorrowedValues = await getTotalValues(prices, formatCoins(hardTotalBorrowed));
  await setTotalValue(BUSD_DENOM, 'TB-BUSD', totalBorrowedValues);

  const balances = await getModuleBalances(hardAccounts)
  const totalBalancesUsd = await getTotalValues(prices, balances);
  setTotalAssetValue(totalBalancesUsd)

  const hardSupplyRewardsPerYearByDenom = await getRewardPerYearByDenom(incentiveParams.hard_supply_reward_periods);

  const supplyApyByDenom = setApyByDenom(formatCoins(hardTotalSupplied), prices, hardSupplyRewardsPerYearByDenom);
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

var main = async () => {
  await updateDisplayValues();
  await sleep(30000);
  main()
}

var sleep = (ms = 10000) => { return new Promise(resolve => setTimeout(resolve, ms)); }

main();
