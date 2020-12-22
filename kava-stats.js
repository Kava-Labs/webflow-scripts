const FACTOR_SIX = Number(10 ** 6)
const FACTOR_EIGHT = Number(10 ** 8)
const BASE_URL = "https://kava4.data.kava.io"
const BINANACE_URL = "https://api.binance.com/api/v3"

// usdFormatter
var usdF = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

// formatMoneyMillions
var formatMM = (v) => {
  const valueBorrowedInMil = v/FACTOR_SIX
  const valueBorrowedFormatted = usdF.format(valueBorrowedInMil)
  return valueBorrowedFormatted + "M"
}

// formatMoneyNoDecimalsOrLabels
var formatMNDOL = (v) => {
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
  return ['ukava-a', 'usdx', 'hard', 'ukava'].includes(d)
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

// totalLockedAndBorrowedByDenom
var tLABBD = async (denom) => {
  let denomCdpsURL = BASE_URL + `/cdp/cdps/collateralType/${denom}`;
  let cdpResponse = await fetch(denomCdpsURL);
  let cdpData = await cdpResponse.json();
  let cdpRes = cdpData && cdpData.result;

  var { collateral, principal, accumulated_fees } = cdpRes.reduce(function(accumulator, item) {
    Object.keys(item.cdp).forEach(function(key) {
      let c = ['collateral', 'principal', 'accumulated_fees'];
      if(c.includes(key)){
        accumulator[key] = Number((accumulator[key] || 0)) + Number(item.cdp[key].amount);
      }
    });
    return accumulator;
  }, {});

  return {
    locked: isKNA(denom) ? Number(collateral/FACTOR_SIX) : Number(collateral/FACTOR_EIGHT),
    borrowed: Number(principal/FACTOR_SIX),
    fees: Number(accumulated_fees/FACTOR_SIX)
  }
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
  const iRdata = data.result
  let ukavaRewardsPerPeriod = 0;
  let nanoSecondsPerPeriod = 0;
  if(iRdata) {
    if(iRdata.rewards && iRdata.rewards.length > 0) {
      const denomRewards = data.result.rewards.find(
        (item) => item.collateral_type.toUpperCase() === denom.toUpperCase()
      );
      ukavaRewardsPerPeriod = Number(denomRewards.available_rewards.amount);
      nanoSecondsPerPeriod = Number(denomRewards.duration);
    }
  }

  const kavaRewardsPerPeriod = ukavaRewardsPerPeriod/FACTOR_SIX;
  const periodsPerYear = rPPY(nanoSecondsPerPeriod);
  const rewardsPerYearInKava = kavaRewardsPerPeriod * periodsPerYear;
  const rewardsPerYearInUsd = rewardsPerYearInKava * Number(kavaPrice);

  const rawDenomApy = rewardsPerYearInUsd/lockedDenomBalance;
  const denomPercentageApy = Number(rawDenomApy) * 100;
  const formattedPercentageWithDollarSign = usdF.format(denomPercentageApy);
  const formattedPercentageFinal = formattedPercentageWithDollarSign.slice(1, formattedPercentageWithDollarSign.length);
  return formattedPercentageFinal + "%";
};

// rewardPeriodsPerYear
function rPPY(ns) {
  const NanoSecondsPerYear = Number(31449600000000000);
  return NanoSecondsPerYear / Number(ns)
}

// usdxDebtLimitByDenom
var uDLBD = (denom, data) => {
  const collateralParams = data.result.collateral_params;

  const denomParams = collateralParams.find(
    (item) => item.type.toUpperCase() === denom.toUpperCase()
  );

  let hasDebtLimit = denomParams && denomParams.debt_limit;
  return hasDebtLimit ? (Number(denomParams.debt_limit.amount)/FACTOR_SIX) : 0
};

// setUsdxAmount
var setUA = (limit, borrowed, feesOwed) => {
  if(limit && borrowed) {
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
  return hasSupplyLimit ? (Number(denomParams.supply_limit.limit)/FACTOR_EIGHT) : 0
};

// setDenomTotalSupplied
var setDTS = (denomSupplyFromAcct, factor, denomPrice, denomLockedId) => {
  const denomTotalSupplyCoin = denomSupplyFromAcct/factor;
  const denomTotalSupplyValue = Number(denomTotalSupplyCoin * denomPrice);
  setDV(formatMNDS(denomTotalSupplyValue), denomLockedId);
  return denomTotalSupplyValue
}

// setDenomAPY
var setDAPY = (denomPrice, denomLockedValue, incentiveDenom, kavaPrice, incentiveParamsData, denomApyId) => {
  const denomValueLocked = Number(denomPrice) * Number(denomLockedValue)
  const denomRewardAPY = getRAFD(incentiveDenom, denomValueLocked, kavaPrice, incentiveParamsData)
  setDV(denomRewardAPY, denomApyId);
}

  // setDenomTotalSupplyValue
var setDTSV = async (supplyData, bep3ParamsData, denomPrice, platformDenom) => {
  let denomTotalSupply;
  platformDenom === 'bnb' ?
    denomTotalSupply = bAOP(supplyData) :
    denomTotalSupply = tAOPBD(supplyData, platformDenom)
  let denomTotalSupplyConverted
  isKNA(platformDenom) ?
    denomTotalSupplyConverted = Number(denomTotalSupply)/FACTOR_SIX :
    denomTotalSupplyConverted = Number(denomTotalSupply)/FACTOR_EIGHT
  let denomTotalSupplyValue =  Number(denomTotalSupplyConverted * denomPrice)
  let denomAssetLimit = supplyLBD(platformDenom, bep3ParamsData)
  let data = {}
  data[`${platformDenom}Usd`] = denomTotalSupplyValue
  data[`${platformDenom}MC`] = formatMM(denomTotalSupplyValue)
  data[`${platformDenom}Supply`] = formatMNDOL(denomTotalSupplyConverted) + ' ' + denomLabel(platformDenom)
  data[`${platformDenom}AL`] = formatMNDOL(denomAssetLimit) + ' ' + denomLabel(platformDenom)
  return data;
};

// getRewardPeriodsData
var getRPD = async () => {
  const rewardPeriodsURL = BASE_URL + "/incentive/rewardperiods";
  const rewardPeriodsRepsonse = await fetch(rewardPeriodsURL);
  const rewardPeriodsData = await rewardPeriodsRepsonse.json();
  return rewardPeriodsData;
}

// getValueRewardsDistributedForDenom
var getVRDFD = (rewardPeriodsData, denom, kavaPrice, rewardsStartTime) => {
  if(!rewardsStartTime) { return 0.00 }
  let kavaDistributed = 0;

  if(rewardPeriodsData.result) {
    const denomRewardPeriod = rewardPeriodsData.result.find(
      (item) => item.collateral_type.toUpperCase() === denom.toUpperCase()
    );

    const millisecondsRewardActive = Date.now() - rewardsStartTime.getTime();
    const secondsRewardActive = millisecondsRewardActive / 1000;

    const ukavaRewardsPerSecond = denomRewardPeriod.reward.amount;
    const ukavaDistributed = Number(ukavaRewardsPerSecond) * Number(secondsRewardActive);
    kavaDistributed = ukavaDistributed / FACTOR_SIX;
  }
  return Number(kavaDistributed) * Number(kavaPrice);
};

// asset 'Total Borrowed', 'Borrow Limit', 'percent line'
// setUsdxAmountsByDenom
var setUABD = (denom, usdxAmount, usdxLimit) => {
  const formattedUsdxAmount = formatMNDOL(usdxAmount);
  const formattedUsdxLimit = formatMNDOL(usdxLimit);

  const rawUsdxUtilization = Number(usdxAmount.toFixed(0)) / Number(usdxLimit.toFixed(0))
  const percentUsdxUtilization = Number(rawUsdxUtilization.toFixed(3) * 100).toFixed(2) + "%";
  $(`.percent-line-usdx-${denom}`).css("width", percentUsdxUtilization);
  setDV(formattedUsdxAmount, `tb-${denom}`)
  setDV(formattedUsdxLimit, `bl-${denom}`)
};

// setDenomPriceData
var setDPD = (denomPercentChange, priceChangeCssId) => {
  let kavaPercentChangeFinal;
  if(Number(denomPercentChange) >= 0) {
    kavaPercentChangeFinal =  "+" + formatMNDS(denomPercentChange) + "%";
    setDC('green', priceChangeCssId)
  } else {
    kavaPercentChangeFinal = usdF.format(denomPercentChange).replace("$", "") + "%";
    setDC('red', priceChangeCssId)
  }
  setDV(kavaPercentChangeFinal, priceChangeCssId)
}

// setUsdxAssetLimit
var setUAL = (cdpParamsData) => {
  return formatMNDOL(Number(cdpParamsData.result.global_debt_limit.amount)/FACTOR_SIX);
}

// setDisplayValue
var setDV = (value, cssId) => {
  // $(`#${cssId}`).html(value);
  $(`#${cssId}`).last().html(value);
  $(`#${cssId}`).first().html(value);
  // document.getElementById(cssId).innerHTML = value;
};

// setDisplayColor
var setDC = (color, cssId) =>{
  $(`#${cssId}`).css({ color: color });
  // document.getElementById(cssId).style.color = color;
}

// updateDisplayValues
var updateDV = async () => {
  // set price info for denoms
  const [kavaMR, hardMR, bnbMR, busdMR, btcbMR, xrpbMR, usdxMR] = await Promise.all([
    fetch(BINANACE_URL + "/ticker/24hr?symbol=KAVAUSDT"),
    fetch(BINANACE_URL + "/ticker/24hr?symbol=HARDUSDT"),
    fetch(BINANACE_URL + "/ticker/24hr?symbol=BNBUSDT"),
    fetch(BINANACE_URL + "/ticker/24hr?symbol=BUSDUSDT"),
    fetch(BINANACE_URL + "/ticker/24hr?symbol=BTCUSDT"),
    fetch(BINANACE_URL + "/ticker/24hr?symbol=XRPUSDT"),
    fetch('https://api.coingecko.com/api/v3/coins/usdx')
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
  const rewardPeriodsData = await getRPD();
  const bnbReward = getVRDFD(rewardPeriodsData, 'bnb-a', kavaPrice, new Date("2020-07-29T14:00:14.333506701Z"));
  const busdReward = getVRDFD(rewardPeriodsData, 'busd-a', kavaPrice, new Date("2020-11-09T14:00:14.333506701Z"));
  const btcbReward = getVRDFD(rewardPeriodsData, 'btcb-a', kavaPrice, new Date("2020-11-16T14:00:14.333506701Z"));
  const xrpbReward = getVRDFD(rewardPeriodsData, 'xrpb-a', kavaPrice, new Date("2020-12-02T14:00:14.333506701Z"));
  const kavaReward = getVRDFD(rewardPeriodsData, 'ukava-a', kavaPrice, new Date("2020-12-14T14:00:14.333506701Z"));
  // const hardReward = getVRDFD(rewardPeriodsData, 'hard-a', kavaPrice, new Date("2020-12-28T14:00:14.333506701Z"));
  const totalReward = bnbReward + busdReward + btcbReward + xrpbReward + kavaReward; // + kavaReward;



  // get main asset data
  const [saData, sData, bnbSDdata, bep3Data, cdpD, ipD] = await Promise.all([
    fetch(BASE_URL + '/auth/accounts/kava1wq9ts6l7atfn45ryxrtg4a2gwegsh3xha9e6rp'),
    fetch(BASE_URL + "/supply/total"),
    fetch(BASE_URL + "/bep3/supplies"),
    fetch(BASE_URL + "/bep3/parameters"),
    fetch(BASE_URL + "/cdp/parameters"),
    fetch(BASE_URL + "/incentive/parameters")
  ])

  const suppliedAmountJson = await saData.json()
  const suppliedAmounts = suppliedAmountJson.result.value.coins
  const supplyData = await sData.json()
  const bnbSupplyData = await bnbSDdata.json()
  const bep3ParamsData = await bep3Data.json()
  const cdpParamsData = await cdpD.json()
  const incentiveParamsData = await ipD.json()

  // new bnb
  let bnbPlatformAmounts = await tLABBD('bnb-a');
  let bnbLocked;
  let bnbBorrowed;
  let bnbFees;
  if (bnbPlatformAmounts) {
    bnbLocked = bnbPlatformAmounts.locked;
    bnbBorrowed = bnbPlatformAmounts.borrowed;
    bnbFees = bnbPlatformAmounts.fees;
  }
  let bnbUsdxLimit = await uDLBD('BNB-A', cdpParamsData)
  let bnbUSDX = setUA(bnbUsdxLimit, bnbBorrowed, bnbFees)
  let bnbPrice = Number(bnbMD.lastPrice);
  const bnbPCP = Number(bnbMD.priceChangePercent);
  let {
    bnbUsd,
    bnbMC,
    bnbSupply,
    bnbAL
  } = await setDTSV(bnbSupplyData, bep3ParamsData, bnbPrice, 'bnb');

  // set bnb info in UI
  setDV(usdF.format(bnbPrice), 'price-bnb');
  setDPD(bnbPCP, 'pc-bnb');
  let bnbFromSuppliedAccount = suppliedAmounts.find((a) => a.denom === 'bnb').amount;
  const bnbSupplied = setDTS(bnbFromSuppliedAccount, FACTOR_EIGHT, bnbPrice, 'ts-bnb');
  setDTS(bnbFromSuppliedAccount, FACTOR_EIGHT, bnbPrice, 'ts-m-bnb');
  setDV(usdF.format(bnbReward), 'te-bnb');
  setDV(usdF.format(bnbReward), 'te-m-bnb');
  setDAPY(bnbPrice, bnbLocked, 'bnb-a', kavaPrice, incentiveParamsData, 'ea-bnb');
  setDAPY(bnbPrice, bnbLocked, 'bnb-a', kavaPrice, incentiveParamsData, 'ea-m-bnb');
  setUABD('bnb', bnbUSDX, bnbUsdxLimit);




  // new busd
  let busdPlatformAmounts = await tLABBD('busd-a');
  let busdLocked;
  let busdBorrowed;
  let busdFees;
  if (busdPlatformAmounts) {
    busdLocked = busdPlatformAmounts.locked;
    busdBorrowed = busdPlatformAmounts.borrowed;
    busdFees = busdPlatformAmounts.fees;
  }
  let busdUsdxLimit = await uDLBD('BUSD-A', cdpParamsData)
  let busdUSDX = setUA(busdUsdxLimit, busdBorrowed, busdFees)
  let busdPrice = Number(busdMD.lastPrice);
  const busdPCP = Number(busdMD.priceChangePercent);
  let {
    busdUsd,
    busdMC,
    busdSupply,
    busdAL
  } = await setDTSV(supplyData, bep3ParamsData, busdPrice, 'busd');

  // set busd info in UI
  setDV(usdF.format(busdPrice), 'price-busd');
  setDPD(busdPCP, 'pc-busd');
  let busdFromSuppliedAccount = suppliedAmounts.find((a) => a.denom === 'busd').amount;
  const busdSupplied = setDTS(busdFromSuppliedAccount, FACTOR_EIGHT, busdPrice, 'ts-busd');
  setDTS(busdFromSuppliedAccount, FACTOR_EIGHT, busdPrice, 'ts-m-busd');
  setDV(usdF.format(busdReward), 'te-busd');
  setDV(usdF.format(busdReward), 'te-m-busd');
  setDAPY(busdPrice, busdLocked, 'busd-a', kavaPrice, incentiveParamsData, 'ea-busd');
  setDAPY(busdPrice, busdLocked, 'busd-a', kavaPrice, incentiveParamsData, 'ea-m-busd');
  setUABD('busd', busdUSDX, busdUsdxLimit);




  // new btc
  let btcPlatformAmounts = await tLABBD('btcb-a');
  let btcLocked;
  let btcBorrowed;
  let btcFees;
  if (btcPlatformAmounts) {
    btcLocked = btcPlatformAmounts.locked;
    btcBorrowed = btcPlatformAmounts.borrowed;
    btcFees = btcPlatformAmounts.fees;
  }
  let btcUsdxLimit = await uDLBD('BTCB-A', cdpParamsData)
  let btcUSDX = setUA(btcUsdxLimit, btcBorrowed, btcFees)
  let btcPrice = Number(btcbMD.lastPrice);
  const btcPCP = Number(btcbMD.priceChangePercent);
  let {
    btcbUsd,
    btcbMC,
    btcbSupply,
    btcbAL
  } = await setDTSV(supplyData, bep3ParamsData, btcPrice, 'btcb');

  // set btc info in UI
  setDV(usdF.format(btcPrice), 'price-btc');
  setDPD(btcPCP, 'pc-btc');
  let btcFromSuppliedAccount = suppliedAmounts.find((a) => a.denom === 'btcb').amount;
  const btcSupplied = setDTS(btcFromSuppliedAccount, FACTOR_EIGHT, btcPrice, 'ts-btc');
  setDTS(btcFromSuppliedAccount, FACTOR_EIGHT, btcPrice, 'ts-m-btc');
  setDV(usdF.format(btcbReward), 'te-btc');
  setDV(usdF.format(btcbReward), 'te-m-btc');
  setDAPY(btcPrice, btcLocked, 'btcb-a', kavaPrice, incentiveParamsData, 'ea-btc');
  setDAPY(btcPrice, btcLocked, 'btcb-a', kavaPrice, incentiveParamsData, 'ea-m-btc');
  setUABD('btc', btcUSDX, btcUsdxLimit)




  // new xrp
  let xrpPlatformAmounts = await tLABBD('xrpb-a');
  let xrpLocked;
  let xrpBorrowed;
  let xrpFees;
  if (xrpPlatformAmounts) {
    xrpLocked = xrpPlatformAmounts.locked;
    xrpBorrowed = xrpPlatformAmounts.borrowed;
    xrpFees = xrpPlatformAmounts.fees;
  }
  let xrpUsdxLimit = await uDLBD('XRPB-A', cdpParamsData)
  let xrpUSDX = setUA(xrpUsdxLimit, xrpBorrowed, xrpFees)
  let xrpbPrice = Number(xrpbMD.lastPrice);
  const xrpbPCP = Number(xrpbMD.priceChangePercent);
  let {
    xrpbUsd,
    xrpbMC,
    xrpbSupply,
    xrpbAL
  } = await setDTSV(supplyData, bep3ParamsData, xrpbPrice, 'xrpb');

  // set xrp info in UI
  setDV(usdF.format(xrpbPrice), 'price-xrp');
  setDPD(xrpbPCP, 'pc-xrp');
  let xrpFromSuppliedAccount = suppliedAmounts.find((a) => a.denom === 'xrpb').amount;
  const xrpbSupplied = setDTS(xrpFromSuppliedAccount, FACTOR_EIGHT, xrpbPrice, 'ts-xrp');
  setDTS(xrpFromSuppliedAccount, FACTOR_EIGHT, xrpbPrice, 'ts-m-xrp');
  setDV(usdF.format(xrpbReward), 'te-xrpb');
  setDV(usdF.format(xrpbReward), 'te-m-xrpb');
  setDAPY(xrpbPrice, xrpLocked, 'xrpb-a', kavaPrice, incentiveParamsData, 'ea-xrp');
  setDAPY(xrpbPrice, xrpLocked, 'xrpb-a', kavaPrice, incentiveParamsData, 'ea-m-xrp');
  setUABD('xrp', xrpUSDX, xrpUsdxLimit);




  // new kava
  let ukavaPlatformAmounts = await tLABBD('ukava-a');
  let ukavaLocked;
  let ukavaBorrowed;
  let ukavaFees;
  if (ukavaPlatformAmounts) {
    ukavaLocked = ukavaPlatformAmounts.locked;
    ukavaBorrowed = ukavaPlatformAmounts.borrowed;
    ukavaFees = ukavaPlatformAmounts.fees;
  }
  let ukavaUsdxLimit = await uDLBD('UKAVA-A', cdpParamsData)
  let ukavaUSDX = setUA(ukavaUsdxLimit, ukavaBorrowed, ukavaFees)
  const kavaPCP = Number(kavaMD.priceChangePercent);
  let { ukavaUsd, ukavaMC, ukavaSupply } = await setDTSV(supplyData, bep3ParamsData, kavaPrice, 'ukava');

  // set kava info in UI
  setDV(usdF.format(kavaPrice), 'price-kava');
  setDPD(kavaPCP, 'pc-kava');
  let kavaFromSuppliedAccount = suppliedAmounts.find((a) => a.denom === 'ukava').amount;
  const kavaSupplied = setDTS(kavaFromSuppliedAccount, FACTOR_SIX, kavaPrice, 'ts-kava');
  setDTS(kavaFromSuppliedAccount, FACTOR_SIX, kavaPrice, 'ts-m-kava');
  setDV(usdF.format(kavaReward), 'te-kava');
  setDV(usdF.format(kavaReward), 'te-m-kava');
  setDAPY(kavaPrice, ukavaLocked, 'ukava-a', kavaPrice, incentiveParamsData, 'ea-kava');
  setDAPY(kavaPrice, ukavaLocked, 'ukava-a', kavaPrice, incentiveParamsData, 'ea-m-kava');
  setUABD('kava', ukavaUSDX, ukavaUsdxLimit);




  // new hard
  // let hardPlatformAmounts = await tLABBD('hard-a');
  // let hardLocked;
  // let hardBorrowed;
  // let hardFees;
  // if (hardPlatformAmounts) {
  //   hardLocked = hardPlatformAmounts.locked;
  //   hardBorrowed = hardPlatformAmounts.borrowed;
  //   hardFees = hardPlatformAmounts.fees;
  // }
  // let hardUsdxLimit = await uDLBD('HARD-A', cdpParamsData)
  // let hardUSDX = setUA(hardUsdxLimit, hardPlatformAmounts, hardBorrowed, hardFees)
  let hardPrice = Number(hardMD.lastPrice);
  const hardPCP = Number(hardMD.priceChangePercent);
  let { hardUsd, hardMC, hardSupply } = await setDTSV(supplyData, bep3ParamsData, hardPrice, 'hard');

  // // set hard info in UI
  setDV(usdF.format(hardPrice), 'price-hard');
  setDPD(hardPCP, 'pc-hard');
  // let hardFromSuppliedAccount = suppliedAmounts.find((a) => a.denom === 'hard').amount;
  // const hardSupplied = setDTS(hardFromSuppliedAccount, FACTOR_SIX, hardPrice, 'ts-hard');
  // setDTS(hardFromSuppliedAccount, FACTOR_SIX, hardPrice, 'ts-m-hard');
  // setDV(usdF.format(hardReward), 'te-hard');
  // setDV(usdF.format(hardReward), 'te-m-hard');
  // setDAPY(hardPrice, hardLocked, 'hard-a', kavaPrice, incentiveParamsData, 'ea-hard');
  // setDAPY(hardPrice, hardLocked, 'hard-a', kavaPrice, incentiveParamsData, 'ea-m-hard');
  // setUABD('hard', hardUSDX, hardUsdxLimit);


  // Total Assets Supplied
  const totalAS = bnbSupplied + busdSupplied + btcSupplied + xrpbSupplied + kavaSupplied //+ hardSupplied
   setDV(formatMNDS(totalAS), "t-a-s");

  // Total Assets Borrowed
  let totalUSDX = bnbUSDX + btcUSDX + busdUSDX + xrpUSDX + ukavaUSDX; // + hardUSDX;
  setDV(formatMNDS(totalUSDX), 't-a-b');



  // defi hub stats

  const usdxPrice = usdxMD.market_data.current_price.usd;
  const usdxPCPC = usdxMD.market_data.price_change_percentage_24h
  let { usdxUsd, usdxMC, usdxSupply } = await setDTSV(supplyData, bep3ParamsData, usdxPrice, 'usdx');

  const totalMC = bnbUsd + busdUsd + btcbUsd + xrpbUsd + ukavaUsd + hardUsd + usdxUsd
  setDV(formatMNDS(totalMC), 't-m-c');

  setDV(usdF.format(kavaPrice), 'price-d-kava');
  setDPD(kavaPCP, 'pc-d-kava');
  setDV(ukavaMC, 'mc-kava')
  setDV(ukavaSupply, 's-kava')
  setDV(usdF.format(kavaPrice), 'price-md-kava');
  setDPD(kavaPCP, 'pc-md-kava');
  setDV(ukavaMC, 'mc-m-kava')
  setDV(ukavaSupply, 's-m-kava')

  setDV(usdF.format(hardPrice), 'price-d-hard');
  setDPD(hardPCP, 'pc-d-hard');
  setDV(hardMC, 'mc-hard')
  setDV(hardSupply, 's-hard')
  setDV(usdF.format(hardPrice), 'price-md-hard');
  setDPD(hardPCP, 'pc-md-hard');
  setDV(hardMC, 'mc-m-hard')
  setDV(hardSupply, 's-m-hard')

  setDV(usdF.format(usdxPrice), 'price-d-usdx');
  setDPD(usdxPCPC, 'pc-d-usdx');
  setDV(usdxMC, 'mc-usdx')
  setDV(usdxSupply, 's-usdx')
  setDV((setUAL(cdpParamsData) + ' ' + denomLabel('usdx')), 'al-usdx')
  setDV(usdF.format(usdxPrice), 'price-md-usdx');
  setDPD(usdxPCPC, 'pc-md-usdx');
  setDV(usdxMC, 'mc-m-usdx')
  setDV(usdxSupply, 's-m-usdx')
  setDV((setUAL(cdpParamsData) + ' ' + denomLabel('usdx')), 'al-m-usdx')

  setDV(usdF.format(btcPrice), 'price-d-btc');
  setDPD(btcPCP, 'pc-d-btc');
  setDV(btcbMC, 'mc-btc')
  setDV(btcbSupply, 's-btc')
  setDV(btcbAL, 'al-btc')
  setDV(usdF.format(btcPrice), 'price-md-btc');
  setDPD(btcPCP, 'pc-md-btc');
  setDV(btcbMC, 'mc-m-btc')
  setDV(btcbSupply, 's-m-btc')
  setDV(btcbAL, 'al-m-btc')

  setDV(usdF.format(xrpbPrice), 'price-d-xrp');
  setDPD(xrpbPCP, 'pc-d-xrp');
  setDV(xrpbMC, 'mc-xrp')
  setDV(xrpbSupply, 's-xrp')
  setDV(xrpbAL, 'al-xrp')
  setDV(usdF.format(xrpbPrice), 'price-md-xrp');
  setDPD(xrpbPCP, 'pc-md-xrp');
  setDV(xrpbMC, 'mc-m-xrp')
  setDV(xrpbSupply, 's-m-xrp')
  setDV(xrpbAL, 'al-m-xrp')

  setDV(usdF.format(busdPrice), 'price-d-busd');
  setDPD(busdPCP, 'pc-d-busd');
  setDV(busdMC, 'mc-busd')
  setDV(busdSupply, 's-busd')
  setDV(busdAL, 'al-busd')
  setDV(usdF.format(busdPrice), 'price-md-busd');
  setDPD(busdPCP, 'pc-md-busd');
  setDV(busdMC, 'mc-m-busd')
  setDV(busdSupply, 's-m-busd')
  setDV(busdAL, 'al-m-busd')

  setDV(usdF.format(bnbPrice), 'price-d-bnb');
  setDPD(bnbPCP, 'pc-d-bnb');
  setDV(bnbMC, 'mc-bnb')
  setDV(bnbSupply, 's-bnb')
  setDV(bnbAL, 'al-bnb')
  setDV(usdF.format(bnbPrice), 'price-md-bnb');
  setDPD(bnbPCP, 'pc-md-bnb');
  setDV(bnbMC, 'mc-m-bnb')
  setDV(bnbSupply, 's-m-bnb')
  setDV(bnbAL, 'al-m-bnb')
};

var main = async () => {
    await updateDV()
    await sleep(60000)
    main()
}

var sleep = (ms = 10000) => { return new Promise(resolve => setTimeout(resolve, ms)); }

main();
