import React from 'react';
import SwapApi from './swapApi';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Tooltip from './Tooltip';
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
            list: this.makeList(),
            sort: 'asc'
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

    toggleSortList() {
        let sortOrder = 'unsort';
        if (this.state.sort === 'unsort' || this.state.sort === 'desc')
            sortOrder = 'asc';       
        else if (this.state.sort === 'asc')
            sortOrder = 'desc';        
        else
            sortOrder = 'asc';

        this.setState({sort: sortOrder}, function() {
            this.setState({list : this.makeList(this.state.sort)});
        });
    }

    comparator(sortDirection) {
        let allowedSortDirections = ['asc','desc','unsort'];
        let defaultComparator = function(a,b) {
                                return 0; //default return value (no sorting)
                            }
        if (sortDirection === undefined || allowedSortDirections.indexOf(sortDirection) !== -1) {
            if (sortDirection === 'asc') {
                return function(a,b) {
                    var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase();
                    if (nameA < nameB) //sortDirection string ascending
                    return -1;
                    if (nameA > nameB)
                    return 1;
                    return 0; //default return value (no sorting)
                }
            } else if (sortDirection === 'desc') {
                return function(a,b) {
                    var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase();
                    if (nameA < nameB) //sortDirection string descending
                    return 1;
                    if (nameA > nameB)
                    return -1;
                    return 0; //default return value (no sorting)
                }
            } else if (sortDirection === 'unsort') {
                return defaultComparator;
            }                
        } else {
            console.log('Such sortDirection is not allowed. Sort by default direction - "unsort"')
            return defaultComparator;
        }
    }

    makeList(sortDirection = 'asc') {//allowable values are: 'asc','desc','unsort'
        return this.getTokens(this.tokenFilter).sort(this.comparator(sortDirection)).map(el => {
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
                        <Tooltip text={this.root.state.langData.trade.tokenCard.tooltipText}/>
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

                <div className="d-flex align-items-center justify-content-between mb-4">
                    <span>{this.root.state.langData.trade.tokenCard.tokenName}</span>
                    <span className="sort-direction-toggler" onClick={this.toggleSortList.bind(this)}>
                        <i className={'fas ' + 'fa-arrow-' + (this.state.sort === 'desc' ? 'up' : 'down') + ' hover-pointer'}/>
                    </span>                    
                </div>

                <div id="tokensList">
                    { this.state.list }
                </div>
            </div>
        );
    };
};

export default TokenCard;