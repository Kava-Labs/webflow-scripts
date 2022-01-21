const FACTOR_SIX = Number(10 ** 6)
const FACTOR_EIGHT = Number(10 ** 8)
const BASE_URL = "https://api2.kava.io/";
const BINANACE_URL = "https://api.binance.com/api/v3/"

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})


// TODO add other denoms here as they become available 
const ibcDenoms = {
  "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2": "uatom-a",
  // TODO 
  // "ibc/.": "uakt-a", 
  // "ibc/..": "luna-a",
  // "ibc/...":"uosmo-a",
};

const setConversionFactors = (denoms) => {
  const denomConversions = {};
  for (const denom of denoms) {
    if (isKavaNativeAsset(denom)) {
      denomConversions[denom] = FACTOR_SIX;
    } else if (denom === "uatom-a"){
      denomConversions[denom] = FACTOR_SIX;
    } 
    else {
      denomConversions[denom] = FACTOR_EIGHT;
    }
  }
  return denomConversions;
}

const setRewardsDates = (denoms) => {
  const rewardsStartDates = {}

  for (const denom of denoms) {
    let date;
    switch (denom) {
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
  const commonDenoms = {
    "btc": "btcb-a",
    "uatom-a": "uatom-a",
    "usdx": "usdx",
    "kava": "ukava-a",
    "xrp": "xrpb-a",
  };
  const commonDenom = commonDenoms[denom];
  if (commonDenom) {
    return commonDenom;
  }
  return denom + '-a';
}
const ibcDenomMapper = (denom) => {
  if (!denom.includes("ibc")) {
    return denom;
  };

  if (ibcDenoms.hasOwnProperty(denom)) {
    return ibcDenoms[denom];
  };
};

const normalizeDenoms = (denomsList) => {
  const readableDenoms = [];
  for (let d of denomsList) {
    if (d.denom.includes('ibc')) {
      const parsedDenom = ibcDenomMapper(d.denom);
      readableDenoms.push({ ...d, denom: parsedDenom })
    } else {
      readableDenoms.push(d);
    }
  }
  return readableDenoms;
};

const emptyCoin = (denom) => { return { denom, amount: 0 } }

const formatCssId = (value, denom) => {
  let displayDenom;
  switch (denom) {
    case 'xrpb-a':
      displayDenom = denom.split('b-')[0]
      break;
    case 'ukava-a':
      displayDenom = 'kava'
      break;
    case 'uatom-a':
      displayDenom = 'atom';
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
  switch (denom) {
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

const formatMoneyMillions = (v) => {
  const valueBorrowedInMil = v / FACTOR_SIX
  const valueBorrowedFormatted = usdFormatter.format(valueBorrowedInMil)
  return valueBorrowedFormatted + "M"
}
const formatInThousands = (value) => {
  const valueInK = value / Number(10 ** 3);
  const valueInKUsd = usdFormatter.format(valueInK);
  return valueInKUsd + "K";
}


const formatMoneyNoDecimalsOrLabels = (v) => {
  const fm = usdFormatter.format(v)
  return fm.slice(1, fm.length - 3)
}

const noDollarSign = (value) => {
  return value.slice(1, value.length);
}

const isKavaNativeAsset = (d) => {
  return ['ukava-a', 'usdx', 'hard', 'ukava', 'hard-a', 'swp-a'].includes(d)
}

const denomLabel = (v) => {
  switch (v) {
    case 'xrpb-a':
      return 'XRP'
    case 'ukava-a':
      return 'KAVA'
    case 'btcb-a':
      return 'BTC'
    case 'uatom-a':
      return "ATOM"
    default:
      return v.split('-')[0].toUpperCase()
  }
}

const bnbAmountOnPlatform = (data) => {
  const denomData = data.result.find((d) => d.current_supply.denom === 'bnb')
  return Number(denomData.current_supply.amount)
}

const totalAmountOnPlatformByDenom = (data, denom) => {
  const denomData = data.result.find((d) => d.denom === denom)
  return Number(denomData.amount)
}

const supplyLimitByDenom = (denom, bep3ParamsDataOld) => {
  const assetParams = bep3ParamsDataOld.result.asset_params;

  const denomParams = assetParams.find(
    (item) => item.denom.toUpperCase() === denom.toUpperCase()
  );

  let hasSupplyLimit = denomParams && denomParams.supply_limit && denomParams.supply_limit.limit;
  return hasSupplyLimit ? (Number(denomParams.supply_limit.limit) / FACTOR_EIGHT) : 0
};

const setDenomTotalSupplied = (denomSupplyFromAcct, factor, denomPrice, denomLockedId) => {
  const denomTotalSupplyCoin = denomSupplyFromAcct / factor;
  const denomTotalSupplyValue = Number(denomTotalSupplyCoin * denomPrice);
  setDisplayValue(noDollarSign(denomTotalSupplyValue), denomLockedId);

  return denomTotalSupplyValue
}

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
    if (denom !== 'usdx') { continue; }
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
  const nonThirtyPrices = pricefeedResult.filter(p => !p.market_id.includes('30'));
  let prices = {};

  let mappedPrices = {};
  for (const price of nonThirtyPrices) {
    const priceName = price.market_id.split(":")[0];
    mappedPrices[commonDenomMapper(priceName)] = { price: Number(price.price) };

    // hbtc doesn't have it's own price, it just uses btc's price
    if (commonDenomMapper(priceName) === 'btcb-a') {
      mappedPrices['hbtc-a'] = { price: Number(price.price) };
    }
  }

  for (const denom of denoms) {
    let mappedPrice = mappedPrices[denom] || mappedPrices[denom.slice(1)];
    let price = { price: 0 };

    if (mappedPrice) {
      price = { price: mappedPrice.price };
    }
    prices[denom] = price;
  }
  return prices;
};

const mapMarketData = async (denoms, marketData) => {
  let prices = {}
  let mappedMarkets = {};

  for (const market in marketData) {
    mappedMarkets[market] = { priceChangePercent: marketData[market].priceChangePercent };
    if (market === 'swp') {
      mappedMarkets[market] = { priceChangePercent: marketData.swp.market_data.price_change_percentage_24h };
    }
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

const mapPlatformAmounts = async (totalCollateral, totalPrincipal) => {
  const coins = {};
  for (const denom of totalCollateral) {
    const { amount: { amount }, collateral_type } = denom;
    coins[collateral_type] = {};
    coins[collateral_type].collateral = amount;
  };
  for (const denom of totalPrincipal) {
    const { collateral_type, amount: { amount } } = denom;
    coins[collateral_type].principal = amount;
  };
  return coins;
};

const mapCdpParams = async (denoms, cdpParamsData) => {
  const coins = {};
  const mappedLimits = {};
  const mappedStabilityFees = {};
  let usdxDebtLimit = 0;
  if (cdpParamsData) {
    for (const denom of cdpParamsData.collateral_params) {
      const debtLimit = denom.debt_limit ? Number(denom.debt_limit.amount) / FACTOR_SIX : 0;
      mappedLimits[denom.type] = { debtLimit }
      const secondsPerYear = 31536000;
      const stabilityFeePercentage = ((Number(denom.stability_fee) ** secondsPerYear - 1) * 100).toFixed(2);
      mappedStabilityFees[denom.type] = stabilityFeePercentage
    };
    usdxDebtLimit = Number(cdpParamsData.global_debt_limit.amount) / FACTOR_SIX;
  };
  for (const denom of denoms) {
    let limit = 0;
    if (denom === 'usdx') {
      limit = usdxDebtLimit
    } else {
      let cdpParam = mappedLimits[denom]
      if (cdpParam) { limit = cdpParam.debtLimit }
    };
    coins[denom] = { debtLimit: limit, stabilityFeePercentage: mappedStabilityFees[denom] || '0.00' }
  };
  return coins;
};

const mapIncentiveParams = async (denoms, usdxMintingParams) => {
  let coins = {}

  let mappedParams = {}
  if (usdxMintingParams) {
    for (const param of usdxMintingParams) {
      const rewardPerSecond = param.rewards_per_second;
      mappedParams[param.collateral_type] = { denom: rewardPerSecond.denom, amount: Number(rewardPerSecond.amount) }
    }
  }

  for (const denom of denoms) {
    let coinParams = mappedParams[denom]
    // empty coin with 'ukava' assumes reward type is going to be in ukava
    let coin = emptyCoin('ukava')

    if (coinParams) {
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
    mappedCoins[commonDenomMapper(coin.denom)] = { denom: coin.denom, amount: coin.amount };
  }

  for (const denom of denoms) {
    let coin = emptyCoin(denom);
    const accountCoin = mappedCoins[denom];
    if (accountCoin) {
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

    if (bep3Supply) { amount = bep3Supply }
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

const mapSupplyAndMarket = (denoms, siteData) => {
  const supplydata = siteData['supplyData']
  const bep3SupplyData = siteData['bep3SupplyData']
  const denomConversions = siteData['denomConversions']
  const coins = {};
  for (const denom of denoms) {
    // think we do this because of the double spend?
    let denomTotalSupply = 0;
    let factor = FACTOR_EIGHT;

    if (denom === "bnb-a") {
      denomTotalSupply = bep3SupplyData[denom];
    } else {
      if (supplydata[denom]) {
        denomTotalSupply = supplydata[denom].amount;
      }
      else {
        console.warn(`${denom} not found in supplyData object, falling back to zero`);
      }
    }

    if (denomConversions[denom]) {
      factor = denomConversions[denom];
    } else {
      console.warn(`${denom} not found in denomConversions Object, falling back to factor 8`);
    }

    const denomTotalSupplyCoin = denomTotalSupply / factor;
    coins[denom] = denomTotalSupplyCoin
  }
  return coins
}

const mapCoinGeckoApiData = async (coinGeckoApiJson) => {
  //  currently using CoinGecko's API for price change for USDX and SWP
  return coinGeckoApiJson.market_data.price_change_percentage_24h;
}

const setSwpPrice = async (swpMarketJson) => {
  const swpPriceInUSD = swpMarketJson.market_data.current_price.usd;

  return {
    price: swpPriceInUSD
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

    if (priceChangePercent > 0) {
      formattedChangePercent = "+" + formattedChangePercent
      setDisplayColor(kavaLendingCssId, 'green')
      setDisplayColor(kavaDefiDesktopCssId, 'green')
      setDisplayColor(kavaDefiMobileCssId, 'green')
    } else if (priceChangePercent === 0) {
      setDisplayColor(kavaLendingCssId, 'grey')
      setDisplayColor(kavaDefiDesktopCssId, 'grey')
      setDisplayColor(kavaDefiMobileCssId, 'grey')
    } else {
      formattedChangePercent = "-" + noDollarSign(formattedChangePercent)
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
  const platformAmounts = siteData['platformAmounts'];
  const cdpParamsData = siteData['cdpParamsData'];

  for (const denom of denoms) {
    const totalBorrowedCssId = cssIds[denom]['totalBorrowed'];
    const borrowLimitCssId = cssIds[denom]['borrowLimit'];

    let usdxAmount = '0';
    let usdxLimit = 0;
    if (platformAmounts[denom]) {
      usdxAmount = platformAmounts[denom].principal;
    };
    if (cdpParamsData[denom]) {
      usdxLimit = cdpParamsData[denom].debtLimit;
    };

    const formattedUsdxAmount = formatMoneyNoDecimalsOrLabels((Number(usdxAmount) / FACTOR_SIX));
    const formmatedUsdxLimit = formatMoneyNoDecimalsOrLabels(usdxLimit);
    setDisplayValueById(totalBorrowedCssId, formattedUsdxAmount)
    setDisplayValueById(borrowLimitCssId, formmatedUsdxLimit)

    // borrow limit bar
    let rawUsdxUtilization = 0;
    if (usdxLimit !== 0) {
      rawUsdxUtilization = (Number(usdxAmount) / FACTOR_SIX) / usdxLimit;
    };

    const percentUsdxUtilization = (rawUsdxUtilization * 100).toFixed(2) + "%";
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
    let collateral = 0;
    if (siteData['platformAmounts'][denom]) {
      collateral = siteData['platformAmounts'][denom].collateral;
    };
    const usdxMintingRewards = siteData['incentiveParamsData'][denom]

    let rewardsDenom = commonDenomMapper(usdxMintingRewards.denom);
    let rewardsAmountPerSecond = usdxMintingRewards.amount;

    const denomValueLocked = denomPrice * collateral;

    // 31536000 seconds in a year
    const rewardsPerYear = rewardsAmountPerSecond * 31536000 / denomConversions[rewardsDenom]
    const rewardPrice = siteData['prices'][rewardsDenom].price;
    const rewardsPerYearInUsd = rewardsPerYear * rewardPrice;
    const rawDenomApy = denomValueLocked === 0 ? 0 : rewardsPerYearInUsd / denomValueLocked

    const denomPercentageApy = rawDenomApy * 100;

    // use usdFormatter to truncate to 2 decimals and round
    const denomPercentDisplay = usdFormatter.format(denomPercentageApy);
    const commaSeparatedPercentDisplay = noDollarSign(denomPercentDisplay);

    setDisplayValueById(desktopCssId, commaSeparatedPercentDisplay + "%")
    setDisplayValueById(mobileCssId, commaSeparatedPercentDisplay + "%")
  };
};

const setTotalAssetsSuppliedDisplayValue = async (siteData, cssIds) => {
  let cssId = cssIds['totalAssetsSupplied'];
  let totalAssetsSupplied = 0;
  const platformAmounts = siteData['platformAmounts'];
  const denomConversions = siteData['denomConversions'];
  const prices = siteData['prices'];

  for (const denom in platformAmounts) {
    // fallbacks 
    let price = 0;
    let factor = FACTOR_EIGHT;

    if (prices[denom]) {
      price = prices[denom].price;
    } else {
      console.warn(`coudn't find ${denom} in prices object, will fallback to zero price`);
    }
    // guaaranteed to be available because we are looping over it 
    const denomSupplied = platformAmounts[denom].collateral;

    if (denomConversions[denom]) {
      factor = denomConversions[denom];
    } else {
      console.warn(`coudn't find ${denom} in denomConversions object, will fallback to factor 8`);
    };

    const denomSuppliedUSD = (denomSupplied * price) / factor;
    totalAssetsSupplied += denomSuppliedUSD;
  };
  const totalAssetsSuppliedUsd = usdFormatter.format(totalAssetsSupplied);

  setDisplayValueById(cssId, noDollarSign(totalAssetsSuppliedUsd))
};

const setTotalAssetsBorrowedDisplayValue = async (siteData, cssIds) => {
  let cssId = cssIds['totalAssetsBorrowed'];
  let totalAssetsBorrowed = 0;
  const platformAmounts = siteData['platformAmounts'];
  const prices = siteData['prices'];
  for (const denom in platformAmounts) {
    let price = 0;

    if (prices[denom]) {
      price = prices[denom].price;
    }
    else {
      console.warn(`${denom} not found in prices object, falling back to zero`);
    }

    const denomBorrowed = platformAmounts[denom].principal
    const denomBorrowedUSD = denomBorrowed / FACTOR_SIX;
    totalAssetsBorrowed += denomBorrowedUSD;
  };
  const totalAssetsBorrowedUsd = usdFormatter.format(totalAssetsBorrowed);

  setDisplayValueById(cssId, noDollarSign(totalAssetsBorrowedUsd));
};

const setMarketCapDisplayValues = async (denoms, siteData, cssIds) => {
  const defiCoinsSupply = siteData['defiCoinsSupply']
  const prices = siteData['prices']
  const cssId = cssIds['totalMarketCap']
  let total = 0;

  for (const denom of denoms) {
    let price = 0;
    let suppliedCoin = 0;
    if (prices[denom]) {
      price = prices[denom].price
    }
    else {
      console.warn(`${denom} not found in prices Object, falling back to zero`);
    }
    // could be zero which is why !== undefined is there
    if (defiCoinsSupply[denom] !== undefined) {
      suppliedCoin = defiCoinsSupply[denom];
    }
    else {
      console.warn(`${denom} not found in defiCoinsSupply Object, falling back to zero`);
    }

    const suppliedDenomUsd = suppliedCoin * price;
    total += suppliedDenomUsd
    const desktopCssId = cssIds[denom]['marketCap']['d']
    const mobileCssId = cssIds[denom]['marketCap']['m']

    setDisplayValueById(desktopCssId, suppliedDenomUsd > 1000000 ? formatMoneyMillions(suppliedDenomUsd) : formatInThousands(suppliedDenomUsd))
    setDisplayValueById(mobileCssId, suppliedDenomUsd > 1000000 ? formatMoneyMillions(suppliedDenomUsd) : formatInThousands(suppliedDenomUsd))
  }

  setDisplayValueById(cssId, noDollarSign(usdFormatter.format(total)))
}

const setSupplyDisplayValues = async (denoms, siteData, cssIds) => {
  const defiCoinsSupply = siteData['defiCoinsSupply']
  for (const denom of denoms) {
    let supply = 0;
    if (defiCoinsSupply[denom] !== undefined) {
      supply = defiCoinsSupply[denom]
    } else {
      console.warn(`${denom} not found in defiCoinsSupply Object, falling back to 0`);
    }

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
  if (lastElement) { lastElement.html(value) };
  if (firstElement) { firstElement.html(value) };
};

const updateDisplayValues = async (denoms) => {
  const data = {
    pricefeedResponse: () => fetch(BASE_URL + "pricefeed/prices"),
    incentiveParamsResponse: () => fetch(BASE_URL + "incentive/parameters"),
    kavaMarketResponse: () => fetch(BINANACE_URL + "ticker/24hr?symbol=KAVAUSDT"),
    hardMarketResponse: () => fetch(BINANACE_URL + "ticker/24hr?symbol=HARDUSDT"),
    bnbMarketResponse: () => fetch(BINANACE_URL + "ticker/24hr?symbol=BNBUSDT"),
    busdMarketResponse: () => fetch(BINANACE_URL + "ticker/24hr?symbol=BUSDUSDT"),
    btcbMarketResponse: () => fetch(BINANACE_URL + "ticker/24hr?symbol=BTCUSDT"),
    xrpbMarketResponse: () => fetch(BINANACE_URL + "ticker/24hr?symbol=XRPUSDT"),
    usdxMarketResponse: () => fetch('https://api.coingecko.com/api/v3/coins/usdx'),
    atomMarketResponse: () => fetch("https://api.coingecko.com/api/v3/coins/cosmos"),
    // lunaMarketResponse: () => fetch("https://api.coingecko.com/api/v3/coins/terra-luna"),
    swpMarketResponse: () => fetch('https://api.coingecko.com/api/v3/coins/kava-swap'),
    supplyAccountResponse: () => fetch(BASE_URL + 'bank/balances/kava1wq9ts6l7atfn45ryxrtg4a2gwegsh3xha9e6rp'),
    supplyTotalResponse: () => fetch(BASE_URL + "bank/total"),
    bep3SupplyResponse: () => fetch(BASE_URL + "bep3/supplies"),
    bep3ParamsResponse: () => fetch(BASE_URL + "bep3/parameters"),
    cdpParamsResponse: () => fetch(BASE_URL + "cdp/parameters"),
    totalCollateralResponse: () => fetch(BASE_URL + '/cdp/totalCollateral'),
    totalPrincipalResponse: () => fetch(BASE_URL + '/cdp/totalPrincipal'),
  };
  const makeData = async () => {
    const results = Object.keys(data).map((request) => ({ reqKey: request, reqVal: data[request]() }));
    for (let i = 0; i < results.length; ++i) {
      data[results[i].reqKey] = await results[i].reqVal;
    }
    return data;
  };
  const {
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
    totalCollateralResponse,
    totalPrincipalResponse,
    atomMarketResponse,
    // lunaMarketResponse,
  } = await makeData();


  const pricefeedPrices = await pricefeedResponse.json()
  const incentiveParamsJson = await incentiveParamsResponse.json();
  const suppliedAmountJson = await supplyAccountResponse.json();
  const supplyTotalJson = await supplyTotalResponse.json()
  const bep3SupplyJson = await bep3SupplyResponse.json();
  const bep3ParamsJson = await bep3ParamsResponse.json()
  const cdpParamsJson = await cdpParamsResponse.json();
  const bnbMarketData = await bnbMarketResponse.json();
  const btcbMarketData = await btcbMarketResponse.json();
  const busdMarketData = await busdMarketResponse.json();
  const xrpbMarketData = await xrpbMarketResponse.json();
  const hardMarketData = await hardMarketResponse.json();
  const kavaMarketData = await kavaMarketResponse.json();
  const usdxMarketDataJson = await usdxMarketResponse.json();
  const swpMarketDataJson = await swpMarketResponse.json();
  const totalCollateralJson = await totalCollateralResponse.json();
  const totalPrincipalJson = await totalPrincipalResponse.json();
  const atomMarketDataJson = await atomMarketResponse.json();
  // const lunaMaretDataJson = await lunaMarketResponse.json();
  const markets = {
    'bnb-a': bnbMarketData,
    'btcb-a': btcbMarketData,
    'busd-a': busdMarketData,
    'busd-b': busdMarketData,
    'hbtc-a': btcbMarketData,
    'xrpb-a': xrpbMarketData,
    'hard-a': hardMarketData,
    'ukava-a': kavaMarketData,
  }
  // usdx and swp market data comes from a different api so we don't want them to
  // map the same with the other markets
  let siteData = {};
  // fix cssIds
  const cssIds = mapCssIds(denoms);
  const denomConversions = setConversionFactors(denoms);
  siteData['denomConversions'] = denomConversions;

  const rewardsStartDates = setRewardsDates(denoms);
  siteData['rewardsStartDates'] = rewardsStartDates;

  const marketData = await mapMarketData(denoms, markets);
  siteData['marketData'] = marketData;

  const usdxMarketData = await mapCoinGeckoApiData(usdxMarketDataJson);
  siteData['marketData']['usdx']['priceChangePercent'] = String(usdxMarketData);

  const swpMarketData = await mapCoinGeckoApiData(swpMarketDataJson)
  siteData['marketData']['swp-a']['priceChangePercent'] = String(swpMarketData);

  const atomMarketData = await mapCoinGeckoApiData(atomMarketDataJson);
  siteData['marketData']["uatom-a"]["priceChangePercent"] = String(atomMarketData);

  // const lunaMarketData = await mapCoinGeckoApiData(lunaMaretDataJson);
  // siteData["marketData"]["uluna-a"]["priceChangePercent"] = String(lunaMarketData);

  const prices = await mapPrices(denoms, pricefeedPrices.result);
  siteData['prices'] = prices;

  siteData['prices']['busd-b'] = siteData['prices']['busd-a'];

  const swpPrice = await setSwpPrice(swpMarketDataJson);
  siteData['prices']['swp-a'] = swpPrice;

  const incentiveParamsData = await mapIncentiveParams(denoms, incentiveParamsJson.result.usdx_minting_reward_periods)
  siteData['incentiveParamsData'] = incentiveParamsData;

  const platformAmounts = await mapPlatformAmounts(totalCollateralJson.result, totalPrincipalJson.result);
  siteData['platformAmounts'] = platformAmounts;

  const cdpParamsData = await mapCdpParams(denoms, cdpParamsJson.result);
  siteData['cdpParamsData'] = cdpParamsData;

  const suppliedAmounts = mapSuppliedAmounts(denoms, normalizeDenoms(suppliedAmountJson.result));
  siteData['suppliedAmounts'] = suppliedAmounts;
  siteData['suppliedAmounts']['busd-b'] = siteData['suppliedAmounts']['busd-a'];

  const totalSuppliedData = await mapDenomTotalSupplied(denoms, siteData);
  siteData['totalSuppliedData'] = totalSuppliedData;

  const supplyData = mapSuppliedAmounts(denoms, normalizeDenoms(supplyTotalJson.result.supply));
  siteData['supplyData'] = supplyData;

  const bep3SupplyData = await mapBep3Supplies(denoms, bep3SupplyJson.result);
  siteData['bep3SupplyData'] = bep3SupplyData;

  const bep3ParamsData = await mapBep3Params(denoms, bep3ParamsJson.result.asset_params, siteData);
  siteData['bep3ParamsData'] = bep3ParamsData;

  const defiCoinsSupply = mapSupplyAndMarket(denoms, siteData)
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
  await setTotalAssetsSuppliedDisplayValue(siteData, cssIds);
  await setTotalAssetsBorrowedDisplayValue(siteData, cssIds);
  await setMarketCapDisplayValues(denoms, siteData, cssIds);
  await setSupplyDisplayValues(denoms, siteData, cssIds);
  await setBorrowApyDisplayValues(denoms, siteData, cssIds);

  $(".metric-blur").css("background-color", "transparent")
  $(".metric-blur").addClass('without-after');
  $(".api-metric").css({ "display": "block", "text-align": "center" })

};

const main = async () => {
  const denoms = [
    'bnb-a', 'btcb-a', 'busd-a',
    'hbtc-a', 'xrpb-a', 'hard-a',
    'ukava-a', 'usdx', 'swp-a',
    'uatom-a',
    // 'uakt-a', 'luna-a', 'uosmo-a',
  ];
  await updateDisplayValues(denoms);
  await sleep(30000);
  main();
};

const sleep = (ms = 10000) => new Promise(resolve => setTimeout(resolve, ms));
main();