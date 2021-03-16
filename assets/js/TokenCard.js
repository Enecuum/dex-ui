import React from 'react';
import SwapApi from './swapApi';
import DropdownButton from 'react-bootstrap/DropdownButton';
import '../css/popup-cards.css';
import '../css/token-card.css';

const swapApi = new SwapApi();

class TokenCard extends React.Component {
    constructor(props) {
        super(props);
        this.changeToken = props.changeToken;
        this.closeTokenList = props.closeTokenList;
        this.root = props.root;
        this.tokenFilter = '';
        this.tokens = [];
        this.state = {
            list: this.makeList()
        };
        this.updTokens();
    };

    async updTokens() {
        this.tokens = await (await swapApi.getTokens()).json();
        this.setState({ list: this.makeList() });
    };

    getTokens (searchWord) {
        let word = searchWord.trim().toLowerCase();
        let regExpWord = new RegExp(`.*${word}.*`);
        return this.tokens.filter(token => regExpWord.test(token.name.toLowerCase()) || word === token.hash);
    };

    assignToken(token) {
        this.changeToken(token);
        this.closeTokenList();
    };

    makeList() {
        return this.getTokens(this.tokenFilter).map(el => {
            return (
                <div className='token-option py-1 my-1 px-1 hover-pointer' onClick={this.assignToken.bind(this, el)}>
                    { el.name }
                </div>
            );
        });
    };

    changeList() {
        if (['insertText', 'deleteContentBackward', 'deleteContentForward', 'deleteWordBackward', 'deleteWordForward'].indexOf(event.inputType) !== -1) {
            this.tokenFilter = document.getElementById('token-filter-field').value;
            this.setState({ list: this.makeList() });
        }
    };

    render() {
        return (
            <div>
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center justify-content-start">
                        <span className="mr-3">
                            {this.root.state.langData.trade.tokenCard.header}
                        </span>
                        <span className="icon-Icon4 fire-tooltip hover-pointer" />
                    </div>
                    <span className="icon-Icon17 close-1 hover-pointer" onClick={this.closeTokenList} />
                </div>

                <div className="mb-4">
                    <input  id='token-filter-field'
                            onChange={this.changeList.bind(this)}
                            className='text-input-1 form-control'
                            type='text'
                            placeholder={this.root.state.langData.trade.tokenCard.search} />
                </div>

                <div multiple={true}>
                    { this.state.list }
                </div>
            </div>
        );
    };
};

export default TokenCard;