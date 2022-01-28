const STATS_DATA_URL = "https://lucid-snyder-df4e9f.netlify.app/.netlify/functions/stats";
const BINANACE_URL = "https://api.binance.com/api/v3";
const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";


function setDisplayColor(cssId, color){
    $(`#${cssId}`).css({ color: color });
};
  

const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  })
  
function formatMoneyNoDecimalsOrLabels(v){
    const fm = usdFormatter.format(v)
    return fm.slice(1, fm.length - 3)
};

function setDisplayValueById(elementId, value) {
    const element = document.getElementById(elementId)
    if (element) { element.innerHTML = value; }
};

function formatElementId(value, denom){
    return `${value}-${denom}`.toUpperCase();
};

function mapElementIds(denoms){
    let ids = {}
    ids['totalAssetsSupplied'] = 't-a-s'
    ids['totalAssetsBorrowed'] = 't-a-b'
    ids['totalMarketCap'] = 't-m-c'
    for (const denom of denoms) {
      ids[denom] = {};
      ids[denom].totalSupplied = {
        d: formatElementId('ts', denom),
        m: formatElementId('ts-m', denom)
      }
      ids[denom].totalEarned = {
        d: formatElementId('te', denom),
        m: formatElementId('te-m', denom)
      }
      ids[denom].marketCap = {
        d: formatElementId('mc', denom),
        m: formatElementId('mc-m', denom)
      }
      ids[denom].supplied = {
        d: formatElementId('s', denom),
        m: formatElementId('s-m', denom)
      }
      ids[denom].price = {
        price: formatElementId('price', denom),
        d: formatElementId('price-d', denom),
        md: formatElementId('price-md', denom)
      }
      ids[denom].priceChangePercent = {
        pc: formatElementId('pc', denom),
        d: formatElementId('pc-d', denom),
        md: formatElementId('pc-md', denom)
      }
      ids[denom].totalBorrowed = formatElementId('tb', denom)
      ids[denom].borrowLimit = formatElementId('bl', denom)
      ids[denom].apy = {
        ea: formatElementId('ea', denom),
        m: formatElementId('ea-m', denom)
      }
      ids[denom].assetLimit = {
        d: formatElementId('al', denom),
        m: formatElementId('al-m', denom)
      }
      ids[denom].borrowApy = formatElementId('borrow-apy', denom)
    }
    return ids;
};


function setMarketCapDisplayValue(elementIds, totalMarketCap){
    const elementId = elementIds.totalMarketCap;
    setDisplayValueById(elementId, totalMarketCap.replace("$", ""));
};

function setMarketCapPerDenomDisplayValues(elementIds, marketCapForDenoms){
    for (const denom in marketCapForDenoms){
        const elementIdDesktop = elementIds[denom]["marketCap"]["d"];
        const elementIdMobile = elementIds[denom]["marketCap"]["m"];
        
        setDisplayValueById(elementIdDesktop, marketCapForDenoms[denom]);
        setDisplayValueById(elementIdMobile, marketCapForDenoms[denom]);
    }; 
}; 

function setSupplyPerDenomDisplayValues(elementIds, suppyTotal){
    for (const denom in suppyTotal){
        if (!elementIds[denom]) continue; 
        const elementIdDesktop = elementIds[denom]['supplied']['d'];
        const elementIdMobile = elementIds[denom]['supplied']['m'];
        const supplyTotalForCurrentDenom = formatMoneyNoDecimalsOrLabels(Number(suppyTotal[denom].amount)) + " " + denom;
        setDisplayValueById(elementIdMobile, supplyTotalForCurrentDenom);
        setDisplayValueById(elementIdDesktop, supplyTotalForCurrentDenom);
    }; 
};

function setAssetLimitDisplayValues(elementIds, asssetLimits){
    for (const denom in asssetLimits){
        const elementIdDesktop = elementIds[denom]['assetLimit']['d']; 
        const elementIdMobile = elementIds[denom]['assetLimit']['m'];
        setDisplayValueById(elementIdDesktop, formatMoneyNoDecimalsOrLabels(asssetLimits[denom]));
        setDisplayValueById(elementIdMobile, formatMoneyNoDecimalsOrLabels(asssetLimits[denom]));
    }; 
};

