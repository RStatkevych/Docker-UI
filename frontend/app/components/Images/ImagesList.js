import React, { Component } from 'react'
import {Link} from 'react-router'
import ItemsList from '../../commons/components/ItemsList'
import Provider from '../../commons/provider'

export default class ImagesList extends Component {

	constructor() {
		super()
		this.provider = new Provider('/images')
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
			.auth()
			.body({action: 'rm', images: selected.map((x) => x.id)})
			.change()
			.then(
				this._onSuccess.bind(this),
				this._onFail.bind(this),
			)

	}

	render() {
		const { images, children, fetched, errorMessage } = this.props;

		return (
			<div>
				<ItemsList
					components={images}
					fetched={fetched}
					errorMessage={errorMessage}
					fieldOrder={['short_id', 'tags', 'created', '']}
					linkMapping={{0: (image) => {return `/images/${image.id}`}}}
					buttons={[{
						text: 'Remove',
						isActive: (selected) => {
							return selected.length !== 0
						},
						onClick: this.removeSelected.bind(this)
					}]}
					>
					{children}
				</ItemsList>
			</div>
		)
	}
}

