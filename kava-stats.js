const FACTOR_SIX = Number(10 ** 6)
const FACTOR_EIGHT = Number(10 ** 8)
const BASE_URL = "https://api.kava.io/";
const BINANACE_URL = "https://api.binance.com/api/v3/"

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

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

var formatMoneyMillions = (v) => {
  const valueBorrowedInMil = v/FACTOR_SIX
  const valueBorrowedFormatted = usdFormatter.format(valueBorrowedInMil)
  return valueBorrowedFormatted + "M"
}

var formatMoneyNoDecimalsOrLabels = (v) => {
  const fm = usdFormatter.format(v)
  return fm.slice(1, fm.length-3)
}

const noDollarSign = (value) => {
  return value.slice(1, value.length);
}

var isKavaNativeAsset = (d) => {
  return ['ukava-a', 'usdx', 'hard', 'ukava', 'hard-a', 'swp'].includes(d)
}

var denomLabel = (v) => {
  switch(v) {
    case 'xrpb-a':
      return 'XRP'
    case 'ukava-a':
      return 'KAVA'
    case 'btcb-a':
      return 'BTC'
    default:
      return v.split('-')[0].toUpperCase()
  }
}

// var bnbAmountOnPlatform = (data) => {
//   const denomData = data.result.find((d) => d.current_supply.denom === 'bnb')
//   return Number(denomData.current_supply.amount)
// }
//
// var totalAmountOnPlatformByDenom = (data, denom) => {
//   const denomData = data.result.find((d) => d.denom === denom)
//   return Number(denomData.amount)
// }

// var supplyLimitByDenom = (denom, bep3ParamsDataOld) => {
//   const assetParams = bep3ParamsDataOld.result.asset_params;
//
//   const denomParams = assetParams.find(
//     (item) => item.denom.toUpperCase() === denom.toUpperCase()
//   );
//
//   let hasSupplyLimit = denomParams && denomParams.supply_limit && denomParams.supply_limit.limit;
//   return hasSupplyLimit ? (Number(denomParams.supply_limit.limit)/FACTOR_EIGHT) : 0
// };
//
// var setDenomTotalSupplied = (denomSupplyFromAcct, factor, denomPrice, denomLockedId) => {
//   const denomTotalSupplyCoin = denomSupplyFromAcct/factor;
//   const denomTotalSupplyValue = Number(denomTotalSupplyCoin * denomPrice);
//   setDisplayValue(noDollarSign(denomTotalSupplyValue), denomLockedId);
//   return denomTotalSupplyValue
// }

const setDenomTotalSuppliedDisplayValues = async (denoms, siteData, cssIds) => {
  const totalSuppliedData = siteData['totalSuppliedData']

  for (const denom of denoms) {
    const totalSupplied = totalSuppliedData[denom]

    const formattedTotalSupplied = noDollarSign(usdFormatter.format(totalSupplied))

    const desktopCssId = cssIds[denom].totalSupplied['d']
    const mobileCssId = cssIds[denom].totalSupplied['m']

    setDisplayValueById(desktopCssId, formattedTotalSupplied)
    setDisplayValueById(mobileCssId, formattedTotalSupplied)
  }
}

const setAssetLimitUsdxDisplayValue = async (denoms, siteData, cssIds) => {
  const cdpParamsData = siteData['cdpParamsData'];

  for (const denom of denoms) {
    if (denom !== 'usdx') {continue; }
    const desktopCssId = cssIds[denom]['assetLimit']['d']
    const mobileCssId = cssIds[denom]['assetLimit']['m']

    const usdxDebtLimit = formatMoneyNoDecimalsOrLabels(cdpParamsData[denom].debtLimit)
    const formattedUsdxDebitLimit = usdxDebtLimit + ' ' + denomLabel('usdx')

    setDisplayValueById(desktopCssId, formattedUsdxDebitLimit)
    setDisplayValueById(mobileCssId, formattedUsdxDebitLimit)
  }
}