function serPricesPerDenomDisplayValue(elementIds, pricesUsd){
     pricesUsd["HBTC"] = pricesUsd["BTCB"];
    for (const denom in pricesUsd){
        const kavaLendingCssId = elementIds[denom]['price']['price'];
        const kavaDefiDesktopCssId = elementIds[denom]['price']['d'];
        const kavaDefiMobileCssId = elementIds[denom]['price']['md'];
        const formattedPrice = usdFormatter.format(Number(pricesUsd[denom]));
        setDisplayValueById(kavaLendingCssId, formattedPrice);
        setDisplayValueById(kavaDefiDesktopCssId, formattedPrice);
        setDisplayValueById(kavaDefiMobileCssId, formattedPrice);
    }; 
}; 

// MINT STATS 
function setTotalAssetsSuppliedDisplayValue(elementIds, totalSupplied){
    const elementId = elementIds.totalAssetsSupplied;
    setDisplayValueById(elementId, usdFormatter.format(totalSupplied).replace("$", ""));
}; 

function setTotalAssetsBorrowedDisplayValue(elementIds, totalBorrowed){
    const elementId = elementIds.totalAssetsBorrowed;
    setDisplayValueById(elementId, usdFormatter.format(totalBorrowed).replace("$", ""));
}; 


function setTotalSuppliedUSDPerAssetDisplayValues(elementIds, totalSuppliedPerDenom){
    for (const denom in totalSuppliedPerDenom){
        if (!elementIds[denom]) continue; 
        const elementIdDesktop = elementIds[denom]["totalSupplied"]["d"];
        const elementIdMobile = elementIds[denom]["totalSupplied"]["m"];
        setDisplayValueById(elementIdMobile, usdFormatter.format(Number(totalSuppliedPerDenom[denom])));
        setDisplayValueById(elementIdDesktop, usdFormatter.format(Number(totalSuppliedPerDenom[denom])));
    };
}; 

function setTotalBorrowedPerAssetUSDXDisplayValues(elementIds, totalBorrowedPerDenom){
    for (const denom in totalBorrowedPerDenom){
        if (!elementIds[denom]) continue;
        const elementId = elementIds[denom]["totalBorrowed"];
        setDisplayValueById(elementId, formatMoneyNoDecimalsOrLabels(Number(totalBorrowedPerDenom[denom])));
    };
}; 

function setTotalBorrowedPerAssetPercentage(debtLimits, totalBorrowedPerDenom){
    for (const denom in debtLimits){
        const denomDebtLimit = debtLimits[denom];
        const denomTotalBorrowed = totalBorrowedPerDenom[denom];
        const percentage = ((Number(denomTotalBorrowed) / Number(denomDebtLimit))  * 100).toFixed(2) + "%";

        const element = $(`.percent-line-usdx-${denom.toLocaleLowerCase()}`)
        if (element) { element.css("width", percentage); }
    }
};

function setBorrowAPYPerAssetDisplayValues(elementIds, rewardsAPY){
    for (const denom in rewardsAPY){
        if (!elementIds[denom]) continue;
        const elementId = elementIds[denom]['borrowApy'];
        setDisplayValueById(elementId, rewardsAPY[denom] + "%");
    };
}; 

function setBorrowLimitsPerAssetDisplayValues(elementIds, borrowLimits){
    for (const denom in borrowLimits){
        const elementId = elementIds[denom]['borrowLimit'];
        setDisplayValueById(elementId, formatMoneyNoDecimalsOrLabels(borrowLimits[denom]));
    }; 
};

function updateStatsUI(elementIds, statsData) {
    setMarketCapDisplayValue(elementIds, statsData.totalMarketCap);
    setMarketCapPerDenomDisplayValues(elementIds, statsData.marketCapForDenoms);
    setSupplyPerDenomDisplayValues(elementIds, statsData.suppyTotal);
    setAssetLimitDisplayValues(elementIds, statsData.asssetLimits);
    serPricesPerDenomDisplayValue(elementIds, statsData.pricesUsd);
    setTotalAssetsSuppliedDisplayValue(elementIds, statsData.totalSupplied);
    setTotalAssetsBorrowedDisplayValue(elementIds, statsData.totalBorrowed);
    setTotalSuppliedUSDPerAssetDisplayValues(elementIds, statsData.totalSuppliedPerDenom);
    setTotalBorrowedPerAssetUSDXDisplayValues(elementIds, statsData.totalBorrowedPerDenom);
    setBorrowAPYPerAssetDisplayValues(elementIds, statsData.rewardsAPY);
    setTotalBorrowedPerAssetPercentage(statsData.debtLimits, statsData.totalBorrowedPerDenom);
    setBorrowLimitsPerAssetDisplayValues(elementIds, statsData.debtLimits);
    $(".metric-blur").css("background-color", "transparent");
    $(".metric-blur").addClass('without-after');
    $(".api-metric").css({"display": "block", "text-align": "center"});
};
  

