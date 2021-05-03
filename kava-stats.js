const TO_6 = Number(10 ** 6)
const TO_8 = Number(10 ** 8)
const BASE_URL = "https://api.kava.io/";
const BINANACE_URL = "https://api.binance.com/api/v3/"

var usdFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

var formatMoneyMillions = (v) => {
  const valueBorrowedInMil = v/TO_6
  const valueBorrowedFormatted = usdFormatter.format(valueBorrowedInMil)
  return valueBorrowedFormatted + "M"
}

var formatMoneyNoDecimalsOrLabels = (v) => {
  const fm = usdFormatter.format(v)
  return fm.slice(1, fm.length-3)
}

var formatMoneyNoDollarSign = (v) => {
  const fm = usdFormatter.format(v)
  return fm.slice(1, fm.length)
}

var isKavaNativeAsset = (d) => {
  return ['ukava-a', 'usdx', 'hard', 'ukava', 'hard-a'].includes(d)
}

var denomLabel = (v) => {
  switch(v) {
    case 'xrpb':
      return 'XRP'
    case 'ukava':
      return 'KAVA'
    case 'btcb':
      return 'BTC'
    default:
      return v.toUpperCase()
  }
}

var totalLockedAndBorrowedByDenom = async (cdpRes, denom) => {
  let locked = 0;
  let borrowed = 0;
  let fees = 0;
  if (cdpRes) {
    var { collateral, principal, accumulated_fees } = cdpRes.reduce(function(accumulator, item) {
      Object.keys(item.cdp).forEach(function(key) {
        let c = ['collateral', 'principal', 'accumulated_fees'];
        if(c.includes(key)){
          accumulator[key] = Number((accumulator[key] || 0)) + Number(item.cdp[key].amount);
        }
      });
      return accumulator;
    }, {});

    locked = isKavaNativeAsset(denom) ? Number(collateral/TO_6) : Number(collateral/TO_8),
    borrowed = Number(principal/TO_6),
    fees = Number(accumulated_fees/TO_6)
  }

  return { locked, borrowed, fees }
};

var bnbAmountOnPlatform = (data) => {
  const denomData = data.result.find((d) => d.current_supply.denom === 'bnb')
  return Number(denomData.current_supply.amount)
}

var totalAmountOnPlatformByDenom = (data, denom) => {
  const denomData = data.result.find((d) => d.denom === denom)
  return Number(denomData.amount)
}

var getRewardApyForDenom = (denom, lockedDenomBalance, kavaPrice, data) => {
  const iRdata = data.result.usdx_minting_reward_periods;
  let ukavaRewardsPerSecond = 0;
  if(iRdata) {
    if(iRdata && iRdata.length > 0) {
      const denomRewards = iRdata.find(
        (item) => item.collateral_type.toUpperCase() === denom.toUpperCase()
      );
      if (denomRewards) {
        ukavaRewardsPerSecond = Number(denomRewards.rewards_per_second.amount);
      }
    }
  }

  const kavaRewardsPerYear = (ukavaRewardsPerSecond * 31536000 / 10 ** 6)
  const rewardsPerYearInUsd = kavaRewardsPerYear * Number(kavaPrice);

  let rawDenomApy = 0
  if (lockedDenomBalance !== 0) {
    rawDenomApy = rewardsPerYearInUsd/lockedDenomBalance;
  }

  const denomPercentageApy = Number(rawDenomApy) * 100;
  const formattedPercentageWithDollarSign = usdFormatter.format(denomPercentageApy);
  const formattedPercentageFinal = formattedPercentageWithDollarSign.slice(1, formattedPercentageWithDollarSign.length);
  return formattedPercentageFinal + "%";
};


var usdxDebtLimitByDenom = (denom, data) => {
  const collateralParams = data.result.collateral_params;

  const denomParams = collateralParams.find(
    (item) => item.type.toUpperCase() === denom.toUpperCase()
  );

  let hasDebtLimit = denomParams && denomParams.debt_limit;
  return hasDebtLimit ? (Number(denomParams.debt_limit.amount)/TO_6) : 0
};

var setUsdxAmount = (limit, borrowed, feesOwed) => {
  if(limit && typeof borrowed !== 'undefined') {
    const usdxBorrowedAndFees = borrowed + feesOwed;
    return usdxBorrowedAndFees > limit ? Number(limit) : Number(usdxBorrowedAndFees);
  }
}

