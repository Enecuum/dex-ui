import React from 'react';
import SwapApi from './swapApi';
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

    getTokens(searchWord) {
        return this.tokens.filter(el => (new RegExp(`.*${searchWord.trim().toLowerCase()}.*`)).test(el.name.toLowerCase()));
    };

    assignToken(token) {
        this.changeToken(token);
        this.closeTokenList();
    };

    makeList() {
        return this.getTokens(this.tokenFilter).map(el => {
            return (
                <option onClick={this.assignToken.bind(this, el)} className='token-option'>
                    { el.name}
                </option>
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
                <div className="close" onClick={this.closeTokenList} style={{ marginTop: '-10px', marginRight: '-6px' }}>
                </div>
                <p style={{
                    fontWeight: 'bold',
                    marginTop: '22px',
                    marginLeft: '30px'}}>
                    {this.root.state.langData.trade.tokenCard.header}
                </p>
                <div style={{
                    borderBottom: '1px solid #80808094',
                    marginTop: '15px',
                    width: '100%'
                }}>
                </div>
                <input id='token-filter-field'
                    onChange={this.changeList.bind(this)}
                    className='form-control mr-sm-2'
                    type='text'
                    placeholder={this.root.state.langData.trade.tokenCard.search}>
                </input>
                <select multiple={true} className='form-control' id='full-token-list'>
                    {this.state.list}
                </select>
            </div>
        );
    };
};

export default TokenCard;