async function fetchMarketData(){
    const [
      usdxResp,
      atomResp,
      lunaResp,
      swpResp,
      kavaResp,
      hardResp,
      bnbResp,
      busdResp,
      btcResp,
      xrpResp,
    ] = await Promise.all([
      fetch(`${COINGECKO_API_URL}/coins/usdx`),
      fetch(`${COINGECKO_API_URL}/coins/cosmos`),
      fetch(`${COINGECKO_API_URL}/coins/terra-luna`),
      fetch(`${COINGECKO_API_URL}/coins/kava-swap`),
      fetch(`${BINANACE_URL}/ticker/24hr?symbol=KAVAUSDT`),
      fetch(`${BINANACE_URL}/ticker/24hr?symbol=HARDUSDT`),
      fetch(`${BINANACE_URL}/ticker/24hr?symbol=BNBUSDT`),
      fetch(`${BINANACE_URL}/ticker/24hr?symbol=BUSDUSDT`),
      fetch(`${BINANACE_URL}/ticker/24hr?symbol=BTCUSDT`),
      fetch(`${BINANACE_URL}/ticker/24hr?symbol=XRPUSDT`),
    ]);
  
    const [
      usdxMarket,
      atomMarket,
      lunaMarket,
      swapMarket,
      kavaMarket,
      hardMarket,
      bnbMarket,
      busdMarket,
      btcMarket,
      xrpMarket,
    ] = await Promise.all([
      usdxResp.json(),
      atomResp.json(),
      lunaResp.json(),
      swpResp.json(),
      kavaResp.json(),
      hardResp.json(),
      bnbResp.json(),
      busdResp.json(),
      btcResp.json(),
      xrpResp.json(),
    ]);
  
    return {
      LUNA: lunaMarket.market_data.price_change_percentage_24h,
      ATOM: atomMarket.market_data.price_change_percentage_24h,
      SWP: swapMarket.market_data.price_change_percentage_24h,
      USDX: usdxMarket.market_data.price_change_percentage_24h,
      KAVA: kavaMarket.priceChangePercent,
      HARD: hardMarket.priceChangePercent,
      BNB: bnbMarket.priceChangePercent,
      BUSD: busdMarket.priceChangePercent,
      BTCB: btcMarket.priceChangePercent,
      XRP: xrpMarket.priceChangePercent,
    };
  };

function updatePriceChangesUI(elementIds){
    fetchMarketData().then(function(marketData) {
        marketData["HBTC"] = marketData["BTCB"];
        for (const denom in marketData){
            if (!elementIds[denom]) continue; 
            const priceChangeMobile = elementIds[denom]["priceChangePercent"]["md"];
            const priceChangeDesktop = elementIds[denom]["priceChangePercent"]["d"];
            const priceChangeId = elementIds[denom]["priceChangePercent"]["pc"];
            let percentageChange = Number(marketData[denom]).toFixed(2);

            if (Number(percentageChange) > 0) {
                percentageChange = "+" + percentageChange
                setDisplayColor(priceChangeMobile, 'green')
                setDisplayColor(priceChangeDesktop, 'green')
                setDisplayColor(priceChangeId, 'green')
              } else if (Number(percentageChange) === 0) {
                setDisplayColor(priceChangeMobile, 'grey')
                setDisplayColor(priceChangeDesktop, 'grey')
                setDisplayColor(priceChangeId, 'grey')
              } else {
                percentageChange = percentageChange
                setDisplayColor(priceChangeMobile, 'red')
                setDisplayColor(priceChangeDesktop, 'red')
                setDisplayColor(priceChangeId, 'red')
              }
          

            setDisplayValueById(priceChangeDesktop, percentageChange + "%");
            setDisplayValueById(priceChangeMobile, percentageChange + "%");
            setDisplayValueById(priceChangeId, percentageChange + "%");
          
        };
    }); 
}; 

async function getStatsData() {
    const resp = await fetch(STATS_DATA_URL);
    const swapDataJson = await resp.json();
    return swapDataJson;
};
  
async function statsPageInit() {
    const statsData = await getStatsData();
    const elementIds = mapElementIds([...Object.keys(statsData.pricesUsd), "HBTC"]);
    updateStatsUI(elementIds, statsData);
    updatePriceChangesUI(elementIds);
    await sleep(30000);
    statsPageInit();
};
  
function sleep(ms = 10000) {
    return new Promise(resolve => setTimeout(resolve, ms));
};
  
statsPageInit(); 