const setAssetLimitDisplayValues = async (denoms, siteData, cssIds) => {
  const bep3ParamsData = siteData['bep3ParamsData'];

  for (const denom of denoms) {
    if (isKavaNativeAsset(denom)) { continue; }
    const desktopCssId = cssIds[denom]['assetLimit']['d']
    const mobileCssId = cssIds[denom]['assetLimit']['m']

    const formattedAssetLimit = formatMoneyNoDecimalsOrLabels(bep3ParamsData[denom]) + ' ' + denomLabel(denom)
    setDisplayValueById(desktopCssId, formattedAssetLimit)
    setDisplayValueById(mobileCssId, formattedAssetLimit)
  }
}

const mapCssIds = (denoms) => {
  let ids = {}
  ids['totalAssetsSupplied'] = 't-a-s'
  ids['totalAssetsBorrowed'] = 't-a-b'
  ids['totalMarketCap'] = 't-m-c'

  // for the individual lending stats table
  for (const denom of denoms) {
    ids[denom] = {};
    ids[denom].totalSupplied = {
      d: formatCssId('ts', denom),
      m: formatCssId('ts-m', denom)
    }
    ids[denom].totalEarned = {
      d: formatCssId('te', denom),
      m: formatCssId('te-m', denom)
    }
    ids[denom].marketCap = {
      d: formatCssId('mc', denom),
      m: formatCssId('mc-m', denom)
    }
    ids[denom].supplied = {
      d: formatCssId('s', denom),
      m: formatCssId('s-m', denom)
    }
    ids[denom].price = {
      price: formatCssId('price', denom),
      d: formatCssId('price-d', denom),
      md: formatCssId('price-md', denom)
    }
    ids[denom].priceChangePercent = {
      pc: formatCssId('pc', denom),
      d: formatCssId('pc-d', denom),
      md: formatCssId('pc-md', denom)
    }
    ids[denom].totalBorrowed = formatCssId('tb', denom)
    ids[denom].borrowLimit = formatCssId('bl', denom)
    ids[denom].apy = {
      ea: formatCssId('ea', denom),
      m: formatCssId('ea-m', denom)
    }
    ids[denom].assetLimit = {
      d: formatCssId('al', denom),
      m: formatCssId('al-m', denom)
    }
    ids[denom].borrowApy = formatCssId('borrow-apy', denom)
  }
  return ids;
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

const mapMarketData = async (denoms, marketData) => {
  let prices = {}
  let mappedMarkets = {};

  for (const market in marketData) {
    mappedMarkets[market] = { priceChangePercent: marketData[market].priceChangePercent };
  }

  for (const denom of denoms) {
    let priceChangePercent = mappedMarkets[denom] ? mappedMarkets[denom].priceChangePercent : ' '
    prices[denom] = { priceChangePercent: priceChangePercent }
  }

  return prices
}

const mapDenomTotalSupplied = async (denoms, siteData) => {
  const suppliedAmounts = siteData['suppliedAmounts']
  const denomConversions = siteData['denomConversions']
  const prices = siteData['prices']

  let coins = {}

  for (const denom of denoms) {
    const suppliedDenom = suppliedAmounts[denom].amount
    const factor = denomConversions[denom]
    const price = prices[denom].price

    const coinValue = suppliedDenom / factor
    const denomTotalSupplyValue = coinValue * price

    coins[denom] = denomTotalSupplyValue
  }

  return coins
}

const mapPlatformAmounts = async (denoms, platformAmounts) => {
  const coins = {};

  for (const denom of denoms) {
    const coin = { locked: 0, borrowed: 0, fees: 0 };
    const platformAmount = platformAmounts[denom];

    if(platformAmount) {
      const { collateral, principal, accumulated_fees } = platformAmount.reduce(function(accumulator, item) {
        Object.keys(item.cdp).forEach(function(key) {
          let c = ['collateral', 'principal', 'accumulated_fees'];
          if(c.includes(key)){
            accumulator[key] = Number((accumulator[key] || 0)) + Number(item.cdp[key].amount);
          }
        });
        return accumulator;
      }, {});

      coin['locked'] = isKavaNativeAsset(denom) ? Number(collateral/FACTOR_SIX) : Number(collateral/FACTOR_EIGHT)
      coin['borrowed'] = Number(principal/FACTOR_SIX)
      coin['fees'] = Number(accumulated_fees/FACTOR_SIX)
    }
    coins[denom] = coin;
  }
  return coins;
};

const mapCdpParams = async (denoms, cdpParamsData) => {
  const coins = {};

  const mappedLimits = {};
  const mappedStabilityFees = {};
  let usdxDebtLimit = 0;
  if(cdpParamsData) {
    for (const denom of cdpParamsData.collateral_params) {

      const debtLimit = denom.debt_limit ? Number(denom.debt_limit.amount)/FACTOR_SIX : 0;
      mappedLimits[denom.type] = { debtLimit }

      const secondsPerYear = 31536000;
      const stabilityFeePercentage = ((Number(denom.stability_fee) ** secondsPerYear - 1) * 100).toFixed(2);
      mappedStabilityFees[denom.type] = stabilityFeePercentage
    }

    usdxDebtLimit = Number(cdpParamsData.global_debt_limit.amount)/FACTOR_SIX;
  }

  for (const denom of denoms) {
    let limit = 0;
    let stabilityFee = ' ';

    if (denom === 'usdx') {
      limit = usdxDebtLimit
    } else {
      let cdpParam = mappedLimits[denom]
      if(cdpParam) { limit = cdpParam.debtLimit }
    }

    coins[denom] = { debtLimit: limit, stabilityFeePercentage: mappedStabilityFees[denom] }
  }
  return coins;
};


const mapUsdxBorrowed = async (denoms, siteData) => {
  const coins = { total: 0 }

  for (const denom of denoms) {
    const cdpParamsData = siteData['cdpParamsData'][denom];
    const platformData = siteData['platformAmounts'][denom];

    let usdxAmount = 0;
    if(cdpParamsData && platformData) {
      const usdxBorrowedAndFees = platformData.borrowed + platformData.fees;
      usdxAmount = usdxBorrowedAndFees > cdpParamsData.debtLimit ? cdpParamsData.debtLimit : usdxBorrowedAndFees;
      coins['total'] += usdxAmount;
    }
    coins[denom] = usdxAmount;
  }
  return coins;
}

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

const mapSuppliedAmounts = (denoms, coins) => {
  let formattedCoins = {};

  let mappedCoins = {}
  for (const coin of coins) {
    mappedCoins[commonDenomMapper(coin.denom)] = { denom: coin.denom, amount: coin.amount }
  }

  for(const denom of denoms) {
    let coin = emptyCoin(denom);

    let accountCoin = mappedCoins[denom]
    // if (denom === 'swp') {
    //   const swapSuppliedAmount = coins.find(coin => coin.denom === 'swp').amount
    //   // console.log('swapSuppliedAmount', swapSuppliedAmount)
    //   accountCoin = {
    //     denom: 'swp',
    //     amount: swapSuppliedAmount
    //   }
    // }

    if(accountCoin) {
      coin = { denom: commonDenomMapper(accountCoin.denom), amount: Number(accountCoin.amount) }
    }
    formattedCoins[denom] = coin
  }
  return formattedCoins
}

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

const mapBep3Params = async (denoms, bep3ParamsData, siteData) => {
  const coins = {};

  const mappedBep3Params = {};
  for (const param of bep3ParamsData) {
    mappedBep3Params[commonDenomMapper(param.denom)] = Number(param.supply_limit.limit)
  }


  const denomConversions = siteData['denomConversions'];

  for (const denom of denoms) {
    let bep3SupplyLimit = mappedBep3Params[denom];

    let limit = 0;
    if (bep3SupplyLimit) { limit = bep3SupplyLimit / denomConversions[denom] }

    coins[denom] = limit
  }

  return coins
}

const mapSupplyAndMarket = async (denoms, siteData) => {
  // siteData['supplyData']['swp'] = siteData['suppliedAmounts']['swp'];
  const supplydata = siteData['supplyData']
  const bep3SupplyData = siteData['bep3SupplyData']
  const denomConversions = siteData['denomConversions']

  const coins = { }
  for (const denom of denoms) {
    // think we do this because of the double spend?
    const denomTotalSupply = denom === 'bnb-a' ? bep3SupplyData[denom] : supplydata[denom].amount
    const factor = denomConversions[denom]

    const denomTotalSupplyCoin = denomTotalSupply / factor
    coins[denom] = denomTotalSupplyCoin
  }
  return coins
}

const mapUsdxMarketData = async (usdxMarketJson) => {
  return usdxMarketJson.market_data.price_change_percentage_24h
}

const setSwpSupplyAmount = async (supplyTotalJson) => {
  const swpSupplyAmount = Number(supplyTotalJson.result.find(coin => coin.denom === 'swp').amount);

  return {
    denom: 'swp',
    amount: swpSupplyAmount
  }
};

const setSwpPoolPrice = async (swpMarketDataJson) => {
  const usdxReserveAmount =  swpMarketDataJson.result.coins.find(coin => coin.denom === 'usdx').amount / FACTOR_SIX;
  const swpReserveAmount =  swpMarketDataJson.result.coins.find(coin => coin.denom === 'swp').amount / FACTOR_SIX;

  const swpPrice = usdxReserveAmount / swpReserveAmount;

  return {
    price: swpPrice
  };
};


const setTotalEarningsDisplayValues = async (denoms, siteData, cssIds) => {
  const usdxMintingRewards = siteData['incentiveParamsData'];
  const rewardsStartDates = siteData['rewardsStartDates'];
  const denomConversions = siteData['denomConversions'];

  const rewards = {};
  for (const denom in usdxMintingRewards) {
    const rewardDenom = formatRewardDenom(usdxMintingRewards[denom].denom);

    const millisecondsRewardActive = Date.now() - rewardsStartDates[denom].getTime();

    const secondsRewardActive = millisecondsRewardActive / 1000;
    const factor = denomConversions[rewardDenom]

    const coinPerYear = (Number(usdxMintingRewards[denom].amount) * Number(secondsRewardActive)) / factor;
    const price = siteData['prices'][rewardDenom] ? siteData['prices'][rewardDenom].price : 0;
    rewards[denom] = usdFormatter.format(coinPerYear * price);
  }

  for (const denom of denoms) {
    let desktopCssId = cssIds[denom]['totalEarned']['d'];
    let mobileCssId = cssIds[denom]['totalEarned']['m'];

    let reward = rewards[denom]
    setDisplayValueById(desktopCssId, reward)
    setDisplayValueById(mobileCssId, reward)
  }
}

const setPriceDisplayValues = async (denoms, siteData, cssIds) => {
  const prices = siteData['prices'];
  for (const denom of denoms) {
    const price = prices[denom].price
    const kavaLendingCssId = cssIds[denom]['price']['price'];

    let kavaDefiDesktopCssId = cssIds[denom]['price']['d'];
    let kavaDefiMobileCssId = cssIds[denom]['price']['md'];
    const formattedPrice = usdFormatter.format(price)

    setDisplayValueById(kavaLendingCssId, formattedPrice)
    setDisplayValueById(kavaDefiDesktopCssId, formattedPrice)
    setDisplayValueById(kavaDefiMobileCssId, formattedPrice)
  }
}

const setPriceChangeDisplayValues = async (denoms, siteData, cssIds) => {
  const marketData = siteData['marketData'];
  for (const denom of denoms) {
    const priceChangePercent = Number(marketData[denom].priceChangePercent);
    const kavaLendingCssId = cssIds[denom]['priceChangePercent']['pc'];
    let kavaDefiDesktopCssId = cssIds[denom]['priceChangePercent']['d'];
    let kavaDefiMobileCssId = cssIds[denom]['priceChangePercent']['md'];

    let formattedChangePercent = noDollarSign(usdFormatter.format(priceChangePercent)) + "%";

    if(priceChangePercent > 0) {
      formattedChangePercent =  "+" + formattedChangePercent
      setDisplayColor(kavaLendingCssId, 'green')
      setDisplayColor(kavaDefiDesktopCssId, 'green')
      setDisplayColor(kavaDefiMobileCssId, 'green')
    } else if (priceChangePercent === 0) {
      setDisplayColor(kavaLendingCssId, 'grey')
      setDisplayColor(kavaDefiDesktopCssId, 'grey')
      setDisplayColor(kavaDefiMobileCssId, 'grey')
    } else {
      formattedChangePercent =  "-" + noDollarSign(formattedChangePercent)
      setDisplayColor(kavaLendingCssId, 'red')
      setDisplayColor(kavaDefiDesktopCssId, 'red')
      setDisplayColor(kavaDefiMobileCssId, 'red')
    }

    setDisplayValueById(kavaLendingCssId, formattedChangePercent)
    setDisplayValueById(kavaDefiDesktopCssId, formattedChangePercent)
    setDisplayValueById(kavaDefiMobileCssId, formattedChangePercent)
  }
}

const setTotalBorrowedBorrowLimitAndLimitBarDisplayValues = async (denoms, siteData, cssIds) => {
  const usdxBorrowed = siteData['usdxBorrowed'];
  const cdpParamsData = siteData['cdpParamsData']

  for (const denom of denoms) {
    const totalBorrowedCssId = cssIds[denom]['totalBorrowed']
    const borrowLimitCssId = cssIds[denom]['borrowLimit']

    const usdxAmount = usdxBorrowed[denom];
    const usdxLimit = cdpParamsData[denom].debtLimit;

    const formattedUsdxAmount = formatMoneyNoDecimalsOrLabels(usdxAmount);
    const formmatedUsdxLimit = formatMoneyNoDecimalsOrLabels(usdxLimit);
    setDisplayValueById(totalBorrowedCssId, formattedUsdxAmount)
    setDisplayValueById(borrowLimitCssId, formmatedUsdxLimit)

    // borrow limit bar
    let rawUsdxUtilization = 0;
    if(Number(usdxLimit.toFixed(0)) !== 0) {
      rawUsdxUtilization = Number(usdxAmount.toFixed(0)) / Number(usdxLimit.toFixed(0))
    }
    const percentUsdxUtilization = Number(rawUsdxUtilization.toFixed(3) * 100).toFixed(2) + "%";

    const element = $(`.percent-line-usdx-${denom}`)
    if (element) { element.css("width", percentUsdxUtilization); }
  }
}

const setBorrowApyDisplayValues = async (denoms, siteData, cssIds) => {
  const cdpParamsData = siteData['cdpParamsData'];

  for (const denom of denoms) {
    const borrowApy = cdpParamsData[denom].stabilityFeePercentage;
    const desktopCssId = cssIds[denom]['borrowApy'];
    setDisplayValueById(desktopCssId, borrowApy + "%")
  }
};

const setRewardsApyDisplayValues = async (denoms, siteData, cssIds) => {
  const denomConversions = siteData['denomConversions']

  for (const denom of denoms) {

    const denomPrice = siteData['prices'][denom].price;
    const desktopCssId = cssIds[denom]['apy']['ea'];
    const mobileCssId = cssIds[denom]['apy']['m'];

    const lockedAmount = siteData['platformAmounts'][denom].locked;
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

    setDisplayValueById(desktopCssId, commaSeparatedPercentDisplay + "%")
    setDisplayValueById(mobileCssId, commaSeparatedPercentDisplay + "%")
  }
}

const setTotalAssetsSuppliedDisplayValue = async (siteData, cssIds) => {
  let cssId = cssIds['totalAssetsSupplied'];
  let totalAssetsSupplied = 0;
  const totalSuppliedData = siteData['totalSuppliedData'];
  for (const denom in totalSuppliedData) {
    const denomSuppliedUsd = totalSuppliedData[denom]
    totalAssetsSupplied += denomSuppliedUsd
  }
  const totalAssetsSuppliedUsd = usdFormatter.format(totalAssetsSupplied);

  setDisplayValueById(cssId, noDollarSign(totalAssetsSuppliedUsd))
}

const setTotalAssetsBorrowedDisplayValue = async (siteData, cssIds) => {
  let cssId = cssIds['totalAssetsBorrowed'];
  const usdxBorrowed = siteData['usdxBorrowed'].total
  const totalAssetsBorrowedUsd = usdFormatter.format(usdxBorrowed);
  setDisplayValueById(cssId, noDollarSign(totalAssetsBorrowedUsd))
}

const setMarketCapDisplayValues = async (denoms, siteData, cssIds) => {
  const defiCoinsSupply = siteData['defiCoinsSupply'];
  const swpSupply = siteData['supplyData']['swp'].amount
  const prices = siteData['prices'];
  const cssId = cssIds['totalMarketCap'];

  let total = 0;

  for (const denom of denoms) {
    const price = prices[denom].price
    let suppliedCoin = defiCoinsSupply[denom]

    if (denom === 'swp') {
      suppliedCoin = swpSupply / FACTOR_SIX;
    }

    const suppliedDenomUsd = suppliedCoin * price;
    total += suppliedDenomUsd

    const desktopCssId = cssIds[denom]['marketCap']['d']
    const mobileCssId = cssIds[denom]['marketCap']['m']

    setDisplayValueById(desktopCssId, formatMoneyMillions(suppliedDenomUsd))
    setDisplayValueById(mobileCssId, formatMoneyMillions(suppliedDenomUsd))
  }
  setDisplayValueById(cssId, noDollarSign(usdFormatter.format(total)))
}
//
// var setDenomTotalSupplyValue = async (supplyDataOld, denomPrice, platformDenom) => {
//   let denomTotalSupply;
//   platformDenom === 'bnb' ?
//     denomTotalSupply = bnbAmountOnPlatform(supplyDataOld) :
//     denomTotalSupply = totalAmountOnPlatformByDenom(supplyDataOld, platformDenom)
//   let denomTotalSupplyConverted
//   isKavaNativeAsset(platformDenom) ?
//     denomTotalSupplyConverted = Number(denomTotalSupply)/FACTOR_SIX :
//     denomTotalSupplyConverted = Number(denomTotalSupply)/FACTOR_EIGHT
//   let denomTotalSupplyValue =  Number(denomTotalSupplyConverted * denomPrice)
//
//   let data = {}
//   data[`${platformDenom}Usd`] = denomTotalSupplyValue
//   data[`${platformDenom}MarketCap`] = formatMoneyMillions(denomTotalSupplyValue)
//   data[`${platformDenom}Supply`] = formatMoneyNoDecimalsOrLabels(denomTotalSupplyConverted) + ' ' + denomLabel(platformDenom)
//
//   return data;
// };

const setSupplyDisplayValues = async (denoms, siteData, cssIds) => {
  const defiCoinsSupply = siteData['defiCoinsSupply']

  for (const denom of denoms) {
    const supply = defiCoinsSupply[denom]
    const formattedSupply = formatMoneyNoDecimalsOrLabels(supply) + ' ' + denomLabel(denom)

    const desktopCssId = cssIds[denom]['supplied']['d']
    const mobileCssId = cssIds[denom]['supplied']['m']

    setDisplayValueById(desktopCssId, formattedSupply)
    setDisplayValueById(mobileCssId, formattedSupply)
  }
}

const setDisplayColor = (cssId, color) => {
  $(`#${cssId}`).css({ color: color });
}

const setDisplayValueById = (cssId, value) => {
  const lastElement = $(`#${cssId}`).last();
  const firstElement = $(`#${cssId}`).first();
  if (lastElement) { lastElement.html(value) }
  if (firstElement) { firstElement.html(value) }
};

const updateDisplayValues = async (denoms) => {

  const [
    pricefeedResponse,
    incentiveParamsResponse,
    kavaMarketResponse,
    hardMarketResponse,
    bnbMarketResponse,
    busdMarketResponse,
    btcbMarketResponse,
    xrpbMarketResponse,
    usdxMarketResponse,
    swpMarketResponse,
    supplyAccountResponse,
    supplyTotalResponse,
    bep3SupplyResponse,
    bep3ParamsResponse,
    cdpParamsResponse,
    btcbCdpResponse,
    busdCdpResponse,
    xrpbCdpResponse,
    bnbCdpResponse,
    kavaCdpResponse,
    hardCdpResponse,
    hbtcCdpResponse

  ] = await Promise.all([
    fetch(BASE_URL + "pricefeed/prices"),
    fetch(BASE_URL + "incentive/parameters"),
    fetch(BINANACE_URL + "ticker/24hr?symbol=KAVAUSDT"),
    fetch(BINANACE_URL + "ticker/24hr?symbol=HARDUSDT"),
    fetch(BINANACE_URL + "ticker/24hr?symbol=BNBUSDT"),
    fetch(BINANACE_URL + "ticker/24hr?symbol=BUSDUSDT"),
    fetch(BINANACE_URL + "ticker/24hr?symbol=BTCUSDT"),
    fetch(BINANACE_URL + "ticker/24hr?symbol=XRPUSDT"),
    fetch('https://api.coingecko.com/api/v3/coins/usdx'),
    fetch(BASE_URL + 'swap/pool?pool=swp:usdx'),
    fetch(BASE_URL + 'auth/accounts/kava1wq9ts6l7atfn45ryxrtg4a2gwegsh3xha9e6rp'),
    fetch(BASE_URL + "supply/total"),
    fetch(BASE_URL + "bep3/supplies"),
    fetch(BASE_URL + "bep3/parameters"),
    fetch(BASE_URL + "cdp/parameters"),
    fetch(BASE_URL + '/cdp/cdps/collateralType/btcb-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/busd-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/xrpb-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/bnb-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/ukava-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/hard-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/hbtc-a'),
  ]);


  const pricefeedPrices = await pricefeedResponse.json()
  const incentiveParamsJson = await incentiveParamsResponse.json();
  const suppliedAmountJson = await supplyAccountResponse.json();
  const supplyTotalJson = await supplyTotalResponse.json()
  const bep3SupplyJson = await bep3SupplyResponse.json();
  const bep3ParamsJson = await bep3ParamsResponse.json()

  const cdpParamsJson = await cdpParamsResponse.json();
  const btcPlatformAmountsJson = await btcbCdpResponse.json();
  const busdPlatformAmountsJson = await busdCdpResponse.json();
  const xrpPlatformAmountsJson = await xrpbCdpResponse.json();
  const bnbPlatformAmountsJson = await bnbCdpResponse.json();
  const ukavaPlatformAmountsJson = await kavaCdpResponse.json();
  const hardPlatformAmountsJson = await hardCdpResponse.json();
  const hbtcPlatformAmountsJson = await hbtcCdpResponse.json()

  const bnbMarketData = await bnbMarketResponse.json();
  const btcbMarketData = await btcbMarketResponse.json();
  const busdMarketData = await busdMarketResponse.json();
  const xrpbMarketData = await xrpbMarketResponse.json();
  const hardMarketData = await hardMarketResponse.json();
  const kavaMarketData = await kavaMarketResponse.json();
  const usdxMarketDataJson = await usdxMarketResponse.json();
  const swpMarketDataJson = await swpMarketResponse.json();


  const platformAmounts = {
    'bnb-a': await bnbPlatformAmountsJson.result,
    'btcb-a': await btcPlatformAmountsJson.result,
    'busd-a': await busdPlatformAmountsJson.result,
    'hbtc-a': await hbtcPlatformAmountsJson.result,
    'xrpb-a': await xrpPlatformAmountsJson.result,
    'hard-a': await hardPlatformAmountsJson.result,
    'ukava-a': await ukavaPlatformAmountsJson.result
  }

  const markets = {
    'bnb-a': await bnbMarketData,
    'btcb-a': await btcbMarketData,
    'busd-a': await busdMarketData,
    'hbtc-a': await btcbMarketData,
    'xrpb-a': await xrpbMarketData,
    'hard-a': await hardMarketData,
    'ukava-a': await kavaMarketData
  }
  // usdx market data comes from a different api so we don't want it to
  // map the same with the other markets


  let siteData = {}
  // fix cssIds
  const cssIds = mapCssIds(denoms)

  const denomConversions = setConversionFactors(denoms)
  siteData['denomConversions'] = denomConversions;

  const rewardsStartDates = setRewardsDates(denoms)
  siteData['rewardsStartDates'] = rewardsStartDates;

  const marketData = await mapMarketData(denoms, markets)
  siteData['marketData'] = marketData;

  const usdxMarketData = await mapUsdxMarketData(usdxMarketDataJson)
  siteData['marketData']['usdx']['priceChangePercent'] = usdxMarketData;

  const prices = await mapPrices(denoms, pricefeedPrices.result);
  siteData['prices'] = prices;

  const swpPoolPrice = await setSwpPoolPrice(swpMarketDataJson);
  siteData['prices']['swp'] = swpPoolPrice;

  const incentiveParamsData = await mapIncentiveParams(denoms, incentiveParamsJson.result.usdx_minting_reward_periods)
  siteData['incentiveParamsData'] = incentiveParamsData;

  const platformData = await mapPlatformAmounts(denoms, platformAmounts)
  siteData['platformAmounts'] = platformData

  const cdpParamsData = await mapCdpParams(denoms, cdpParamsJson.result);
  siteData['cdpParamsData'] = cdpParamsData

  const usdxBorrowed = await mapUsdxBorrowed(denoms, siteData)
  siteData['usdxBorrowed'] = usdxBorrowed;

  const suppliedAmounts = mapSuppliedAmounts(denoms, suppliedAmountJson.result.value.coins);
  siteData['suppliedAmounts'] = suppliedAmounts;

  const totalSuppliedData = await mapDenomTotalSupplied(denoms, siteData)
  siteData['totalSuppliedData'] = totalSuppliedData;

  const supplyData = mapSuppliedAmounts(denoms, supplyTotalJson.result);
  siteData['supplyData'] = supplyData;

  const suppliedSwpAmount = await setSwpSupplyAmount(supplyTotalJson);
  siteData['supplyData']['swp'] = suppliedSwpAmount;

  const bep3SupplyData = await mapBep3Supplies(denoms, bep3SupplyJson.result);
  siteData['bep3SupplyData'] = bep3SupplyData;

  const bep3ParamsData = await mapBep3Params(denoms, bep3ParamsJson.result.asset_params, siteData);
  siteData['bep3ParamsData'] = bep3ParamsData;

  const defiCoinsSupply = await mapSupplyAndMarket(denoms, siteData)
  siteData['defiCoinsSupply'] = defiCoinsSupply;

  // set display values
  await setTotalEarningsDisplayValues(denoms, siteData, cssIds)

  await setPriceDisplayValues(denoms, siteData, cssIds)

  await setPriceChangeDisplayValues(denoms, siteData, cssIds)

  await setTotalBorrowedBorrowLimitAndLimitBarDisplayValues(denoms, siteData, cssIds)

  await setRewardsApyDisplayValues(denoms, siteData, cssIds)

  await setAssetLimitDisplayValues(denoms, siteData, cssIds)

  await setAssetLimitUsdxDisplayValue(denoms, siteData, cssIds)

  await setDenomTotalSuppliedDisplayValues(denoms, siteData, cssIds)

  // denoms not needed here since totalSupplieData has already looped through the denoms
  await setTotalAssetsSuppliedDisplayValue(siteData, cssIds)
  await setTotalAssetsBorrowedDisplayValue(siteData, cssIds)

  await setMarketCapDisplayValues(denoms, siteData, cssIds)

  await setSupplyDisplayValues(denoms, siteData, cssIds)
  await setBorrowApyDisplayValues(denoms, siteData, cssIds);

  $(".metric-blur").css("background-color", "transparent")
  $(".metric-blur").addClass('without-after');
  $(".api-metric").css({"display": "block", "text-align": "center"})
};

var main = async () => {
  const denoms = [
    'bnb-a', 'btcb-a', 'busd-a',
    'hbtc-a', 'xrpb-a', 'hard-a',
    'ukava-a', 'usdx', 'swp'
  ]

  await updateDisplayValues(denoms);
  await sleep(30000);
  main()
}

var sleep = (ms = 10000) => { return new Promise(resolve => setTimeout(resolve, ms)); }

main();
