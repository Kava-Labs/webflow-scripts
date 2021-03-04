const TO_6 = Number(10 ** 6)
const TO_8 = Number(10 ** 8)
const BASE_URL = "https://api.kava.io/";
const BINANACE_URL = "https://api.binance.com/api/v3/"

// usdFormatter
var usdF = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

// formatMoneyMillions
var formatMM = (v) => {
  const valueBorrowedInMil = v/TO_6
  const valueBorrowedFormatted = usdF.format(valueBorrowedInMil)
  return valueBorrowedFormatted + "M"
}

// formatMoneyNoDecimalsOrLabels
var fMNDOL = (v) => {
  const fm = usdF.format(v)
  return fm.slice(1, fm.length-3)
}

// formatMoneyNoDollarSign
var formatMNDS = (v) => {
  const fm = usdF.format(v)
  return fm.slice(1, fm.length)
}

// isKavaNativeAsset
var isKNA = (d) => {
  return ['ukava-a', 'usdx', 'hard', 'ukava', 'hard-a'].includes(d)
}

var dLab = (v) => {
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

// totalLockedAndBorrowedByDenom
var tLABBD = async (cdpRes, denom) => {

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

    locked = isKNA(denom) ? Number(collateral/TO_6) : Number(collateral/TO_8),
    borrowed = Number(principal/TO_6),
    fees = Number(accumulated_fees/TO_6)
  }

  return { locked, borrowed, fees }
};

// bnbAmountOnPlatform
var bAOP = (data) => {
  const denomData = data.result.find((d) => d.current_supply.denom === 'bnb')
  return Number(denomData.current_supply.amount)
}

// totalAmountOnPlatformByDenom
var tAOPBD = (data, denom) => {
  const denomData = data.result.find((d) => d.denom === denom)
  return Number(denomData.amount)
}

// getRewardApyForDenom
var getRAFD = (denom, lockedDenomBalance, kavaPrice, data) => {
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
  const formattedPercentageWithDollarSign = usdF.format(denomPercentageApy);
  const formattedPercentageFinal = formattedPercentageWithDollarSign.slice(1, formattedPercentageWithDollarSign.length);
  return formattedPercentageFinal + "%";
};


// usdxDebtLimitByDenom
var uDLBD = (denom, data) => {
  const collateralParams = data.result.collateral_params;

  const denomParams = collateralParams.find(
    (item) => item.type.toUpperCase() === denom.toUpperCase()
  );

  let hasDebtLimit = denomParams && denomParams.debt_limit;
  return hasDebtLimit ? (Number(denomParams.debt_limit.amount)/TO_6) : 0
};

// setUsdxAmount
var sUA = (limit, borrowed, feesOwed) => {
  if(limit && typeof borrowed !== 'undefined') {
    const usdxBorrowedAndFees = borrowed + feesOwed;
    return usdxBorrowedAndFees > limit ? Number(limit) : Number(usdxBorrowedAndFees);
  }
}

// supplyLimitByDenom
var supplyLBD = (denom, bep3ParamsData) => {
  const assetParams = bep3ParamsData.result.asset_params;

  const denomParams = assetParams.find(
    (item) => item.denom.toUpperCase() === denom.toUpperCase()
  );

  let hasSupplyLimit = denomParams && denomParams.supply_limit && denomParams.supply_limit.limit;
  return hasSupplyLimit ? (Number(denomParams.supply_limit.limit)/TO_8) : 0
};

// setDenomTotalSupplied
var sDTS = (denomSupplyFromAcct, factor, denomPrice, denomLockedId) => {
  const denomTotalSupplyCoin = denomSupplyFromAcct/factor;
  const denomTotalSupplyValue = Number(denomTotalSupplyCoin * denomPrice);
  sDV(formatMNDS(denomTotalSupplyValue), denomLockedId);
  return denomTotalSupplyValue
}

