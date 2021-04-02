import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import '../css/confirm-supply.css';

class WaitingConfirmation extends React.Component {
    constructor(props) {
        super(props);
        this.root = props.root;
        this.txStateType = 'waiting'; //'waiting' or 'submitted'
        this.explorer_href = '#BLANK-LINK-TO-EXPLORER'; //ссылка для Wiew on pulse.enecuum.com
    };

    // Предлагаю принять, что у нас два основных вида оформления (и контента) модальных окон, соответствующим двум типам состояния транзакций:
    // - ожидающая (waiting) транза
    // - подтвержденная (submitted) транза
    // это надо отразить двумя путями:
    // повесить на модалку соответствующий стилевой класс
    // отдать сам элемент с иконкой

    getHeaderPropNameByType(txStateType) {
        let modalHeaderPropName = ""
        if (txStateType === 'submitted')
            modalHeaderPropName = "transactionSubmitted";
        else if (txStateType === 'waiting')
            modalHeaderPropName = "waitingForConfirmation";
        return modalHeaderPropName;
    }

    getContentByType(txStateType) {

/////////////////////// TODO Использовать интерполируемые параметры в i18 для Swapping 20.6172 BRY for 0.100203 ENQ после добавления соответствующего функционала
/////////////////////// TODO Использовать интерполируемые параметры в i18 для Wiew on pulse.enecuum.com после добавления соответствующего функционала

        if (txStateType === 'submitted') {
            return  (
                        <>
                            <div className="tx-state-icon-wrapper bordered d-flex align-items-center justify-content-center mx-auto">
                                <span className="tx-state-icon icon-Icon13"/>                                
                            </div>
                            <a className="wiew-in-explorer d-block hover-pointer mt-4"
                                href = { this.explorer_href }
                                target = "_blank" >
                                <span className="mr-3">Wiew on pulse.enecuum.com</span>
                                <span className="icon-Icon11"></span>
                            </a>
                            <Button className='btn-secondary mx-auto mt-3'>{ this.root.state.langData.close }</Button>

                        </>
                    );    
        } else if (txStateType === 'waiting') {          
            return  (
                        <>
                            <div className="tx-state-icon-waiting spinner d-flex align-items-center justify-content-center mx-auto" />
                            <div>                                
                                <div className="mt-4">Swapping 20.6172 BRY for 0.100203 ENQ</div>
                                <div className="small mt-2">{ this.root.state.langData.trade.confirmCard.confirmInWallet }</div>
                            </div>                            
                        </>
                    );    
        }
    }

    render() {
        return (
            <>
                <Modal
                    show={true}
                    aria-labelledby="example-custom-modal-styling-title"
                    className={'tx-state-' +  this.txStateType}
                    centered >
                    <Modal.Header closeButton  className="pb-0">
                        <Modal.Title id="example-custom-modal-styling-title">
                            <div className="d-flex align-items-center justify-content-start">
                                <span>
                                    { this.root.state.langData[this.getHeaderPropNameByType(this.txStateType)] }
                                </span>
                            </div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="text-center">
                            { this.getContentByType(this.txStateType) }
                        </div>                        
                    </Modal.Body>
                </Modal>
            </>
        );
    };
};

export default WaitingConfirmation;