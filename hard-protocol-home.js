const FACTOR_SIX = Number(10 ** 6);
const FACTOR_EIGHT = Number(10 ** 8);
const BASE_URL = "https://api.kava.io";

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const isKavaNativeAsset = (denom) => {
  return ['ukava-a', 'usdx', 'hard', 'ukava', 'hard-a'].includes(denom)
}

const setConversionFactors = (denoms) => {
  const denomConversions = {}
  for (const denom of denoms) {
    if (isKavaNativeAsset(denom)) {
      denomConversions[denom] = FACTOR_SIX
    } else {
      denomConversions[denom] = FACTOR_EIGHT
    }
  }
  return denomConversions;
}

const noDollarSign = (value) => {
  return value.slice(1, value.length);
}

function isEmpty(obj) {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object
}

const formatCssId = (value, denom) => {
  let displayDenom;
  switch(denom) {
    case 'xrpb-a':
      displayDenom = denom.split('b-')[0]
      break;
    case 'ukava-a':
      displayDenom = 'kava'
      break;
    default:
      displayDenom = denom.split('-')[0]
      break;
  }

  return `${value}-${displayDenom}`.toUpperCase()
}

function formatCoins(coins) {
  let formattedCoins = {};
  for (const coin of coins) {
    formattedCoins[commonDenomMapper(coin.denom)] = { denom: coin.denom, amount: coin.amount }
  }
  return formattedCoins;
}

function formatNumbers(input, fixed = 2){
  return (Number(input).toFixed(fixed).toString()).replace(
    /^([-+]?)(0?)(\d+)(.?)(\d+)$/g, function(match, sign, zeros, before, decimal, after) {
      const reverseString = function(string) { return string.split('').reverse().join(''); };
      const insertCommas  = function(string) {
        const reversed = reverseString(string);
        const reversedWithCommas = reversed.match(/.{1,3}/g).join(',');
        return reverseString(reversedWithCommas);
      };
      return sign + (decimal ? insertCommas(before) + decimal + after : insertCommas(before + after));
    }
  );
};

const formatPercentage = (value) => {
  return value +"%"
};

