import React, { Component } from 'react'
import ItemsList from '../../../commons/components/ItemsList'

export default class FilesList extends ItemsList {


	render() {
		const { files, children, onFolderClick } = this.props;

		return (
			<div className="files-table">
				<ItemsList
					components={files}
					fieldOrder={['file_type', 'file_name', 'file_size']}
					checkboxEnabled = {false}
					controlsEnabled = {false}
					actionMapping = {
						{
							1: onFolderClick
						}
					}
					>
					{children}
				</ItemsList>
			</div>
		)
	}
}

