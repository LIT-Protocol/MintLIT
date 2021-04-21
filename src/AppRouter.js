import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'
import Mint from './Mint'
import Decrypt from './Decrypt'

const URL_MAP = {
  home: {
    path: '/',
    component: props => <Mint {...props} />
  },
  redirectPage: {
    path: '/decrypt',
    component: props => <Decrypt {...props} />
  }
}

export default function AppRouter () {
  return (
    <Router>
      <Switch>
        {Object.values(URL_MAP).map(u =>
          <Route
            key={u.path}
            exact
            path={u.path}
            render={routeProps => u.component(routeProps)}
          />
        )}
      </Switch>
    </Router>
  )
}
