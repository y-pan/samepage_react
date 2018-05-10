import React, { Component } from 'react';
import './App.css';
import {Jumbotron, Grid} from 'react-bootstrap';

import { BrowserRouter as Router, Route, Switch} from 'react-router-dom'



import Page from './Components/Page';


class App extends Component {
    // constructor(props) {
    //     super(props);

    // }

    state = {
        timestamp: 'no timestamp yet'
    };

    render() {
        return (
            <Router>
            <div className="App">
               <Grid>
                   <Jumbotron>
                       <h2>SamePage - Sharing made sample</h2>
                       <p>Same time + same page, for you and your friends to see and update</p>
                   </Jumbotron>
               </Grid>

                <Switch>
                    <Route exact path="/"  component={Page} />
                    <Route path="/:puid" component={Page} />
                </Switch>
            </div>
            </Router>
        );
    }
}

export default App;
// export default withRouter(connect(
//     mapStateToProps,
//   )(App))