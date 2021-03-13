import React from 'react';
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
        return this.mySwapPage.tokens.filter(el => (new RegExp(`.*${searchWord.trim().toLowerCase()}.*`)).test(el.name.toLowerCase()));
    };

    assignToken (token) {
       this.mySwapPage.changeToken(token);
    };

    makeList () {
        return this.getTokens(this.mySwapPage.tokenFilter).map(el => {
            return (
                <option onClick={this.assignToken.bind(this, el)}
                        className='token-option'
                        style={{
                            textAlign: 'left',
                            color: 'var(--color3)',
                            fontSize: '20px',
                            padding: '10px',
                            borderRadius: '10px'
                        }}>
                    { el.name }
                </option>
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
                <div className="close" onClick={this.mySwapPage.closeConnectionList.bind(this.mySwapPage)} style={{ marginTop : '-10px',
                                                                                                                marginRight : '-6px' }}>
                </div>
                <p style={{
                        fontWeight: 'bold',
                        marginTop: '22px',
                        marginLeft: '30px'
                    }}>
                    {this.mySwapPage.state.langData.trade.tokenCard.header}
                </p>
                <div style={{
                        borderBottom: '1px solid #80808094',
                        marginTop : '15px',
                        width: '100%'
                    }}>
                </div>
                <input  id='token-filter-field'
                        onChange={this.changeList.bind(this)}
                        className='form-control mr-sm-2'
                        type='text'
                        placeholder={this.mySwapPage.state.langData.trade.tokenCard.search}
                        style={{
                            textAlign : 'left',
                            width : '90%',
                            marginLeft : '5%',
                            marginTop : '15px',
                            borderRadius : '20px'
                        }}>
                </input>
                <select multiple={true}
                        className='form-control'
                        id='full-token-list'
                        style={{
                            borderRadius : '5px',
                            position : 'absolute',
                            width : '90%',
                            marginLeft : '5%',
                            marginTop : '20px',
                            backgroundColor : 'var(--color1)',
                            height : '77%',
                            border : 0
                        }}>
                    { this.state.list }
                </select>
            </div>
        );
    };
};

export default TokenCard;