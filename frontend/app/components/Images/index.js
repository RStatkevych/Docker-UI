import React, { Component } from 'react'
import  { connect } from 'react-redux'

import './style.less'
import {AlertsComponents, connectRedux} from '../../commons/components/AlertsComponent'

import ImagesList from './ImagesList'
import Provider from '../../commons/provider'

export class ImagesIndex extends AlertsComponents {
  constructor() {
    super()
    this.state = {
      images: [],
      fetched: false,
      errorMessage: null
    }
    this.provider = new Provider('/images');
  }

  fetchRecentImages() {
    this.setState({fetched: false})
    this.provider
      .builder()
      .auth()
      .read()
      .then((data) => {
        this.setState({images: data.Response, fetched: true})
      })
      .catch((data) => {
        this.setState({fetched: true, errorMessage: data.Error.message})
      })
  }

  componentWillMount() {
    this.fetchRecentImages();
  }

  render() {
    const { images, fetched, errorMessage } = this.state;
    const { children } = this.props;
    return (
      <div>
        <ImagesList 
          images={images}
          children={children} 
          fetched={fetched}
          showSuccess={this.props.showSuccess}
          showError={this.props.showError}
          errorMessage={errorMessage}/>
      </div>
    )
  }
}


export default connectRedux(ImagesIndex);
