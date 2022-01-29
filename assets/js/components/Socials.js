import React from 'react';

import '../../css/aside.css';

class Socials extends React.Component {
    constructor () {
        super();
        this.items = {
            twitter : {
                link: 'https://twitter.com/ENEXSPACE',
                iconClasses: 'fab fa-twitter'
            },
            telegram : {
                link: 'https://t.me/enexspace',
                iconClasses: 'fab fa-telegram-plane'
            },
            medium : {
                link: 'https://blog.enex.space/',
                iconClasses: 'fab fa-medium-m'
            },
            reddit : {
                link: 'https://www.reddit.com/user/enex_space',
                iconClasses: 'fab fa-reddit-alien'
            },
            github : {
                link: 'https://github.com/TrinityLabDAO',
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
}

export default Socials;