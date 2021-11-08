const FACTOR_SIX = Number(10 ** 6);
const FACTOR_EIGHT = Number(10 ** 8);
const BASE_URL = "https://api.kava.io";

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

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

const setRewardsDates = (denoms) => {
  const rewardsStartDates = {}

  for (const denom of denoms) {
    let date;
    switch(denom) {
      case 'bnb-a':
        date = new Date("2020-07-29T14:00:14.333506701Z")
        break;
      case 'btcb-a':
        date = new Date("2020-11-16T14:00:14.333506701Z")
        break;
      case 'busd-a':
        date = new Date("2020-11-09T14:00:14.333506701Z")
        break;
      case 'xrpb-a':
        date = new Date("2020-12-02T14:00:14.333506701Z")
        break;
      case 'hbtc-a':
        date = new Date("2021-03-15T14:00:14.333506701Z")
        break;
      case 'hard-a':
        date = new Date("2021-01-15T14:00:14.333506701Z")
        break;
      case 'ukava-a':
        date = new Date("2020-12-14T14:00:14.333506701Z")
        break;
      default:
        date = new Date()
        break;
    }
    rewardsStartDates[denom] = date
  }
  return rewardsStartDates;
}

function isEmpty(obj) {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object
}

const noDollarSign = (value) => {
  return value.slice(1, value.length);
}

const formatPercentage = (value) => {
  return value +"%";
};

const displayInMillions = (value) => {
  const valueInMil = value/FACTOR_SIX;
  const valueInMilUsd = usdFormatter.format(valueInMil);
  return valueInMilUsd + "M";
}

const displayInThousands = (value) => {
  const valueInK = value/Number(10 ** 3);
  const valueInKUsd = usdFormatter.format(valueInK);
  return valueInKUsd + "K";
}