// setDenomAPY
var sDAPY = (denomPrice, denomLockedValue, incentiveDenom, kavaPrice, iPData, denomApyId) => {
  const denomValueLocked = Number(denomPrice) * Number(denomLockedValue)
  const denomRewardAPY = getRAFD(incentiveDenom, denomValueLocked, kavaPrice, iPData)
  sDV(denomRewardAPY, denomApyId);
}

  // setDenomTotalSupplyValue
var sDTSV = async (supplyData, bep3ParamsData, denomPrice, platformDenom) => {
  let denomTotalSupply;
  platformDenom === 'bnb' ?
    denomTotalSupply = bAOP(supplyData) :
    denomTotalSupply = tAOPBD(supplyData, platformDenom)
  let denomTotalSupplyConverted
  isKNA(platformDenom) ?
    denomTotalSupplyConverted = Number(denomTotalSupply)/TO_6 :
    denomTotalSupplyConverted = Number(denomTotalSupply)/TO_8
  let denomTotalSupplyValue =  Number(denomTotalSupplyConverted * denomPrice)
  let denomAssetLimit = supplyLBD(platformDenom, bep3ParamsData)
  let data = {}
  data[`${platformDenom}Usd`] = denomTotalSupplyValue
  data[`${platformDenom}MC`] = formatMM(denomTotalSupplyValue)
  data[`${platformDenom}Supply`] = fMNDOL(denomTotalSupplyConverted) + ' ' + dLab(platformDenom)
  data[`${platformDenom}AL`] = fMNDOL(denomAssetLimit) + ' ' + dLab(platformDenom)
  return data;
};