var supplyLimitByDenom = (denom, bep3ParamsData) => {
  const assetParams = bep3ParamsData.result.asset_params;

  const denomParams = assetParams.find(
    (item) => item.denom.toUpperCase() === denom.toUpperCase()
  );

  let hasSupplyLimit = denomParams && denomParams.supply_limit && denomParams.supply_limit.limit;
  return hasSupplyLimit ? (Number(denomParams.supply_limit.limit)/TO_8) : 0
};

var setDenomTotalSupplied = (denomSupplyFromAcct, factor, denomPrice, denomLockedId) => {
  const denomTotalSupplyCoin = denomSupplyFromAcct/factor;
  const denomTotalSupplyValue = Number(denomTotalSupplyCoin * denomPrice);
  setDisplayValue(formatMoneyNoDollarSign(denomTotalSupplyValue), denomLockedId);
  return denomTotalSupplyValue
}

var setDenomAPY = (denomPrice, denomLockedValue, incentiveDenom, kavaPrice, iPData, denomApyId) => {
  const denomValueLocked = Number(denomPrice) * Number(denomLockedValue)
  const denomRewardAPY = getRewardApyForDenom(incentiveDenom, denomValueLocked, kavaPrice, iPData)
  setDisplayValue(denomRewardAPY, denomApyId);
}

var setDenomTotalSupplyValue = async (supplyData, bep3ParamsData, denomPrice, platformDenom) => {
  let denomTotalSupply;
  platformDenom === 'bnb' ?
    denomTotalSupply = bnbAmountOnPlatform(supplyData) :
    denomTotalSupply = totalAmountOnPlatformByDenom(supplyData, platformDenom)
  let denomTotalSupplyConverted
  isKavaNativeAsset(platformDenom) ?
    denomTotalSupplyConverted = Number(denomTotalSupply)/TO_6 :
    denomTotalSupplyConverted = Number(denomTotalSupply)/TO_8
  let denomTotalSupplyValue =  Number(denomTotalSupplyConverted * denomPrice)
  let denomAssetLimit = supplyLimitByDenom(platformDenom, bep3ParamsData)
  let data = {}
  data[`${platformDenom}Usd`] = denomTotalSupplyValue
  data[`${platformDenom}MarketCap`] = formatMoneyMillions(denomTotalSupplyValue)
  data[`${platformDenom}Supply`] = formatMoneyNoDecimalsOrLabels(denomTotalSupplyConverted) + ' ' + denomLabel(platformDenom)
  data[`${platformDenom}AssetLimit`] = formatMoneyNoDecimalsOrLabels(denomAssetLimit) + ' ' + denomLabel(platformDenom)
  return data;
};

var getValueRewardsDistributedForDenom = (rewardPeriodsData, denom, kavaPrice) => {
  let data = rewardPeriodsData.result

  let ukavaRewardsPerSecond = 0;
  let rewardsStartTime = Date.now();
  if(data) {
    const denomRewardPeriod = data.usdx_minting_reward_periods.find(
      (item) => item.collateral_type.toUpperCase() === denom.toUpperCase()
    );

    if(denomRewardPeriod) {
      rewardsStartTime = new Date(denomRewardPeriod.start).getTime();
      ukavaRewardsPerSecond = denomRewardPeriod.rewards_per_second.amount;
    }

    const millisecondsRewardActive = Date.now() - rewardsStartTime;
    const secondsRewardActive = millisecondsRewardActive / 1000;

    const ukavaDistributed = Number(ukavaRewardsPerSecond) * Number(secondsRewardActive);
    kavaDistributed = ukavaDistributed / TO_6;
  }
  return Number(kavaDistributed) * Number(kavaPrice);
};

// asset 'Total Borrowed', 'Borrow Limit', 'percent line'
var setUsdxAmountsByDenom = (denom, usdxAmount, usdxLimit) => {
  const formattedUsdxAmount = formatMoneyNoDecimalsOrLabels(usdxAmount);
  const formattedUsdxLimit = formatMoneyNoDecimalsOrLabels(usdxLimit);
  const rawUsdxUtilization = Number(usdxAmount.toFixed(0)) / Number(usdxLimit.toFixed(0))
  const percentUsdxUtilization = Number(rawUsdxUtilization.toFixed(3) * 100).toFixed(2) + "%";
  $(`.percent-line-usdx-${denom}`).css("width", percentUsdxUtilization);
  setDisplayValue(formattedUsdxAmount, `tb-${denom}`)
  setDisplayValue(formattedUsdxLimit, `bl-${denom}`)
};

