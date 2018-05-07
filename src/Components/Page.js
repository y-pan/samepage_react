import React, { Component } from 'react';
import openSocket from 'socket.io-client';

import { makePage, openPage, savePage, sharePage } from '../general/pageActions';
import {validateEmail} from '../general/util';

// const ownSocket = openSocket('http://localhost:8000'); /** local */
const ownSocket = openSocket("https://samepage1.herokuapp.com/");  /** heroku production */


const ERROR_UNKNOWN = "Unknow error occorred, try again later ~";
const ERROR_NOTFOUND = "Page not found, operation aborted!";
const OK_SHARED = "Your page is shared with your friend(s) via email.";
const ERROR_NOTSHARED = "Some error occured, please try again later ~";

class Page extends Component {
    constructor(props) {
        super(props);
        this.contentChange = this.contentChange.bind(this);
        this.requestMakePage = this.requestMakePage.bind(this);
        this.saveContent = this.saveContent.bind(this);
        this.nameChange = this.nameChange.bind(this);

        this.requestOpenPage = this.requestOpenPage.bind(this);
        this.pending_puidChange = this.pending_puidChange.bind(this);
        this.viewOnlyChange = this.viewOnlyChange.bind(this);

        this.requestSharePage = this.requestSharePage.bind(this);
        this.emailsChange = this.emailsChange.bind(this);
        this.yourNameChange = this.yourNameChange.bind(this);
    }

    componentDidMount() {
        const { match: { params } } = this.props;
        let puid = params.puid;
        if (puid) {
            this.setState({ puid: puid }, () => {
                openPage(this.state.puid).then(response => {
                    if (response.data) {
                        let page = response.data;

                        this.setState({ puid: page.puid, _id: page._id, name: page.name, content: page.content, rows: this.state.rows2, cols: this.state.cols2, disabled: false });
                        ownSocket.emit('join', { puid: puid, username: "dummyVisitor" });
                        ownSocket.on('update', (params) => {
                            this.setState({ content: params.content, name: params.name });
                        });
                        this.setState({ errMsg: "" });

                    } else {
                        this.setState({ errMsg: ERROR_NOTFOUND });
                    }

                }).catch(err => {
                    this.setState({ errMsg: ERROR_UNKNOWN });
                    this.setState({ disabled: true });
                })
            });

        }
    }

    requestSharePage(e){
        if(!this.state.puid){ 
            this.setState({errMsg_sharePage:"No page to share!", okMsg_sharePage:""});
            return; 
        }
        if(!this.state.yourName.trim()){
            this.setState({errMsg_sharePage:"Your name or email is required", okMsg_sharePage:""});
            return;
        }
        let emailsString = this.state.emails;
        let emails_temp = emailsString.split("\n");
        let emails = []
        for(var line of emails_temp){
            line = line.trim();
            let elements = line.split(',');
            for(var em of elements){
                em = em.trim();
                if(em.length === 0){ continue;}
                if(validateEmail(em)){
                    emails.push(em);
                }else{
                    this.setState({errMsg_sharePage:"Invalid email: " + em, okMsg_sharePage:""});
                    return;
                }
            }
        }

    
        sharePage(this.state.puid, emails, this.state.yourName.trim(), this.state.yourName.trim())
            .then(response => {
                if(response['data']){
                    this.setState({okMsg_sharePage:OK_SHARED, errMsg_sharePage:""}, ()=>{
                        setTimeout(()=>{this.setState({okMsg_sharePage:"", errMsg_sharePage:""});}, 5000);
                    });

                }else{
                    this.setState({okMsg_sharePage:"", errMsg_sharePage:ERROR_NOTSHARED}, ()=>{
                        setTimeout(()=>{this.setState({okMsg_sharePage:"", errMsg_sharePage:""});}, 5000);
                    });
                }
            })
            .catch(err => {
                this.setState({okMsg_sharePage:"", errMsg_sharePage:ERROR_UNKNOWN}, ()=>{
                    setTimeout(()=>{this.setState({okMsg_sharePage:"", errMsg_sharePage:""});}, 5000);
                });
            })
    }
    requestOpenPage(e) {
        // console.log(e.target.dataset.trigger)
        let trigger = e.target.dataset.trigger;
        let _puid = "";
        if (trigger === "input") { /** press ENTER */
            if (e.keyCode !== 13) return;
            _puid = e.target.value.trim();
        } else {
            _puid = this.state.pending_puid.trim();
        }

        if (!_puid) {
            return;
        }
        let _confirm = true;

        if (this.state.puid) {
            if (this.state.puid === _puid) {
                /** already on the same page, no need to change anything */
                return;
            }
            if (window.confirm("You will leave your current page, are you sure?")) {
                _confirm = true;
            } else {
                _confirm = false;
            }
        }

        if (!_confirm) {
            return;
        }
        openPage(_puid).then(response => {
            if (response.data) {
                let page = response.data;
                let puid = page.puid;

                this.setState({ puid: page.puid, _id: page._id, name: page.name, content: page.content, disabled: false, rows: this.state.rows2, cols: this.state.cols2 });

                ownSocket.emit('join', { puid: puid, username: "dummyOwner" });
                ownSocket.on('update', (params) => {
                    this.setState({ content: params.content });
                });
                this.setState({ errMsg: "" });
            } else {
                this.setState({ errMsg: ERROR_NOTFOUND }, ()=>{
                    setTimeout(()=>{this.setState({errMsg:""});}, 5000);
                });
            }
        }).catch(err => {
            this.setState({ errMsg: ERROR_UNKNOWN });
            console.error(err);
        })

    }