// getValueRewardsDistributedForDenom
var getVRDFD = (rewardPeriodsData, denom, kavaPrice) => {
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
// setUsdxAmountsByDenom
var sUABD = (denom, usdxAmount, usdxLimit) => {
  const formattedUsdxAmount = fMNDOL(usdxAmount);
  const formattedUsdxLimit = fMNDOL(usdxLimit);
  const rawUsdxUtilization = Number(usdxAmount.toFixed(0)) / Number(usdxLimit.toFixed(0))
  const percentUsdxUtilization = Number(rawUsdxUtilization.toFixed(3) * 100).toFixed(2) + "%";
  $(`.percent-line-usdx-${denom}`).css("width", percentUsdxUtilization);
  sDV(formattedUsdxAmount, `tb-${denom}`)
  sDV(formattedUsdxLimit, `bl-${denom}`)
};

// setDenomPriceData
var sDPD = (denomPercentChange, priceChangeCssId) => {
  let kavaPercentChangeFinal;
  if(Number(denomPercentChange) >= 0) {
    kavaPercentChangeFinal =  "+" + formatMNDS(denomPercentChange) + "%";
    sDC('green', priceChangeCssId)
  } else {
    kavaPercentChangeFinal = usdF.format(denomPercentChange).replace("$", "") + "%";
    sDC('red', priceChangeCssId)
  }
  sDV(kavaPercentChangeFinal, priceChangeCssId)
}

// getSuppliedAmount
var gSA = (suppliedAmounts, denom) => {
  let amount = 0;
  const denomAmounts = suppliedAmounts.find((a) => a.denom === denom)
  if (denomAmounts) {
    amount = denomAmounts.amount;
  }
  return amount
}

// setUsdxAssetLimit
var sUAL = (cdpParamsData) => {
  return fMNDOL(Number(cdpParamsData.result.global_debt_limit.amount)/TO_6);
}

// setDisplayValue
var sDV = (value, cssId) => {
  // $(`#${cssId}`).html(value);
  $(`#${cssId}`).last().html(value);
  $(`#${cssId}`).first().html(value);
  // document.getElementById(cssId).innerHTML = value;
};

// setDisplayColor
var sDC = (color, cssId) =>{
  $(`#${cssId}`).css({ color: color });
  // document.getElementById(cssId).style.color = color;
}

// updateDisplayValues
var updateDV = async () => {
  // set price info for denoms
  const [
    kavaMR,
    hardMR,
    bnbMR,
    busdMR,
    btcbMR,
    xrpbMR,
    usdxMR,
    saData,
    sData,
    bnbSDdata,
    bep3Data,
    cdpD,
    ipD,
    cdpRBnb,
    cdpRBusd,
    cdpRBtc,
    cdpRXrp,
    cdpRKava,
    cdpRHard,
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

  const kavaMD = await kavaMR.json();
  const hardMD = await hardMR.json();
  const bnbMD = await bnbMR.json();
  const busdMD = await busdMR.json();
  const btcbMD = await btcbMR.json();
  const xrpbMD = await xrpbMR.json();
  const usdxMD = await usdxMR.json();

  const kavaPrice = Number(kavaMD.lastPrice);

  // "Total Rewards Distributed"
  const iPData = await ipD.json()
//  bnb = new Date("2020-07-29T14:00:14.333506701Z");
// busd = new Date("2020-11-09T14:00:14.333506701Z");
// btcb = new Date("2020-11-16T14:00:14.333506701Z");
// xrpb = new Date("2020-12-02T14:00:14.333506701Z");
// kava = new Date("2020-12-14T14:00:14.333506701Z");
// hard = new Date("2021-01-15T14:00:14.333506701Z");

  const bnbReward = getVRDFD(iPData, 'bnb-a', kavaPrice);
  const busdReward = getVRDFD(iPData, 'busd-a', kavaPrice);
  const btcbReward = getVRDFD(iPData, 'btcb-a', kavaPrice);
  const xrpbReward = getVRDFD(iPData, 'xrpb-a', kavaPrice);
  const kavaReward = getVRDFD(iPData, 'ukava-a', kavaPrice);
  const hardReward = getVRDFD(iPData, 'hard-a', kavaPrice);

  const suppliedAmountJson = await saData.json()
  const suppliedAmounts = suppliedAmountJson.result.value.coins
  const supplyData = await sData.json()
  const bnbSupplyData = await bnbSDdata.json()
  const bep3ParamsData = await bep3Data.json()
  const cdpParamsData = await cdpD.json()

  const bnbCdPData = await cdpRBnb.json()
  const busdCdPData = await cdpRBusd.json()
  const btcCdPData = await cdpRBtc.json()
  const xrpCdPData = await cdpRXrp.json()
  const kavaCdPData = await cdpRKava.json()
  const hardCdPData = await cdpRHard.json()


  // new bnb
  let bnbPlatformAmounts = await tLABBD(bnbCdPData.result, 'bnb-a');
  let bnbLocked;
  let bnbBorrowed;
  let bnbFees;
  if (bnbPlatformAmounts) {
    bnbLocked = bnbPlatformAmounts.locked;
    bnbBorrowed = bnbPlatformAmounts.borrowed;
    bnbFees = bnbPlatformAmounts.fees;
  }
  let bnbUsdxLimit = await uDLBD('BNB-A', cdpParamsData)
  let bnbUSDX = sUA(bnbUsdxLimit, bnbBorrowed, bnbFees)
  let bnbPrice = Number(bnbMD.lastPrice);
  const bnbPCP = Number(bnbMD.priceChangePercent);
  let {
    bnbUsd,
    bnbMC,
    bnbSupply,
    bnbAL
  } = await sDTSV(bnbSupplyData, bep3ParamsData, bnbPrice, 'bnb');

  // set bnb info in UI
  sDV(usdF.format(bnbPrice), 'price-bnb');
  sDPD(bnbPCP, 'pc-bnb');
  let bnbFromSuppliedAccount =  gSA(suppliedAmounts, 'bnb');
  // let bnbFromSuppliedAccount = suppliedAmounts.find((a) => a.denom === 'bnb').amount;
  const bnbSupplied = sDTS(bnbFromSuppliedAccount, TO_8, bnbPrice, 'ts-bnb');
  sDTS(bnbFromSuppliedAccount, TO_8, bnbPrice, 'ts-m-bnb');
  sDV(usdF.format(bnbReward), 'te-bnb');
  sDV(usdF.format(bnbReward), 'te-m-bnb');
  sDAPY(bnbPrice, bnbLocked, 'bnb-a', kavaPrice, iPData, 'ea-bnb');
  sDAPY(bnbPrice, bnbLocked, 'bnb-a', kavaPrice, iPData, 'ea-m-bnb');
  sUABD('bnb', bnbUSDX, bnbUsdxLimit);




  // new busd
  let busdPlatformAmounts = await tLABBD(busdCdPData.result, 'busd-a');
  let busdLocked;
  let busdBorrowed;
  let busdFees;
  if (busdPlatformAmounts) {
    busdLocked = busdPlatformAmounts.locked;
    busdBorrowed = busdPlatformAmounts.borrowed;
    busdFees = busdPlatformAmounts.fees;
  }
  let busdUsdxLimit = await uDLBD('BUSD-A', cdpParamsData)
  let busdUSDX = sUA(busdUsdxLimit, busdBorrowed, busdFees)
  let busdPrice = Number(busdMD.lastPrice);
  const busdPCP = Number(busdMD.priceChangePercent);
  let {
    busdUsd,
    busdMC,
    busdSupply,
    busdAL
  } = await sDTSV(supplyData, bep3ParamsData, busdPrice, 'busd');

  // set busd info in UI
  sDV(usdF.format(busdPrice), 'price-busd');
  sDPD(busdPCP, 'pc-busd');
  let busdFromSuppliedAccount =  gSA(suppliedAmounts, 'busd');
  const busdSupplied = sDTS(busdFromSuppliedAccount, TO_8, busdPrice, 'ts-busd');
  sDTS(busdFromSuppliedAccount, TO_8, busdPrice, 'ts-m-busd');
  sDV(usdF.format(busdReward), 'te-busd');
  sDV(usdF.format(busdReward), 'te-m-busd');
  sDAPY(busdPrice, busdLocked, 'busd-a', kavaPrice, iPData, 'ea-busd');
  sDAPY(busdPrice, busdLocked, 'busd-a', kavaPrice, iPData, 'ea-m-busd');
  sUABD('busd', busdUSDX, busdUsdxLimit);

  // new btc
  let btcPlatformAmounts = await tLABBD(btcCdPData.result, 'btcb-a');
  let btcLocked;
  let btcBorrowed;
  let btcFees;
  if (btcPlatformAmounts) {
    btcLocked = btcPlatformAmounts.locked;
    btcBorrowed = btcPlatformAmounts.borrowed;
    btcFees = btcPlatformAmounts.fees;
  }
  let btcUsdxLimit = await uDLBD('BTCB-A', cdpParamsData)
  let btcUSDX = sUA(btcUsdxLimit, btcBorrowed, btcFees)
  let btcPrice = Number(btcbMD.lastPrice);
  const btcPCP = Number(btcbMD.priceChangePercent);
  let {
    btcbUsd,
    btcbMC,
    btcbSupply,
    btcbAL
  } = await sDTSV(supplyData, bep3ParamsData, btcPrice, 'btcb');

  // set btc info in UI
  sDV(usdF.format(btcPrice), 'price-btc');
  sDPD(btcPCP, 'pc-btc');
  let btcFromSuppliedAccount =  gSA(suppliedAmounts, 'btcb');
  // let btcFromSuppliedAccount = suppliedAmounts.find((a) => a.denom === 'btcb').amount;
  const btcSupplied = sDTS(btcFromSuppliedAccount, TO_8, btcPrice, 'ts-btc');
  sDTS(btcFromSuppliedAccount, TO_8, btcPrice, 'ts-m-btc');
  sDV(usdF.format(btcbReward), 'te-btc');
  sDV(usdF.format(btcbReward), 'te-m-btc');
  sDAPY(btcPrice, btcLocked, 'btcb-a', kavaPrice, iPData, 'ea-btc');
  sDAPY(btcPrice, btcLocked, 'btcb-a', kavaPrice, iPData, 'ea-m-btc');
  sUABD('btc', btcUSDX, btcUsdxLimit)




  // new xrp
  let xrpPlatformAmounts = await tLABBD(xrpCdPData.result, 'xrpb-a');
  let xrpLocked;
  let xrpBorrowed;
  let xrpFees;
  if (xrpPlatformAmounts) {
    xrpLocked = xrpPlatformAmounts.locked;
    xrpBorrowed = xrpPlatformAmounts.borrowed;
    xrpFees = xrpPlatformAmounts.fees;
  }
  let xrpUsdxLimit = await uDLBD('XRPB-A', cdpParamsData)
  let xrpUSDX = sUA(xrpUsdxLimit, xrpBorrowed, xrpFees)
  let xrpbPrice = Number(xrpbMD.lastPrice);
  const xrpbPCP = Number(xrpbMD.priceChangePercent);
  let {
    xrpbUsd,
    xrpbMC,
    xrpbSupply,
    xrpbAL
  } = await sDTSV(supplyData, bep3ParamsData, xrpbPrice, 'xrpb');

  // set xrp info in UI
  sDV(usdF.format(xrpbPrice), 'price-xrp');
  sDPD(xrpbPCP, 'pc-xrp');
  let xrpFromSuppliedAccount =  gSA(suppliedAmounts, 'xrpb');
  // let xrpFromSuppliedAccount = suppliedAmounts.find((a) => a.denom === 'xrpb').amount;
  const xrpbSupplied = sDTS(xrpFromSuppliedAccount, TO_8, xrpbPrice, 'ts-xrp');
  sDTS(xrpFromSuppliedAccount, TO_8, xrpbPrice, 'ts-m-xrp');
  sDV(usdF.format(xrpbReward), 'te-xrpb');
  sDV(usdF.format(xrpbReward), 'te-m-xrpb');
  sDAPY(xrpbPrice, xrpLocked, 'xrpb-a', kavaPrice, iPData, 'ea-xrp');
  sDAPY(xrpbPrice, xrpLocked, 'xrpb-a', kavaPrice, iPData, 'ea-m-xrp');
  sUABD('xrp', xrpUSDX, xrpUsdxLimit);

  // new kava
  let ukavaPlatformAmounts = await tLABBD(kavaCdPData.result, 'ukava-a');
  let ukavaLocked;
  let ukavaBorrowed;
  let ukavaFees;
  if (ukavaPlatformAmounts) {
    ukavaLocked = ukavaPlatformAmounts.locked;
    ukavaBorrowed = ukavaPlatformAmounts.borrowed;
    ukavaFees = ukavaPlatformAmounts.fees;
  }
  let ukavaUsdxLimit = await uDLBD('UKAVA-A', cdpParamsData)
  let ukavaUSDX = sUA(ukavaUsdxLimit, ukavaBorrowed, ukavaFees)
  const kavaPCP = Number(kavaMD.priceChangePercent);
  let { ukavaUsd, ukavaMC, ukavaSupply } = await sDTSV(supplyData, bep3ParamsData, kavaPrice, 'ukava');

  // set kava info in UI
  sDV(usdF.format(kavaPrice), 'price-kava');
  sDPD(kavaPCP, 'pc-kava');
  let kavaFromSuppliedAccount =  gSA(suppliedAmounts, 'ukava');
  // let kavaFromSuppliedAccount = suppliedAmounts.find((a) => a.denom === 'ukava').amount;
  const kavaSupplied = sDTS(kavaFromSuppliedAccount, TO_6, kavaPrice, 'ts-kava');
  sDTS(kavaFromSuppliedAccount, TO_6, kavaPrice, 'ts-m-kava');
  sDV(usdF.format(kavaReward), 'te-kava');
  sDV(usdF.format(kavaReward), 'te-m-kava');
  sDAPY(kavaPrice, ukavaLocked, 'ukava-a', kavaPrice, iPData, 'ea-kava');
  sDAPY(kavaPrice, ukavaLocked, 'ukava-a', kavaPrice, iPData, 'ea-m-kava');
  sUABD('kava', ukavaUSDX, ukavaUsdxLimit);




  // new hard
  let hardPlatformAmounts = await tLABBD(hardCdPData.result, 'hard-a');
  let hardLocked;
  let hardBorrowed;
  let hardFees;
  if (hardPlatformAmounts) {
    hardLocked = hardPlatformAmounts.locked;
    hardBorrowed = hardPlatformAmounts.borrowed;
    hardFees = hardPlatformAmounts.fees;
  }
  let hardUsdxLimit = await uDLBD('HARD-A', cdpParamsData)
  let hardUSDX = sUA(hardUsdxLimit, hardBorrowed, hardFees)
  let hardPrice = Number(hardMD.lastPrice);
  const hardPCP = Number(hardMD.priceChangePercent);
  let { hardUsd, hardMC, hardSupply } = await sDTSV(supplyData, bep3ParamsData, hardPrice, 'hard');

  // // set hard info in UI
  sDV(usdF.format(hardPrice), 'price-hard');
  sDPD(hardPCP, 'pc-hard');
  let hardFromSuppliedAccount =  gSA(suppliedAmounts, 'hard');
  // let hardFromSuppliedAccount = suppliedAmounts.find((a) => a.denom === 'hard').amount;
  const hardSupplied = sDTS(hardFromSuppliedAccount, TO_6, hardPrice, 'ts-hard');
  sDTS(hardFromSuppliedAccount, TO_6, hardPrice, 'ts-m-hard');
  sDV(usdF.format(hardReward), 'te-hard');
  sDV(usdF.format(hardReward), 'te-m-hard');
  sDAPY(hardPrice, hardLocked, 'hard-a', kavaPrice, iPData, 'ea-hard');
  sDAPY(hardPrice, hardLocked, 'hard-a', kavaPrice, iPData, 'ea-m-hard');
  sUABD('hard', hardUSDX, hardUsdxLimit);


  // Total Assets Supplied
  const totalAS = bnbSupplied + busdSupplied + btcSupplied + xrpbSupplied + kavaSupplied + hardSupplied
   sDV(formatMNDS(totalAS), "t-a-s");

  // Total Assets Borrowed
  let totalUSDX = bnbUSDX + btcUSDX + busdUSDX + xrpUSDX + ukavaUSDX + hardUSDX;
  sDV(formatMNDS(totalUSDX), 't-a-b');



  // defi hub stats

  const usdxPrice = usdxMD.market_data.current_price.usd;
  const usdxPCPC = usdxMD.market_data.price_change_percentage_24h
  let { usdxUsd, usdxMC, usdxSupply } = await sDTSV(supplyData, bep3ParamsData, usdxPrice, 'usdx');

  const totalMC = bnbUsd + busdUsd + btcbUsd + xrpbUsd + ukavaUsd + hardUsd + usdxUsd
  sDV(formatMNDS(totalMC), 't-m-c');

  sDV(usdF.format(kavaPrice), 'price-d-kava');
  sDPD(kavaPCP, 'pc-d-kava');
  sDV(ukavaMC, 'mc-kava')
  sDV(ukavaSupply, 's-kava')
  sDV(usdF.format(kavaPrice), 'price-md-kava');
  sDPD(kavaPCP, 'pc-md-kava');
  sDV(ukavaMC, 'mc-m-kava')
  sDV(ukavaSupply, 's-m-kava')

  sDV(usdF.format(hardPrice), 'price-d-hard');
  sDPD(hardPCP, 'pc-d-hard');
  sDV(hardMC, 'mc-hard')
  sDV(hardSupply, 's-hard')
  sDV(usdF.format(hardPrice), 'price-md-hard');
  sDPD(hardPCP, 'pc-md-hard');
  sDV(hardMC, 'mc-m-hard')
  sDV(hardSupply, 's-m-hard')

  sDV(usdF.format(usdxPrice), 'price-d-usdx');
  sDPD(usdxPCPC, 'pc-d-usdx');
  sDV(usdxMC, 'mc-usdx')
  sDV(usdxSupply, 's-usdx')
  sDV((sUAL(cdpParamsData) + ' ' + dLab('usdx')), 'al-usdx')
  sDV(usdF.format(usdxPrice), 'price-md-usdx');
  sDPD(usdxPCPC, 'pc-md-usdx');
  sDV(usdxMC, 'mc-m-usdx')
  sDV(usdxSupply, 's-m-usdx')
  sDV((sUAL(cdpParamsData) + ' ' + dLab('usdx')), 'al-m-usdx')

  sDV(usdF.format(btcPrice), 'price-d-btc');
  sDPD(btcPCP, 'pc-d-btc');
  sDV(btcbMC, 'mc-btc')
  sDV(btcbSupply, 's-btc')
  sDV(btcbAL, 'al-btc')
  sDV(usdF.format(btcPrice), 'price-md-btc');
  sDPD(btcPCP, 'pc-md-btc');
  sDV(btcbMC, 'mc-m-btc')
  sDV(btcbSupply, 's-m-btc')
  sDV(btcbAL, 'al-m-btc')

  sDV(usdF.format(xrpbPrice), 'price-d-xrp');
  sDPD(xrpbPCP, 'pc-d-xrp');
  sDV(xrpbMC, 'mc-xrp')
  sDV(xrpbSupply, 's-xrp')
  sDV(xrpbAL, 'al-xrp')
  sDV(usdF.format(xrpbPrice), 'price-md-xrp');
  sDPD(xrpbPCP, 'pc-md-xrp');
  sDV(xrpbMC, 'mc-m-xrp')
  sDV(xrpbSupply, 's-m-xrp')
  sDV(xrpbAL, 'al-m-xrp')

  sDV(usdF.format(busdPrice), 'price-d-busd');
  sDPD(busdPCP, 'pc-d-busd');
  sDV(busdMC, 'mc-busd')
  sDV(busdSupply, 's-busd')
  sDV(busdAL, 'al-busd')
  sDV(usdF.format(busdPrice), 'price-md-busd');
  sDPD(busdPCP, 'pc-md-busd');
  sDV(busdMC, 'mc-m-busd')
  sDV(busdSupply, 's-m-busd')
  sDV(busdAL, 'al-m-busd')

  sDV(usdF.format(bnbPrice), 'price-d-bnb');
  sDPD(bnbPCP, 'pc-d-bnb');
  sDV(bnbMC, 'mc-bnb')
  sDV(bnbSupply, 's-bnb')
  sDV(bnbAL, 'al-bnb')
  sDV(usdF.format(bnbPrice), 'price-md-bnb');
  sDPD(bnbPCP, 'pc-md-bnb');
  sDV(bnbMC, 'mc-m-bnb')
  sDV(bnbSupply, 's-m-bnb')
  sDV(bnbAL, 'al-m-bnb')

  $(".metric-blur").css("background-color", "transparent")
  $(".metric-blur").addClass('without-after');
  $(".api-metric").css({"display": "block", "text-align": "center"})
};

var main = async () => {
    await updateDV()
    await sleep(60000)
    main()
}

var sleep = (ms = 10000) => { return new Promise(resolve => setTimeout(resolve, ms)); }

main();
