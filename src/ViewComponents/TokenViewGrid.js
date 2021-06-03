
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

import TokenView from './TokenView'

const useStyles = makeStyles(theme => ({
  frameContainer: {
    position: 'relative',
    width: '100%',
    paddingTop: '75%'
  },
  frame: {
    position: 'absolute',
    top: '0',
    left: '0',
    bottom: '0',
    right: '0',
    width: '100%',
    height: '100%',
    border: 0
  },
  leftAlign: {
    textAlign: 'left'
  }
}))

export default function TokenViewGrid (props) {
  const classes = useStyles()
  const { tokenMetadata } = props

  if (tokenMetadata.length === 0) {
    return (
      <Typography variant='h4'>
        You have no LITs associated with the current crypto address selected in Metamask / your wallet.
      </Typography>
    )
  }

  return (
    <Grid container spacing={3}>
      {tokenMetadata.map(t => (
        <Grid md={6} sm={12} item key={t.tokenId}>
          <TokenView t={t} />
        </Grid>
      ))}
    </Grid>
  )
}
