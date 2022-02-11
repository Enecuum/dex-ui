import lsdp from "./localStorageDataProcessor"

const settings = {
    upTrustedTokens : "raise_up_trusted_tokens",
    upBalances : "raise_up_balances",
    upLpTokens : "raise_up_lp_tokens"
}

function initSettings () {
    return {
        [settings.upTrustedTokens] : initSetting(settings.upTrustedTokens),
        [settings.upBalances] : initSetting(settings.upBalances),
        [settings.upLpTokens] : initSetting(settings.upLpTokens)
    }
}
function initSetting (localStorageKey) {
    let res = lsdp.simple.get(localStorageKey)
    return res === null ? false : res === "true"
}

export {
    initSettings,
    settings
}