var setDenomPriceData = (denomPercentChange, priceChangeCssId) => {
  let kavaPercentChangeFinal;
  if(Number(denomPercentChange) >= 0) {
    kavaPercentChangeFinal =  "+" + formatMoneyNoDollarSign(denomPercentChange) + "%";
    setDisplayColor('green', priceChangeCssId)
  } else {
    kavaPercentChangeFinal = usdFormatter.format(denomPercentChange).replace("$", "") + "%";
    setDisplayColor('red', priceChangeCssId)
  }
  setDisplayValue(kavaPercentChangeFinal, priceChangeCssId)
}

var getSuppliedAmount = (suppliedAmounts, denom) => {
  let amount = 0;
  const denomAmounts = suppliedAmounts.find((a) => a.denom === denom)
  if (denomAmounts) {
    amount = denomAmounts.amount;
  }
  return amount
}

var setUsdxAssetLimit = (cdpParamsData) => {
  return formatMoneyNoDecimalsOrLabels(Number(cdpParamsData.result.global_debt_limit.amount)/TO_6);
}

var setDisplayValue = (value, cssId) => {
  // $(`#${cssId}`).html(value);
  $(`#${cssId}`).last().html(value);
  $(`#${cssId}`).first().html(value);
  // document.getElementById(cssId).innerHTML = value;
};

var setDisplayColor = (color, cssId) =>{
  $(`#${cssId}`).css({ color: color });
  // document.getElementById(cssId).style.color = color;
}

