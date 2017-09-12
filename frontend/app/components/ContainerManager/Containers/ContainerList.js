import React, { Component } from 'react'
import {Link} from 'react-router'
import ItemsList from '../../../commons/components/ItemsList'
import Provider from '../../../commons/provider'
import './style.less'


const buttonShouldBeActive = (selected) => {
	return selected.length !== 0;
}

export default class ContainerList extends ItemsList {

	componentWillMount() {
		this.provider = new Provider('/containers');
 	}

 	_onSuccess(data) {
		this.props.showSuccess(data.Response.message)
		this.props.fetchNewContainersList()
 	}

 	_onFail(data) {
		this.props.showError(data.Error.message)
 	}

	removeSelected(selected) {
		this.provider
			.builder()
			.body({action: 'rm', containers: selected.map((x) => x.id)})
			.auth()
			.change()
			.then(
				this._onSuccess.bind(this),
				this._onFail.bind(this),
			)
	}

	killSelected(selected) {
		this.provider
			.builder()
			.body({action: 'kill', containers: selected.map((x) => x.id)})
			.auth()
			.change()
			.then(
				this._onSuccess.bind(this),
				this._onFail.bind(this),
			)
	}

	stopSelected(selected) {
		this.provider
			.builder()
			.body({action: 'stop', containers: selected.map((x) => x.id)})
			.auth()
			.change()
			.then(
				this._onSuccess.bind(this),
				this._onFail.bind(this),
			)
	}

	restartSelected(selected) {
		this.provider
			.builder()
			.body({action: 'restart', containers: selected.map((x) => x.id)})
			.auth()
			.change()
			.then(
				this._onSuccess.bind(this),
				this._onFail.bind(this),
			)
	}

	render() {
		const { containers, children, fetch, errorMessage } = this.props;

		return (
			<div className="collumn">
				<ItemsList
					components={containers}
					fetched={fetch}
					errorMessage={errorMessage}
					buttons={[
							{
								text: 'Remove',
								isActive: buttonShouldBeActive,
								onClick: this.removeSelected.bind(this)
							},
							{
								isActive: buttonShouldBeActive,
								text: 'Stop',
								onClick: this.stopSelected.bind(this)
							},
							{
								text: 'Kill',
								isActive: buttonShouldBeActive,
								onClick: this.killSelected.bind(this)
							},
							{
								text: 'restart',
								isActive: buttonShouldBeActive,
								onClick: this.restartSelected.bind(this)
							}
						]}
					fieldOrder={['name', 'image_name', 'created', 'status']}
					linkMapping={{0: (cont)=> {return '/containers/' + cont.id}}}
					tableClassName={'containers-table'}
					>
					{children}
				</ItemsList>
			</div>
		)
	}
}