const formatPrices = async (pricefeedResult) => {
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

const getModuleBalances = async (hardAccounts) => {
  const hardAccountCoins = hardAccounts.find(a => a.value.name === 'hard').value.coins;
  const coins = {};
  for (const coin of hardAccountCoins) {
    coins[commonDenomMapper(coin.denom)] = { denom: coin.denom, amount: coin.amount }
  }
  return coins;
};

const getRewardPerYearByDenom = async (hardData, siteData) => {
  let tokensDistributedBySuppliedAssetPerYear = {};
  const denomConversions = siteData['denomConversions'];
   for (const period of hardData) {
      const coins = {};
      for (const reward of period.rewards_per_second) {
        // 31536000 = seconds in a year
        const coinPerYear = Number(reward.amount) * 31536000 / denomConversions[commonDenomMapper(reward.denom)];

        const coinRewardPerYear = { denom: reward.denom, amount: String(coinPerYear) }

        coins[commonDenomMapper(reward.denom)] = coinRewardPerYear
      }
      tokensDistributedBySuppliedAssetPerYear[commonDenomMapper(period.collateral_type)] =  coins;
    }
  return tokensDistributedBySuppliedAssetPerYear;
}
const setApyByDenom = (siteData,  cssIds, denoms) => {
  const hardSupplyRewardsPerYearByDenom = siteData['hardSupplyRewardsPerYearByDenom']
  const balances = siteData['hard-total-supplied'];
  const prices = siteData['prices'];
  const denomConversions = siteData['denomConversions'];
  for (const denom of denoms) {
    const collatDenomPrice = prices[denom].price;
    let balanceAmount = 0;
    if (balances[denom]) {
      balanceAmount= Number(balances[denom].amount)
    }
    const balanceCurrency = balanceAmount / denomConversions[denom];
    const reward = hardSupplyRewardsPerYearByDenom[denom];

    let numerator = 0;
    for (const rewardDenom in reward) {
      const denomPrice = prices[rewardDenom].price;
      numerator += Number(reward[rewardDenom].amount) * denomPrice;
    }
    console.log("reward denom", reward, denom)
    const denomenator = balanceCurrency * collatDenomPrice;
    let apy = '0.00%';

    if (denomenator !==0) {
      apy = formatPercentage(formatNumbers((numerator / denomenator) * 100));
    }
    const cssId = cssIds[denom]['apy'];
    setDisplayValueById(cssId, apy)
    console.log(apy)
  }
};

const getTotalValues = (denoms, prices, coins) => {
  let totalValues = {};
  const denomConversions = setConversionFactors(denoms)
  if(!isEmpty(coins)) {
    for(const coin in coins) {
      const supply = Number(coins[coin].amount)/ denomConversions[coin];
      const price = prices[coin].price;
      totalValues[coin] = {denom: coin, amount: supply * Number(price) }
    }
  }
  return totalValues;
}

const setApyValue = (denom, cssId, apyByDenom) => {
  const denomApy = apyByDenom[denom] ? apyByDenom[denom].apy : formatPercentage(0);
  // document.getElementById(cssId).innerHTML = denomApy;
};

const setTotalAssetValue = (totalBalancesUsd) => {
  let totalAssetValue = 0;
  for (const coin in totalBalancesUsd) {
    totalAssetValue += Number(totalBalancesUsd[coin].amount)
  }
  // document.getElementById("TAV").innerHTML = usdFormatter.format(totalAssetValue);
}

const getTotalHardAvailable = async (hardData) => {
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
  return totalHardDist / FACTOR_SIX;
}

const setDisplayValueById = (cssId, value) => {
  const element = document.getElementById(cssId)
  if (element) { element.innerHTML = value; }
}

const setTotalHardDistributedDisplayValue = (siteData, cssIds) => {
  const rawTotalHardDist = siteData["raw-total-hard-supply-distributed"] + siteData["raw-total-hard-borrow-distributed"];
  const prices = siteData['prices']
  const cssId = cssIds['total-hard-dist'];
  const displayTotalHardDist = usdFormatter.format(rawTotalHardDist * prices['hard-a'].price);
  setDisplayValueById(cssId, noDollarSign(displayTotalHardDist))
}

const setTotalSuppliedDisplayValues = (siteData, cssIds, denoms) => {
  const hardTotalSupplied = siteData['hard-total-supplied'];
  const prices = siteData['prices'];
  const denomConversions = siteData['denomConversions']
  for (const denom of denoms) {
    console.log("denom", denom)

    const suppliedHard = hardTotalSupplied[denom];
    const suppliedHardAmount = suppliedHard ? Number(suppliedHard.amount) : 0
    const cssId = cssIds[denom]['totalSupplied'];
    const currencyValue = suppliedHardAmount / denomConversions[denom];

    const usdValue = currencyValue * prices[denom].price;
    const formattedUsdValue = usdFormatter.format(usdValue)
    console.log("formattedUsdValue", formattedUsdValue)
  }
};

const commonDenomMapper = (denom) => {
  let formattedDenom;
  switch(denom.toLowerCase()) {
    case 'btc':
      formattedDenom = 'btcb-a';
      break;
    case 'usdx':
      formattedDenom = denom;
      break;
    case 'kava':
      formattedDenom = 'ukava-a';
      break;
    case 'xrp':
      formattedDenom = 'xrpb-a';
      break;
    default:
      formattedDenom = denom + '-a';
      break;
  }
  return formattedDenom
}

const mapPrices = async (denoms, pricefeedResult) => {
  // for now drop any of the usd:30 prices returned
  const nonThirtyPrices = pricefeedResult.filter(p => !p.market_id.includes('30'))
  let prices = {};

  let mappedPrices = {};
  for (const price of nonThirtyPrices) {
    const priceName = price.market_id.split(":")[0]
    mappedPrices[commonDenomMapper(priceName)] = { price: Number(price.price)}

    // hbtc doesn't have it's own price, it just uses btc's price
    if (commonDenomMapper(priceName) === 'btcb-a') {
      mappedPrices['hbtc-a'] = { price: Number(price.price)}
    }
  }

  for ( const denom of denoms) {
    let mappedPrice = mappedPrices[denom]
    let price = { price: 0 }

    if(mappedPrice) {
      price = { price: mappedPrice.price }
    }
    prices[denom] = price
  }
  return prices;
};

const mapCssIds = (denoms) => {
  let ids = {}
  // total asset value
  ids['TAV'] = 'TAV'

  // total HARD Distributed
  ids['total-hard-dist'] = 'TOTAL-HARD-DISTRIBUTED'

  // for the market overview table
  for (const denom of denoms) {
    ids[denom] = {};
    ids[denom].totalBorrowed = formatCssId('tb', denom)
    ids[denom].totalSupplied = formatCssId('tl', denom)
    ids[denom].apy = formatCssId('apy', denom)
  }
  return ids
}

const setTotalAssetDisplayValue = async (siteData, cssIds) => {
  const cssId = cssIds['TAV'];
  const totalSupplied = siteData['hardTotalSupplied'] ? siteData['totalSupplied'].total : 0
  const totalBorrowed = siteData['hardTotalBorrowed'] ? siteData['usdxBorrowed'].total : 0

  const totalAssetValue = usdFormatter.format(totalSupplied + totalBorrowed);
  setDisplayValueById(cssId, noDollarSign(totalAssetValue))
}

const updateDisplayValues = async(denoms) => {
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

  let siteData = {}
  const cssIds = mapCssIds(denoms)

  const pricefeedPrices = await pricefeedResponse.json()
  const hardAccountJson = await hardAccountResponse.json()
  const hardTotalSuppliedJson = await hardTotalSuppliedResponse.json()
  const hardTotalBorrowedJson = await hardTotalBorrowedResponse.json()
  const incentiveParamsJson = await incentiveParametersResponse.json()

//  Feed this into siteData
  const prices = await mapPrices(denoms, pricefeedPrices.result);
  siteData['prices'] = prices;
  const denomConversions = setConversionFactors(denoms)
  siteData['denomConversions'] = denomConversions;
  const hardAccount = await getModuleBalances(hardAccountJson.result);
  siteData['hard-account'] = hardAccount;
  const hardTotalSupplied = formatCoins(hardTotalSuppliedJson.result);
  siteData['hard-total-supplied'] = hardTotalSupplied;
  const hardTotalBorrowed = formatCoins(hardTotalBorrowedJson.result);
  siteData['hard-total-borrowed'] = hardTotalBorrowed;
  const incentiveParams = await incentiveParamsJson.result;



  const rawTotalHardSupplyDist = await getTotalHardAvailable(incentiveParams.hard_supply_reward_periods);
  siteData["raw-total-hard-supply-distributed"] = rawTotalHardSupplyDist;
  const rawTotalHardBorrowDist = await getTotalHardAvailable(incentiveParams.hard_borrow_reward_periods);
  siteData["raw-total-hard-borrow-distributed"] = rawTotalHardBorrowDist;


  const totalSuppliedValues = await getTotalValues(denoms, siteData['prices'], siteData['hard-total-supplied']);

  //  Use map to get the denoms

  const totalBorrowedValues = await getTotalValues(denoms, siteData['prices'], siteData['hard-total-borrowed']);


  const balances = siteData['hard-account'];
  const totalBalancesUsd = await getTotalValues(denoms, siteData['prices'], balances);
  setTotalAssetValue(totalBalancesUsd)

  const hardSupplyRewardsPerYearByDenom = await getRewardPerYearByDenom(incentiveParams.hard_supply_reward_periods, siteData);
  siteData['hardSupplyRewardsPerYearByDenom'] = hardSupplyRewardsPerYearByDenom;
  const supplyApyByDenom = setApyByDenom(siteData, cssIds, denoms);

  //  Use map to get the denoms
  // setApyValue('bnb', 'APY-BNB', supplyApyByDenom);
  // setApyValue('hard', 'APY-HARD', supplyApyByDenom);
  // setApyValue('ukava', 'APY-KAVA', supplyApyByDenom);
  // setApyValue('usdx', 'APY-USDX', supplyApyByDenom);
  // setApyValue('btcb', 'APY-BTC', supplyApyByDenom);
  // setApyValue('xrpb', 'APY-XRP', supplyApyByDenom);
  // setApyValue('busd', 'APY-BUSD', supplyApyByDenom);




  setTotalHardDistributedDisplayValue(siteData, cssIds);
  setTotalSuppliedDisplayValues(siteData, cssIds, denoms);

  // const platformData = await mapPlatformAmounts(denoms, platformAmounts)
  // siteData['platformAmounts'] = platformData
  //
  // const suppliedAmounts = mapSuppliedAmounts(denoms, suppliedAmountJson.result.value.coins);
  // siteData['suppliedAmounts'] = suppliedAmounts;
  //
  // const bep3SupplyData = await mapBep3Supplies(denoms, bep3SupplyJson.result);
  // siteData['bep3SupplyData'] = bep3SupplyData;

  // const totalSupplied = await mapTotalSupplied(denoms, siteData)
  // siteData['totalSupplied'] = totalSupplied;


  // set display values
  // await setTotalRewardsDistributedDisplayValue(siteData, cssIds)

  // await setTotalBorrowedDisplayValues(denoms, siteData, cssIds)
  //
  // await setTotalLockedDisplayValues(denoms, siteData, cssIds)
  //
  // await setRewardsApyDisplayValues(denoms, siteData, cssIds)
  //
  // await setTotalAssetDisplayValue(siteData, cssIds)

  $(".metric-blur").css("background-color", "transparent")
  $(".metric-blur").addClass('without-after');
  $(".api-metric").css({"display": "block", "text-align": "center"})
}

const main = async () => {
  const denoms = [
    'bnb-a', 'btcb-a', 'busd-a',
    'hbtc-a', 'xrpb-a', 'hard-a', 'usdx',
    'ukava-a'
  ]
  await updateDisplayValues(denoms);
  await sleep(30000);
  main();
}

const sleep = (ms = 10000) => { return new Promise(resolve => setTimeout(resolve, ms)); };

main();
