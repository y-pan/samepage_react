// import axios from 'axios';

import uuid from 'uuid';

let serverMode = 0; /** 0-heroku, 1-local */

let baseUrl = null;
switch(serverMode){
    case 0: baseUrl = "https://samepage1.herokuapp.com/"; break;
    default:baseUrl = "http://localhost:8000/";break;
}

function makePage(name){
    let puid = uuid.v4();
    if(!name){name = puid.substring(0,8); }
    let owner = "";
    let json = {puid:puid, name:name, content:"", owner:owner}
    let url = `${baseUrl}api/page/create`;
    return new Promise((resolve, reject) => {
        fetch(url, {method:"POST", body: JSON.stringify(json), headers:{"Content-Type":"application/json"}})
            .then(response => {
                if(response.status !== 200){
                    return reject("Unknown error");
                }
                response.json().then(data => {
                    resolve(data);
                })
            }).catch(err => {
                reject('Fetch err');
            })
    })
}

function savePage(puid, name, content, isOwner){

    let url = `${baseUrl}api/page/save`;
    let json = {puid, name, content}
    return new Promise((resolve, reject) =>{
        fetch(url,  {method:"POST", body: JSON.stringify(json), headers:{"Content-Type":"application/json"}})
        .then(response => {
            if(response.status !== 200){
                return reject("Unknown error");
            }

            response.json().then(data => {
                resolve(data);
        
            })
        }).catch(err => {
            reject('Fetch err');
        })
    });
}

function openPage(puid){
    let url = `${baseUrl}api/page/${puid}`;
    return new Promise((resolve, reject) =>{
        fetch(url)
        .then(response => {
            if(response.status !== 200){
                return reject("Unknown error");
            }

            response.json().then(data => {
                resolve(data);
               
            })
        }).catch(err => {
            reject('Fetch err');
        })
    });
}

function sharePage(puid,emails, from){
    if(!puid || !emails || !(emails instanceof Array) || emails.length <=0 ){
        return;
    }
    let url = `${baseUrl}api/page/share`;
    let json = {puid:puid, emails:emails, from:from}
    return new Promise((resolve, reject) =>{
        fetch(url,  {method:"POST", body: JSON.stringify(json), headers:{"Content-Type":"application/json"}})
        .then(response => {
            if(response.status !== 200){
                return reject("Unknown error");
            }
            response.json().then(data => {
                resolve(data);
            })
        }).catch(err => {
            reject('Fetch err');
        })
    });
}
export {makePage, openPage, savePage, sharePage}