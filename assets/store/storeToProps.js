import { bindActionCreators } from 'redux';

import rootCreator from './actionCreators/root';
import walletCreator from './actionCreators/wallet';
import swapCardCreator from './actionCreators/swapCard';

const components = {
    ROOT : 0x0
};

function mapStoreToProps (component) {
    switch (component) {
        case components.ROOT:
            return function (state) {
                return state.root;
            };
        default:
            return undefined;
    }
};

function mapDispatchToProps (component) {
    switch (component) {
        case components.ROOT:
            return function (dispatch) {
                return {
                    openAside       : bindActionCreators(rootCreator.openAside, dispatch),
                    closeAside      : bindActionCreators(rootCreator.closeAside, dispatch),
                    changeNetwork   : bindActionCreators(rootCreator.changeNetwork, dispatch),
                    changeLanguage  : bindActionCreators(rootCreator.changeLanguage, dispatch),
                    openConList     : bindActionCreators(rootCreator.openConList, dispatch),
                    closeConList    : bindActionCreators(rootCreator.closeConList, dispatch),
                    setConStatus    : bindActionCreators(rootCreator.setConStatus, dispatch),
                    changeMenuItem  : bindActionCreators(rootCreator.changeMenuItem, dispatch)
                };
            };
        default:
            return undefined;
    }
};

export {
    mapStoreToProps,
    mapDispatchToProps,
    components
};