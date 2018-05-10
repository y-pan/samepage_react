import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch} from 'react-router-dom'

import Page from './Components/Page';


class App extends Component {
    // constructor(props) {
    //     super(props);

    // }

    // state = {
    //     timestamp: 'no timestamp yet'
    // };

    render() {
        return (
            <Router>
            <div className="App">
               
                <h1>Welcome to SamePage</h1>
                wlh: {window.location.href}
                <p className="App-intro">
                    Share page with friends, see and edit at the same time. Changes typically are to be saved instantly.
                </p>
                <hr />

                
                <Switch>
                    <Route exact path="/"  component={Page} />
                    
                    {/* this route not found on mobile's browser  */}
                    <Route path="/:puid" component={Page} />

                    {/* workaround for mobile, where the above route doesn't work */}
                    <Route path="*"  component={Page} />
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