    requestMakePage() {
        let _confirm = true;
        if (this.state.puid) {
            if (window.confirm("You will leave your current page, are you sure?")) {
                _confirm = true;
            } else {
                _confirm = false;
            }
        }
        if (!_confirm) {
            return;
        }
        this.setState({pending_puid:''});
        makePage(this.state.name).then(response => {
            if (response.data) {
                let page = response.data;
                let puid = page.puid;

                this.setState({ puid: page.puid, _id: page._id, name: page.name, content: page.content, disabled: false, rows: this.state.rows2, cols: this.state.cols2 });

                ownSocket.emit('join', { puid: puid, username: "dummyuser" });
                ownSocket.on('update', (params) => {
                    this.setState({ content: params.content });
                });
                this.setState({ errMsg: "" });
            } else {
                this.setState({ errMsg: ERROR_NOTFOUND }, ()=>{
                    setTimeout(()=>{this.setState({errMsg:""});}, 5000);
                });
            }
        }).catch(err => {
            this.setState({ errMsg: ERROR_UNKNOWN }, ()=>{
                setTimeout(()=>{this.setState({errMsg:""});}, 5000);
            });
            console.log(err);
        })

    }
    viewOnlyChange(e){
        this.setState({viewOnly:!this.state.viewOnly}, ()=>{
            // console.log(this.state.viewOnly)
        });
    }
    contentChange(e) {
        if(!this.state.viewOnly){
            this.setState({ content: e.target.value }, () => {
                this.saveContent(e)
            })
        }
        
    }
    pending_puidChange(e) {
        this.setState({ pending_puid: e.target.value });
    }

    nameChange(e) {
        if(!this.state.viewOnly){
            this.setState({ name: e.target.value }, () => {
                if (this.state.puid) {
                    this.saveContent(e)
                }
            })
        }
    }

    emailsChange(e){
        this.setState({emails:e.target.value});
    }
    yourNameChange(e){
        this.setState({yourName:e.target.value});
    }
    saveContent(e) {
        /** socket first, then update db, UI response faster */
        ownSocket.emit('update', { puid: this.state.puid, content: this.state.content, name: this.state.name });

        savePage(this.state.puid, this.state.name, this.state.content, true)
            .then(response => {
                // ownSocket.emit('update', { puid: this.state.puid, content: this.state.content, name: this.state.name });
            })
            .catch(err => {
                console.log(err)
            })
    }
    state = {
        _id: null,
        puid: '',
        pending_puid: '',
        content: '',
        name: '', /** page name */
        
        disabled: true,
        viewOnly:true,

        rows: 1,
        cols: 30,
        rows2: 20,
        cols2: 100,

        emails:"",
        yourName:"", /** your name or email, to appear in email so your friend can see it is from you! */
        okMsg_sharePage:"", errMsg_sharePage:""

    };
    render() {
        return (
            <div className="Page">
                <p className="error">{this.state.errMsg}</p>
                <button onClick={this.requestMakePage}>Make page =></button> <strong> Page Name: </strong> <input value={this.state.name} onChange={this.nameChange} />
                <strong> Page ID: </strong>{this.state.puid}
                <br />

                <button data-trigger="button" onClick={this.requestOpenPage}>Open page =></button> <input data-trigger="input" value={this.state.pending_puid} onKeyDown={this.requestOpenPage} onChange={this.pending_puidChange} />
                <br/>
                <input id="inputViewOnly" type="checkbox" defaultChecked={this.state.viewOnly} onClick={this.viewOnlyChange}/><label htmlFor="inputViewOnly">View Only</label>
                <br />
                <textarea onChange={this.contentChange} value={this.state.content} disabled={this.state.disabled} rows={this.state.rows} cols={this.state.cols}/>
                <br />
                <p className="error">{this.state.errMsg_sharePage}</p>
                <p className="ok">{this.state.okMsg_sharePage}</p>
                <br />

                <button onClick={this.requestSharePage}>Share Page With Emails:</button>
                <br/>
                <label htmlFor="inputYourName">Tell your friends who you are: </label><input id="inputYourName" value={this.state.yourName} onChange={this.yourNameChange} placeholder="Your name or email"/>
                <br/>
                <textarea onChange={this.emailsChange} value={this.state.emails} rows="3" cols="30" placeholder="Friends' emails like: email1@gmail.com,email2@gmail.com"/>

                {/* <button onClick={this.saveContent} disabled={this.state.disabled}>Save</button> */}
            </div>
        );
    }
}

export default Page;
