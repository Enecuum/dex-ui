import React from 'react';
import DropdownButton from 'react-bootstrap/DropdownButton';
import '../css/popup-cards.css';

class TokenCard extends React.Component {
    constructor (props) {
        super(props);
        this.mySwapPage = props.outer;
        this.state = {
            list : this.makeList()
        };
        this.initTokenList();
    };

    async initTokenList () {
        while (this.makeList().length === 0)
            await new Promise(resolve => { setTimeout(resolve, 100) });
        this.setState( { list : this.makeList()} );
    };

    getTokens (searchWord) {
        let word = searchWord.trim().toLowerCase();
        let regExpWord = new RegExp(`.*${word}.*`);
        return this.mySwapPage.tokens.filter(token => regExpWord.test(token.name.toLowerCase()) || word === token.hash);
    };

    assignToken (token) {
       this.mySwapPage.changeToken(token);
    };

    makeList () {
        return this.getTokens(this.mySwapPage.tokenFilter).map(el => {
            return (
                <div className='token-option py-1 my-1 px-1 hover-pointer' onClick={this.assignToken.bind(this, el)}>
                    { el.name }
                </div>
            );
        });
    };

    changeList () {
        if (['insertText', 'deleteContentBackward', 'deleteContentForward'].indexOf(event.inputType) !== -1) {
            this.mySwapPage.tokenFilter = document.getElementById('token-filter-field').value;
            this.setState( { list : this.makeList()} );
        }
    };

    render () {
        return (
            <div>
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center justify-content-start">
                        <span className="mr-3">
                            {this.mySwapPage.state.langData.trade.tokenCard.header}
                        </span>
                        <span className="icon-Icon4 fire-tooltip hover-pointer" />
                    </div>
                    <span className="icon-Icon17 close-1 hover-pointer" onClick={this.mySwapPage.closeConnectionList.bind(this.mySwapPage)} />
                </div>

                <div className="mb-4">
                    <input  id='token-filter-field'
                            onChange={this.changeList.bind(this)}
                            className='text-input-1 form-control'
                            type='text'
                            placeholder={this.mySwapPage.state.langData.trade.tokenCard.search} />
                </div>


                <div id='full-token-list' multiple={true}>
                    { this.state.list }
                </div>
            </div>
        );
    };
};

export default TokenCard;