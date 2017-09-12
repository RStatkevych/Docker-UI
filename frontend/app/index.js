import React, { Component } from 'react'
import Auth from './components/Auth'
import Images from './components/Images'
import Image from './components/Images/Image'


import ShortContainerInfo from './components/ContainerManager/Containers/ShortContainerInfo'

import DetailedContainerInfo from './components/ContainerManager/ContainerDetails'
import ContainerFiles from './components/ContainerManager/ContainerFiles'

import ContainerManager from './components/ContainerManager'

import App from './components/App'


import { Router, Route, Link, hashHistory, IndexRedirect, IndexRoute } from 'react-router'
import { Provider } from 'react-redux'
import { createStore, compose,  } from 'redux'
import reducer from './reducers'
import "font-awesome/less/font-awesome.less";

export const store = createStore(reducer);

const isAuthorized = (nextState, replace) => {
	let jwt = window.localStorage.getItem('_auth');
	if(jwt === null) {
		replace({
			pathname: '/login'
		})
	} 
}

export default class Index extends Component {
	render () {
	  return (
	  	<Provider store={store}>
		  	<Router history={hashHistory}>
			  	<Route path="/login" component={Auth} />
		  		<Route path="/" component={App} onEnter={isAuthorized}>
		  			<IndexRedirect to='/dashboard' />
			  		<Route path="containers" component={ContainerManager} onEnter={isAuthorized}>
			  			<Route path=":container_id" component={ShortContainerInfo}  onEnter={isAuthorized}/>
			  		</Route>
			  		<Route path="containers/:container_id/details" component={DetailedContainerInfo} onEnter={isAuthorized}/>
			  		<Route path="containers/:container_id/fs" component={ContainerFiles} onEnter={isAuthorized}/>

			  		<Route path="images" component={Images} onEnter={isAuthorized}/>
			  		<Route path="images/:imageId" component={Image} onEnter={isAuthorized}/>
		  		</Route>
		   	</Router>
	   	</Provider>
	  )
	}
}