import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';

import SwapApi from '../requests/swapApi';
import Tooltip from '../components/Tooltip';

import '../../css/token-card.css';

const swapApi = new SwapApi();

class TokenCard extends React.Component {
    constructor(props) {
        super(props);
        this.changeBalance = this.props.changeBalance;
        this.tokenFilter = '';
        this.updTokens();
    };

    async updTokens() {
        this.props.assignAllTokens(await (await swapApi.getTokens()).json());
        this.props.assignTokenList(this.makeList());
    };

    getTokens (searchWord) {
        let word = searchWord.trim().toLowerCase();
        let regExpWord = new RegExp(`.*${word}.*`);
        return this.props.tokens.filter(token => regExpWord.test(token.name.toLowerCase()) || word === token.hash);
    };

    assignToken(token) {
        this.props.assignTokenValue(this.props.menuItem, this.props.activeField, token);
        this.props.closeTokenList();
        this.changeBalance();
    };

    toggleSortList() {
        let sortOrder = 'unsort';
        if (this.props.sort === 'unsort' || this.props.sort === 'desc')
            sortOrder = 'asc';       
        else if (this.props.sort === 'asc')
            sortOrder = 'desc';        
        else
            sortOrder = 'asc';
        this.props.changeSort(sortOrder);
        this.props.assignTokenList(this.makeList(this.props.sort));
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
        return this.getTokens(this.tokenFilter).sort(this.comparator(sortDirection)).map((el, i) => {
            return (
                <div className='token-option py-1 my-1 px-1 hover-pointer' key={i} onClick={this.assignToken.bind(this, el)}>
                    { el.name }
                </div>
            );
        });
    };

    changeList() {
        if (['insertText', 'deleteContentBackward', 'deleteContentForward', 'deleteWordBackward', 'deleteWordForward'].indexOf(event.inputType) !== -1) {
            this.tokenFilter = document.getElementById('token-filter-field').value;
            this.props.assignTokenList(this.makeList());
        }
    };

    closeTokenList () {
        this.props.closeTokenList();
    };

    render() {
        return (
            <>
              <Modal
                show={true}
                aria-labelledby="example-custom-modal-styling-title"
                onHide={this.closeTokenList.bind(this)}
                centered
              >
                <Modal.Header closeButton className="pb-0">
                  <Modal.Title id="example-custom-modal-styling-title">
                    <div className="d-flex align-items-center justify-content-start">
                        <span className="mr-3">
                            {this.props.langData.header}
                        </span>
                        <Tooltip text={this.props.langData.tooltipText}/>
                    </div>
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-4">
                        <input  id='token-filter-field'
                                onChange={this.changeList.bind(this)}
                                className='text-input-1 form-control'
                                type='text'
                                placeholder={this.props.langData.search} />
                    </div>

                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <span>{this.props.langData.tokenName}</span>
                        <span className="sort-direction-toggler" onClick={this.toggleSortList.bind(this)}>
                            <i className={'fas ' + 'fa-arrow-' + (this.props.sort === 'desc' ? 'up' : 'down') + ' hover-pointer'}/>
                        </span>                    
                    </div>

                    <div id="tokensList">
                        { this.props.list }
                    </div>
                </Modal.Body>
              </Modal>
            </>
        );
    };
};

const WTokenCard = connect(mapStoreToProps(components.TOKEN_CARD), mapDispatchToProps(components.TOKEN_CARD))(TokenCard);

export default WTokenCard;