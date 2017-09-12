import React from 'react'
import Provider from '../../commons/provider'
import ContainerIndex from './Containers/container'
import {AlertsComponents, connectRedux} from '../../commons/components/AlertsComponent'

export class ContainerManagerIngex extends AlertsComponents {

  render() {
    const {children} = this.props

    return (
      <div className="collumn">
        <ContainerIndex
          showSuccess = {this.props.showSuccess}
          showWarning = {this.props.showWarning}
          showError = {this.props.showError}

          {...this.props}
          > 
          {children}
        </ContainerIndex>
      </div>
    )
  }
}


export default connectRedux(ContainerManagerIngex);
