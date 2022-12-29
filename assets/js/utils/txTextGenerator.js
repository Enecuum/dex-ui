import utils from './swapUtils'

function editInterpolateParams (params) {
    for (let param in params) {
        if (params[param] === undefined || params[param] === null)
            params[param] = ''
        else
            params[param] = utils.removeEndZeros(params[param])
    }
    return params
}

function generateTxText (translate, textPlace, actionType, interpolateParams = {}) {    
    let pathToActionWords = 'txActionWords'
    pathToActionWords += (textPlace === 'waitingConfirmation') ? '.meanwhileSending' : '.history'
    interpolateParams.action = translate(pathToActionWords + '.' + actionType)   
    let descriptionPhrase = `txActionPhrases.${actionType}.completePhrase`
    interpolateParams = editInterpolateParams(interpolateParams)

    return translate(descriptionPhrase, interpolateParams)
}

export default generateTxText