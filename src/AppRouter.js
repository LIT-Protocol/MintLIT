import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'
import Mint from './Mint'
import View from './View'
import Transfer from './Transfer'

const URL_MAP = {
  home: {
    path: '/',
    component: props => <Mint {...props} />
  },
  view: {
    path: '/view',
    component: props => <View {...props} />
  },
  transfer: {
    path: '/transfer',
    component: props => <Transfer {...props} />
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