var updateDisplayValues = async () => {
  // set price info for denoms
  const [
    kavaMarketResponse,
    hardMarketResponse,
    bnbMarketResponse,
    busdMarketResponse,
    btcbMarketResponse,
    xrpbMarketResponse,
    usdxMarketResponse,
    supplyAccountResponse,
    supplyTotalResponse,
    bep3SupplyResponse,
    bep3ParamsResponse,
    cdpParamsResponse,
    incentiveParamsResponse,
    cdpResponseDataBnb,
    cdpResponseDataBusd,
    cdpResponseDataBtc,
    cdpResponseDataXrp,
    cdpResponseDataKava,
    cdpResponseDataHard,
  ] = await Promise.all([
    fetch(BINANACE_URL + "ticker/24hr?symbol=KAVAUSDT"),
    fetch(BINANACE_URL + "ticker/24hr?symbol=HARDUSDT"),
    fetch(BINANACE_URL + "ticker/24hr?symbol=BNBUSDT"),
    fetch(BINANACE_URL + "ticker/24hr?symbol=BUSDUSDT"),
    fetch(BINANACE_URL + "ticker/24hr?symbol=BTCUSDT"),
    fetch(BINANACE_URL + "ticker/24hr?symbol=XRPUSDT"),
    fetch('https://api.coingecko.com/api/v3/coins/usdx'),
    fetch(BASE_URL + 'auth/accounts/kava1wq9ts6l7atfn45ryxrtg4a2gwegsh3xha9e6rp'),
    fetch(BASE_URL + "supply/total"),
    fetch(BASE_URL + "bep3/supplies"),
    fetch(BASE_URL + "bep3/parameters"),
    fetch(BASE_URL + "cdp/parameters"),
    fetch(BASE_URL + "incentive/parameters"),
    fetch(BASE_URL + 'cdp/cdps/collateralType/bnb-a'),
    fetch(BASE_URL + 'cdp/cdps/collateralType/busd-a'),
    fetch(BASE_URL + 'cdp/cdps/collateralType/btcb-a'),
    fetch(BASE_URL + 'cdp/cdps/collateralType/xrpb-a'),
    fetch(BASE_URL + 'cdp/cdps/collateralType/ukava-a'),
    fetch(BASE_URL + 'cdp/cdps/collateralType/hard-a')
  ]);

  const kavaMarketData = await kavaMarketResponse.json();
  const hardMarketData = await hardMarketResponse.json();
  const bnbMarketData = await bnbMarketResponse.json();
  const busdMarketData = await busdMarketResponse.json();
  const btcbMarketData = await btcbMarketResponse.json();
  const xrpbMarketData = await xrpbMarketResponse.json();
  const usdxMarketData = await usdxMarketResponse.json();

  const kavaPrice = Number(kavaMarketData.lastPrice);

  // "Total Rewards Distributed"
  const incentiveParamsData = await incentiveParamsResponse.json()
//  bnb = new Date("2020-07-29T14:00:14.333506701Z");
// busd = new Date("2020-11-09T14:00:14.333506701Z");
// btcb = new Date("2020-11-16T14:00:14.333506701Z");
// xrpb = new Date("2020-12-02T14:00:14.333506701Z");
// kava = new Date("2020-12-14T14:00:14.333506701Z");
// hard = new Date("2021-01-15T14:00:14.333506701Z");

  const bnbReward = getValueRewardsDistributedForDenom(incentiveParamsData, 'bnb-a', kavaPrice);
  const busdReward = getValueRewardsDistributedForDenom(incentiveParamsData, 'busd-a', kavaPrice);
  const btcbReward = getValueRewardsDistributedForDenom(incentiveParamsData, 'btcb-a', kavaPrice);
  const xrpbReward = getValueRewardsDistributedForDenom(incentiveParamsData, 'xrpb-a', kavaPrice);
  const kavaReward = getValueRewardsDistributedForDenom(incentiveParamsData, 'ukava-a', kavaPrice);
  const hardReward = getValueRewardsDistributedForDenom(incentiveParamsData, 'hard-a', kavaPrice);

  const suppliedAmountJson = await supplyAccountResponse.json()
  const suppliedAmounts = suppliedAmountJson.result.value.coins
  const supplyData = await supplyTotalResponse.json()
  const bnbSupplyData = await bep3SupplyResponse.json()
  const bep3ParamsData = await bep3ParamsResponse.json()
  const cdpParamsData = await cdpParamsResponse.json()

  const bnbCdPData = await cdpResponseDataBnb.json()
  const busdCdPData = await cdpResponseDataBusd.json()
  const btcCdPData = await cdpResponseDataBtc.json()
  const xrpCdPData = await cdpResponseDataXrp.json()
  const kavaCdPData = await cdpResponseDataKava.json()
  const hardCdPData = await cdpResponseDataHard.json()


  // new bnb
  let bnbPlatformAmounts = await totalLockedAndBorrowedByDenom(bnbCdPData.result, 'bnb-a');
  let bnbLocked;
  let bnbBorrowed;
  let bnbFees;
  if (bnbPlatformAmounts) {
    bnbLocked = bnbPlatformAmounts.locked;
    bnbBorrowed = bnbPlatformAmounts.borrowed;
    bnbFees = bnbPlatformAmounts.fees;
  }
  let bnbUsdxLimit = await usdxDebtLimitByDenom('BNB-A', cdpParamsData)
  let bnbUSDX = setUsdxAmount(bnbUsdxLimit, bnbBorrowed, bnbFees)
  let bnbPrice = Number(bnbMarketData.lastPrice);
  const bnbPriceChangePercent = Number(bnbMarketData.priceChangePercent);
  let {
    bnbUsd,
    bnbMarketCap,
    bnbSupply,
    bnbAssetLimit
  } = await setDenomTotalSupplyValue(bnbSupplyData, bep3ParamsData, bnbPrice, 'bnb');

  // set bnb info in UI
  setDisplayValue(usdFormatter.format(bnbPrice), 'price-bnb');
  setDenomPriceData(bnbPriceChangePercent, 'pc-bnb');
  let bnbFromSuppliedAccount =  getSuppliedAmount(suppliedAmounts, 'bnb');
  // let bnbFromSuppliedAccount = suppliedAmounts.find((a) => a.denom === 'bnb').amount;
  const bnbSupplied = setDenomTotalSupplied(bnbFromSuppliedAccount, TO_8, bnbPrice, 'ts-bnb');
  setDenomTotalSupplied(bnbFromSuppliedAccount, TO_8, bnbPrice, 'ts-m-bnb');
  setDisplayValue(usdFormatter.format(bnbReward), 'te-bnb');
  setDisplayValue(usdFormatter.format(bnbReward), 'te-m-bnb');
  setDenomAPY(bnbPrice, bnbLocked, 'bnb-a', kavaPrice, incentiveParamsData, 'ea-bnb');
  setDenomAPY(bnbPrice, bnbLocked, 'bnb-a', kavaPrice, incentiveParamsData, 'ea-m-bnb');
  setUsdxAmountsByDenom('bnb', bnbUSDX, bnbUsdxLimit);


  // new busd
  let busdPlatformAmounts = await totalLockedAndBorrowedByDenom(busdCdPData.result, 'busd-a');
  let busdLocked;
  let busdBorrowed;
  let busdFees;
  if (busdPlatformAmounts) {
    busdLocked = busdPlatformAmounts.locked;
    busdBorrowed = busdPlatformAmounts.borrowed;
    busdFees = busdPlatformAmounts.fees;
  }
  let busdUsdxLimit = await usdxDebtLimitByDenom('BUSD-A', cdpParamsData)
  let busdUSDX = setUsdxAmount(busdUsdxLimit, busdBorrowed, busdFees)
  let busdPrice = Number(busdMarketData.lastPrice);
  const busdPriceChangePercent = Number(busdMarketData.priceChangePercent);
  let {
    busdUsd,
    busdMarketCap,
    busdSupply,
    busdAssetLimit
  } = await setDenomTotalSupplyValue(supplyData, bep3ParamsData, busdPrice, 'busd');

  // set busd info in UI
  setDisplayValue(usdFormatter.format(busdPrice), 'price-busd');
  setDenomPriceData(busdPriceChangePercent, 'pc-busd');
  let busdFromSuppliedAccount =  getSuppliedAmount(suppliedAmounts, 'busd');
  const busdSupplied = setDenomTotalSupplied(busdFromSuppliedAccount, TO_8, busdPrice, 'ts-busd');
  setDenomTotalSupplied(busdFromSuppliedAccount, TO_8, busdPrice, 'ts-m-busd');
  setDisplayValue(usdFormatter.format(busdReward), 'te-busd');
  setDisplayValue(usdFormatter.format(busdReward), 'te-m-busd');
  setDenomAPY(busdPrice, busdLocked, 'busd-a', kavaPrice, incentiveParamsData, 'ea-busd');
  setDenomAPY(busdPrice, busdLocked, 'busd-a', kavaPrice, incentiveParamsData, 'ea-m-busd');
  setUsdxAmountsByDenom('busd', busdUSDX, busdUsdxLimit);

  // new btc
  let btcPlatformAmounts = await totalLockedAndBorrowedByDenom(btcCdPData.result, 'btcb-a');
  let btcLocked;
  let btcBorrowed;
  let btcFees;
  if (btcPlatformAmounts) {
    btcLocked = btcPlatformAmounts.locked;
    btcBorrowed = btcPlatformAmounts.borrowed;
    btcFees = btcPlatformAmounts.fees;
  }
  let btcUsdxLimit = await usdxDebtLimitByDenom('BTCB-A', cdpParamsData)
  let btcUSDX = setUsdxAmount(btcUsdxLimit, btcBorrowed, btcFees)
  let btcPrice = Number(btcbMarketData.lastPrice);
  const btcPriceChangePercent = Number(btcbMarketData.priceChangePercent);
  let {
    btcbUsd,
    btcbMarketCap,
    btcbSupply,
    btcbAssetLimit
  } = await setDenomTotalSupplyValue(supplyData, bep3ParamsData, btcPrice, 'btcb');

  // set btc info in UI
  setDisplayValue(usdFormatter.format(btcPrice), 'price-btc');
  setDenomPriceData(btcPriceChangePercent, 'pc-btc');
  let btcFromSuppliedAccount =  getSuppliedAmount(suppliedAmounts, 'btcb');
  // let btcFromSuppliedAccount = suppliedAmounts.find((a) => a.denom === 'btcb').amount;
  const btcSupplied = setDenomTotalSupplied(btcFromSuppliedAccount, TO_8, btcPrice, 'ts-btc');
  setDenomTotalSupplied(btcFromSuppliedAccount, TO_8, btcPrice, 'ts-m-btc');
  setDisplayValue(usdFormatter.format(btcbReward), 'te-btc');
  setDisplayValue(usdFormatter.format(btcbReward), 'te-m-btc');
  setDenomAPY(btcPrice, btcLocked, 'btcb-a', kavaPrice, incentiveParamsData, 'ea-btc');
  setDenomAPY(btcPrice, btcLocked, 'btcb-a', kavaPrice, incentiveParamsData, 'ea-m-btc');
  setUsdxAmountsByDenom('btc', btcUSDX, btcUsdxLimit)




  // new xrp
  let xrpPlatformAmounts = await totalLockedAndBorrowedByDenom(xrpCdPData.result, 'xrpb-a');
  let xrpLocked;
  let xrpBorrowed;
  let xrpFees;
  if (xrpPlatformAmounts) {
    xrpLocked = xrpPlatformAmounts.locked;
    xrpBorrowed = xrpPlatformAmounts.borrowed;
    xrpFees = xrpPlatformAmounts.fees;
  }
  let xrpUsdxLimit = await usdxDebtLimitByDenom('XRPB-A', cdpParamsData)
  let xrpUSDX = setUsdxAmount(xrpUsdxLimit, xrpBorrowed, xrpFees)
  let xrpbPrice = Number(xrpbMarketData.lastPrice);
  const xrpbPriceChangePercent = Number(xrpbMarketData.priceChangePercent);
  let {
    xrpbUsd,
    xrpbMarketCap,
    xrpbSupply,
    xrpbAssetLimit
  } = await setDenomTotalSupplyValue(supplyData, bep3ParamsData, xrpbPrice, 'xrpb');

  // set xrp info in UI
  setDisplayValue(usdFormatter.format(xrpbPrice), 'price-xrp');
  setDenomPriceData(xrpbPriceChangePercent, 'pc-xrp');
  let xrpFromSuppliedAccount =  getSuppliedAmount(suppliedAmounts, 'xrpb');
  // let xrpFromSuppliedAccount = suppliedAmounts.find((a) => a.denom === 'xrpb').amount;
  const xrpbSupplied = setDenomTotalSupplied(xrpFromSuppliedAccount, TO_8, xrpbPrice, 'ts-xrp');
  setDenomTotalSupplied(xrpFromSuppliedAccount, TO_8, xrpbPrice, 'ts-m-xrp');
  setDisplayValue(usdFormatter.format(xrpbReward), 'te-xrpb');
  setDisplayValue(usdFormatter.format(xrpbReward), 'te-m-xrpb');
  setDenomAPY(xrpbPrice, xrpLocked, 'xrpb-a', kavaPrice, incentiveParamsData, 'ea-xrp');
  setDenomAPY(xrpbPrice, xrpLocked, 'xrpb-a', kavaPrice, incentiveParamsData, 'ea-m-xrp');
  setUsdxAmountsByDenom('xrp', xrpUSDX, xrpUsdxLimit);

  // new kava
  let ukavaPlatformAmounts = await totalLockedAndBorrowedByDenom(kavaCdPData.result, 'ukava-a');
  let ukavaLocked;
  let ukavaBorrowed;
  let ukavaFees;
  if (ukavaPlatformAmounts) {
    ukavaLocked = ukavaPlatformAmounts.locked;
    ukavaBorrowed = ukavaPlatformAmounts.borrowed;
    ukavaFees = ukavaPlatformAmounts.fees;
  }
  let ukavaUsdxLimit = await usdxDebtLimitByDenom('UKAVA-A', cdpParamsData)
  let ukavaUSDX = setUsdxAmount(ukavaUsdxLimit, ukavaBorrowed, ukavaFees)
  const kavaPriceChangePercent = Number(kavaMarketData.priceChangePercent);
  let { ukavaUsd, ukavaMarketCap, ukavaSupply } = await setDenomTotalSupplyValue(supplyData, bep3ParamsData, kavaPrice, 'ukava');

  // set kava info in UI
  setDisplayValue(usdFormatter.format(kavaPrice), 'price-kava');
  setDenomPriceData(kavaPriceChangePercent, 'pc-kava');
  let kavaFromSuppliedAccount =  getSuppliedAmount(suppliedAmounts, 'ukava');
  // let kavaFromSuppliedAccount = suppliedAmounts.find((a) => a.denom === 'ukava').amount;
  const kavaSupplied = setDenomTotalSupplied(kavaFromSuppliedAccount, TO_6, kavaPrice, 'ts-kava');
  setDenomTotalSupplied(kavaFromSuppliedAccount, TO_6, kavaPrice, 'ts-m-kava');
  setDisplayValue(usdFormatter.format(kavaReward), 'te-kava');
  setDisplayValue(usdFormatter.format(kavaReward), 'te-m-kava');
  setDenomAPY(kavaPrice, ukavaLocked, 'ukava-a', kavaPrice, incentiveParamsData, 'ea-kava');
  setDenomAPY(kavaPrice, ukavaLocked, 'ukava-a', kavaPrice, incentiveParamsData, 'ea-m-kava');
  setUsdxAmountsByDenom('kava', ukavaUSDX, ukavaUsdxLimit);




  // new hard
  let hardPlatformAmounts = await totalLockedAndBorrowedByDenom(hardCdPData.result, 'hard-a');
  let hardLocked;
  let hardBorrowed;
  let hardFees;
  if (hardPlatformAmounts) {
    hardLocked = hardPlatformAmounts.locked;
    hardBorrowed = hardPlatformAmounts.borrowed;
    hardFees = hardPlatformAmounts.fees;
  }
  let hardUsdxLimit = await usdxDebtLimitByDenom('HARD-A', cdpParamsData)
  let hardUSDX = setUsdxAmount(hardUsdxLimit, hardBorrowed, hardFees)
  let hardPrice = Number(hardMarketData.lastPrice);
  const hardPriceChangePercent = Number(hardMarketData.priceChangePercent);
  let { hardUsd, hardMarketCap, hardSupply } = await setDenomTotalSupplyValue(supplyData, bep3ParamsData, hardPrice, 'hard');

  // // set hard info in UI
  setDisplayValue(usdFormatter.format(hardPrice), 'price-hard');
  setDenomPriceData(hardPriceChangePercent, 'pc-hard');
  let hardFromSuppliedAccount =  getSuppliedAmount(suppliedAmounts, 'hard');
  // let hardFromSuppliedAccount = suppliedAmounts.find((a) => a.denom === 'hard').amount;
  const hardSupplied = setDenomTotalSupplied(hardFromSuppliedAccount, TO_6, hardPrice, 'ts-hard');
  setDenomTotalSupplied(hardFromSuppliedAccount, TO_6, hardPrice, 'ts-m-hard');
  setDisplayValue(usdFormatter.format(hardReward), 'te-hard');
  setDisplayValue(usdFormatter.format(hardReward), 'te-m-hard');
  setDenomAPY(hardPrice, hardLocked, 'hard-a', kavaPrice, incentiveParamsData, 'ea-hard');
  setDenomAPY(hardPrice, hardLocked, 'hard-a', kavaPrice, incentiveParamsData, 'ea-m-hard');
  setUsdxAmountsByDenom('hard', hardUSDX, hardUsdxLimit);


  // Total Assets Supplied
  const totalAS = bnbSupplied + busdSupplied + btcSupplied + xrpbSupplied + kavaSupplied + hardSupplied
   setDisplayValue(formatMoneyNoDollarSign(totalAS), "t-a-s");

  // Total Assets Borrowed
  let totalUSDX = bnbUSDX + btcUSDX + busdUSDX + xrpUSDX + ukavaUSDX + hardUSDX;
  setDisplayValue(formatMoneyNoDollarSign(totalUSDX), 't-a-b');

  // defi hub stats
  const usdxPrice = usdxMarketData.market_data.current_price.usd;
  const usdxPCPC = usdxMarketData.market_data.price_change_percentage_24h
  let { usdxUsd, usdxMarketCap, usdxSupply } = await setDenomTotalSupplyValue(supplyData, bep3ParamsData, usdxPrice, 'usdx');

  const totalMarketCap = bnbUsd + busdUsd + btcbUsd + xrpbUsd + ukavaUsd + hardUsd + usdxUsd
  setDisplayValue(formatMoneyNoDollarSign(totalMarketCap), 't-m-c');

  setDisplayValue(usdFormatter.format(kavaPrice), 'price-d-kava');
  setDenomPriceData(kavaPriceChangePercent, 'pc-d-kava');
  setDisplayValue(ukavaMarketCap, 'mc-kava')
  setDisplayValue(ukavaSupply, 's-kava')
  setDisplayValue(usdFormatter.format(kavaPrice), 'price-md-kava');
  setDenomPriceData(kavaPriceChangePercent, 'pc-md-kava');
  setDisplayValue(ukavaMarketCap, 'mc-m-kava')
  setDisplayValue(ukavaSupply, 's-m-kava')

  setDisplayValue(usdFormatter.format(hardPrice), 'price-d-hard');
  setDenomPriceData(hardPriceChangePercent, 'pc-d-hard');
  setDisplayValue(hardMarketCap, 'mc-hard')
  setDisplayValue(hardSupply, 's-hard')
  setDisplayValue(usdFormatter.format(hardPrice), 'price-md-hard');
  setDenomPriceData(hardPriceChangePercent, 'pc-md-hard');
  setDisplayValue(hardMarketCap, 'mc-m-hard')
  setDisplayValue(hardSupply, 's-m-hard')

  setDisplayValue(usdFormatter.format(usdxPrice), 'price-d-usdx');
  setDenomPriceData(usdxPCPC, 'pc-d-usdx');
  setDisplayValue(usdxMarketCap, 'mc-usdx')
  setDisplayValue(usdxSupply, 's-usdx')
  setDisplayValue((setUsdxAssetLimit(cdpParamsData) + ' ' + denomLabel('usdx')), 'al-usdx')
  setDisplayValue(usdFormatter.format(usdxPrice), 'price-md-usdx');
  setDenomPriceData(usdxPCPC, 'pc-md-usdx');
  setDisplayValue(usdxMarketCap, 'mc-m-usdx')
  setDisplayValue(usdxSupply, 's-m-usdx')
  setDisplayValue((setUsdxAssetLimit(cdpParamsData) + ' ' + denomLabel('usdx')), 'al-m-usdx')

  setDisplayValue(usdFormatter.format(btcPrice), 'price-d-btc');
  setDenomPriceData(btcPriceChangePercent, 'pc-d-btc');
  setDisplayValue(btcbMarketCap, 'mc-btc')
  setDisplayValue(btcbSupply, 's-btc')
  setDisplayValue(btcbAssetLimit, 'al-btc')
  setDisplayValue(usdFormatter.format(btcPrice), 'price-md-btc');
  setDenomPriceData(btcPriceChangePercent, 'pc-md-btc');
  setDisplayValue(btcbMarketCap, 'mc-m-btc')
  setDisplayValue(btcbSupply, 's-m-btc')
  setDisplayValue(btcbAssetLimit, 'al-m-btc')

  setDisplayValue(usdFormatter.format(xrpbPrice), 'price-d-xrp');
  setDenomPriceData(xrpbPriceChangePercent, 'pc-d-xrp');
  setDisplayValue(xrpbMarketCap, 'mc-xrp')
  setDisplayValue(xrpbSupply, 's-xrp')
  setDisplayValue(xrpbAssetLimit, 'al-xrp')
  setDisplayValue(usdFormatter.format(xrpbPrice), 'price-md-xrp');
  setDenomPriceData(xrpbPriceChangePercent, 'pc-md-xrp');
  setDisplayValue(xrpbMarketCap, 'mc-m-xrp')
  setDisplayValue(xrpbSupply, 's-m-xrp')
  setDisplayValue(xrpbAssetLimit, 'al-m-xrp')

  setDisplayValue(usdFormatter.format(busdPrice), 'price-d-busd');
  setDenomPriceData(busdPriceChangePercent, 'pc-d-busd');
  setDisplayValue(busdMarketCap, 'mc-busd')
  setDisplayValue(busdSupply, 's-busd')
  setDisplayValue(busdAssetLimit, 'al-busd')
  setDisplayValue(usdFormatter.format(busdPrice), 'price-md-busd');
  setDenomPriceData(busdPriceChangePercent, 'pc-md-busd');
  setDisplayValue(busdMarketCap, 'mc-m-busd')
  setDisplayValue(busdSupply, 's-m-busd')
  setDisplayValue(busdAssetLimit, 'al-m-busd')

  setDisplayValue(usdFormatter.format(bnbPrice), 'price-d-bnb');
  setDenomPriceData(bnbPriceChangePercent, 'pc-d-bnb');
  setDisplayValue(bnbMarketCap, 'mc-bnb')
  setDisplayValue(bnbSupply, 's-bnb')
  setDisplayValue(bnbAssetLimit, 'al-bnb')
  setDisplayValue(usdFormatter.format(bnbPrice), 'price-md-bnb');
  setDenomPriceData(bnbPriceChangePercent, 'pc-md-bnb');
  setDisplayValue(bnbMarketCap, 'mc-m-bnb')
  setDisplayValue(bnbSupply, 's-m-bnb')
  setDisplayValue(bnbAssetLimit, 'al-m-bnb')

  $(".metric-blur").css("background-color", "transparent")
  $(".metric-blur").addClass('without-after');
  $(".api-metric").css({"display": "block", "text-align": "center"})
};

var main = async () => {
    await updateDisplayValues()
    await sleep(60000)
    main()
}

var sleep = (ms = 10000) => { return new Promise(resolve => setTimeout(resolve, ms)); }

main();
