import React from 'react';
import '../css/aside.css';

class Socials extends React.Component {
    constructor () {
        super();
        this.items = {
            twitter : {
                link: 'twitter',
                iconClasses: 'fab fa-twitter'
            },
            telegram : {
                link: 'telegram',
                iconClasses: 'fab fa-telegram-plane'
            },
            medium : {
                link: 'medium',
                iconClasses: 'fab fa-medium-m'
            },
            reddit : {
                link: 'reddit',
                iconClasses: 'fab fa-reddit-alien'
            },
            github : {
                link: 'github',
                iconClasses: 'fab fa-github'
            }
        }
        this.order = ['twitter', 'telegram', 'medium', 'reddit', 'github'];
    };

    render () {
        return (
            <div className='socialsBar'>
                {this.order.map((social, index) => (
                    <a href={this.items[social].link} key={index}>
                        <span className={this.items[social].iconClasses}/>
                    </a>
                ))}
            </div>
        );
    };
};

export default Socials;