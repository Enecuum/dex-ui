import lsdp from "./localStorageDataProcessor"

const settings = {
    upTrustedTokens : "raise_up_trusted_tokens",
    upBalances : "raise_up_balances",
    upLpTokens : "raise_up_lp_tokens",
    routingSwitch : "routing_switch"
}

function initSettings () {
    return {
        [settings.upTrustedTokens] : initSetting(settings.upTrustedTokens),
        [settings.upBalances] : initSetting(settings.upBalances),
        [settings.upLpTokens] : initSetting(settings.upLpTokens),
        [settings.routingSwitch] : initSetting(settings.routingSwitch)
    }
}

function defaultSetting (localStorageKey) {
    if (localStorageKey === settings.upTrustedTokens) {
        lsdp.simple.write(localStorageKey, "true")
        return "true"
    } else if (localStorageKey === settings.upBalances) {
        lsdp.simple.write(localStorageKey, "true")
        return "true"
    } else if (localStorageKey === settings.upLpTokens) {
        return false
    } else if (localStorageKey === settings.routingSwitch) {
        lsdp.simple.write(localStorageKey, "true")
        return true
    }
}

function initSetting (localStorageKey) {
    let res = lsdp.simple.get(localStorageKey)
    if (res === null) {
        return defaultSetting(localStorageKey)
    } else
        return res === "true"
}

export {
    initSettings,
    defaultSetting,
    settings
}