const isKavaNativeAsset = (denom) => {
  return ['ukava-a', 'usdx', 'hard', 'ukava', 'hard-a', 'swp-a'].includes(denom)
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

// used to format denom to match how it's used in the system
// Example:  ukava => ukava-a
const formatRewardDenom = (denom) => {
  let formattedDenom;
  switch(denom) {
    case 'ukava':
      formattedDenom = 'ukava-a'
      break;
    case 'hard':
      formattedDenom = 'hard-a'
      break;
    default:
      formattedDenom = denom;
      break;
  }
  return formattedDenom;
}

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

const emptyCoin = (denom) => { return { denom, amount: 0 } }

const mapSuppliedAmounts = (denoms, coins) => {
  let formattedCoins = {};

  let mappedCoins = {}
  for (const coin of coins) {
    mappedCoins[commonDenomMapper(coin.denom)] = { denom: coin.denom, amount: coin.amount }
  }

  for(const denom of denoms) {
    let coin = emptyCoin(denom);

    const accountCoin = mappedCoins[denom]
    if(accountCoin) {
      coin = { denom: commonDenomMapper(accountCoin.denom), amount: Number(accountCoin.amount) }
    }
    formattedCoins[denom] = coin
  }
  return formattedCoins
}

const mapPlatformAmounts = async (totalCollateral, totalPrincipal) => {
  const coins = {};
      for (const denom of totalCollateral) {
        const { amount: { amount }, collateral_type } = denom;
        coins[collateral_type] = {};
        coins[collateral_type].collateral = amount;
      };
      for (const denom of totalPrincipal) {
        const {collateral_type, amount: { amount }} = denom;
        coins[collateral_type].principal = amount; 
      };
     return coins;
};

const mapBep3Supplies = async (denoms, bep3SupplyData) => {
  const coins = {};
  const mappedBep3Supplies = {};
  for (const denom of bep3SupplyData) {
    const currentSupply = denom.current_supply;
    const amount = currentSupply ? currentSupply.amount : 0
    mappedBep3Supplies[commonDenomMapper(currentSupply.denom)] = Number(amount)
  }

  for (const denom of denoms) {
    let bep3Supply = mappedBep3Supplies[denom]
    let amount = 0;

    if(bep3Supply) { amount = bep3Supply }
    coins[denom] = amount
  }
  return coins
}

const mapUsdxLimits = async (denoms, cdpParamsData) => {
  const coins = {};

  const mappedLimits = {};
  if(cdpParamsData) {
    for (const denom of cdpParamsData.collateral_params) {
      const debtLimit = denom.debt_limit ? Number(denom.debt_limit.amount)/FACTOR_SIX : 0;
      mappedLimits[denom.type] = { debtLimit }
    }
  }

  for (const denom of denoms) {
    let cdpParam = mappedLimits[denom]
    let limit = 0;

    if(cdpParam) { limit = cdpParam.debtLimit }
    coins[denom] = { debtLimit: limit }
  }
  return coins;
};


const mapTotalSupplied = async (denoms, siteData) => {
  let coins = { total: 0 };

  const bep3SupplyData = siteData['bep3SupplyData'];
  const suppliedAmountData = siteData['suppliedAmounts'];
  const denomConversions = siteData['denomConversions'];
  for(const denom of denoms) {

    const denomPrice = siteData['prices'][denom].price;

    let denomTotalSupply;
    if (isKavaNativeAsset(denom)) {
      denomTotalSupply = suppliedAmountData[denom].amount;
    } else {
      denomTotalSupply = bep3SupplyData[denom];
    }
    const factor = denomConversions[denom]
    const denomTotalSupplyUsdValue =  Number((denomTotalSupply/factor) * denomPrice)
    // kava and hard are not included in the total asset value supplied
    if (!['ukava-a', 'hard-a'].includes(denom)) {
      coins['total'] += denomTotalSupplyUsdValue;
    }

    coins[denom] = denomTotalSupplyUsdValue;
  }
 
  return coins;
};

const mapIncentiveParams = async (denoms, usdxMintingParams) => {
  let coins = {}

  let mappedParams = {}
  if (usdxMintingParams) {
    for(const param of usdxMintingParams) {
      const rewardPerSecond = param.rewards_per_second;
      mappedParams[param.collateral_type] = { denom: rewardPerSecond.denom, amount: Number(rewardPerSecond.amount) }
    }
  }

  for (const denom of denoms) {
    let coinParams = mappedParams[denom]
    // empty coin with 'ukava' assumes reward type is going to be in ukava
    let coin = emptyCoin('ukava')

    if(coinParams) {
      coin = { denom: coinParams.denom, amount: Number(coinParams.amount) }
    }
    coins[denom] = coin
  }
  return coins;
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

const mapUsdxBorrowed = async (denoms, siteData) => {
  const coins = { total: 0 };
  for (const denom of denoms) {
    const cdpParamsData = siteData['cdpParamsData'][denom];
    const platformData = siteData['platformAmounts'][denom];
    let usdxAmount = 0;
    if(cdpParamsData && platformData) {
      const usdxBorrowedAndFees = Number(platformData.principal / FACTOR_SIX);
      usdxAmount = usdxBorrowedAndFees > cdpParamsData.debtLimit ? cdpParamsData.debtLimit : usdxBorrowedAndFees;
      coins['total'] += usdxAmount;
    }
    coins[denom] = usdxAmount;
  }
  return coins;
}

const mapCdpInterestRates = async (denoms, cdpParamsData) => {
  const coins = {};

  const mappedStabilityFees = {};
  if(cdpParamsData) {
    for (const denom of cdpParamsData.collateral_params) {
      const secondsPerYear = 31536000;
      const stabilityFeePercentage = ((Number(denom.stability_fee) ** secondsPerYear - 1) * 100).toFixed(2);
      mappedStabilityFees[denom.type] = stabilityFeePercentage
    }
  }

  for (const denom of denoms) {
    coins[denom] = { stabilityFeePercentage: mappedStabilityFees[denom] }
  }
  return coins;
};

const mapCssIds = (denoms) => {
  let ids = {}
  // total asset value
  ids['totalAssetValue'] = 'TOTAL-VALUE-LOCKED'

  // total rewards Distributed
  ids['totalRewardsDistributed'] = 'TOTAL-REWARDS-DISTRIBUTED'

  // for the market overview table
  for (const denom of denoms) {
    ids[denom] = {};
    ids[denom].totalBorrowed = formatCssId('tb', denom)
    ids[denom].totalLocked = formatCssId('tl', denom)
    ids[denom].apy = formatCssId('apy', denom)
    ids[denom].cdpInterestRate = formatCssId('bapy', denom)
    ids[denom].hardRewardApy = formatCssId('hrapy', denom)
  }
  return ids
}

const setTotalRewardsDistributedDisplayValue = async (siteData, cssIds) => {
  let cssId = cssIds['totalRewardsDistributed'];
  let totalRewardsDistributed = 0;

  const usdxMintingRewards = siteData['incentiveParamsData'];
  const rewardsStartDates = siteData['rewardsStartDates'];
  const denomConversions = siteData['denomConversions'];

  for (const denom in usdxMintingRewards) {

    const rewardDenom = formatRewardDenom(usdxMintingRewards[denom].denom);

    const millisecondsRewardActive = Date.now() - rewardsStartDates[denom].getTime();


    const secondsRewardActive = millisecondsRewardActive / 1000;
    const factor = denomConversions[rewardDenom]

    const coinPerYear = (Number(usdxMintingRewards[denom].amount) * Number(secondsRewardActive)) / factor;
    const price = siteData['prices'][rewardDenom] ? siteData['prices'][rewardDenom].price : 0;
    totalRewardsDistributed += coinPerYear * price;
  }
  const totalRewardsDistributedUsd = usdFormatter.format(totalRewardsDistributed);
  setDisplayValueById(cssId, noDollarSign(totalRewardsDistributedUsd))
}

const setTotalBorrowedDisplayValues = async (denoms, siteData, cssIds) => {
  for (const denom of denoms) {
    const usdxBorrowed = siteData['usdxBorrowed'][denom];
    const cssId = cssIds[denom]['totalBorrowed'];

    const denomTotalBorrowed = usdxBorrowed >= 10 ** 6 ? displayInMillions(usdxBorrowed) : displayInThousands(usdxBorrowed);
    setDisplayValueById(cssId, denomTotalBorrowed)
  }
}

const setTotalLockedDisplayValues = async (denoms, siteData, cssIds) => {
  for (const denom of denoms) {
    const suppliedAmount = siteData['suppliedAmounts'][denom];
    const denomConversions = siteData['denomConversions'];

    const price = siteData['prices'][denom] ? siteData['prices'][denom].price : 0;
    const cssId = cssIds[denom]['totalLocked'];
    const factor = denomConversions[denom]

    const denomSupplyFromAcct = suppliedAmount ? suppliedAmount.amount : 0;
    const denomTotalSupplyCoin = denomSupplyFromAcct/factor;
    const denomTotalSupplyValue = Number(denomTotalSupplyCoin * price);

    const denomTotalLocked = denomTotalSupplyValue >= 10 ** 6 ? displayInMillions(denomTotalSupplyValue) : displayInThousands(denomTotalSupplyValue);
    setDisplayValueById(cssId, denomTotalLocked)
  }
}

const setRewardsApyDisplayValues = async (denoms, siteData, cssIds) => {
  const denomConversions = siteData['denomConversions']

  for (const denom of denoms) {
    if (denom === 'usdx') continue; 
    const denomPrice = siteData['prices'][denom].price;
    const cssId = cssIds[denom]['apy'];
    const lockedAmount = siteData['platformAmounts'][denom].collateral;
    const usdxMintingRewards = siteData['incentiveParamsData'][denom]

    let rewardsDenom = commonDenomMapper(usdxMintingRewards.denom);
    let rewardsAmountPerSecond = usdxMintingRewards.amount;


    const denomValueLocked = denomPrice * lockedAmount

    // 31536000 seconds in a year
    const rewardsPerYear = rewardsAmountPerSecond * 31536000 / denomConversions[rewardsDenom]
    const rewardPrice = siteData['prices'][rewardsDenom].price;
    const rewardsPerYearInUsd = rewardsPerYear * rewardPrice;
    const rawDenomApy = denomValueLocked === 0 ? 0 : rewardsPerYearInUsd/denomValueLocked

    const denomPercentageApy = rawDenomApy * 100;

    // use usdFormatter to truncate to 2 decimals and round
    const denomPercentDisplay = usdFormatter.format(denomPercentageApy);
    const commaSeparatedPercentDisplay = noDollarSign(denomPercentDisplay);
    setDisplayValueById(cssId, commaSeparatedPercentDisplay + "%")
  }
}

const setTotalAssetDisplayValue = async (siteData, cssIds) => {
  const cssId = cssIds['totalAssetValue'];
  const totalSupplied = siteData['totalSupplied'] ? siteData['totalSupplied'].total : 0
  const totalBorrowed = siteData['usdxBorrowed'] ? siteData['usdxBorrowed'].total : 0

  const totalAssetValue = usdFormatter.format(totalSupplied + totalBorrowed);
  setDisplayValueById(cssId, noDollarSign(totalAssetValue))
}

const setDisplayValueById = (cssId, value) => {
  const element = document.getElementById(cssId)
  if (element) { element.innerHTML = value; }
}

const setBorrowApyDisplayValues = async (denoms, siteData, cssIds) => {
  const cdpInterestRate = siteData['cdpInterestRate'];

  for (const denom of denoms) {
    const borrowApy = cdpInterestRate[denom].stabilityFeePercentage;
    const cssId = cssIds[denom]['cdpInterestRate'];
    setDisplayValueById(cssId, borrowApy + "%")
  }
};

const setHardRewardApyDisplayValue = async (denoms, siteData, cssIds) => {
  const hardSupplyRewardsPerYearByDenom = siteData['hardSupplyRewardsPerYearByDenom']
  const balances = siteData['hardTotalSupplied'];
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
    const denominator = balanceCurrency * collatDenomPrice;
    let apy = '0.00%';

    if (denominator !==0) {
      // use usdFormatter to truncate to 2 decimals and round
      const apyWithDollarSign = usdFormatter.format((numerator / denominator) * 100);
      apy = formatPercentage(noDollarSign(apyWithDollarSign));
    }
    const cssId = cssIds[denom].hardRewardApy;
    setDisplayValueById(cssId, apy)
  }
};

function formatCoins(coins) {
  let formattedCoins = {};
  for (const coin of coins) {
    formattedCoins[commonDenomMapper(coin.denom)] = { denom: coin.denom, amount: coin.amount }
  }
  return formattedCoins;
};

const getRewardPerYearByDenom = async (siteData) => {
  const incentiveParams = siteData['hardIncentiveParams'];
  const hardData = incentiveParams.hard_supply_reward_periods;
  let tokensDistributedBySuppliedAssetPerYear = {};
  const denomConversions = siteData['denomConversions'];
  for (const period of hardData) {
    const coins = {};
    for (const reward of period.rewards_per_second) {
      // 31536000 = seconds in a year
      const coinPerYear = Number(reward.amount) * 31536000 / denomConversions[commonDenomMapper(reward.denom)];

      const coinRewardPerYear = { denom: reward.denom, amount: String(coinPerYear) };

      coins[commonDenomMapper(reward.denom)] = coinRewardPerYear;
    }
    tokensDistributedBySuppliedAssetPerYear[commonDenomMapper(period.collateral_type)] =  coins;
  }
  return tokensDistributedBySuppliedAssetPerYear;
};

const updateDisplayValues = async (denoms) => {
  const [
    pricefeedResponse,
    incentiveParamsResponse,
    supplyAccountResponse,
    bep3SupplyResponse,
    cdpParamsResponse,
    btcbCdpResponse,
    busdCdpResponse,
    xrpbCdpResponse,
    bnbCdpResponse,
    kavaCdpResponse,
    hardCdpResponse,
    hbtcCdpResponse,
    hardTotalSuppliedResponse,
    totalCollateralResponse,
    totalPrincipalResponse,
  ] = await Promise.all([
    fetch(BASE_URL + '/pricefeed/prices'),
    fetch(BASE_URL + "/incentive/parameters"),
    fetch(BASE_URL + '/auth/accounts/kava1wq9ts6l7atfn45ryxrtg4a2gwegsh3xha9e6rp'),
    fetch(BASE_URL + "/bep3/supplies"),
    fetch(BASE_URL + "/cdp/parameters"),
    fetch(BASE_URL + '/cdp/cdps/collateralType/btcb-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/busd-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/xrpb-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/bnb-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/ukava-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/hard-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/hbtc-a'),
    fetch(`${BASE_URL}/hard/total-deposited`),
    fetch(BASE_URL + '/cdp/totalCollateral'),
    fetch(BASE_URL + '/cdp/totalPrincipal'),
  ]);
  const pricefeedPrices = await pricefeedResponse.json()

  const incentiveParamsJson = await incentiveParamsResponse.json();
  const suppliedAmountJson = await supplyAccountResponse.json();
  const bep3SupplyJson = await bep3SupplyResponse.json();
  const cdpParamsJson = await cdpParamsResponse.json();
  const btcPlatformAmountsJson = await btcbCdpResponse.json();
  const busdPlatformAmountsJson = await busdCdpResponse.json();
  const xrpPlatformAmountsJson = await xrpbCdpResponse.json();
  const bnbPlatformAmountsJson = await bnbCdpResponse.json();
  const ukavaPlatformAmountsJson = await kavaCdpResponse.json();
  const hardPlatformAmountsJson = await hardCdpResponse.json();
  const hbtcPlatformAmountsJson = await hbtcCdpResponse.json();
  const hardTotalSuppliedJson = await hardTotalSuppliedResponse.json();
  const totalCollateralJson = await totalCollateralResponse.json(); 
  const totalPrincipalJson = await totalPrincipalResponse.json(); 

  let siteData = {}
  const cssIds = mapCssIds(denoms)

  const denomConversions = setConversionFactors(denoms)
  siteData['denomConversions'] = denomConversions;

  const rewardsStartDates = setRewardsDates(denoms)
  siteData['rewardsStartDates'] = rewardsStartDates;

  const prices = await mapPrices(denoms, pricefeedPrices.result);
  siteData['prices'] = prices;

  const incentiveParamsData = await mapIncentiveParams(denoms, incentiveParamsJson.result.usdx_minting_reward_periods)
  siteData['incentiveParamsData'] = incentiveParamsData;

    const platformAmounts = await mapPlatformAmounts(totalCollateralJson.result, totalPrincipalJson.result); 
    siteData['platformAmounts'] = platformAmounts;

  const cdpParamsData = await mapUsdxLimits(denoms, cdpParamsJson.result);
  siteData['cdpParamsData'] = cdpParamsData

  const usdxBorrowed = await mapUsdxBorrowed(denoms, siteData)
  siteData['usdxBorrowed'] = usdxBorrowed;

  const suppliedAmounts = mapSuppliedAmounts(denoms, suppliedAmountJson.result.value.coins);
  siteData['suppliedAmounts'] = suppliedAmounts;

  const bep3SupplyData = await mapBep3Supplies(denoms, bep3SupplyJson.result);
  siteData['bep3SupplyData'] = bep3SupplyData;

  const totalSupplied = await mapTotalSupplied(denoms, siteData)
  siteData['totalSupplied'] = totalSupplied;

  const cdpInterestRate = await mapCdpInterestRates(denoms, cdpParamsJson.result);
  siteData['cdpInterestRate'] = cdpInterestRate;

  const hardTotalSupplied = formatCoins(hardTotalSuppliedJson.result);
  siteData['hardTotalSupplied'] = hardTotalSupplied;

  const hardIncentiveParams = await incentiveParamsJson.result;
  siteData['hardIncentiveParams'] = hardIncentiveParams;

  const hardSupplyRewardsPerYearByDenom = await getRewardPerYearByDenom(siteData);
  siteData['hardSupplyRewardsPerYearByDenom'] = hardSupplyRewardsPerYearByDenom;
  console.log(siteData)
  // set display values
  await setTotalRewardsDistributedDisplayValue(siteData, cssIds)

  await setTotalBorrowedDisplayValues(denoms, siteData, cssIds)

  await setTotalLockedDisplayValues(denoms, siteData, cssIds)

  await setRewardsApyDisplayValues(denoms, siteData, cssIds)

  await setTotalAssetDisplayValue(siteData, cssIds)

  await setBorrowApyDisplayValues(denoms, siteData, cssIds);

  await setHardRewardApyDisplayValue(denoms, siteData, cssIds);

  // used to show loading skeltons while data is loading, then remove them once data is loaded
  $(".metric-blur").css("background-color", "transparent")
  $(".metric-blur").addClass('without-after');
  $(".api-metric").css({"display": "block", "text-align": "center"})
};

const main = async () => {
  const denoms = [
    'bnb-a', 'btcb-a', 'busd-a',
    'hbtc-a', 'xrpb-a', 'hard-a',
    'ukava-a', 'usdx', 'swp-a',
  ]

  await updateDisplayValues(denoms);
  await sleep(30000);
  main()
}

const sleep = (ms = 10000) => { return new Promise(resolve => setTimeout(resolve, ms)); }

main();