import React, { Component } from 'react'
import  { connect } from 'react-redux'

import AppIndex from './container'
import './style.less'

const mapDispatchToProps = (dispatch) => {
  return {
  	dispatch
  }
}

const mapStateToProps = ({alerts}) => {
  return {
  	alerts
  }
}

const App = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppIndex)


export default App;
