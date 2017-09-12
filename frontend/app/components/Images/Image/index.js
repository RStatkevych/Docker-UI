import React, { Component } from 'react'
import  { connect } from 'react-redux'

import {AlertsComponents, connectRedux} from '../../../commons/components/AlertsComponent'

import Provider from '../../../commons/provider'

export class ImageInfo extends AlertsComponents {
  constructor() {
    super()
    this.state = {
      imageInfo: {},
      fetched: false,
      errorMessage: null
    }
  }

  fetchImage() {
    this.setState({fetched: false})
    this.provider
      .builder()
      .auth()
      .read()
      .then((data) => {
        this.setState({imageInfo: data.Response, fetched: true})
      })
      .catch((data) => {
        this.props.showError(data.Error.message)
        this.setState({fetched: true, errorMessage: data.Error.message})
      })
  }

  componentWillMount() {
    let {routeParams: {imageId}} = this.props
    this.provider = new Provider(`/images/${imageId}`);
    this.fetchImage();
  }

  render() {
    const { imageInfo, fetched, errorMessage } = this.state;
    return (
      <div>
      {JSON.stringify(imageInfo)}
      </div>
    )
  }
}


export default connectRedux(ImageInfo);
